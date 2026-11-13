import {redirect} from 'next/navigation';
import {eq} from 'drizzle-orm';
import {getLocale} from 'next-intl/server';
import {db} from '@/lib/db';
import {users} from '@/lib/db/schema';
import {getCurrentUser} from '@/lib/auth';
import PasswordForm from '@/components/PasswordForm';

export default async function Security({searchParams}: {searchParams: Promise<{saved?: string}>}) {
  const locale = await getLocale();
  const user = await getCurrentUser();
  if (!user) redirect(`/${locale}/login`);
  const [row] = await db.select({hash: users.passwordHash, google: users.googleId}).from(users).where(eq(users.id, user.id)).limit(1);
  const {saved} = await searchParams;
  const ar = locale === 'ar';
  const t = (en: string, a: string) => (ar ? a : en);

  return (
    <section className="rounded-3xl bg-snow p-6 shadow-[0_16px_40px_rgba(15,24,89,0.06)] lg:p-8">
      <h1 className="font-display text-2xl font-bold leading-normal text-navy">{t('Password & security', 'كلمة المرور والأمان')}</h1>
      <p className="mt-1 text-sm text-navy/60">
        {row?.hash
          ? t('Change the password you use to log in with your email.', 'غيّر كلمة المرور التي تستخدمها لتسجيل الدخول بالبريد.')
          : t('You signed in with Google. Set a password to also log in with your email.', 'سجّلت الدخول عبر Google. عيّن كلمة مرور لتتمكن من الدخول بالبريد أيضاً.')}
      </p>
      <PasswordForm hasPassword={!!row?.hash} saved={saved === '1'} />
    </section>
  );
}