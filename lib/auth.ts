import {cookies} from 'next/headers';
import {cache} from 'react';
import {SignJWT, jwtVerify} from 'jose';
import {eq} from 'drizzle-orm';
import {db} from '@/lib/db';
import {admins, users} from '@/lib/db/schema';

const COOKIE = 'torrbi_admin';
const UCOOKIE = 'torrbi_user';

export type AdminSession = {
  id: number;
  email: string;
  role: 'owner' | 'staff';
  sessionVersion: number;
  mustChangePassword: boolean;
  lastLoginAt: Date | null;
  expiresAt: number;
};

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

export async function createSession(admin: Pick<AdminSession, 'id' | 'sessionVersion'>, expiresAt?: number) {
  const expiration = expiresAt ?? Math.floor(Date.now() / 1000) + 60 * 60 * 8;
  const token = await new SignJWT({adminId: admin.id, sessionVersion: admin.sessionVersion})
    .setProtectedHeader({alg: 'HS256'})
    .setExpirationTime(expiration)
    .sign(key());
  (await cookies()).set(COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: Math.max(0, expiration - Math.floor(Date.now() / 1000))
  });
}

export const getSession = cache(async (): Promise<AdminSession | null> => {
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) return null;
  let adminId: unknown;
  let sessionVersion: unknown;
  let expiresAt: unknown;
  try {
    const {payload} = await jwtVerify(token, key());
    adminId = payload.adminId;
    sessionVersion = payload.sessionVersion;
    expiresAt = payload.exp;
  } catch {
    return null;
  }
  if (
    typeof adminId !== 'number' || !Number.isSafeInteger(adminId) || adminId < 1 ||
    typeof sessionVersion !== 'number' || !Number.isSafeInteger(sessionVersion) ||
    typeof expiresAt !== 'number'
  ) return null;
  const [admin] = await db.select({
    id: admins.id,
    email: admins.email,
    role: admins.role,
    sessionVersion: admins.sessionVersion,
    mustChangePassword: admins.mustChangePassword,
    lastLoginAt: admins.lastLoginAt
  }).from(admins).where(eq(admins.id, adminId)).limit(1);
  if (!admin || admin.sessionVersion !== sessionVersion) return null;
  return {...admin, expiresAt};
});

export function isOwner(admin: Pick<AdminSession, 'role'> | null | undefined): boolean {
  return admin?.role === 'owner';
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