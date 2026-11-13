import Image from 'next/image';
import {redirect} from 'next/navigation';
import {desc, eq} from 'drizzle-orm';
import {getLocale} from 'next-intl/server';
import {Link} from '@/i18n/navigation';
import {db} from '@/lib/db';
import {bookings, packages} from '@/lib/db/schema';
import {getCurrentUser} from '@/lib/auth';
import {cancelBooking} from '@/lib/booking-actions';

const STATUS: Record<string, {en: string; ar: string; cls: string}> = {
  pending: {en: 'Pending', ar: 'قيد الانتظار', cls: 'bg-[#F2C14E]/25 text-[#8a6410]'},
  confirmed: {en: 'Confirmed', ar: 'مؤكد', cls: 'bg-[#16a34a]/15 text-[#15803d]'},
  cancelled: {en: 'Cancelled', ar: 'ملغي', cls: 'bg-[#ef4444]/15 text-[#b91c1c]'}
};

export default async function MyBookings() {
  const locale = await getLocale();
  const user = await getCurrentUser();
  if (!user) redirect(`/${locale}/login`);
  const rows = await db
    .select({b: bookings, cover: packages.cover, slug: packages.slug})
    .from(bookings)
    .leftJoin(packages, eq(bookings.packageId, packages.id))
    .where(eq(bookings.userId, user.id))
    .orderBy(desc(bookings.createdAt));
  const ar = locale === 'ar';
  const t = (en: string, a: string) => (ar ? a : en);

  return (
    <section className="rounded-3xl bg-snow p-6 shadow-[0_16px_40px_rgba(15,24,89,0.06)] lg:p-8">
      <h1 className="font-display text-2xl font-bold leading-normal text-navy">{t('My bookings', 'حجوزاتي')}</h1>
      {rows.length === 0 && (
        <div className="mt-6 rounded-2xl bg-mist p-8 text-center">
          <p className="text-navy/70">{t('You have no bookings yet.', 'ليس لديك حجوزات بعد.')}</p>
          <Link href="/packages" className="mt-4 inline-block rounded-full bg-brand-warm px-8 py-3 font-bold text-navy">
            {t('Browse packages', 'تصفح الباكدجات')}
          </Link>
        </div>
      )}
      <div className="mt-6 space-y-4">
        {rows.map(({b, cover, slug}) => {
          const s = STATUS[b.status] ?? {en: b.status, ar: b.status, cls: 'bg-mist text-navy'};
          return (
            <article key={b.id} className="flex flex-col gap-4 rounded-2xl border border-navy/10 p-4 sm:flex-row">
              {cover && (
                <div className="relative h-36 w-full shrink-0 overflow-hidden rounded-xl sm:h-28 sm:w-40">
                  <Image src={cover} alt="" fill sizes="160px" className="object-cover" />
                </div>
              )}
              <div className="flex-1">
                <div className="flex items-start justify-between gap-3">
                  <h2 className="font-display text-xl font-bold leading-normal text-navy">{b.packageTitle}</h2>
                  <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-bold ${s.cls}`}>{ar ? s.ar : s.en}</span>
                </div>
                <p className="mt-1 text-sm text-navy/70">
                  {b.travelDate} · {t('Adults', 'بالغين')}: {b.pax}
                </p>
                <div className="mt-3 flex items-center justify-between">
                  {b.totalUsd != null ? <p className="font-bold text-navy">${b.totalUsd}</p> : <span />}
                  {slug && (
                    <Link href={`/packages/${slug}`} className="text-sm font-bold text-sky">
                      {t('View package', 'عرض الباكدج')}
                    </Link>
                  )}
                </div>
                {b.status === 'pending' && (
                  <form action={cancelBooking} className="mt-3">
                    <input type="hidden" name="id" value={b.id} />
                    <button className="text-sm font-bold text-[#ef4444] hover:underline">
                      {t('Cancel booking', 'إلغاء الحجز')}
                    </button>
                  </form>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}