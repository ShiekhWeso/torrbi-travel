'use server';

import {headers} from 'next/headers';
import {redirect} from 'next/navigation';
import {revalidatePath} from 'next/cache';
import {getLocale} from 'next-intl/server';
import {eq} from 'drizzle-orm';
import {db} from '@/lib/db';
import {feedback, type FeedbackStatus} from '@/lib/db/schema';
import {getCurrentUser, getSession} from '@/lib/auth';
import {sendEmail} from '@/lib/email';
import {checkIpRateLimit, getClientIp} from '@/lib/rate-limit';

export type FeedbackSubmitState = {
  ok?: boolean;
  errors?: Record<string, string>;
  message?: string;
};

function text(formData: FormData, key: string) {
  const value = formData.get(key);
  if (value === null) return '';
  if (typeof value !== 'string' || value.length > 10_000 || value.includes('\0')) throw new Error(`Invalid ${key}`);
  return value.trim();
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  })[character] ?? character);
}

export async function submitFeedback(_prev: FeedbackSubmitState, formData: FormData): Promise<FeedbackSubmitState> {
  const ip = getClientIp(await headers());
  if (await checkIpRateLimit('feedback-submit', ip, 5, 60 * 60 * 1000) !== null) {
    return {ok: false, errors: {form: 'Too many submissions. Please try again later.'}};
  }
  if (text(formData, 'website')) return {ok: false, errors: {form: 'Submission blocked'}};

  const type = text(formData, 'type');
  const title = text(formData, 'title');
  const message = text(formData, 'message');
  const suppliedEmail = text(formData, 'email');
  const imageUrl = text(formData, 'imageUrl');
  const pageUrl = text(formData, 'pageUrl');
  const errors: Record<string, string> = {};

  if (!['bug', 'complaint', 'suggestion'].includes(type)) errors.type = 'Choose a valid feedback type';
  if (!title) errors.title = 'Title is required';
  else if (title.length > 120) errors.title = 'Title must be 120 characters or fewer';
  if (!message) errors.message = 'Description is required';
  else if (message.length > 2000) errors.message = 'Description must be 2000 characters or fewer';
  if (pageUrl) {
    if (pageUrl.length > 2000) errors.pageUrl = 'Invalid page link';
    else {
      try {
        const url = new URL(pageUrl);
        if (!['http:', 'https:'].includes(url.protocol)) errors.pageUrl = 'Invalid page link';
      } catch {
        errors.pageUrl = 'Invalid page link';
      }
    }
  }
  if (imageUrl) {
    if (imageUrl.length > 2000) {
      errors.imageUrl = 'Invalid image';
    } else if (!(imageUrl.startsWith('/') && !imageUrl.startsWith('//') && !/[\\\u0000-\u001f]/.test(imageUrl))) {
      try {
        const url = new URL(imageUrl);
        if (url.protocol !== 'https:' || url.username || url.password ||
          !/^[a-z0-9-]+\.public\.blob\.vercel-storage\.com$/i.test(url.hostname)) {
          errors.imageUrl = 'Invalid image';
        }
      } catch {
        errors.imageUrl = 'Invalid image';
      }
    }
  }

  const user = await getCurrentUser();
  let email: string | null = user?.email ?? suppliedEmail;
  if (email) {
    email = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) {
      errors.email = 'Enter a valid email address';
    }
  } else {
    email = null;
  }

  if (Object.keys(errors).length) return {ok: false, errors};
  const [inserted] = await db.insert(feedback).values({
    type: type as 'bug' | 'complaint' | 'suggestion',
    title,
    message,
    imageUrl: imageUrl || null,
    userId: user?.id ?? null,
    email,
    pageUrl: pageUrl || null
  }).returning({id: feedback.id});

  const locale = await getLocale();
  const adminEmail = process.env.ADMIN_NOTIFY_EMAIL?.trim();
  if (adminEmail) {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') || '';
    const adminLink = `${baseUrl}/${locale}/admin/feedback`;
    await sendEmail({
      to: adminEmail,
      subject: `[${type}] ${title}`,
      html: `<p><strong>Type:</strong> ${escapeHtml(type)}</p><p><strong>Title:</strong> ${escapeHtml(title)}</p><p><strong>Sender:</strong> ${escapeHtml(email ?? 'Guest')}</p><p><strong>Message:</strong></p><p>${escapeHtml(message)}</p>${pageUrl ? `<p><strong>Page:</strong> ${escapeHtml(pageUrl)}</p>` : ''}<p><a href="${escapeHtml(adminLink)}">Open feedback inbox</a></p>`
    }).catch((error: unknown) => console.error('Failed to send feedback notification', error));
  }

  revalidatePath(`/${locale}/admin/feedback`, 'page');
  return {ok: true, message: 'Thank you, we received your message'};
}

async function requireAdmin() {
  const session = await getSession();
  if (!session) {
    const locale = await getLocale();
    redirect(`/${locale}/admin/login`);
  }
}

function safeReturnTo(value: FormDataEntryValue | null) {
  const raw = String(value ?? '');
  return /^\/[^/]+\/admin\/feedback(?:\?.*)?$/.test(raw) ? raw : null;
}

export async function updateFeedback(formData: FormData) {
  await requireAdmin();
  const idValue = formData.get('id');
  const statusValue = formData.get('status');
  const noteValue = formData.get('adminNote');
  if (typeof idValue !== 'string' || typeof statusValue !== 'string' ||
    (noteValue !== null && typeof noteValue !== 'string')) throw new Error('Invalid feedback form');
  const id = Number(idValue);
  const status = statusValue;
  const adminNote = (noteValue ?? '').trim();
  if (!Number.isSafeInteger(id) || id < 1) throw new Error('Invalid feedback id');
  if (!['new', 'in_progress', 'done'].includes(status)) throw new Error('Invalid feedback status');
  if (adminNote.length > 2000) throw new Error('Admin note is too long');
  await db.update(feedback).set({
    status: status as FeedbackStatus,
    adminNote: adminNote || null
  }).where(eq(feedback.id, id));
  const locale = await getLocale();
  revalidatePath(`/${locale}/admin/feedback`, 'page');
  redirect(safeReturnTo(formData.get('returnTo')) ?? `/${locale}/admin/feedback`);
}

export async function deleteFeedback(formData: FormData) {
  await requireAdmin();
  const idValue = formData.get('id');
  if (typeof idValue !== 'string') throw new Error('Invalid feedback id');
  const id = Number(idValue);
  if (!Number.isSafeInteger(id) || id < 1) throw new Error('Invalid feedback id');
  await db.delete(feedback).where(eq(feedback.id, id));
  const locale = await getLocale();
  revalidatePath(`/${locale}/admin/feedback`, 'page');
  redirect(safeReturnTo(formData.get('returnTo')) ?? `/${locale}/admin/feedback`);
}
