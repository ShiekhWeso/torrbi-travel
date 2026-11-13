import {redirect} from 'next/navigation';
import {getLocale} from 'next-intl/server';
import Header from '@/components/Header';
import AccountNav from '@/components/AccountNav';
import {getCurrentUser} from '@/lib/auth';

export default async function AccountLayout({children}: {children: React.ReactNode}) {
  const locale = await getLocale();
  const user = await getCurrentUser();
  if (!user) redirect(`/${locale}/login`);
  return (
    <>
      <Header hideAuth />
      <main className="min-h-screen bg-mist pb-16 pt-28">
        <div className="mx-auto max-w-6xl px-4 lg:px-8">
          <div className="mb-6 flex items-center gap-4 rounded-3xl bg-navy p-6 text-snow">
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-warm font-display text-2xl font-bold text-navy">
              {user.name[0]?.toUpperCase()}
            </span>
            <div>
              <p className="font-display text-2xl font-bold leading-normal">{user.name}</p>
              <p className="text-sm text-snow/70">{user.email}</p>
            </div>
          </div>
          <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
            <AccountNav />
            <div>{children}</div>
          </div>
        </div>
      </main>
    </>
  );
}