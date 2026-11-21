import {and, asc, count, eq, gte, lt, sql} from 'drizzle-orm';
import {db} from '@/lib/db';
import {loginAttempts} from '@/lib/db/schema';

const FIFTEEN_MINUTES = 15 * 60 * 1000;
const RETENTION = 7 * 24 * 60 * 60 * 1000;

export function getClientIp(requestHeaders: {get(name: string): string | null}) {
  // Prefer proxy-set headers; x-forwarded-for may be client-supplied, so use its last appended value.
  const forwarded = requestHeaders.get('x-forwarded-for')?.split(',').pop()?.trim();
  const ip = requestHeaders.get('x-real-ip')?.trim() ||
    requestHeaders.get('x-vercel-forwarded-for')?.trim() ||
    forwarded ||
    'unknown';
  return ip && ip.length <= 128 && !/[\u0000-\u001f]/.test(ip) ? ip : 'unknown';
}

async function pruneAttempts(now: Date) {
  await db.delete(loginAttempts).where(lt(loginAttempts.createdAt, new Date(now.getTime() - RETENTION)));
}

function retryMinutes(createdAt: Date, windowMs: number, now: Date) {
  return Math.max(1, Math.ceil((createdAt.getTime() + windowMs - now.getTime()) / 60_000));
}

export async function checkLoginRateLimit(scope: 'admin' | 'user', identifier: string, ip: string) {
  const now = new Date();
  await pruneAttempts(now);
  const since = new Date(now.getTime() - FIFTEEN_MINUTES);
  const identifierLimit = 5;
  const ipLimit = scope === 'admin' ? 10 : 20;

  return db.transaction(async (tx) => {
    await tx.execute(sql`select pg_advisory_xact_lock(hashtext(${scope}), hashtext(${identifier}))`);
    await tx.execute(sql`select pg_advisory_xact_lock(hashtext(${scope}), hashtext(${ip}))`);

    const [byIdentifier] = await tx.select({value: count()}).from(loginAttempts).where(and(
      eq(loginAttempts.scope, scope),
      eq(loginAttempts.identifier, identifier),
      eq(loginAttempts.success, false),
      gte(loginAttempts.createdAt, since)
    ));
    const [byIp] = await tx.select({value: count()}).from(loginAttempts).where(and(
      eq(loginAttempts.scope, scope),
      eq(loginAttempts.ip, ip),
      eq(loginAttempts.success, false),
      gte(loginAttempts.createdAt, since)
    ));

    const blockedUntil: number[] = [];
    const identifierCount = byIdentifier?.value ?? 0;
    const ipCount = byIp?.value ?? 0;
    if (identifierCount >= identifierLimit) {
      const expirationsNeeded = identifierCount - identifierLimit + 1;
      const oldest = await tx.select({createdAt: loginAttempts.createdAt}).from(loginAttempts).where(and(
        eq(loginAttempts.scope, scope),
        eq(loginAttempts.identifier, identifier),
        eq(loginAttempts.success, false),
        gte(loginAttempts.createdAt, since)
      )).orderBy(asc(loginAttempts.createdAt)).limit(expirationsNeeded);
      if (oldest.length) blockedUntil.push(retryMinutes(oldest[oldest.length - 1].createdAt, FIFTEEN_MINUTES, now));
    }
    if (ipCount >= ipLimit) {
      const expirationsNeeded = ipCount - ipLimit + 1;
      const oldest = await tx.select({createdAt: loginAttempts.createdAt}).from(loginAttempts).where(and(
        eq(loginAttempts.scope, scope),
        eq(loginAttempts.ip, ip),
        eq(loginAttempts.success, false),
        gte(loginAttempts.createdAt, since)
      )).orderBy(asc(loginAttempts.createdAt)).limit(expirationsNeeded);
      if (oldest.length) blockedUntil.push(retryMinutes(oldest[oldest.length - 1].createdAt, FIFTEEN_MINUTES, now));
    }
    if (blockedUntil.length) return Math.max(...blockedUntil);
    await tx.insert(loginAttempts).values({scope, identifier, ip, success: false});
    return null;
  });
}

export async function recordLoginSuccess(scope: 'admin' | 'user', identifier: string, ip: string) {
  await db.transaction(async (tx) => {
    await tx.execute(sql`select pg_advisory_xact_lock(hashtext(${scope}), hashtext(${identifier}))`);
    await tx.execute(sql`select pg_advisory_xact_lock(hashtext(${scope}), hashtext(${ip}))`);
    await tx.delete(loginAttempts).where(and(
      eq(loginAttempts.scope, scope),
      eq(loginAttempts.identifier, identifier),
      eq(loginAttempts.success, false)
    ));
    await tx.insert(loginAttempts).values({scope, identifier, ip, success: true});
  });
}

export async function checkIpRateLimit(key: string, ip: string, limit: number, windowMs: number) {
  const now = new Date();
  await pruneAttempts(now);
  const since = new Date(now.getTime() - windowMs);
  const identifier = `api:${key}`;
  return db.transaction(async (tx) => {
    await tx.execute(sql`select pg_advisory_xact_lock(hashtext(${identifier}), hashtext(${ip}))`);
    const [row] = await tx.select({value: count()}).from(loginAttempts).where(and(
      eq(loginAttempts.scope, 'user'),
      eq(loginAttempts.identifier, identifier),
      eq(loginAttempts.ip, ip),
      eq(loginAttempts.success, true),
      gte(loginAttempts.createdAt, since)
    ));
    if ((row?.value ?? 0) >= limit) {
      const expirationsNeeded = (row?.value ?? 0) - limit + 1;
      const oldest = await tx.select({createdAt: loginAttempts.createdAt}).from(loginAttempts).where(and(
        eq(loginAttempts.scope, 'user'),
        eq(loginAttempts.identifier, identifier),
        eq(loginAttempts.ip, ip),
        eq(loginAttempts.success, true),
        gte(loginAttempts.createdAt, since)
      )).orderBy(asc(loginAttempts.createdAt)).limit(expirationsNeeded);
      return oldest.length ? retryMinutes(oldest[oldest.length - 1].createdAt, windowMs, now) : 1;
    }
    await tx.insert(loginAttempts).values({scope: 'user', identifier, ip, success: true});
    return null;
  });
}
