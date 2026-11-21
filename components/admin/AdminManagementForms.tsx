'use client';

import {useActionState} from 'react';
import {useLocale} from 'next-intl';
import {tr} from '@/lib/adminT';
import AdminPasswordField from '@/components/admin/AdminPasswordField';
import ConfirmButton from '@/components/admin/ConfirmButton';
import {
  changeAdminRole,
  createAdmin,
  deleteAdmin,
  resetAdminPassword,
  signOutAdminEverywhere
} from '@/app/[locale]/admin/(panel)/admins/actions';

export function AddAdminForm() {
  const t = tr(useLocale());
  const [error, action, pending] = useActionState(createAdmin, null);
  return (
    <form action={action} className="space-y-4 rounded-2xl bg-snow p-5 shadow-sm">
      <h2 className="font-display text-xl font-bold text-navy">{t.addAdmin}</h2>
      <label className="block text-sm font-bold text-navy">
        {t.email}
        <input name="email" type="email" required maxLength={254} autoComplete="off" className="mt-1 w-full rounded-xl border border-navy/15 bg-white px-3 py-2 font-normal" />
      </label>
      <label className="block text-sm font-bold text-navy">
        {t.role}
        <select name="role" defaultValue="staff" className="mt-1 w-full rounded-xl border border-navy/15 bg-white px-3 py-2 font-normal">
          <option value="staff">{t.staff}</option>
          <option value="owner">{t.owner}</option>
        </select>
      </label>
      <AdminPasswordField name="password" />
      <p className="text-xs text-navy/60">{t.neverEmailPassword}</p>
      {error && <p role="alert" className="text-sm font-bold text-red-600">{error}</p>}
      <button disabled={pending} className="rounded-full bg-brand-warm px-5 py-2 font-bold text-navy disabled:opacity-60">{t.addAdmin}</button>
    </form>
  );
}

export function AdminRowActions({id, role, isSelf}: {id: number; role: 'owner' | 'staff'; isSelf: boolean}) {
  const t = tr(useLocale());
  const [error, resetAction, pending] = useActionState(resetAdminPassword, null);
  return (
    <div className="mt-4 space-y-3 border-t border-navy/10 pt-4">
      <form action={resetAction} className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
        <input type="hidden" name="id" value={id} />
        <AdminPasswordField name="password" />
        <button disabled={pending} className="rounded-full bg-mist px-4 py-2 text-sm font-bold text-navy disabled:opacity-60">{t.resetPassword}</button>
      </form>
      {error && <p role="alert" className="text-sm font-bold text-red-600">{error}</p>}
      <div className="flex flex-wrap items-center gap-3">
        <form action={signOutAdminEverywhere}>
          <input type="hidden" name="id" value={id} />
          <button className="rounded-full bg-mist px-4 py-2 text-sm font-bold text-navy">{t.signOutEverywhere}</button>
        </form>
        <form action={changeAdminRole} className="flex items-center gap-2">
          <input type="hidden" name="id" value={id} />
          <select name="role" defaultValue={role} aria-label={t.role} className="rounded-xl border border-navy/15 bg-white px-3 py-2 text-sm">
            <option value="staff">{t.staff}</option>
            <option value="owner">{t.owner}</option>
          </select>
          <button className="rounded-full bg-mist px-4 py-2 text-sm font-bold text-navy">{t.changeRole}</button>
        </form>
        <form action={deleteAdmin}>
          <input type="hidden" name="id" value={id} />
          <ConfirmButton disabled={isSelf} className="rounded-full px-4 py-2 text-sm font-bold text-red-600 disabled:opacity-40">{t.delete}</ConfirmButton>
        </form>
      </div>
    </div>
  );
}
