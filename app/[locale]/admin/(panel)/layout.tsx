import {redirect} from 'next/navigation';
import {getLocale} from 'next-intl/server';
import {Link} from '@/i18n/navigation';
import {getSession} from '@/lib/auth';
import {tr} from '@/lib/adminT';
import LangSwitch from '@/components/admin/LangSwitch';
import {logout} from '../actions';

export default async function PanelLayout({children}: {children: React.ReactNode}) {
  const locale = await getLocale();
  const session = await getSession();
  if (!session) redirect(`/${locale}/admin/login`);
  const t = tr(locale);
  const nav = [
    [t.dashboard, '/admin'],
    [t.packages, '/admin/packages'],
    [t.destinations, '/admin/destinations'],
    [t.offers, '/admin/offers']
  ] as const;

  return (
    <div className="min-h-screen bg-mist">
      <header className="border-b border-navy/10 bg-snow">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3">
          <nav className="flex flex-wrap gap-1">
            {nav.map(([label, href]) => (
              <Link key={href} href={href} className="rounded-lg px-4 py-2 text-sm font-bold text-navy hover:bg-mist">
                {label}
              </Link>
            ))}
          </nav>
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