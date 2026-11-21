import {NextResponse} from 'next/server';
import {getCurrentUser} from '@/lib/auth';
import {checkIpRateLimit, getClientIp} from '@/lib/rate-limit';

export async function GET(request: Request) {
  const ip = getClientIp(request.headers);
  if (await checkIpRateLimit('me', ip, 300, 15 * 60 * 1000) !== null) {
    return NextResponse.json({error: 'Too many requests'}, {status: 429, headers: {'Cache-Control': 'no-store'}});
  }
  const u = await getCurrentUser();
  return NextResponse.json({user: u ? {name: u.name} : null}, {headers: {'Cache-Control': 'no-store'}});
}