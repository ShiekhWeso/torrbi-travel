import {cookies} from 'next/headers';
import {SignJWT, jwtVerify} from 'jose';

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