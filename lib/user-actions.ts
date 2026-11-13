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