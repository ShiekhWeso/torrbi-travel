'use client';

import {useActionState} from 'react';
import {useLocale} from 'next-intl';
import {tr} from '@/lib/adminT';
import {changeOwnAdminPassword, signOutAdminOnAllDevices} from '@/app/[locale]/admin/account-actions';

export default function AdminAccountForm({mustChangePassword}: {mustChangePassword: boolean}) {
  const t = tr(useLocale());
  const [error, action, pending] = useActionState(changeOwnAdminPassword, null);
  const input = 'mt-1 w-full rounded-xl border border-navy/15 bg-white px-3 py-2 font-normal';

  return (
    <div className="space-y-6">
      {mustChangePassword && (
        <p className="rounded-xl bg-brand-warm/40 px-4 py-3 text-sm font-bold text-navy" role="status">
          {t.passwordChangeRequiredNotice}
        </p>
      )}
      <form action={action} className="space-y-4">
        <label className="block text-sm font-bold text-navy">
          {t.currentPassword}
          <input name="current" type="password" required autoComplete="current-password" className={input} />
        </label>
        <label className="block text-sm font-bold text-navy">
          {t.newPassword}
          <input name="password" type="password" required minLength={8} maxLength={72} autoComplete="new-password" className={input} />
        </label>
        <label className="block text-sm font-bold text-navy">
          {t.confirmPassword}
          <input name="confirm" type="password" required minLength={8} maxLength={72} autoComplete="new-password" className={input} />
        </label>
        {error && <p role="alert" className="text-sm font-bold text-red-600">{error}</p>}
        <button disabled={pending} className="rounded-full bg-brand-warm px-5 py-2 font-bold text-navy disabled:opacity-60">
          {t.updatePassword}
        </button>
      </form>
      <form action={signOutAdminOnAllDevices}>
        <button className="rounded-full bg-mist px-5 py-2 text-sm font-bold text-navy">{t.signOutAllDevices}</button>
      </form>
    </div>
  );
}
