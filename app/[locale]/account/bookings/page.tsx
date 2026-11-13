import Image from 'next/image';
import {redirect} from 'next/navigation';
import {desc, eq} from 'drizzle-orm';
import {getLocale} from 'next-intl/server';
import {Link} from '@/i18n/navigation';
import {db} from '@/lib/db';
import {activities, bookings, packages} from '@/lib/db/schema';
import {getCurrentUser} from '@/lib/auth';
import {cancelBooking} from '@/lib/booking-actions';
import {bookingRef} from '@/lib/bookingRef';

const STATUS: Record<string, {en: string; ar: string; cls: string}> = {
  pending: {en: 'Pending', ar: 'قيد الانتظار', cls: 'bg-[#F2C14E]/25 text-[#8a6410]'},
  confirmed: {en: 'Confirmed', ar: 'مؤكد', cls: 'bg-[#16a34a]/15 text-[#15803d]'},
  cancelled: {en: 'Cancelled', ar: 'ملغي', cls: 'bg-[#ef4444]/15 text-[#b91c1c]'}
};

export default async function MyBookings({searchParams}: {searchParams: Promise<{new?: string}>}) {
  const {new: newBooking} = await searchParams;
  const locale = await getLocale();
  const user = await getCurrentUser();
  if (!user) redirect(`/${locale}/login`);
  const rows = await db
    .select({b: bookings, cover: packages.cover, slug: packages.slug, activityImage: activities.image, activitySlug: activities.slug})
    .from(bookings)
    .leftJoin(packages, eq(bookings.packageId, packages.id))
    .leftJoin(activities, eq(bookings.activityId, activities.id))
    .where(eq(bookings.userId, user.id))
    .orderBy(desc(bookings.createdAt));
  const ar = locale === 'ar';
  const t = (en: string, a: string) => (ar ? a : en);
  const receivedBooking = rows.find(({b}) => b.id === Number(newBooking));

  return (
    <section className="rounded-3xl bg-snow p-6 shadow-[0_16px_40px_rgba(15,24,89,0.06)] lg:p-8">
      <h1 className="font-display text-2xl font-bold leading-normal text-navy">{t('My bookings', 'حجوزاتي')}</h1>
      {receivedBooking && (
        <div className="mb-6 rounded-2xl bg-[#16a34a]/15 p-4 text-sm font-bold text-[#15803d]">
          {ar
            ? `تم استلام طلب الحجز! رقم الحجز ${bookingRef(receivedBooking.b.id)}. سيتواصل معك فريقنا قريباً للتأكيد.`
            : `Booking request received! Your reference is ${bookingRef(receivedBooking.b.id)}. Our team will contact you shortly to confirm.`}
        </div>
      )}
      {rows.length === 0 && (
        <div className="mt-6 rounded-2xl bg-mist p-8 text-center">
          <p className="text-navy/70">{t('You have no bookings yet.', 'ليس لديك حجوزات بعد.')}</p>
          <Link href="/packages" className="mt-4 inline-block rounded-full bg-brand-warm px-8 py-3 font-bold text-navy">
            {t('Browse packages', 'تصفح الباكدجات')}
          </Link>
        </div>
      )}
      <div className="mt-6 space-y-4">
        {rows.map(({b, cover, slug, activityImage, activitySlug}) => {
          const s = STATUS[b.status] ?? {en: b.status, ar: b.status, cls: 'bg-mist text-navy'};
          const image = b.kind === 'activity' ? activityImage : cover;
          const viewSlug = b.kind === 'activity' ? activitySlug : slug;
          return (
            <article key={b.id} className={`flex flex-col gap-4 rounded-2xl border p-4 sm:flex-row ${receivedBooking?.b.id === b.id ? 'border-brand-warm' : 'border-navy/10'}`}>
              {image && (
                <div className="relative h-36 w-full shrink-0 overflow-hidden rounded-xl sm:h-28 sm:w-40">
                  <Image src={image} alt="" fill sizes="160px" className="object-cover" />
                </div>
              )}
              <div className="flex-1">
                <p className="mb-1 text-xs text-navy/50">{bookingRef(b.id)}</p>
                <div className="flex items-start justify-between gap-3">
                  <h2 className="font-display text-xl font-bold leading-normal text-navy">{b.packageTitle}</h2>
                  <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-bold ${s.cls}`}>{ar ? s.ar : s.en}</span>
                </div>
                <p className="mt-1 text-sm text-navy/70">
                  {b.travelDate} · {t('Adults', 'بالغين')}: {b.pax}
                </p>
                <div className="mt-3 flex items-center justify-between">
                  {b.totalUsd != null ? <p className="font-bold text-navy">${b.totalUsd}</p> : <span />}
                  {viewSlug && (
                    <Link href={b.kind === 'activity' ? `/activities/${viewSlug}` : `/packages/${viewSlug}`} className="text-sm font-bold text-sky">
                      {b.kind === 'activity' ? t('View activity', 'عرض النشاط') : t('View package', 'عرض الباكدج')}
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