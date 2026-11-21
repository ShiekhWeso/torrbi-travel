'use server';

import bcrypt from 'bcryptjs';
import {asc, eq, sql} from 'drizzle-orm';
import {revalidatePath} from 'next/cache';
import {redirect} from 'next/navigation';
import {getLocale} from 'next-intl/server';
import {db} from '@/lib/db';
import {admins} from '@/lib/db/schema';
import {getSession, isOwner} from '@/lib/auth';

async function requireOwner() {
  const [locale, session] = await Promise.all([getLocale(), getSession()]);
  if (!session) redirect(`/${locale}/admin/login`);
  if (!isOwner(session)) redirect(`/${locale}/admin`);
  return {locale, session};
}

function formString(formData: FormData, key: string, maxLength = 10_000) {
  const value = formData.get(key);
  if (typeof value !== 'string' || value.length > maxLength || value.includes('\0')) {
    throw new Error(`Invalid ${key}`);
  }
  return value;
}

function validPassword(password: string) {
  return Array.from(password).length >= 8 && Buffer.byteLength(password, 'utf8') <= 72 &&
    /\p{L}/u.test(password) && /\p{N}/u.test(password);
}

function validRole(role: string): role is 'owner' | 'staff' {
  return role === 'owner' || role === 'staff';
}

function validId(value: string) {
  const id = Number(value);
  if (!Number.isSafeInteger(id) || id < 1) throw new Error('Invalid admin ID');
  return id;
}

export async function createAdmin(_previous: string | null, formData: FormData): Promise<string | null> {
  const {locale} = await requireOwner();
  const ar = locale === 'ar';
  const email = formString(formData, 'email', 254).trim().toLowerCase();
  const role = formString(formData, 'role');
  const password = formString(formData, 'password');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return ar ? 'يرجى إدخال بريد إلكتروني صالح.' : 'Enter a valid email address.';
  }
  if (!validRole(role)) throw new Error('Invalid admin role');
  if (!validPassword(password)) {
    return ar
      ? 'يجب أن تتكون كلمة المرور من 8 إلى 72 حرفاً وأن تحتوي على حرف ورقم.'
      : 'Password must be 8-72 characters and include at least one letter and one number.';
  }
  const inserted = await db.insert(admins).values({
    email,
    passwordHash: await bcrypt.hash(password, 12),
    role,
    mustChangePassword: true
  }).onConflictDoNothing({target: admins.email}).returning({id: admins.id});
  if (inserted.length === 0) {
    return ar ? 'يوجد حساب بهذا البريد الإلكتروني بالفعل.' : 'An admin with this email already exists.';
  }
  revalidatePath(`/${locale}/admin/admins`);
  redirect(`/${locale}/admin/admins`);
}

export async function resetAdminPassword(_previous: string | null, formData: FormData): Promise<string | null> {
  const {locale} = await requireOwner();
  const ar = locale === 'ar';
  const id = validId(formString(formData, 'id'));
  const password = formString(formData, 'password');
  if (!validPassword(password)) {
    return ar
      ? 'يجب أن تتكون كلمة المرور من 8 إلى 72 حرفاً وأن تحتوي على حرف ورقم.'
      : 'Password must be 8-72 characters and include at least one letter and one number.';
  }
  const changed = await db.update(admins).set({
    passwordHash: await bcrypt.hash(password, 12),
    mustChangePassword: true,
    sessionVersion: sql`${admins.sessionVersion} + 1`
  }).where(eq(admins.id, id)).returning({id: admins.id});
  if (changed.length === 0) {
    return ar ? 'لم يتم العثور على المشرف.' : 'Admin not found.';
  }
  revalidatePath(`/${locale}/admin/admins`);
  redirect(`/${locale}/admin/admins`);
}

export async function signOutAdminEverywhere(formData: FormData) {
  const {locale} = await requireOwner();
  const id = validId(formString(formData, 'id'));
  await db.update(admins)
    .set({sessionVersion: sql`${admins.sessionVersion} + 1`})
    .where(eq(admins.id, id));
  revalidatePath(`/${locale}/admin/admins`);
  redirect(`/${locale}/admin/admins`);
}

export async function changeAdminRole(formData: FormData) {
  const {locale, session} = await requireOwner();
  const id = validId(formString(formData, 'id'));
  const role = formString(formData, 'role');
  if (!validRole(role)) throw new Error('Invalid admin role');
  const result = await db.transaction(async (tx) => {
    const owners = await tx.select({id: admins.id}).from(admins)
      .where(eq(admins.role, 'owner')).orderBy(asc(admins.id)).for('update');
    const [target] = await tx.select({id: admins.id, role: admins.role})
      .from(admins).where(eq(admins.id, id)).for('update').limit(1);
    if (!target) return 'not-found';
    if (target.id === session.id && target.role === 'owner' && role !== 'owner') return 'self-demotion';
    if (target.role === 'owner' && role !== 'owner' && owners.length <= 1) return 'last-owner';
    await tx.update(admins).set({role}).where(eq(admins.id, id));
    return null;
  });
  if (result === 'not-found') throw new Error('Admin not found');
  if (result === 'self-demotion') throw new Error('You cannot demote your own account');
  if (result === 'last-owner') throw new Error('The last owner cannot be demoted');
  revalidatePath(`/${locale}/admin/admins`);
  redirect(`/${locale}/admin/admins`);
}

export async function deleteAdmin(formData: FormData) {
  const {locale, session} = await requireOwner();
  const id = validId(formString(formData, 'id'));
  const result = await db.transaction(async (tx) => {
    const owners = await tx.select({id: admins.id}).from(admins)
      .where(eq(admins.role, 'owner')).orderBy(asc(admins.id)).for('update');
    const [target] = await tx.select({id: admins.id, role: admins.role})
      .from(admins).where(eq(admins.id, id)).for('update').limit(1);
    if (!target) return 'not-found';
    if (target.id === session.id) return 'self-delete';
    if (target.role === 'owner' && owners.length <= 1) return 'last-owner';
    await tx.delete(admins).where(eq(admins.id, id));
    return null;
  });
  if (result === 'not-found') throw new Error('Admin not found');
  if (result === 'self-delete') throw new Error('You cannot delete your own account');
  if (result === 'last-owner') throw new Error('The last owner cannot be deleted');
  revalidatePath(`/${locale}/admin/admins`);
  redirect(`/${locale}/admin/admins`);
}
