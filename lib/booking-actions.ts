'use server';

import {and, eq, sql} from 'drizzle-orm';
import {revalidatePath} from 'next/cache';
import {getLocale} from 'next-intl/server';
import {db} from '@/lib/db';
import {activities, bookings, coupons, packages} from '@/lib/db/schema';
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
  lang?: string;
  carMode?: boolean;
  carTier?: 1 | 2 | 3 | null;
  fullName?: string;
  notes: string;
  phone: string;
  couponCode?: string | null;
};

type CouponInput = {code: string; kind: 'package' | 'activity'; id: number; totalUsd: number};
type CouponCheck =
  | {ok: true; couponId: number; code: string; discountUsd: number; title: string}
  | {ok: false; reason: 'invalid' | 'expired' | 'min' | 'used_up' | 'scope'};

function checkCoupon(
  coupon: typeof coupons.$inferSelect | undefined,
  input: CouponInput,
  code: string,
  locale: 'en' | 'ar'
): CouponCheck {
  if (!coupon || coupon.code !== code || !coupon.active) return {ok: false, reason: 'invalid'};
  const now = new Date();
  if ((coupon.validFrom && coupon.validFrom > now) || (coupon.validUntil && coupon.validUntil < now)) {
    return {ok: false, reason: 'expired'};
  }
  if (coupon.maxUses != null && coupon.usedCount >= coupon.maxUses) return {ok: false, reason: 'used_up'};
  if (coupon.minTotalUsd != null && input.totalUsd < coupon.minTotalUsd) return {ok: false, reason: 'min'};
  const scopeMatches = coupon.scope === 'all' ||
    (coupon.scope === 'package' && input.kind === 'package' && (coupon.packageId == null || coupon.packageId === input.id)) ||
    (coupon.scope === 'activity' && input.kind === 'activity' && (coupon.activityId == null || coupon.activityId === input.id));
  if (!scopeMatches) {
    return {ok: false, reason: 'scope'};
  }
  const discountUsd = coupon.discountType === 'percent'
    ? Math.round(input.totalUsd * coupon.discountValue / 100)
    : Math.min(coupon.discountValue, input.totalUsd);
  return {ok: true, couponId: coupon.id, code, discountUsd, title: coupon.i18n[locale].title};
}

export async function validateCoupon(input: CouponInput) {
  const code = input.code.trim().toUpperCase();
  if (
    !code ||
    (input.kind !== 'package' && input.kind !== 'activity') ||
    !Number.isInteger(input.id) ||
    input.id < 1 ||
    !Number.isInteger(input.totalUsd) ||
    input.totalUsd <= 0
  ) {
    return {ok: false as const, reason: 'invalid' as const};
  }
  const [coupon] = await db.select().from(coupons).where(eq(coupons.code, code)).limit(1);
  const locale = (await getLocale()) === 'ar' ? 'ar' : 'en';
  const result = checkCoupon(coupon, input, code, locale);
  return result.ok
    ? {ok: true as const, discountUsd: result.discountUsd, title: result.title}
    : result;
}

export async function saveBookingFromBox(input: BookingBoxInput) {
  const user = await getCurrentUser();
  if (!user) return;

  const {kind, slug, date, returnDate, adults, children, infants, notes, phone} = input;
  if (kind !== 'package' && kind !== 'activity') throw new Error('Invalid booking kind');
  if (![adults, children, infants].every((count) => Number.isInteger(count) && count >= 0)) {
    throw new Error('Booking counts must be non-negative integers');
  }
  if (kind === 'activity' && (!input.fullName?.trim() || !phone.trim())) {
    throw new Error('Activity booking name and phone are required');
  }
  const lang = (await getLocale()) === 'ar' ? 'ar' : 'en';
  const bookingLang = kind === 'activity' ? lang : input.lang === 'ar' ? 'ar' : 'en';
  let title: string;
  let packageId: number | null = null;
  let activityId: number | null = null;
  let couponTargetId: number | null = null;
  let adultPrice: number | null;
  let childPrice: number | null;
  let infantPrice: number | null;
  let carPrices: [number | null, number | null, number | null] | null = null;

  if (kind === 'package') {
    const [pkg] = await db.select().from(packages).where(eq(packages.slug, slug)).limit(1);
    if (!pkg) throw new Error(`Package not found: ${slug}`);
    title = pkg.i18n[lang].title;
    packageId = pkg.id;
    couponTargetId = pkg.id;
    adultPrice = pkg.priceUsd;
    childPrice = pkg.childPriceUsd;
    infantPrice = pkg.infantPriceUsd;
  } else {
    const [activity] = await db.select().from(activities).where(eq(activities.slug, slug)).limit(1);
    if (!activity) throw new Error(`Activity not found: ${slug}`);
    title = activity.i18n[lang].title;
    activityId = activity.id;
    couponTargetId = activity.id;
    adultPrice = activity.priceUsd;
    childPrice = activity.childPriceUsd;
    infantPrice = activity.infantPriceUsd;
    carPrices = [activity.carPrice1Usd, activity.carPrice2Usd, activity.carPrice3Usd];
  }

  let bookingAdults = adults;
  let bookingChildren = children;
  let bookingInfants = infants;
  let pax: number;
  let totalUsd: number | null;
  if (input.carMode) {
    if (kind !== 'activity' || (input.carTier !== 1 && input.carTier !== 2 && input.carTier !== 3)) {
      throw new Error('Invalid car booking selection');
    }
    const tierIndex = input.carTier - 1;
    const price = carPrices?.[tierIndex];
    if (price == null) throw new Error('Selected car tier is not available');
    pax = [3, 6, 10][tierIndex];
    bookingAdults = pax;
    bookingChildren = 0;
    bookingInfants = 0;
    totalUsd = price;
  } else {
    const counts = [adults, children, infants];
    const prices = [adultPrice, childPrice, infantPrice];
    totalUsd = counts.some((count, index) => count > 0 && prices[index] == null)
      ? null
      : counts.reduce((total, count, index) => total + count * (prices[index] ?? 0), 0);
    pax = adults + children + infants;
  }
  const values = {
    userId: user.id,
    kind,
    packageId,
    activityId,
    packageTitle: title,
    travelDate: date,
    returnDate,
    pax,
    adults: bookingAdults,
    children: bookingChildren,
    infants: bookingInfants,
    notes: kind === 'activity'
      ? [
          input.fullName?.trim() ? `${lang === 'ar' ? 'الاسم الكامل' : 'Full name'}: ${input.fullName.trim()}` : '',
          notes.trim()
        ].filter(Boolean).join('\n') || null
      : notes.trim() || null,
    phone: phone.trim() || null,
    lang: bookingLang,
    totalUsd,
    status: 'pending'
  };
  const code = input.couponCode?.trim().toUpperCase() ?? '';
  if (!code) {
    const [booking] = await db.insert(bookings).values({...values, couponCode: null, discountUsd: null}).returning({id: bookings.id});
    return booking.id;
  }
  if (totalUsd == null || totalUsd <= 0) throw new Error('Coupon requires a known positive booking total');

  const [booking] = await db.transaction(async (tx) => {
    const [coupon] = await tx.select().from(coupons).where(eq(coupons.code, code)).for('update').limit(1);
    if (couponTargetId == null) throw new Error('Booking coupon target not found');
    const result = checkCoupon(coupon, {code, kind, id: couponTargetId, totalUsd}, code, lang);
    if (!result.ok) throw new Error(`Coupon is no longer valid: ${result.reason}`);
    const [created] = await tx.insert(bookings).values({
      ...values,
      totalUsd: totalUsd - result.discountUsd,
      couponCode: code,
      discountUsd: result.discountUsd
    }).returning({id: bookings.id});
    await tx.update(coupons).set({usedCount: sql`${coupons.usedCount} + 1`}).where(eq(coupons.id, result.couponId));
    return [created];
  });

  return booking.id;
}

type ActivityPaymentResult = {ok: true; url: string} | {ok: false; reason: 'soon'};

export async function startActivityPayment(_bookingId: number): Promise<ActivityPaymentResult> {
  const user = await getCurrentUser();
  if (!user) throw new Error('Login required to pay for this booking');
  if (!Number.isInteger(_bookingId) || _bookingId < 1) throw new Error('Invalid booking');
  const [booking] = await db.select({id: bookings.id}).from(bookings).where(and(
    eq(bookings.id, _bookingId),
    eq(bookings.userId, user.id),
    eq(bookings.kind, 'activity')
  )).limit(1);
  if (!booking) throw new Error('Activity booking not found');
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