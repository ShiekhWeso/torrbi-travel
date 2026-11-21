import {NextRequest, NextResponse} from 'next/server';
import {eq} from 'drizzle-orm';
import {db} from '@/lib/db';
import {users} from '@/lib/db/schema';
import {createUserSession} from '@/lib/auth';
import {safeActivityReturnTo} from '@/lib/activity-return-to';
import {sendEmail} from '@/lib/email';
import {welcome} from '@/lib/email-templates';
import {checkIpRateLimit, getClientIp} from '@/lib/rate-limit';

export async function GET(req: NextRequest) {
  const ip = getClientIp(req.headers);
  if (await checkIpRateLimit('google-auth-callback', ip, 60, 60 * 1000) !== null) {
    return NextResponse.json({error: 'Too many requests'}, {status: 429});
  }
  const origin = req.nextUrl.origin;
  const code = req.nextUrl.searchParams.get('code');
  const state = req.nextUrl.searchParams.get('state');
  const [saved, localeValue = 'en', encodedReturnTo = ''] = (req.cookies.get('g_state')?.value ?? '').split('.');
  const locale = localeValue === 'ar' ? 'ar' : 'en';
  const returnTo = safeActivityReturnTo(Buffer.from(encodedReturnTo, 'base64url').toString(), locale);
  const loginUrl = new URL(`/${locale}/login`, origin);
  loginUrl.searchParams.set('error', 'google');
  if (returnTo) loginUrl.searchParams.set('returnTo', returnTo);
  const fail = NextResponse.redirect(loginUrl);
  fail.cookies.delete('g_state');
  if (!code || code.length > 4096 || !state || !/^[0-9a-f]{32}$/i.test(state) || state !== saved) return fail;
  const clientId = process.env.GOOGLE_CLIENT_ID?.trim();
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    console.error('Google sign-in is not configured');
    return fail;
  }

  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: {'Content-Type': 'application/x-www-form-urlencoded'},
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: `${origin}/api/auth/google/callback`,
      grant_type: 'authorization_code'
    })
  });
  if (!tokenRes.ok) return fail;
  const tokenData: unknown = await tokenRes.json();
  if (typeof tokenData !== 'object' || tokenData === null || !('access_token' in tokenData) ||
    typeof tokenData.access_token !== 'string' || tokenData.access_token.length > 8192) return fail;
  const accessToken = tokenData.access_token;
  const infoRes = await fetch('https://openidconnect.googleapis.com/v1/userinfo', {
    headers: {Authorization: `Bearer ${accessToken}`}
  });
  if (!infoRes.ok) return fail;
  const info: unknown = await infoRes.json();
  if (typeof info !== 'object' || info === null || !('sub' in info) || typeof info.sub !== 'string' ||
    !('email' in info) || typeof info.email !== 'string' ||
    !('email_verified' in info) || info.email_verified !== true ||
    info.sub.length > 255 || info.email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(info.email)) return fail;
  const g = info as {sub: string; email: string; email_verified: true; name?: unknown};

  const email = g.email.trim().toLowerCase();
  let [u] = await db.select().from(users).where(eq(users.email, email)).limit(1);
  if (!u) {
    const name = typeof g.name === 'string' && g.name.trim().length <= 120 ? g.name.trim() : email.split('@')[0];
    [u] = await db.insert(users).values({email, name, googleId: g.sub}).returning();
    void sendEmail({to: email, ...welcome(locale, {name: u.name})});
  } else if (!u.googleId) {
    await db.update(users).set({googleId: g.sub}).where(eq(users.id, u.id));
  }
  await createUserSession(u.id);
  const res = NextResponse.redirect(`${origin}${returnTo ?? `/${locale}/account`}`);
  res.cookies.delete('g_state');
  return res;
}