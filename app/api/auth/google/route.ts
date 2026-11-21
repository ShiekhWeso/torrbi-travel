import {NextRequest, NextResponse} from 'next/server';
import {randomBytes} from 'node:crypto';
import {safeActivityReturnTo} from '@/lib/activity-return-to';
import {checkIpRateLimit, getClientIp} from '@/lib/rate-limit';

export async function GET(req: NextRequest) {
  const ip = getClientIp(req.headers);
  if (await checkIpRateLimit('google-auth-start', ip, 30, 60 * 1000) !== null) {
    return NextResponse.json({error: 'Too many requests'}, {status: 429});
  }
  const clientId = process.env.GOOGLE_CLIENT_ID?.trim();
  if (!clientId) return NextResponse.json({error: 'Google sign-in is not configured'}, {status: 503});
  const locale = req.nextUrl.searchParams.get('locale') === 'ar' ? 'ar' : 'en';
  const returnTo = safeActivityReturnTo(req.nextUrl.searchParams.get('returnTo'), locale);
  const state = randomBytes(16).toString('hex');
  const url = new URL('https://accounts.google.com/o/oauth2/v2/auth');
  url.search = new URLSearchParams({
    client_id: clientId,
    redirect_uri: `${req.nextUrl.origin}/api/auth/google/callback`,
    response_type: 'code',
    scope: 'openid email profile',
    state
  }).toString();
  const res = NextResponse.redirect(url);
  res.cookies.set('g_state', `${state}.${locale}.${Buffer.from(returnTo ?? '').toString('base64url')}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 600
  });
  return res;
}