import {notFound, redirect} from 'next/navigation';
import {setRequestLocale, getTranslations} from 'next-intl/server';
import {and, eq} from 'drizzle-orm';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Price from '@/components/Price';
import {Link} from '@/i18n/navigation';
import {getCurrentUser} from '@/lib/auth';
import {bookingRef} from '@/lib/bookingRef';
import {safeActivityReturnTo} from '@/lib/activity-return-to';
import {db} from '@/lib/db';
import {activities, bookings} from '@/lib/db/schema';

export default async function ActivityConfirmedPage({
  params,
  searchParams
}: {
  params: Promise<{locale: string; id: string}>;
  searchParams: Promise<{booking?: string | string[]}>;
}) {
  const {locale, id} = await params;
  const search = await searchParams;
  setRequestLocale(locale);
  const t = await getTranslations({locale, namespace: 'activityBooking'});
  const rawId = Array.isArray(search.booking) ? search.booking[0] : search.booking;
  const bookingId = Number(rawId);
  if (!Number.isInteger(bookingId) || bookingId < 1) notFound();

  const returnTo = `/${locale}/activities/${encodeURIComponent(id)}/confirmed?booking=${bookingId}`;
  const user = await getCurrentUser();
  if (!user) redirect(`/${locale}/login?returnTo=${encodeURIComponent(safeActivityReturnTo(returnTo, locale) ?? `/${locale}/activities/${encodeURIComponent(id)}`)}`);

  const [row] = await db.select({booking: bookings}).from(bookings)
    .innerJoin(activities, eq(bookings.activityId, activities.id))
    .where(and(
      eq(bookings.id, bookingId),
      eq(bookings.userId, user.id),
      eq(bookings.kind, 'activity'),
      eq(activities.slug, id)
    )).limit(1);
  if (!row) notFound();

  const b = row.booking;
  const date = new Intl.DateTimeFormat(locale, {dateStyle: 'long', timeZone: 'UTC'}).format(new Date(`${b.travelDate}T00:00:00Z`));

  return (
    <>
      <Header />
      <main className="min-h-screen bg-mist pb-16 pt-32">
        <div className="mx-auto max-w-3xl px-4 lg:px-8">
          <section className="rounded-3xl bg-snow p-6 shadow-[0_16px_40px_rgba(15,24,89,0.06)] lg:p-10">
            <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-[#16a34a]/15 text-[#15803d]">
              <span className="material-symbols-outlined text-3xl">check</span>
            </div>
            <h1 className="font-display text-3xl font-bold text-navy">{t('confirmedTitle')}</h1>
            <p className="mt-3 text-navy/70">{t('confirmedMessage')}</p>
            <p className="mt-6 rounded-2xl bg-mist p-4 text-sm font-bold text-navy">
              {t('bookingReference')}: {bookingRef(b.id)}
            </p>
            <dl className="mt-6 space-y-4 text-sm">
              <div className="flex justify-between gap-4"><dt className="text-navy/60">{t('activity')}</dt><dd className="text-end font-bold text-navy">{b.packageTitle}</dd></div>
              <div className="flex justify-between gap-4"><dt className="text-navy/60">{t('date')}</dt><dd className="text-end font-bold text-navy">{date}</dd></div>
              <div className="flex justify-between gap-4"><dt className="text-navy/60">{t('guests')}</dt><dd className="text-end font-bold text-navy">{b.pax}</dd></div>
              {b.totalUsd != null && b.discountUsd != null && b.discountUsd > 0 && (
                <div className="flex justify-between gap-4"><dt className="text-navy/60">{t('couponDiscount')}</dt><dd className="text-end font-bold text-[#15803d]">−<Price usd={b.discountUsd} /></dd></div>
              )}
              <div className="flex justify-between gap-4"><dt className="text-navy/60">{t('total')}</dt><dd className="text-end font-bold text-navy">{b.totalUsd == null ? t('onRequest') : <Price usd={b.totalUsd} />}</dd></div>
              <div className="flex justify-between gap-4"><dt className="text-navy/60">{t('status')}</dt><dd className="text-end font-bold text-[#8a6410]">{t('pendingConfirmation')}</dd></div>
            </dl>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/account/bookings" className="rounded-full bg-navy px-6 py-3 font-bold text-snow">{t('myBookings')}</Link>
              <Link href="/" className="rounded-full border border-navy/20 px-6 py-3 font-bold text-navy">{t('backHome')}</Link>
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}
