'use server';

import {redirect} from 'next/navigation';
import {revalidatePath} from 'next/cache';
import bcrypt from 'bcryptjs';
import {and, eq} from 'drizzle-orm';
import {getLocale} from 'next-intl/server';
import {headers} from 'next/headers';
import {db} from '@/lib/db';
import {favorites, users} from '@/lib/db/schema';
import {createUserSession, destroyUserSession, getCurrentUser} from '@/lib/auth';
import {safeActivityReturnTo} from '@/lib/activity-return-to';
import {sendEmail} from '@/lib/email';
import {welcome} from '@/lib/email-templates';
import {checkLoginRateLimit, getClientIp, recordLoginSuccess} from '@/lib/rate-limit';

async function go(path: string): Promise<never> {
  redirect(`/${await getLocale()}${path}`);
}
const str = (v: FormDataEntryValue | null) => {
  if (v === null) return '';
  if (typeof v !== 'string' || v.length > 10_000 || v.includes('\0')) throw new Error('Invalid form value');
  return v.trim();
};
const DUMMY_PASSWORD_HASH = bcrypt.hashSync('not-a-real-password', 10);

function validPassword(password: string) {
  return Array.from(password).length >= 8 && Buffer.byteLength(password, 'utf8') <= 72 &&
    /\p{L}/u.test(password) && /\p{N}/u.test(password);
}

function attemptsMessage(ar: boolean, minutes: number) {
  return ar
    ? `محاولات كثيرة، حاول مرة أخرى بعد ${minutes} دقيقة`
    : `Too many attempts, try again in ${minutes} minutes`;
}

function wrongPasswordMessage(ar: boolean) {
  return ar ? 'البريد أو كلمة المرور غير صحيحة' : 'Wrong email or password';
}

export async function toggleFavorite(kind: 'package' | 'activity', id: number) {
  const user = await getCurrentUser();
  if (!user) return go('/login');
  if ((kind !== 'package' && kind !== 'activity') || !Number.isSafeInteger(id) || id <= 0) {
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
  const rawEmail = str(fd.get('email')).toLowerCase();
  const email = rawEmail.length <= 254 ? rawEmail : '';
  const phone = str(fd.get('phone'));
  const password = typeof fd.get('password') === 'string' ? String(fd.get('password')) : '';
  const ip = getClientIp(await headers());
  const blocked = await checkLoginRateLimit('user', email, ip);
  if (blocked !== null) return attemptsMessage(ar, blocked);
  if (!name || name.length > 120 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || phone.length > 40) {
    return ar ? 'بيانات غير صحيحة' : 'Invalid details';
  }
  if (!validPassword(password)) {
    return ar
      ? 'يجب أن تتكون كلمة المرور من 8 إلى 72 حرفاً وأن تحتوي على حرف ورقم'
      : 'Password must be 8-72 characters and include at least one letter and one number';
  }
  const [exists] = await db.select({id: users.id}).from(users).where(eq(users.email, email)).limit(1);
  if (exists) {
    return ar ? 'البريد مسجل مسبقاً' : 'Email already registered';
  }
  const [u] = await db
    .insert(users)
    .values({name, email, phone: phone || null, passwordHash: await bcrypt.hash(password, 10)})
    .returning({id: users.id});
  await recordLoginSuccess('user', email, ip);
  void sendEmail({to: email, ...welcome(ar ? 'ar' : 'en', {name})});
  await createUserSession(u.id);
  const returnTo = safeActivityReturnTo(str(fd.get('returnTo')), locale);
  if (returnTo) redirect(returnTo);
  await go('/account');
}

export async function userLogin(_prev: string | null | undefined, fd: FormData) {
  const locale = await getLocale();
  const ar = locale === 'ar';
  const rawEmail = str(fd.get('email')).toLowerCase();
  const email = rawEmail.length <= 254 ? rawEmail : '';
  const password = typeof fd.get('password') === 'string' ? String(fd.get('password')) : '';
  const ip = getClientIp(await headers());
  const blocked = await checkLoginRateLimit('user', email, ip);
  if (blocked !== null) return attemptsMessage(ar, blocked);
  const [u] = await db.select().from(users).where(eq(users.email, email)).limit(1);
  const ok = await bcrypt.compare(password, u?.passwordHash ?? DUMMY_PASSWORD_HASH);
  if (!u || !u.passwordHash || !ok) {
    return wrongPasswordMessage(ar);
  }
  await recordLoginSuccess('user', email, ip);
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
  const phone = str(fd.get('phone'));
  const nationality = str(fd.get('nationality'));
  if (!firstName || firstName.length > 80 || lastName.length > 80 || phone.length > 40 || nationality.length > 80) {
    throw new Error('Invalid profile details');
  }
  await db.update(users).set({
    firstName,
    lastName: lastName || null,
    name: `${firstName} ${lastName}`.trim(),
    phone: phone || null,
    nationality: nationality || null
  }).where(eq(users.id, user.id));
  await go('/account?saved=1');
}

export async function setPassword(_prev: string | null | undefined, fd: FormData) {
  const ar = (await getLocale()) === 'ar';
  const user = await getCurrentUser();
  if (!user) return go('/login');
  const ip = getClientIp(await headers());
  const blocked = await checkLoginRateLimit('user', user.email.toLowerCase(), ip);
  if (blocked !== null) return attemptsMessage(ar, blocked);
  const [row] = await db.select({hash: users.passwordHash}).from(users).where(eq(users.id, user.id)).limit(1);
  const currentValue = fd.get('current');
  const nextValue = fd.get('password');
  const confirmValue = fd.get('confirm');
  if ([currentValue, nextValue, confirmValue].some((value) => value !== null && typeof value !== 'string')) {
    throw new Error('Invalid password form');
  }
  const current = typeof currentValue === 'string' ? currentValue : '';
  const next = typeof nextValue === 'string' ? nextValue : '';
  const confirm = typeof confirmValue === 'string' ? confirmValue : '';
  if (row?.hash && !(await bcrypt.compare(current, row.hash))) {
    return ar ? 'كلمة المرور الحالية غير صحيحة' : 'Current password is wrong';
  }
  if (!validPassword(next)) {
    return ar
      ? 'يجب أن تتكون كلمة المرور من 8 إلى 72 حرفاً وأن تحتوي على حرف ورقم'
      : 'Password must be 8-72 characters and include at least one letter and one number';
  }
  if (next !== confirm) {
    return ar ? 'كلمتا المرور غير متطابقتين' : 'Passwords do not match';
  }
  await db.update(users).set({passwordHash: await bcrypt.hash(next, 10)}).where(eq(users.id, user.id));
  await recordLoginSuccess('user', user.email.toLowerCase(), ip);
  await go('/account/security?saved=1');
}