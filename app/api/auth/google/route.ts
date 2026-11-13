import {NextRequest, NextResponse} from 'next/server';
import {randomBytes} from 'node:crypto';

export function GET(req: NextRequest) {
  const locale = req.nextUrl.searchParams.get('locale') === 'ar' ? 'ar' : 'en';
  const state = randomBytes(16).toString('hex');
  const url = new URL('https://accounts.google.com/o/oauth2/v2/auth');
  url.search = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID!,
    redirect_uri: `${req.nextUrl.origin}/api/auth/google/callback`,
    response_type: 'code',
    scope: 'openid email profile',
    state
  }).toString();
  const res = NextResponse.redirect(url);
  res.cookies.set('g_state', `${state}.${locale}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 600
  });
  return res;
}