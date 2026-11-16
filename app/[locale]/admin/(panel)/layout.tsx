import {redirect} from 'next/navigation';
import {getLocale} from 'next-intl/server';
import {count, eq} from 'drizzle-orm';
import {getSession} from '@/lib/auth';
import {db} from '@/lib/db';
import {bookings} from '@/lib/db/schema';
import {tr} from '@/lib/adminT';
import AdminNav from '@/components/admin/AdminNav';
import LangSwitch from '@/components/admin/LangSwitch';
import UnsavedChangesGuard from '@/components/admin/UnsavedChangesGuard';
import {logout} from '../actions';

export default async function PanelLayout({children}: {children: React.ReactNode}) {
  const locale = await getLocale();
  const session = await getSession();
  if (!session) redirect(`/${locale}/admin/login`);
  const t = tr(locale);
  const [pendingRow] = await db.select({value: count()}).from(bookings).where(eq(bookings.status, 'pending'));
  const pendingCount = pendingRow?.value ?? 0;
  const nav = [
    [t.dashboard, '/admin'],
    [t.packages, '/admin/packages'],
    [t.bookings, '/admin/bookings'],
    [t.customers, '/admin/customers'],
    [t.destinations, '/admin/destinations'],
    [t.activities, '/admin/activities'],
    [t.offers, '/admin/offers'],
    [t.coupons, '/admin/coupons'],
    [t.faq, '/admin/faqs'],
    [t.contact, '/admin/contact'],
    ['Currency / العملة', '/admin/currency']
  ] as const;

  return (
    <div className="min-h-screen bg-mist">
      <UnsavedChangesGuard />
      <header className="border-b border-navy/10 bg-snow">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3">
          <AdminNav items={nav} pendingCount={pendingCount} />
          <div className="flex items-center gap-3 text-sm text-navy/70">
            <LangSwitch />
            <form action={logout} className="flex items-center gap-3">
              {session.email}
              <button className="rounded-full bg-navy px-4 py-2 font-bold text-snow">{t.logout}</button>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
    </div>
  );
}