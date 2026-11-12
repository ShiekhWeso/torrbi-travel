import {redirect} from 'next/navigation';
import Link from 'next/link';
import {getSession} from '@/lib/auth';
import {logout} from '../actions';

const nav = [
  ['Dashboard', '/en/admin'],
  ['Packages', '/en/admin/packages'],
  ['Destinations', '/en/admin/destinations'],
  ['Offers', '/en/admin/offers']
] as const;

export default async function PanelLayout({children}: {children: React.ReactNode}) {
  const session = await getSession();
  if (!session) redirect('/en/admin/login');

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
          <form action={logout} className="flex items-center gap-3 text-sm text-navy/70">
            {session.email}
            <button className="rounded-full bg-navy px-4 py-2 font-bold text-snow">Log out</button>
          </form>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
    </div>
  );
}