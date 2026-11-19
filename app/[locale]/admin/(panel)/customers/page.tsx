import {asc, count, desc, eq, isNotNull} from 'drizzle-orm';
import {getLocale} from 'next-intl/server';
import {Link} from '@/i18n/navigation';
import {tr} from '@/lib/adminT';
import {db} from '@/lib/db';
import {bookings, users} from '@/lib/db/schema';

export default async function CustomersPage({
  searchParams
}: {
  searchParams: Promise<{sort?: string; nationality?: string}>;
}) {
  const sp = await searchParams;
  const sort = sp.sort === 'oldest' ? 'oldest' : 'newest';
  const nat = sp.nationality?.trim() || '';
  const locale = await getLocale();
  const t = tr(locale);
  const i = locale === 'ar' ? 1 : 0;

  const [customers, natRows, [{total}]] = await Promise.all([
    db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        phone: users.phone,
        nationality: users.nationality,
        createdAt: users.createdAt,
        bookingsCount: count(bookings.id)
      })
      .from(users)
      .leftJoin(bookings, eq(bookings.userId, users.id))
      .where(nat ? eq(users.nationality, nat) : undefined)
      .groupBy(users.id)
      .orderBy(sort === 'oldest' ? asc(users.createdAt) : desc(users.createdAt)),
    db
      .select({nationality: users.nationality, n: count()})
      .from(users)
      .where(isNotNull(users.nationality))
      .groupBy(users.nationality)
      .orderBy(desc(count())),
    db.select({total: count()}).from(users)
  ]);

  const href = (s: string, n: string) =>
    `/admin/customers?sort=${s}${n ? `&nationality=${encodeURIComponent(n)}` : ''}`;
  const chip = (active: boolean) =>
    `rounded-full px-4 py-1 text-sm font-bold ${active ? 'bg-navy text-white' : 'bg-snow text-navy'}`;

  return (
    <div>
      <h1 className="mb-2 font-display text-3xl text-navy">{t.customers}</h1>
      <p className="mb-6 text-navy/70">
        {t.totalCustomers}: <b className="text-navy">{total}</b>
        {nat && <> · {nat}: <b className="text-navy">{customers.length}</b></>}
      </p>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <span className="text-sm text-navy/60">{i ? 'الترتيب' : 'Sort'}:</span>
        <Link href={href('newest', nat)} className={chip(sort === 'newest')}>{i ? 'الأحدث' : 'Newest'}</Link>
        <Link href={href('oldest', nat)} className={chip(sort === 'oldest')}>{i ? 'الأقدم' : 'Oldest'}</Link>
      </div>

      <div className="mb-6 flex flex-wrap items-center gap-2">
        <span className="text-sm text-navy/60">{t.nationality}:</span>
        <Link href={href(sort, '')} className={chip(!nat)}>{i ? 'الكل' : 'All'} ({total})</Link>
        {natRows.map((r) => (
          <Link key={r.nationality} href={href(sort, r.nationality!)} className={chip(nat === r.nationality)}>
            {r.nationality} ({r.n})
          </Link>
        ))}
      </div>

      <div className="overflow-x-auto rounded-2xl bg-snow">
        <table className="w-full text-start text-sm">
          <thead className="border-b border-navy/10 text-navy/60">
            <tr>
              <th className="px-4 py-3 font-bold">{t.name}</th>
              <th className="px-4 py-3 font-bold">{t.email}</th>
              <th className="px-4 py-3 font-bold">{t.phone}</th>
              <th className="px-4 py-3 font-bold">{t.nationality}</th>
              <th className="px-4 py-3 font-bold">{t.joined}</th>
              <th className="px-4 py-3 font-bold">{t.bookingsCount}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-navy/10">
            {customers.map((customer) => (
              <tr key={customer.id}>
                <td className="px-4 py-3 font-bold text-navy">
                  <Link href={`/admin/customers/${customer.id}`} className="underline">{customer.name}</Link>
                </td>
                <td className="px-4 py-3 text-navy/70">{customer.email}</td>
                <td className="px-4 py-3 text-navy/70">{customer.phone ?? '—'}</td>
                <td className="px-4 py-3 text-navy/70">{customer.nationality ?? '—'}</td>
                <td className="px-4 py-3 text-navy/70">{customer.createdAt.toLocaleDateString(locale === 'ar' ? 'ar' : 'en-US')}</td>
                <td className="px-4 py-3 text-navy/70">{customer.bookingsCount}</td>
              </tr>
            ))}
            {customers.length === 0 && <tr><td colSpan={6} className="p-6 text-center text-navy/60">{t.noItems}</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}