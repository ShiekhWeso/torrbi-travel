'use server';

import {and, eq} from 'drizzle-orm';
import {revalidatePath} from 'next/cache';
import {getLocale} from 'next-intl/server';
import {db} from '@/lib/db';
import {bookings, packages} from '@/lib/db/schema';
import {getCurrentUser} from '@/lib/auth';

type Result = {ok: true} | {ok: false; error: 'login' | 'date' | 'package'};

export async function createBooking(input: {slug: string; date: string; pax: number; lang: string}): Promise<Result> {
  const user = await getCurrentUser();
  if (!user) return {ok: false, error: 'login'};
  const today = new Date().toISOString().slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(input.date) || input.date < today) return {ok: false, error: 'date'};
  const [pkg] = await db.select().from(packages).where(eq(packages.slug, input.slug)).limit(1);
  if (!pkg) return {ok: false, error: 'package'};
  const pax = Math.min(6, Math.max(1, Math.floor(input.pax) || 1));
  const l = (await getLocale()) === 'ar' ? 'ar' : 'en';
  await db.insert(bookings).values({
    userId: user.id,
    packageId: pkg.id,
    packageTitle: pkg.i18n[l].title,
    travelDate: input.date,
    pax,
    lang: input.lang === 'ar' ? 'ar' : 'en',
    totalUsd: pkg.priceUsd ? pkg.priceUsd * pax : null
  });
  return {ok: true};
}

export async function cancelBooking(fd: FormData) {
  const user = await getCurrentUser();
  if (!user) return;
  await db
    .update(bookings)
    .set({status: 'cancelled'})
    .where(and(eq(bookings.id, Number(fd.get('id'))), eq(bookings.userId, user.id), eq(bookings.status, 'pending')));
  revalidatePath('/', 'layout');
}