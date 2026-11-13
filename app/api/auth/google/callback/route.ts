import {NextRequest, NextResponse} from 'next/server';
import {eq} from 'drizzle-orm';
import {db} from '@/lib/db';
import {users} from '@/lib/db/schema';
import {createUserSession} from '@/lib/auth';

export async function GET(req: NextRequest) {
  const origin = req.nextUrl.origin;
  const code = req.nextUrl.searchParams.get('code');
  const state = req.nextUrl.searchParams.get('state');
  const [saved, locale = 'en'] = (req.cookies.get('g_state')?.value ?? '').split('.');
  const fail = NextResponse.redirect(`${origin}/${locale}/login?error=google`);
  if (!code || !state || state !== saved) return fail;

  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: {'Content-Type': 'application/x-www-form-urlencoded'},
    body: new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      redirect_uri: `${origin}/api/auth/google/callback`,
      grant_type: 'authorization_code'
    })
  });
  if (!tokenRes.ok) return fail;
  const {access_token} = await tokenRes.json();
  const infoRes = await fetch('https://openidconnect.googleapis.com/v1/userinfo', {
    headers: {Authorization: `Bearer ${access_token}`}
  });
  if (!infoRes.ok) return fail;
  const g = (await infoRes.json()) as {sub: string; email: string; email_verified: boolean; name?: string};
  if (!g.email_verified) return fail;

  const email = g.email.toLowerCase();
  let [u] = await db.select().from(users).where(eq(users.email, email)).limit(1);
  if (!u) {
    [u] = await db.insert(users).values({email, name: g.name || email.split('@')[0], googleId: g.sub}).returning();
  } else if (!u.googleId) {
    await db.update(users).set({googleId: g.sub}).where(eq(users.id, u.id));
  }
  await createUserSession(u.id);
  const res = NextResponse.redirect(`${origin}/${locale}/account`);
  res.cookies.delete('g_state');
  return res;
}