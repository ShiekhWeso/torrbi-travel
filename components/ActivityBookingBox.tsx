'use client';

import {useState} from 'react';
import {useLocale} from 'next-intl';
import {useSearchParams} from 'next/navigation';
import {useRouter, usePathname} from '@/i18n/navigation';
import {createActivityBooking} from '@/lib/booking-actions';

export default function ActivityBookingBox({slug, price}: {slug: string; price: number | null}) {
  const sp = useSearchParams();
  const [pax, setPax] = useState(Math.min(6, Math.max(1, Number(sp.get('pax')) || 2)));
  const [date, setDate] = useState(sp.get('date') ?? '');
  const router = useRouter();
  const pathname = usePathname();
  const ar = useLocale() === 'ar';
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const t = (en: string, a: string) => (ar ? a : en);

  const book = async () => {
    if (!date) return setErr(t('Choose a date', 'اختر التاريخ'));
    setBusy(true);
    setErr('');
    const res = await createActivityBooking({slug, date, pax});
    if (res.ok) return router.push(`/account/bookings?new=${res.id}`);
    setBusy(false);
    if (res.error === 'login') return router.push(`/login?next=${encodeURIComponent(pathname)}`);
    setErr(t('Could not create the booking', 'تعذر إنشاء الحجز'));
  };

  const box = 'flex w-full items-center gap-3 rounded-xl border border-navy/20 bg-snow px-4 py-3 font-bold text-navy';
  const input = 'w-full bg-transparent focus:outline-none';

  return (
    <aside className="h-fit rounded-3xl border border-navy/10 bg-snow p-6 shadow-[0_16px_40px_rgba(15,24,89,0.08)] lg:sticky lg:top-28">
      <p className="text-sm text-navy/60">{t('From', 'ابتداءً من')}</p>
      <p className="font-display text-3xl font-bold text-navy">
        {price != null ? `$${price}` : t('On request', 'عند الطلب')}
        {price != null && <span className="text-base font-normal text-navy/60"> {t('per person', 'للفرد')}</span>}
      </p>
      <div className="mt-5 space-y-3">
        <label className={box}>
          <span className="material-symbols-outlined text-sky">person</span>
          <select value={pax} onChange={(e) => setPax(Number(e.target.value))} className={input}>
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <option key={n} value={n}>{t('Guests', 'الضيوف')} × {n}</option>
            ))}
          </select>
        </label>
        <label className={box}>
          <span className="material-symbols-outlined text-sky">calendar_today</span>
          <input
            type="date"
            value={date}
            min={new Date().toISOString().slice(0, 10)}
            onChange={(e) => setDate(e.target.value)}
            className={input}
          />
        </label>
      </div>
      <button
        onClick={book}
        disabled={busy}
        className="mt-5 w-full rounded-full bg-brand-warm py-4 font-bold text-navy shadow-[0_8px_24px_rgba(254,153,98,0.4)] transition-transform hover:scale-[1.02] disabled:opacity-60"
      >
        {t('Book activity', 'احجز النشاط')}
      </button>
      {err && <p className="mt-3 text-sm font-bold text-[#ef4444]">{err}</p>}
    </aside>
  );
}
