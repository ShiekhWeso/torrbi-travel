'use client';

import {useActionState} from 'react';
import {useLocale} from 'next-intl';
import {setPassword} from '@/lib/user-actions';

export default function PasswordForm({hasPassword, saved}: {hasPassword: boolean; saved: boolean}) {
  const ar = useLocale() === 'ar';
  const t = (en: string, a: string) => (ar ? a : en);
  const [error, action, pending] = useActionState(setPassword, null);
  const input = 'w-full rounded-xl bg-mist px-4 py-3 font-bold text-navy focus:outline-none';
  const label = 'mb-1 block text-sm font-bold text-navy/70';

  return (
    <form action={action} className="mt-6 max-w-md space-y-5">
      {hasPassword && (
        <div>
          <label className={label}>{t('Current password', 'كلمة المرور الحالية')}</label>
          <input name="current" type="password" required className={input} />
        </div>
      )}
      <div>
        <label className={label}>{t('New password', 'كلمة المرور الجديدة')}</label>
        <input name="password" type="password" required minLength={8} className={input} />
      </div>
      <div>
        <label className={label}>{t('Confirm new password', 'تأكيد كلمة المرور')}</label>
        <input name="confirm" type="password" required minLength={8} className={input} />
      </div>
      {error && <p className="text-sm font-bold text-[#ef4444]">{error}</p>}
      {saved && !error && <p className="text-sm font-bold text-green-600">{t('Password saved', 'تم حفظ كلمة المرور')}</p>}
      <button
        disabled={pending}
        className="rounded-full bg-brand-warm px-10 py-3 font-bold text-navy transition-transform hover:scale-[1.02] disabled:opacity-60"
      >
        {pending ? '...' : hasPassword ? t('Change password', 'تغيير كلمة المرور') : t('Set password', 'تعيين كلمة المرور')}
      </button>
    </form>
  );
}