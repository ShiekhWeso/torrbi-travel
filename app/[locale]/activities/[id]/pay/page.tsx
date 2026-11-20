import {notFound, redirect} from 'next/navigation';
import {setRequestLocale, getTranslations} from 'next-intl/server';
import {and, eq} from 'drizzle-orm';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Price from '@/components/Price';
import ActivityPaymentButton from '@/components/ActivityPaymentButton';
import {getCurrentUser} from '@/lib/auth';
import {safeActivityReturnTo} from '@/lib/activity-return-to';
import {db} from '@/lib/db';
import {activities, bookings} from '@/lib/db/schema';

export default async function ActivityPayPage({
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
  if (!Number.isInteger(bookingId) || bookingId < 1) redirect(`/${locale}/activities/${encodeURIComponent(id)}`);

  const returnTo = `/${locale}/activities/${encodeURIComponent(id)}/pay?booking=${bookingId}`;
  const user = await getCurrentUser();
  if (!user) redirect(`/${locale}/login?returnTo=${encodeURIComponent(safeActivityReturnTo(returnTo, locale) ?? `/${locale}/activities/${encodeURIComponent(id)}`)}`);

  const [row] = await db.select({booking: bookings}).from(bookings)
    .leftJoin(activities, eq(bookings.activityId, activities.id))
    .where(and(
      eq(bookings.id, bookingId),
      eq(bookings.userId, user.id),
      eq(bookings.kind, 'activity'),
      eq(activities.slug, id)
    )).limit(1);
  if (!row) notFound();

  const b = row.booking;
  const subtotal = b.totalUsd == null ? null : b.totalUsd + (b.discountUsd ?? 0);
  const date = new Intl.DateTimeFormat(locale, {dateStyle: 'long', timeZone: 'UTC'}).format(new Date(`${b.travelDate}T00:00:00Z`));

  return (
    <>
      <Header />
      <main className="min-h-screen bg-mist pb-16 pt-32">
        <div className="mx-auto max-w-3xl px-4 lg:px-8">
          <section className="rounded-3xl bg-snow p-6 shadow-[0_16px_40px_rgba(15,24,89,0.06)] lg:p-10">
            <p className="text-sm font-bold text-sky">{t('paymentTitle')}</p>
            <h1 className="mt-2 font-display text-3xl font-bold text-navy">{b.packageTitle}</h1>
            <dl className="mt-6 space-y-4 text-sm">
              <div className="flex justify-between gap-4"><dt className="text-navy/60">{t('date')}</dt><dd className="text-end font-bold text-navy">{date}</dd></div>
              <div className="flex justify-between gap-4"><dt className="text-navy/60">{t('guests')}</dt><dd className="text-end font-bold text-navy">{b.pax}</dd></div>
              {subtotal != null && b.discountUsd != null && b.discountUsd > 0 && (
                <>
                  <div className="flex justify-between gap-4"><dt className="text-navy/60">{t('price')}</dt><dd className="text-end font-bold text-navy"><Price usd={subtotal} /></dd></div>
                  <div className="flex justify-between gap-4"><dt className="text-navy/60">{t('couponDiscount')}</dt><dd className="text-end font-bold text-[#15803d]">−<Price usd={b.discountUsd} /></dd></div>
                </>
              )}
            </dl>
            <div className="mt-6 flex items-center justify-between border-t border-navy/10 pt-5">
              <span className="font-bold text-navy">{t('total')}</span>
              <span className="font-display text-2xl font-bold text-navy">{b.totalUsd == null ? t('onRequest') : <Price usd={b.totalUsd} />}</span>
            </div>
            <div className="mt-8">
              <ActivityPaymentButton bookingId={b.id} activityId={id} />
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}
