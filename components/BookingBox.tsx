'use client';

import {useState} from 'react';
import {useLocale, useTranslations} from 'next-intl';
import {useSearchParams} from 'next/navigation';
import {useRouter, usePathname} from '@/i18n/navigation';
import {createBooking} from '@/lib/booking-actions';

export default function BookingBox({slug, price}: {slug: string; price: string | null}) {
  const t = useTranslations('packageDetail');
  const p = useTranslations('packages');
  const sp = useSearchParams();
  const [pax, setPax] = useState(Math.min(6, Math.max(1, Number(sp.get('pax')) || 2)));
  const [date, setDate] = useState(sp.get('date') ?? '');
  const [lang, setLang] = useState('en');

  const router = useRouter();
  const pathname = usePathname();
  const ar = useLocale() === 'ar';
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  const book = async () => {
    if (!date) return setErr(ar ? 'اختر تاريخ السفر' : 'Choose a travel date');
    setBusy(true);
    setErr('');
    const res = await createBooking({slug, date, pax, lang});
    if (res.ok) return router.push('/account/bookings');
    setBusy(false);
    if (res.error === 'login') return router.push(`/login?next=${encodeURIComponent(pathname)}`);
    setErr(ar ? 'تعذر إنشاء الحجز' : 'Could not create the booking');
  };

  const box = 'flex w-full items-center gap-3 rounded-xl border border-navy/20 bg-snow px-4 py-3 font-bold text-navy';
  const input = 'w-full bg-transparent focus:outline-none';

  return (
    <aside className="h-fit rounded-3xl border border-navy/10 bg-snow p-6 shadow-[0_16px_40px_rgba(15,24,89,0.08)] lg:sticky lg:top-28">
      <p className="text-sm text-navy/60">{p('from')}</p>
      <p className="font-display text-3xl font-bold text-navy">
        {price || p('onRequest')}
        {price && <span className="text-base font-normal text-navy/60"> {p('perPerson')}</span>}
      </p>

      <div className="mt-5 space-y-3">
        <label className={box}>
          <span className="material-symbols-outlined text-sky">person</span>
          <select value={pax} onChange={(e) => setPax(Number(e.target.value))} className={input}>
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <option key={n} value={n}>{t('adult')} × {n}</option>
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
        <label className={box}>
          <span className="material-symbols-outlined text-sky">language</span>
          <select value={lang} onChange={(e) => setLang(e.target.value)} className={input}>
            <option value="en">{t('langEnglish')}</option>
            <option value="ar">{t('langArabic')}</option>
          </select>
        </label>
      </div>

      <button
        onClick={book}
        disabled={busy}
        className="mt-5 w-full rounded-full bg-brand-warm py-4 font-bold text-navy shadow-[0_8px_24px_rgba(254,153,98,0.4)] transition-transform hover:scale-[1.02] disabled:opacity-60"
      >
        {t('check')}
      </button>
      {err && <p className="mt-3 text-sm font-bold text-[#ef4444]">{err}</p>}

      <ul className="mt-5 space-y-3 border-t border-navy/10 pt-5 text-sm">
        {(['freeCancel', 'payLater'] as const).map((k) => (
          <li key={k} className="flex gap-3">
            <span className="material-symbols-outlined text-[20px] text-sky">check_circle</span>
            <div>
              <p className="font-bold text-navy">{t(k)}</p>
              <p className="text-navy/70">{t(`${k}Text`)}</p>
            </div>
          </li>
        ))}
      </ul>
    </aside>
  );
}