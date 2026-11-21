import {cookies} from 'next/headers';
import {SignJWT, jwtVerify} from 'jose';
import {eq} from 'drizzle-orm';
import {db} from '@/lib/db';
import {admins, users} from '@/lib/db/schema';

const COOKIE = 'torrbi_admin';
const UCOOKIE = 'torrbi_user';

export function assertAuthSecret() {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error('AUTH_SECRET must be set to at least 32 characters');
  }
}

const key = () => {
  assertAuthSecret();
  return new TextEncoder().encode(process.env.AUTH_SECRET);
};

export async function createSession(email: string) {
  const token = await new SignJWT({email})
    .setProtectedHeader({alg: 'HS256'})
    .setExpirationTime('8h')
    .sign(key());
  (await cookies()).set(COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 8
  });
}

export async function getSession() {
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) return null;
  let email: unknown;
  try {
    const {payload} = await jwtVerify(token, key());
    email = payload.email;
  } catch {
    return null;
  }
  if (typeof email !== 'string') return null;
  const [admin] = await db.select({email: admins.email}).from(admins).where(eq(admins.email, email)).limit(1);
  return admin ?? null;
}

export async function destroySession() {
  (await cookies()).set(COOKIE, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0
  });
}

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
  (await cookies()).set(UCOOKIE, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0
  });
}

export async function getCurrentUser() {
  const token = (await cookies()).get(UCOOKIE)?.value;
  if (!token) return null;
  let id: unknown;
  try {
    const {payload} = await jwtVerify(token, key());
    id = payload.uid;
  } catch {
    return null;
  }
  if (typeof id !== 'number' || !Number.isSafeInteger(id) || id < 1) return null;
  const [user] = await db
    .select({
      id: users.id,
      firstName: users.firstName,
      lastName: users.lastName,
      name: users.name,
      phone: users.phone,
      nationality: users.nationality,
      email: users.email
    })
    .from(users)
    .where(eq(users.id, id))
    .limit(1);
  return user ?? null;
}