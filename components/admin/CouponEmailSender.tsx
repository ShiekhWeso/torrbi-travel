'use client';

import {useActionState, useMemo, useState} from 'react';
import {useLocale} from 'next-intl';
import ConfirmButton from '@/components/admin/ConfirmButton';
import {sendCouponEmails} from '@/app/[locale]/admin/actions';
import type {CouponEmailResult} from '@/app/[locale]/admin/actions';
import {tr} from '@/lib/adminT';

type Customer = {id: number; name: string; email: string; nationality: string | null};

const initialResult: CouponEmailResult = {sent: 0, failed: 0, skipped: 0};

export default function CouponEmailSender({
  couponId,
  customers,
  usedUserIds
}: {
  couponId: number;
  customers: Customer[];
  usedUserIds: number[];
}) {
  const locale = useLocale();
  const t = tr('ar');
  const [mode, setMode] = useState<'all' | 'selected'>('all');
  const [query, setQuery] = useState('');
  const [nationality, setNationality] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [result, formAction, pending] = useActionState(sendCouponEmails, initialResult);
  const used = useMemo(() => new Set(usedUserIds), [usedUserIds]);
  const nationalities = useMemo(
    () => [...new Set(customers.map(({nationality: value}) => value).filter((value): value is string => Boolean(value)))].sort(),
    [customers]
  );
  const shown = customers.filter((customer) => {
    const text = `${customer.name} ${customer.email} ${customer.nationality ?? ''}`.toLocaleLowerCase(locale);
    return text.includes(query.toLocaleLowerCase(locale)) &&
      (!nationality || customer.nationality === nationality);
  });
  const selectableShown = shown.filter(({id}) => !used.has(id));
  const selectedCount = [...selectedIds].filter((id) => !used.has(id)).length;
  const emailCount = Math.min(100, mode === 'all'
    ? customers.filter(({id}) => !used.has(id)).length
    : selectedCount);
  const selectedOutsideShown = [...selectedIds].filter((id) => !shown.some(({id: shownId}) => shownId === id));
  const messageCount = (count: number) => `هل تريد إرسال هذا الكوبون إلى ${count} عميل؟`;
  const toggleShown = (checked: boolean) => {
    setSelectedIds((previous) => {
      const next = new Set(previous);
      for (const customer of selectableShown) {
        if (checked) next.add(customer.id);
        else next.delete(customer.id);
      }
      return next;
    });
  };
  const resultText = t.emailSendResult
    .replace('{sent}', String(result.sent))
    .replace('{failed}', String(result.failed))
    .replace('{skipped}', String(result.skipped));

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="couponId" value={couponId} />
      <div className="flex flex-wrap gap-5 text-sm font-bold text-navy">
        <label className="flex items-center gap-2">
          <input type="radio" name="deliveryMode" value="all" checked={mode === 'all'} onChange={() => setMode('all')} />
          {t.allCustomers}
        </label>
        <label className="flex items-center gap-2">
          <input type="radio" name="deliveryMode" value="selected" checked={mode === 'selected'} onChange={() => setMode('selected')} />
          {t.selectedCustomers}
        </label>
      </div>

      {mode === 'selected' && (
        <div className="space-y-3">
          <div className="grid gap-3 md:grid-cols-2">
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={t.searchCustomers}
              className="w-full rounded-lg border border-navy/20 bg-white px-3 py-2 text-sm text-navy"
            />
            <select
              value={nationality}
              onChange={(event) => setNationality(event.target.value)}
              className="w-full rounded-lg border border-navy/20 bg-white px-3 py-2 text-sm text-navy"
            >
              <option value="">{t.nationality}: الكل</option>
              {nationalities.map((value) => <option key={value} value={value}>{value}</option>)}
            </select>
          </div>
          <label className="flex items-center gap-2 text-sm font-bold text-navy">
            <input
              type="checkbox"
              checked={selectableShown.length > 0 && selectableShown.every(({id}) => selectedIds.has(id))}
              onChange={(event) => toggleShown(event.target.checked)}
            />
            {t.selectAllShown}
          </label>
          {selectedOutsideShown.map((id) => <input key={id} type="hidden" name="recipientIds" value={id} />)}
          <div className="max-h-72 overflow-y-auto rounded-xl border border-navy/10 bg-white">
            {shown.map((customer) => {
              const isUsed = used.has(customer.id);
              return (
                <label key={customer.id} className="flex items-start gap-3 border-b border-navy/5 px-3 py-2 last:border-b-0">
                  <input
                    type="checkbox"
                    name="recipientIds"
                    value={customer.id}
                    checked={selectedIds.has(customer.id)}
                    disabled={isUsed}
                    onChange={(event) => setSelectedIds((previous) => {
                      const next = new Set(previous);
                      if (event.target.checked) next.add(customer.id);
                      else next.delete(customer.id);
                      return next;
                    })}
                    className="mt-1"
                  />
                  <span className="min-w-0 text-sm text-navy">
                    <span className="block font-bold">{customer.name}</span>
                    <span className="block break-all text-navy/65">{customer.email}</span>
                    <span className="text-xs text-navy/55">{customer.nationality ?? '—'}{isUsed ? ` · ${t.alreadyUsed}` : ''}</span>
                  </span>
                </label>
              );
            })}
            {shown.length === 0 && <p className="p-4 text-sm text-navy/60">{t.noItems}</p>}
          </div>
        </div>
      )}

      <p className="text-sm text-navy/70">{t.emailsWillBeSent}: <b className="text-navy">{emailCount}</b> (الحد الأقصى 100)</p>
      <ConfirmButton
        className="rounded-full bg-navy px-6 py-2 font-bold text-white disabled:opacity-60"
        disabled={pending || emailCount === 0}
        message={{en: messageCount(emailCount), ar: messageCount(emailCount)}}
      >
        {pending ? t.sending : t.sendCoupon}
      </ConfirmButton>
      {result.error
        ? <p role="alert" className="text-sm font-bold text-red-600">{t.emailSendError}</p>
        : (result.sent > 0 || result.failed > 0 || result.skipped > 0) &&
          <p role="status" className="text-sm font-bold text-navy">{resultText}</p>}
    </form>
  );
}
