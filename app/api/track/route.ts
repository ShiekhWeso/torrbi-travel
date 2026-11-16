import {db} from '@/lib/db';
import {pageViews} from '@/lib/db/schema';
import {getCurrentUser} from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const userAgent = request.headers.get('user-agent') ?? '';
    if (/bot|crawl|spider|preview/i.test(userAgent)) return new Response(null, {status: 204});

    const body = await request.json() as {path?: unknown; visitorId?: unknown};
    if (
      typeof body.path !== 'string' ||
      typeof body.visitorId !== 'string' ||
      body.path.startsWith('/admin') ||
      body.path.startsWith('/api')
    ) {
      return new Response(null, {status: 204});
    }

    const user = await getCurrentUser();
    await db.insert(pageViews).values({
      visitorId: body.visitorId,
      userId: user?.id ?? null,
      path: body.path
    });
  } catch {
    return new Response(null, {status: 204});
  }
  return new Response(null, {status: 204});
}
