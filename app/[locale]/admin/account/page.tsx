import {redirect} from 'next/navigation';
import {getLocale} from 'next-intl/server';
import {Link} from '@/i18n/navigation';
import {getSession} from '@/lib/auth';
import {tr} from '@/lib/adminT';
import AdminAccountForm from '@/components/admin/AdminAccountForm';
import {logout} from '../actions';

export default async function AdminAccountPage({searchParams}: {searchParams: Promise<{changed?: string}>}) {
  const [locale, session, params] = await Promise.all([getLocale(), getSession(), searchParams]);
  if (!session) redirect(`/${locale}/admin/login`);
  const t = tr('ar');
  return (
    <main className="min-h-screen bg-mist px-4 py-8">
      <div className="mx-auto max-w-2xl space-y-6">
        <header className="flex flex-wrap items-center justify-between gap-3">
          <div>
            {!session.mustChangePassword && <Link href="/admin" className="text-sm font-bold text-navy underline">{t.dashboard}</Link>}
            <h1 className="mt-2 font-display text-3xl font-bold text-navy">{t.accountPasswordTitle}</h1>
            <p className="mt-1 break-all text-sm text-navy/60">{session.email}</p>
          </div>
          <form action={logout}>
            <button className="rounded-full bg-navy px-4 py-2 text-sm font-bold text-snow">{t.logout}</button>
          </form>
        </header>
        <section className="rounded-3xl bg-snow p-5 shadow-[0_16px_40px_rgba(15,24,89,0.06)] sm:p-8">
          <h2 className="mb-5 font-display text-xl font-bold text-navy">{t.changeMyPassword}</h2>
          {params.changed === '1' && <p role="status" className="mb-4 text-sm font-bold text-green-700">{t.passwordChanged}</p>}
          <AdminAccountForm mustChangePassword={session.mustChangePassword} />
        </section>
      </div>
    </main>
  );
}
