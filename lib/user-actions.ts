'use server';

import {redirect} from 'next/navigation';
import {revalidatePath} from 'next/cache';
import bcrypt from 'bcryptjs';
import {and, eq} from 'drizzle-orm';
import {getLocale} from 'next-intl/server';
import {db} from '@/lib/db';
import {favorites, users} from '@/lib/db/schema';
import {createUserSession, destroyUserSession, getCurrentUser} from '@/lib/auth';
import {safeActivityReturnTo} from '@/lib/activity-return-to';
import {sendEmail} from '@/lib/email';
import {welcome} from '@/lib/email-templates';

async function go(path: string): Promise<never> {
  redirect(`/${await getLocale()}${path}`);
}
const str = (v: FormDataEntryValue | null) => String(v ?? '').trim();

export async function toggleFavorite(kind: 'package' | 'activity', id: number) {
  const user = await getCurrentUser();
  if (!user) return go('/login');
  if ((kind !== 'package' && kind !== 'activity') || !Number.isInteger(id) || id <= 0) {
    throw new Error('Invalid favorite target');
  }
  const where = kind === 'package'
    ? and(eq(favorites.userId, user.id), eq(favorites.kind, kind), eq(favorites.packageId, id))
    : and(eq(favorites.userId, user.id), eq(favorites.kind, kind), eq(favorites.activityId, id));
  const [existing] = await db.select({id: favorites.id}).from(favorites).where(where).limit(1);
  if (existing) {
    await db.delete(favorites).where(eq(favorites.id, existing.id));
  } else {
    await db.insert(favorites).values({
      userId: user.id,
      kind,
      packageId: kind === 'package' ? id : null,
      activityId: kind === 'activity' ? id : null
    });
  }
  revalidatePath('/', 'layout');
}

export async function signup(_prev: string | null | undefined, fd: FormData) {
  const locale = await getLocale();
  const ar = locale === 'ar';
  const name = str(fd.get('name'));
  const email = str(fd.get('email')).toLowerCase();
  const phone = str(fd.get('phone'));
  const password = String(fd.get('password') ?? '');
  if (!name || !/^\S+@\S+\.\S+$/.test(email)) return ar ? 'بيانات غير صحيحة' : 'Invalid details';
  if (password.length < 8) return ar ? 'كلمة المرور 8 أحرف على الأقل' : 'Password must be at least 8 characters';
  const [exists] = await db.select({id: users.id}).from(users).where(eq(users.email, email)).limit(1);
  if (exists) return ar ? 'البريد مسجل مسبقاً' : 'Email already registered';
  const [u] = await db
    .insert(users)
    .values({name, email, phone: phone || null, passwordHash: await bcrypt.hash(password, 10)})
    .returning({id: users.id});
  void sendEmail({to: email, ...welcome(ar ? 'ar' : 'en', {name})});
  await createUserSession(u.id);
  const returnTo = safeActivityReturnTo(str(fd.get('returnTo')), locale);
  if (returnTo) redirect(returnTo);
  await go('/account');
}

export async function userLogin(_prev: string | null | undefined, fd: FormData) {
  const locale = await getLocale();
  const ar = locale === 'ar';
  const email = str(fd.get('email')).toLowerCase();
  const password = String(fd.get('password') ?? '');
  const [u] = await db.select().from(users).where(eq(users.email, email)).limit(1);
  if (u && !u.passwordHash)
  return ar
    ? 'هذا الحساب أُنشئ عبر Google. استخدم "المتابعة عبر Google" ثم عيّن كلمة مرور من حسابك.'
    : 'This account was created with Google. Use "Continue with Google", then set a password from Account → Password & security.';
  const ok = u?.passwordHash ? await bcrypt.compare(password, u.passwordHash) : false;
  if (!u || !ok) return ar ? 'البريد أو كلمة المرور غير صحيحة' : 'Wrong email or password';
  await createUserSession(u.id);
  const returnTo = safeActivityReturnTo(str(fd.get('returnTo')), locale);
  if (returnTo) redirect(returnTo);
  await go('/account');
}

export async function userLogout() {
  await destroyUserSession();
  await go('/');
}

export async function updateProfile(fd: FormData) {
  const user = await getCurrentUser();
  if (!user) return go('/login');
  const firstName = str(fd.get('firstName'));
  const lastName = str(fd.get('lastName'));
  if (!firstName) return go('/account');
  await db.update(users).set({
    firstName,
    lastName: lastName || null,
    name: `${firstName} ${lastName}`.trim(),
    phone: str(fd.get('phone')) || null,
    nationality: str(fd.get('nationality')) || null
  }).where(eq(users.id, user.id));
  await go('/account?saved=1');
}

export async function setPassword(_prev: string | null | undefined, fd: FormData) {
  const ar = (await getLocale()) === 'ar';
  const user = await getCurrentUser();
  if (!user) return go('/login');
  const [row] = await db.select({hash: users.passwordHash}).from(users).where(eq(users.id, user.id)).limit(1);
  const current = String(fd.get('current') ?? '');
  const next = String(fd.get('password') ?? '');
  const confirm = String(fd.get('confirm') ?? '');
  if (row?.hash && !(await bcrypt.compare(current, row.hash)))
    return ar ? 'كلمة المرور الحالية غير صحيحة' : 'Current password is wrong';
  if (next.length < 8) return ar ? 'كلمة المرور 8 أحرف على الأقل' : 'Password must be at least 8 characters';
  if (next !== confirm) return ar ? 'كلمتا المرور غير متطابقتين' : 'Passwords do not match';
  await db.update(users).set({passwordHash: await bcrypt.hash(next, 10)}).where(eq(users.id, user.id));
  await go('/account/security?saved=1');
}