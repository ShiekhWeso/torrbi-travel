import {after} from 'next/server';
import {db} from '@/lib/db';
import {pageViews} from '@/lib/db/schema';
import {getCurrentUser} from '@/lib/auth';
import {checkIpRateLimit, getClientIp} from '@/lib/rate-limit';

export async function POST(request: Request) {
  const ip = getClientIp(request.headers);
  const userAgent = request.headers.get('user-agent') ?? '';
  if (/bot|crawl|spider|preview/i.test(userAgent)) return new Response(null, {status: 204});
  const contentType = request.headers.get('content-type') ?? '';
  if (!/^application\/json(?:\s*;|$)/i.test(contentType)) return new Response(null, {status: 415});
  const contentLengthHeader = request.headers.get('content-length');
  const contentLength = contentLengthHeader === null ? 0 : Number(contentLengthHeader);
  if (!Number.isFinite(contentLength) || contentLength < 0 || contentLength > 4096) {
    return Response.json({error: 'Request is too large'}, {status: 413});
  }
  const reader = request.body?.getReader();
  if (!reader) return Response.json({error: 'Request body is required'}, {status: 400});
  const chunks: Uint8Array[] = [];
  let total = 0;
  try {
    while (true) {
      const {value, done} = await reader.read();
      if (done) break;
      total += value.length;
      if (total > 4096) {
        await reader.cancel();
        return Response.json({error: 'Request is too large'}, {status: 413});
      }
      chunks.push(value);
    }
  } catch {
    return Response.json({error: 'Could not read request body'}, {status: 400});
  }
  const bytes = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.length;
  }
  let body: unknown;
  try {
    body = JSON.parse(new TextDecoder().decode(bytes));
  } catch {
    return Response.json({error: 'Invalid JSON body'}, {status: 400});
  }
  if (typeof body !== 'object' || body === null || Array.isArray(body)) {
    return Response.json({error: 'Invalid tracking data'}, {status: 400});
  }
  const {path, visitorId} = body as {path?: unknown; visitorId?: unknown};
  if (typeof path !== 'string' || path.length > 2000 || !/^\/(?!\/)[^\u0000-\u001f]*$/.test(path) ||
    typeof visitorId !== 'string' || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(visitorId)) {
    return Response.json({error: 'Invalid tracking data'}, {status: 400});
  }
  if (/^\/(?:[a-z]{2}\/)?(?:admin|api)(?:\/|$)/i.test(path)) return new Response(null, {status: 204});
  after(async () => {
    if (await checkIpRateLimit('track', ip, 120, 60 * 1000) !== null) return;
    const user = await getCurrentUser();
    await db.insert(pageViews).values({visitorId, userId: user?.id ?? null, path});
  });
  return new Response(null, {status: 204});
}
