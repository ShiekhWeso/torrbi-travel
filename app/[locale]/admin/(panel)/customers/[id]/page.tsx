import {notFound} from 'next/navigation';
import {desc, eq} from 'drizzle-orm';
import {getLocale} from 'next-intl/server';
import {tr} from '@/lib/adminT';
import {db} from '@/lib/db';
import {bookings, pageViews, users} from '@/lib/db/schema';
import {bookingRef} from '@/lib/bookingRef';

export default async function CustomerDetails({params}: {params: Promise<{id: string}>}) {
  const {id} = await params;
  const userId = Number(id);
  if (!Number.isInteger(userId) || userId <= 0) notFound();

  const locale = await getLocale();
  const t = tr(locale);
  const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  if (!user) notFound();

  const [customerBookings, views] = await Promise.all([
    db.select().from(bookings).where(eq(bookings.userId, userId)).orderBy(desc(bookings.createdAt)),
    db.select().from(pageViews).where(eq(pageViews.userId, userId)).orderBy(desc(pageViews.createdAt)).limit(50)
  ]);
  const dateTime = new Intl.DateTimeFormat(locale === 'ar' ? 'ar' : 'en-US', {
    dateStyle: 'medium',
    timeStyle: 'short'
  });
  const statusLabel = (status: string) => status === 'pending'
    ? t.pending
    : status === 'confirmed'
      ? t.confirmed
      : status === 'cancelled'
        ? t.cancelled
        : status;

  return (
    <div>
      <h1 className="mb-6 font-display text-3xl text-navy">{t.customerActivity}</h1>
      <section className="rounded-2xl bg-snow p-6">
        <dl className="grid gap-4 sm:grid-cols-2">
          <div><dt className="text-sm text-navy/60">{t.name}</dt><dd className="font-bold text-navy">{user.name}</dd></div>
          <div><dt className="text-sm text-navy/60">{t.email}</dt><dd className="font-bold text-navy">{user.email}</dd></div>
          <div><dt className="text-sm text-navy/60">{t.phone}</dt><dd className="font-bold text-navy">{user.phone ?? '—'}</dd></div>
          <div><dt className="text-sm text-navy/60">{t.nationality}</dt><dd className="font-bold text-navy">{user.nationality ?? '—'}</dd></div>
          <div><dt className="text-sm text-navy/60">{t.joined}</dt><dd className="font-bold text-navy">{dateTime.format(user.createdAt)}</dd></div>
        </dl>
      </section>

      <section className="mt-8">
        <h2 className="mb-4 font-display text-2xl font-bold text-navy">{t.bookings}</h2>
        <div className="divide-y divide-navy/10 rounded-2xl bg-snow">
          {customerBookings.length === 0 && <p className="p-6 text-navy/60">{t.noItems}</p>}
          {customerBookings.map((booking) => (
            <article key={booking.id} className="space-y-2 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="font-bold text-navy">{bookingRef(booking.id)} · {booking.packageTitle}</h3>
                <span className="rounded-full bg-mist px-3 py-1 text-xs font-bold text-navy">{statusLabel(booking.status)}</span>
              </div>
              <p className="text-sm text-navy/70">
                {t.travelDate}: {booking.travelDate} · {t.returnDate}: {booking.returnDate ?? '—'}
              </p>
              <p className="text-sm text-navy/70">
                {t.adults}: {booking.adults ?? '—'} · {t.children}: {booking.children ?? '—'} · {t.infants}: {booking.infants ?? '—'}
              </p>
              {booking.notes && <p className="text-sm text-navy/70">{t.notes}: {booking.notes}</p>}
              <p className="text-sm font-bold text-navy">{t.total}: {booking.totalUsd == null ? '—' : `$${booking.totalUsd} USD`}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-8">
        <h2 className="mb-4 font-display text-2xl font-bold text-navy">{t.pageViews}</h2>
        <div className="divide-y divide-navy/10 rounded-2xl bg-snow">
          {views.length === 0 && <p className="p-6 text-navy/60">{t.noItems}</p>}
          {views.map((view) => (
            <div key={view.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
              <span className="break-all text-navy">{view.path}</span>
              <time className="text-sm text-navy/60">{dateTime.format(view.createdAt)}</time>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
