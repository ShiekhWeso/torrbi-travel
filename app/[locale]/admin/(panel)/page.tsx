import {and, count, desc, eq, gte, lt, sql} from 'drizzle-orm';
import {Link} from '@/i18n/navigation';
import {db} from '@/lib/db';
import {bookings, packages, destinations, offers, pageViews, users} from '@/lib/db/schema';
import {tr} from '@/lib/adminT';
import {bookingRef} from '@/lib/bookingRef';

export default async function Dashboard() {
  const t = tr('ar');
  const now = new Date();
  const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const tomorrow = new Date(today.getTime() + 86400000);
  const weekStart = new Date(today.getTime() - 6 * 86400000);
  const dayExpression = sql<string>`to_char(${pageViews.createdAt} AT TIME ZONE 'UTC', 'YYYY-MM-DD')`;
  const uniqueVisitorsExpression = sql<number>`count(distinct ${pageViews.visitorId})`.mapWith(Number);
  const [
    p, d, o, totalBookings, totalCustomers, pendingRows, todayRows, newCustomerRows, latest,
    visitsTodayRows, uniqueTodayRows, uniqueWeekRows, dailyRows, topPages
  ] = await Promise.all([
    db.$count(packages),
    db.$count(destinations),
    db.$count(offers),
    db.$count(bookings),
    db.$count(users),
    db.select({value: count()}).from(bookings).where(eq(bookings.status, 'pending')),
    db.select({value: count()}).from(bookings).where(and(gte(bookings.createdAt, today), lt(bookings.createdAt, tomorrow))),
    db.select({value: count()}).from(users).where(gte(users.createdAt, new Date(now.getTime() - 7 * 86400000))),
    db.select({id: bookings.id, title: bookings.packageTitle, status: bookings.status, customer: users.name})
      .from(bookings)
      .innerJoin(users, eq(bookings.userId, users.id))
      .orderBy(desc(bookings.createdAt))
      .limit(5),
    db.select({value: count()}).from(pageViews).where(and(gte(pageViews.createdAt, today), lt(pageViews.createdAt, tomorrow))),
    db.select({value: uniqueVisitorsExpression}).from(pageViews).where(and(gte(pageViews.createdAt, today), lt(pageViews.createdAt, tomorrow))),
    db.select({value: uniqueVisitorsExpression}).from(pageViews).where(and(gte(pageViews.createdAt, weekStart), lt(pageViews.createdAt, tomorrow))),
    db.select({
      date: dayExpression,
      visits: count(),
      uniqueVisitors: uniqueVisitorsExpression
    })
      .from(pageViews)
      .where(and(gte(pageViews.createdAt, weekStart), lt(pageViews.createdAt, tomorrow)))
      .groupBy(dayExpression)
      .orderBy(dayExpression),
    db.select({path: pageViews.path, visits: count()})
      .from(pageViews)
      .where(and(gte(pageViews.createdAt, weekStart), lt(pageViews.createdAt, tomorrow)))
      .groupBy(pageViews.path)
      .orderBy(desc(count()))
      .limit(10)
  ]);
  const pendingBookings = pendingRows[0]?.value ?? 0;
  const bookingsToday = todayRows[0]?.value ?? 0;
  const newCustomers = newCustomerRows[0]?.value ?? 0;
  const visitsToday = visitsTodayRows[0]?.value ?? 0;
  const uniqueVisitorsToday = uniqueTodayRows[0]?.value ?? 0;
  const uniqueVisitorsWeek = uniqueWeekRows[0]?.value ?? 0;
  const dailyStats = Array.from({length: 7}, (_, index) => {
    const date = new Date(weekStart.getTime() + index * 86400000).toISOString().slice(0, 10);
    const row = dailyRows.find((item) => item.date === date);
    return {date, visits: row?.visits ?? 0, uniqueVisitors: row?.uniqueVisitors ?? 0};
  });
  const cards = [
    [t.pendingBookings, pendingBookings],
    [t.bookingsToday, bookingsToday],
    [t.totalBookings, totalBookings],
    [t.totalCustomers, totalCustomers],
    [t.newCustomers, newCustomers],
    [t.visitsToday, visitsToday],
    [t.uniqueVisitorsToday, uniqueVisitorsToday],
    [t.uniqueVisitorsWeek, uniqueVisitorsWeek],
    [t.packages, p],
    [t.destinations, d],
    [t.offers, o]
  ] as const;
  const statusLabel = (status: string) => status === 'pending'
    ? t.pending
    : status === 'confirmed'
      ? t.confirmed
      : status === 'cancelled'
        ? t.cancelled
        : status;

  return (
    <>
      <h1 className="font-display text-3xl font-bold text-navy">{t.dashboard}</h1>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map(([label, n]) => (
          <div key={label} className="rounded-2xl bg-snow p-6 shadow-[0_8px_24px_rgba(15,24,89,0.06)]">
            <p className="text-sm text-navy/60">{label}</p>
            <p className="font-display text-4xl font-bold text-navy">{n}</p>
          </div>
        ))}
      </div>
      <section className="mt-8">
        <h2 className="mb-4 font-display text-2xl font-bold text-navy">{t.latestBookings}</h2>
        <div className="divide-y divide-navy/10 rounded-2xl bg-snow">
          {latest.length === 0 && <p className="p-6 text-navy/60">{t.noItems}</p>}
          {latest.map((booking) => (
            <Link key={booking.id} href="/admin/bookings" className="flex flex-wrap items-center justify-between gap-3 p-4 hover:bg-mist">
              <span className="font-bold text-navy">{bookingRef(booking.id)} · {booking.title}</span>
              <span className="text-sm text-navy/70">{booking.customer} · {statusLabel(booking.status)}</span>
            </Link>
          ))}
        </div>
      </section>
      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <section>
          <h2 className="mb-4 font-display text-2xl font-bold text-navy">{t.dailyTraffic}</h2>
          <div className="overflow-x-auto rounded-2xl bg-snow">
            <table className="w-full text-start text-sm">
              <thead className="border-b border-navy/10 text-navy/60">
                <tr>
                  <th className="px-4 py-3 text-start font-bold">{t.date}</th>
                  <th className="px-4 py-3 text-end font-bold">{t.visits}</th>
                  <th className="px-4 py-3 text-end font-bold">{t.uniqueVisitors}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-navy/10">
                {dailyStats.map((row) => (
                  <tr key={row.date}>
                    <td className="px-4 py-3 text-start text-navy/70">{row.date}</td>
                    <td className="px-4 py-3 text-end text-navy/70">{row.visits}</td>
                    <td className="px-4 py-3 text-end text-navy/70">{row.uniqueVisitors}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
        <section>
          <h2 className="mb-4 font-display text-2xl font-bold text-navy">{t.topPages}</h2>
          <div className="divide-y divide-navy/10 rounded-2xl bg-snow">
            {topPages.length === 0 && <p className="p-6 text-navy/60">{t.noItems}</p>}
            {topPages.map((page) => (
              <div key={page.path} className="flex items-center justify-between gap-4 p-4">
                <span className="break-all text-navy">{page.path}</span>
                <span className="shrink-0 text-sm font-bold text-navy/70">
                  {page.visits} {page.visits === 1 ? 'زيارة واحدة' : 'زيارات'}
                </span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}