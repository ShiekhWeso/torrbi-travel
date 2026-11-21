import {notFound, redirect} from 'next/navigation';
import {setRequestLocale, getTranslations} from 'next-intl/server';
import {and, eq} from 'drizzle-orm';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Price from '@/components/Price';
import ActivityBookingForm from '@/components/ActivityBookingForm';
import {Link} from '@/i18n/navigation';
import {getCurrentUser} from '@/lib/auth';
import {safeActivityReturnTo} from '@/lib/activity-return-to';
import {db} from '@/lib/db';
import {activities, couponRedemptions, coupons} from '@/lib/db/schema';

type SearchParams = Record<string, string | string[] | undefined>;
const first = (value: string | string[] | undefined) => Array.isArray(value) ? value[0] : value;

export default async function ActivityBookPage({
  params,
  searchParams
}: {
  params: Promise<{locale: string; id: string}>;
  searchParams: Promise<SearchParams>;
}) {
  const {locale, id} = await params;
  const search = await searchParams;
  setRequestLocale(locale);
  const activityPath = `/${locale}/activities/${encodeURIComponent(id)}`;
  const t = await getTranslations({locale, namespace: 'activityBooking'});
  const rawSelection = new URLSearchParams();
  for (const key of ['date', 'adults', 'children', 'infants', 'car', 'tier', 'coupon']) {
    const value = first(search[key]);
    if (value) rawSelection.set(key, value);
  }
  const path = `/${locale}/activities/${encodeURIComponent(id)}/book?${rawSelection}`;
  const user = await getCurrentUser();
  if (!user) redirect(`/${locale}/login?returnTo=${encodeURIComponent(safeActivityReturnTo(path, locale) ?? `/${locale}/activities/${encodeURIComponent(id)}`)}`);

  const [activity] = await db.select().from(activities).where(eq(activities.slug, id)).limit(1);
  if (!activity) notFound();

  const date = first(search.date) ?? '';
  const dateValue = new Date(`${date}T00:00:00Z`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || Number.isNaN(dateValue.getTime()) || dateValue.toISOString().slice(0, 10) !== date || date < new Date().toISOString().slice(0, 10)) {
    redirect(activityPath);
  }

  const carValue = first(search.car);
  if (carValue != null && carValue !== '1') redirect(activityPath);
  const carMode = carValue === '1';
  const tierValue = Number(first(search.tier));
  const carTier = carMode && (tierValue === 1 || tierValue === 2 || tierValue === 3) ? tierValue : null;
  const parseCount = (value: string | undefined, min: number) => {
    const count = Number(value);
    return value != null && Number.isInteger(count) && count >= min && count <= 10 ? count : null;
  };
  const adults = carMode ? 0 : parseCount(first(search.adults), 1);
  const children = carMode ? 0 : parseCount(first(search.children), 0);
  const infants = carMode ? 0 : parseCount(first(search.infants), 0);
  if (carMode ? carTier == null : adults == null || children == null || infants == null) redirect(activityPath);

  let baseUsd: number | null;
  if (carMode && carTier != null) {
    baseUsd = [activity.carPrice1Usd, activity.carPrice2Usd, activity.carPrice3Usd][carTier - 1];
    if (baseUsd == null) redirect(activityPath);
  } else {
    const counts = [adults!, children!, infants!];
    const prices = [activity.priceUsd, activity.childPriceUsd, activity.infantPriceUsd];
    baseUsd = counts.some((count, index) => count > 0 && prices[index] == null)
      ? null
      : counts.reduce((total, count, index) => total + count * (prices[index] ?? 0), 0);
  }

  const requestedCoupon = first(search.coupon)?.trim().toUpperCase() ?? '';
  let couponCode: string | null = null;
  let discountUsd = 0;
  let couponInvalid = Boolean(requestedCoupon);
  let couponError: 'invalid' | 'alreadyUsed' = 'invalid';
  if (requestedCoupon && baseUsd != null && baseUsd > 0) {
    const [coupon] = await db.select().from(coupons).where(eq(coupons.code, requestedCoupon)).limit(1);
    if (coupon) {
      const [redemption] = await db.select({id: couponRedemptions.id}).from(couponRedemptions).where(and(
        eq(couponRedemptions.couponId, coupon.id),
        eq(couponRedemptions.userId, user.id)
      )).limit(1);
      if (redemption) couponError = 'alreadyUsed';
    }
    const now = new Date();
    const scopeMatches = coupon?.scope === 'all' ||
      (coupon?.scope === 'activity' && (coupon.activityId == null || coupon.activityId === activity.id));
    const valid = couponError !== 'alreadyUsed' && coupon?.active &&
      (!coupon.validFrom || coupon.validFrom <= now) &&
      (!coupon.validUntil || coupon.validUntil >= now) &&
      (coupon.maxUses == null || coupon.usedCount < coupon.maxUses) &&
      (coupon.minTotalUsd == null || baseUsd >= coupon.minTotalUsd) &&
      scopeMatches;
    if (valid && coupon) {
      couponCode = coupon.code;
      discountUsd = coupon.discountType === 'percent'
        ? Math.round(baseUsd * coupon.discountValue / 100)
        : Math.min(coupon.discountValue, baseUsd);
      couponInvalid = false;
    }
  }

  const ar = locale === 'ar';
  const language = ar ? 'ar' : 'en';
  const title = activity.i18n[language].title;
  const guestSummary = carMode && carTier != null
    ? t(`carTier${carTier}` as 'carTier1' | 'carTier2' | 'carTier3')
    : [
        adults ? `${adults} ${t('adults')}` : '',
        children ? `${children} ${t('children')}` : '',
        infants ? `${infants} ${t('infants')}` : ''
      ].filter(Boolean).join(', ');
  const fmt = new Intl.DateTimeFormat(locale, {dateStyle: 'long', timeZone: 'UTC'}).format(dateValue);
  const totalUsd = baseUsd == null ? null : baseUsd - discountUsd;

  return (
    <>
      <Header />
      <main className="min-h-screen bg-mist pb-16 pt-32">
        <div className="mx-auto max-w-6xl px-4 lg:px-8">
          <Link href={`/activities/${encodeURIComponent(id)}`} className="mb-6 inline-flex items-center gap-2 text-sm font-bold text-sky">
            <span className="material-symbols-outlined rtl:rotate-180">arrow_back</span>{t('backToActivity')}
          </Link>
          <h1 className="mb-6 font-display text-3xl font-bold text-navy lg:text-4xl">{t('reviewTitle')}</h1>
          <div className="grid gap-6 lg:grid-cols-[1fr_420px]">
            <section className="rounded-3xl bg-snow p-6 shadow-[0_16px_40px_rgba(15,24,89,0.06)] lg:p-8">
              <h2 className="font-display text-2xl font-bold text-navy">{title}</h2>
              <dl className="mt-6 space-y-4 text-sm">
                <div className="flex justify-between gap-4"><dt className="text-navy/60">{t('date')}</dt><dd className="text-end font-bold text-navy">{fmt}</dd></div>
                <div className="flex justify-between gap-4"><dt className="text-navy/60">{t('guests')}</dt><dd className="text-end font-bold text-navy">{guestSummary}</dd></div>
                <div className="flex justify-between gap-4"><dt className="text-navy/60">{t('price')}</dt><dd className="text-end font-bold text-navy">{baseUsd == null ? t('onRequest') : <Price usd={baseUsd} />}</dd></div>
                {couponCode && discountUsd > 0 && (
                  <div className="flex justify-between gap-4"><dt className="text-navy/60">{t('couponDiscount')} ({couponCode})</dt><dd className="text-end font-bold text-[#15803d]">−<Price usd={discountUsd} /></dd></div>
                )}
              </dl>
              {couponInvalid && <p role="status" className="mt-4 rounded-xl bg-[#ef4444]/10 p-3 text-sm font-bold text-[#b91c1c]">
                {t(couponError === 'alreadyUsed' ? 'alreadyUsedCoupon' : 'invalidCoupon')}
              </p>}
              <div className="mt-6 flex items-center justify-between border-t border-navy/10 pt-5">
                <span className="font-bold text-navy">{t('total')}</span>
                <span className="font-display text-2xl font-bold text-navy">{totalUsd == null ? t('onRequest') : <Price usd={totalUsd} />}</span>
              </div>
            </section>
            <ActivityBookingForm
              slug={id}
              date={date}
              adults={adults!}
              children={children!}
              infants={infants!}
              carMode={carMode}
              carTier={carTier}
              couponCode={couponCode}
              fullName={user.name}
              phone={user.phone ?? ''}
            />
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
