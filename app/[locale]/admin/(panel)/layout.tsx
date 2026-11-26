import {redirect} from 'next/navigation';
import {getLocale} from 'next-intl/server';
import {count, eq} from 'drizzle-orm';
import {getSession} from '@/lib/auth';
import {db} from '@/lib/db';
import {bookings, feedback} from '@/lib/db/schema';
import {tr} from '@/lib/adminT';
import AdminNav from '@/components/admin/AdminNav';
import LangSwitch from '@/components/admin/LangSwitch';
import UnsavedChangesGuard from '@/components/admin/UnsavedChangesGuard';
import {logout} from '../actions';

export default async function PanelLayout({children}: {children: React.ReactNode}) {
  const [locale, session] = await Promise.all([getLocale(), getSession()]);
  if (!session) redirect(`/${locale}/admin/login`);
  if (session.mustChangePassword) redirect(`/${locale}/admin/account`);
  const t = tr('ar');
  const [[pendingRow], [feedbackRow]] = await Promise.all([
    db.select({value: count()}).from(bookings).where(eq(bookings.status, 'pending')),
    db.select({value: count()}).from(feedback).where(eq(feedback.status, 'new'))
  ]);
  const pendingCount = pendingRow?.value ?? 0;
  const feedbackCount = feedbackRow?.value ?? 0;
  const nav = [
    [t.dashboard, '/admin'],
    [t.packages, '/admin/packages'],
    [t.bookings, '/admin/bookings'],
    [t.feedback, '/admin/feedback'],
    [t.customers, '/admin/customers'],
    [t.destinations, '/admin/destinations'],
    [t.activities, '/admin/activities'],
    [t.reviews, '/admin/reviews'],
    [t.offers, '/admin/offers'],
    [t.coupons, '/admin/coupons'],
    [t.faq, '/admin/faqs'],
    [t.contact, '/admin/contact'],
    [t.searchOptions, '/admin/search'],
    ['العملة', '/admin/currency'],
    ...(session.role === 'owner' ? [[t.admins, '/admin/admins'] as const] : []),
    [t.myAccount, '/admin/account']
  ] as const;

  return (
    <div className="min-h-screen bg-mist">
      <UnsavedChangesGuard />
      <header className="border-b border-navy/10 bg-snow">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3">
          <AdminNav items={nav} pendingCount={pendingCount} feedbackCount={feedbackCount} />
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