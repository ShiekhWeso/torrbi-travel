import {count, desc, eq} from 'drizzle-orm';
import {getLocale} from 'next-intl/server';
import {Link} from '@/i18n/navigation';
import {tr} from '@/lib/adminT';
import {db} from '@/lib/db';
import {bookings, users} from '@/lib/db/schema';

export default async function CustomersPage() {
  const locale = await getLocale();
  const t = tr(locale);
  const customers = await db
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
    .groupBy(users.id)
    .orderBy(desc(users.createdAt));

  return (
    <div>
      <h1 className="mb-6 font-display text-3xl text-navy">{t.customers}</h1>
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
