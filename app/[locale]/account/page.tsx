import {redirect} from 'next/navigation';
import {getLocale} from 'next-intl/server';
import {getCurrentUser} from '@/lib/auth';
import {updateProfile} from '@/lib/user-actions';

export default async function Profile({searchParams}: {searchParams: Promise<{saved?: string}>}) {
  const locale = await getLocale();
  const user = await getCurrentUser();
  if (!user) redirect(`/${locale}/login`);
  const {saved} = await searchParams;
  const ar = locale === 'ar';
  const t = (en: string, a: string) => (ar ? a : en);
  const input = 'w-full rounded-xl bg-mist px-4 py-3 font-bold text-navy focus:outline-none';
  const label = 'mb-1 block text-sm font-bold text-navy/70';

  return (
    <section className="rounded-3xl bg-snow p-6 shadow-[0_16px_40px_rgba(15,24,89,0.06)] lg:p-8">
      <h1 className="font-display text-2xl font-bold leading-normal text-navy">{t('Personal information', 'البيانات الشخصية')}</h1>
      <p className="mt-1 text-sm text-navy/60">{t('Keep your details up to date for faster bookings.', 'حافظ على تحديث بياناتك لحجز أسرع.')}</p>
      <form action={updateProfile} className="mt-6 grid gap-5 sm:grid-cols-2">
        <div>
          <label className={label}>{t('Full name', 'الاسم الكامل')}</label>
          <input name="name" required defaultValue={user.name} className={input} />
        </div>
        <div>
          <label className={label}>{t('Phone', 'الهاتف')}</label>
          <input name="phone" type="tel" defaultValue={user.phone ?? ''} className={input} />
        </div>
        <div className="sm:col-span-2">
          <label className={label}>{t('Email', 'البريد الإلكتروني')}</label>
          <input value={user.email} readOnly disabled className={`${input} opacity-60`} />
        </div>
        <div className="flex items-center gap-4 sm:col-span-2">
          <button className="rounded-full bg-brand-warm px-10 py-3 font-bold text-navy transition-transform hover:scale-[1.02]">
            {t('Save changes', 'حفظ التغييرات')}
          </button>
          {saved && <p className="text-sm font-bold text-green-600">{t('Saved', 'تم الحفظ')}</p>}
        </div>
      </form>
    </section>
  );
}