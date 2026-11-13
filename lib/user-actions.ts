'use server';

import {redirect} from 'next/navigation';
import bcrypt from 'bcryptjs';
import {eq} from 'drizzle-orm';
import {getLocale} from 'next-intl/server';
import {db} from '@/lib/db';
import {users} from '@/lib/db/schema';
import {createUserSession, destroyUserSession, getCurrentUser} from '@/lib/auth';

async function go(path: string): Promise<never> {
  redirect(`/${await getLocale()}${path}`);
}
const str = (v: FormDataEntryValue | null) => String(v ?? '').trim();

export async function signup(_prev: string | null | undefined, fd: FormData) {
  const ar = (await getLocale()) === 'ar';
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
  await createUserSession(u.id);
  await go('/account');
}

export async function userLogin(_prev: string | null | undefined, fd: FormData) {
  const ar = (await getLocale()) === 'ar';
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
  await go('/account');
}

export async function userLogout() {
  await destroyUserSession();
  await go('/');
}

export async function updateProfile(fd: FormData) {
  const user = await getCurrentUser();
  if (!user) return go('/login');
  const name = str(fd.get('name'));
  if (name) await db.update(users).set({name, phone: str(fd.get('phone')) || null}).where(eq(users.id, user.id));
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