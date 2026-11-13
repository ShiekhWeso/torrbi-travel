import {redirect} from 'next/navigation';
import {desc, eq} from 'drizzle-orm';
import {getLocale} from 'next-intl/server';
import {Link} from '@/i18n/navigation';
import {db} from '@/lib/db';
import {bookings} from '@/lib/db/schema';
import {getCurrentUser} from '@/lib/auth';

export default async function MyBookings() {
  const locale = await getLocale();
  const user = await getCurrentUser();
  if (!user) redirect(`/${locale}/login`);
  const rows = await db.select().from(bookings).where(eq(bookings.userId, user.id)).orderBy(desc(bookings.createdAt));
  const ar = locale === 'ar';
  const t = (en: string, a: string) => (ar ? a : en);
  const status: Record<string, [string, string]> = {
    pending: ['Pending', 'قيد الانتظار'],
    confirmed: ['Confirmed', 'مؤكد'],
    cancelled: ['Cancelled', 'ملغي']
  };

  return (
    <main className="mx-auto min-h-screen max-w-3xl px-4 pb-16 pt-28">
      <Link href="/account" className="mb-6 flex w-fit items-center gap-1 text-sm font-bold text-sky">
        <span className="material-symbols-outlined text-[18px] rtl:rotate-180">arrow_back</span>
        {t('My account', 'حسابي')}
      </Link>
      <h1 className="font-display text-3xl font-bold leading-normal text-navy">{t('My bookings', 'حجوزاتي')}</h1>
      <div className="mt-6 space-y-4">
        {rows.length === 0 && <p className="text-navy/70">{t('No bookings yet.', 'لا توجد حجوزات بعد.')}</p>}
        {rows.map((b) => (
          <article key={b.id} className="rounded-3xl bg-snow p-6 shadow-[0_16px_40px_rgba(15,24,89,0.08)]">
            <div className="flex items-start justify-between gap-4">
              <h2 className="font-display text-xl font-bold text-navy">{b.packageTitle}</h2>
              <span className="rounded-full bg-mist px-3 py-1 text-xs font-bold text-navy">
                {(status[b.status] ?? [b.status, b.status])[ar ? 1 : 0]}
              </span>
            </div>
            <p className="mt-2 text-sm text-navy/70">
              {b.travelDate} · {t('Adults', 'بالغين')}: {b.pax}
            </p>
            {b.totalUsd != null && <p className="mt-2 font-bold text-navy">${b.totalUsd}</p>}
          </article>
        ))}
      </div>
    </main>
  );
}