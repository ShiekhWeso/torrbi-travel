import {redirect} from 'next/navigation';
import {getLocale} from 'next-intl/server';
import {getCurrentUser} from '@/lib/auth';
import {updateProfile, userLogout} from '@/lib/user-actions';
import {Link} from '@/i18n/navigation';

export default async function Account({searchParams}: {searchParams: Promise<{saved?: string}>}) {
  const locale = await getLocale();
  const user = await getCurrentUser();
  if (!user) redirect(`/${locale}/login`);
  const {saved} = await searchParams;
  const ar = locale === 'ar';
  const t = (en: string, a: string) => (ar ? a : en);
  const input = 'w-full rounded-xl bg-mist px-4 py-3 font-bold text-navy focus:outline-none';

  return (
    <main className="mx-auto min-h-screen max-w-xl px-4 pb-16 pt-28">
        <Link href="/" className="mb-6 flex w-fit items-center gap-1 text-sm font-bold text-sky">
        <span className="material-symbols-outlined text-[18px] rtl:rotate-180">arrow_back</span>
        {t('Back to home', 'العودة للرئيسية')}
        </Link>
      <h1 className="font-display text-3xl font-bold leading-normal text-navy">{t('My account', 'حسابي')}</h1>
      <form action={updateProfile} className="mt-6 space-y-4 rounded-3xl bg-snow p-6 shadow-[0_16px_40px_rgba(15,24,89,0.08)]">
        <input name="name" required defaultValue={user.name} placeholder={t('Full name', 'الاسم الكامل')} className={input} />
        <input value={user.email} disabled className={`${input} opacity-60`} readOnly />
        <input name="phone" type="tel" defaultValue={user.phone ?? ''} placeholder={t('Phone', 'الهاتف')} className={input} />
        {saved && <p className="text-sm font-bold text-green-600">{t('Saved', 'تم الحفظ')}</p>}
        <button className="w-full rounded-full bg-brand-warm py-3 font-bold text-navy">{t('Save', 'حفظ')}</button>
      </form>
      <form action={userLogout} className="mt-4">
        <button className="w-full rounded-full border-2 border-navy py-3 font-bold text-navy">{t('Log out', 'تسجيل الخروج')}</button>
      </form>
    </main>
  );
}