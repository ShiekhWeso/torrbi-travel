import {cookies} from 'next/headers';
import {SignJWT, jwtVerify} from 'jose';
import {eq} from 'drizzle-orm';
import {db} from '@/lib/db';
import {users} from '@/lib/db/schema';

const COOKIE = 'torrbi_admin';
const key = () => new TextEncoder().encode(process.env.AUTH_SECRET);

export async function createSession(email: string) {
  const token = await new SignJWT({email})
    .setProtectedHeader({alg: 'HS256'})
    .setExpirationTime('7d')
    .sign(key());
  (await cookies()).set(COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7
  });
}

export async function getSession() {
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) return null;
  try {
    const {payload} = await jwtVerify(token, key());
    return {email: payload.email as string};
  } catch {
    return null;
  }
}

export async function destroySession() {
  (await cookies()).delete(COOKIE);
}

const UCOOKIE = 'torrbi_user';

export async function createUserSession(id: number) {
  const token = await new SignJWT({uid: id})
    .setProtectedHeader({alg: 'HS256'})
    .setExpirationTime('30d')
    .sign(key());
  (await cookies()).set(UCOOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 30
  });
}

export async function destroyUserSession() {
  (await cookies()).delete(UCOOKIE);
}

export async function getCurrentUser() {
  const token = (await cookies()).get(UCOOKIE)?.value;
  if (!token) return null;
  try {
    const {payload} = await jwtVerify(token, key());
    const [u] = await db
      .select({id: users.id, name: users.name, email: users.email, phone: users.phone})
      .from(users)
      .where(eq(users.id, Number(payload.uid)))
      .limit(1);
    return u ?? null;
  } catch {
    return null;
  }
}