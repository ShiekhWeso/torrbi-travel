'use server';

import {and, eq} from 'drizzle-orm';
import {revalidatePath} from 'next/cache';
import {getLocale} from 'next-intl/server';
import {db} from '@/lib/db';
import {activities, bookings, packages} from '@/lib/db/schema';
import {getCurrentUser} from '@/lib/auth';

type Result = {ok: true; id: number} | {ok: false; error: 'login' | 'date' | 'package' | 'activity'};

type BookingBoxInput = {
  kind: 'package' | 'activity';
  slug: string;
  date: string;
  returnDate: string | null;
  adults: number;
  children: number;
  infants: number;
  lang: string;
  notes: string;
  phone: string;
};

export async function saveBookingFromBox(input: BookingBoxInput) {
  const user = await getCurrentUser();
  if (!user) return;

  const {kind, slug, date, returnDate, adults, children, infants, notes, phone} = input;
  if (kind !== 'package' && kind !== 'activity') throw new Error('Invalid booking kind');
  if (![adults, children, infants].every((count) => Number.isInteger(count) && count >= 0)) {
    throw new Error('Booking counts must be non-negative integers');
  }
  const lang = (await getLocale()) === 'ar' ? 'ar' : 'en';
  let title: string;
  let packageId: number | null = null;
  let activityId: number | null = null;
  let adultPrice: number | null;
  let childPrice: number | null;
  let infantPrice: number | null;

  if (kind === 'package') {
    const [pkg] = await db.select().from(packages).where(eq(packages.slug, slug)).limit(1);
    if (!pkg) throw new Error(`Package not found: ${slug}`);
    title = pkg.i18n[lang].title;
    packageId = pkg.id;
    adultPrice = pkg.priceUsd;
    childPrice = pkg.childPriceUsd;
    infantPrice = pkg.infantPriceUsd;
  } else {
    const [activity] = await db.select().from(activities).where(eq(activities.slug, slug)).limit(1);
    if (!activity) throw new Error(`Activity not found: ${slug}`);
    title = activity.i18n[lang].title;
    activityId = activity.id;
    adultPrice = activity.priceUsd;
    childPrice = activity.childPriceUsd;
    infantPrice = activity.infantPriceUsd;
  }

  const counts = [adults, children, infants];
  const prices = [adultPrice, childPrice, infantPrice];
  const totalUsd = counts.some((count, index) => count > 0 && prices[index] == null)
    ? null
    : counts.reduce((total, count, index) => total + count * (prices[index] ?? 0), 0);
  const pax = adults + children + infants;
  const [booking] = await db.insert(bookings).values({
    userId: user.id,
    kind,
    packageId,
    activityId,
    packageTitle: title,
    travelDate: date,
    returnDate,
    pax,
    adults,
    children,
    infants,
    notes: notes.trim() || null,
    phone: phone.trim() || null,
    lang: input.lang === 'ar' ? 'ar' : 'en',
    totalUsd,
    status: 'pending'
  }).returning({id: bookings.id});

  return booking.id;
}

type ActivityPaymentResult = {ok: true; url: string} | {ok: false; reason: 'soon'};

export async function startActivityPayment(_bookingId: number): Promise<ActivityPaymentResult> {
  // TODO: create Stripe Checkout session (USD) and return its URL.
  return {ok: false, reason: 'soon'};
}

export async function createBooking(input: {slug: string; date: string; pax: number; lang: string}): Promise<Result> {
  const user = await getCurrentUser();
  if (!user) return {ok: false, error: 'login'};
  const today = new Date().toISOString().slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(input.date) || input.date < today) return {ok: false, error: 'date'};
  const [pkg] = await db.select().from(packages).where(eq(packages.slug, input.slug)).limit(1);
  if (!pkg) return {ok: false, error: 'package'};
  const pax = Math.min(6, Math.max(1, Math.floor(input.pax) || 1));
  const l = (await getLocale()) === 'ar' ? 'ar' : 'en';
  const [booking] = await db.insert(bookings).values({
    userId: user.id,
    packageId: pkg.id,
    packageTitle: pkg.i18n[l].title,
    travelDate: input.date,
    pax,
    lang: input.lang === 'ar' ? 'ar' : 'en',
    totalUsd: pkg.priceUsd ? pkg.priceUsd * pax : null
  }).returning({id: bookings.id});
  return {ok: true, id: booking.id};
}

export async function createActivityBooking(input: {slug: string; date: string; pax: number}): Promise<Result> {
  const user = await getCurrentUser();
  if (!user) return {ok: false, error: 'login'};
  const today = new Date().toISOString().slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(input.date) || input.date < today) return {ok: false, error: 'date'};
  const [activity] = await db.select().from(activities).where(eq(activities.slug, input.slug)).limit(1);
  if (!activity) return {ok: false, error: 'activity'};
  const pax = Math.min(6, Math.max(1, Math.floor(input.pax) || 1));
  const l = (await getLocale()) === 'ar' ? 'ar' : 'en';
  const [booking] = await db.insert(bookings).values({
    userId: user.id,
    kind: 'activity',
    packageId: null,
    activityId: activity.id,
    packageTitle: activity.i18n[l].title,
    travelDate: input.date,
    pax,
    lang: l,
    totalUsd: activity.priceUsd ? activity.priceUsd * pax : null
  }).returning({id: bookings.id});
  return {ok: true, id: booking.id};
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