'use server';

import {redirect} from 'next/navigation';
import bcrypt from 'bcryptjs';
import {eq} from 'drizzle-orm';
import {db} from '@/lib/db';
import {admins} from '@/lib/db/schema';
import {createSession, destroySession} from '@/lib/auth';

export async function login(_prev: string | null, formData: FormData) {
  const email = String(formData.get('email') ?? '').trim().toLowerCase();
  const password = String(formData.get('password') ?? '');
  const [admin] = await db.select().from(admins).where(eq(admins.email, email)).limit(1);
  const ok = admin ? await bcrypt.compare(password, admin.passwordHash) : false;
  if (!ok) return 'Wrong email or password';
  await createSession(email);
  redirect('/en/admin');
}

export async function logout() {
  await destroySession();
  redirect('/en/admin/login');
}