'use server';

import bcrypt from 'bcryptjs';
import {eq, sql} from 'drizzle-orm';
import {redirect} from 'next/navigation';
import {getLocale} from 'next-intl/server';
import {db} from '@/lib/db';
import {admins} from '@/lib/db/schema';
import {createSession, destroySession, getSession} from '@/lib/auth';

function validPassword(password: string) {
  return Array.from(password).length >= 8 && Buffer.byteLength(password, 'utf8') <= 72 &&
    /\p{L}/u.test(password) && /\p{N}/u.test(password);
}

export async function changeOwnAdminPassword(_previous: string | null, formData: FormData): Promise<string | null> {
  const [locale, session] = await Promise.all([getLocale(), getSession()]);
  if (!session) redirect(`/${locale}/admin/login`);
  const ar = locale === 'ar';
  const currentValue = formData.get('current');
  const passwordValue = formData.get('password');
  const confirmValue = formData.get('confirm');
  if ([currentValue, passwordValue, confirmValue].some((value) => typeof value !== 'string')) {
    throw new Error('Invalid password form');
  }
  if (typeof currentValue !== 'string' || typeof passwordValue !== 'string' || typeof confirmValue !== 'string') {
    throw new Error('Invalid password form');
  }
  const current = currentValue;
  const password = passwordValue;
  const confirm = confirmValue;
  const [admin] = await db.select({passwordHash: admins.passwordHash})
    .from(admins).where(eq(admins.id, session.id)).limit(1);
  if (!admin || !(await bcrypt.compare(current, admin.passwordHash))) {
    return ar ? 'كلمة المرور الحالية غير صحيحة.' : 'Current password is incorrect.';
  }
  if (!validPassword(password)) {
    return ar
      ? 'يجب أن تتكون كلمة المرور من 8 إلى 72 حرفاً وأن تحتوي على حرف ورقم.'
      : 'Password must be 8-72 characters and include at least one letter and one number.';
  }
  if (password !== confirm) {
    return ar ? 'كلمتا المرور غير متطابقتين.' : 'Passwords do not match.';
  }
  const [updated] = await db.update(admins).set({
    passwordHash: await bcrypt.hash(password, 12),
    mustChangePassword: false,
    sessionVersion: sql`${admins.sessionVersion} + 1`
  }).where(eq(admins.id, session.id))
    .returning({sessionVersion: admins.sessionVersion});
  if (!updated) redirect(`/${locale}/admin/login`);
  await createSession({id: session.id, sessionVersion: updated.sessionVersion}, session.expiresAt);
  redirect(`/${locale}/admin/account?changed=1`);
}

export async function signOutAdminOnAllDevices() {
  const [locale, session] = await Promise.all([getLocale(), getSession()]);
  if (!session) redirect(`/${locale}/admin/login`);
  await db.update(admins)
    .set({sessionVersion: sql`${admins.sessionVersion} + 1`})
    .where(eq(admins.id, session.id));
  await destroySession();
  redirect(`/${locale}/admin/login`);
}
