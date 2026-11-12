'use client';

import {useState} from 'react';
import {useTranslations} from 'next-intl';
import {waLink} from '@/lib/whatsapp';
import {useSearchParams} from 'next/navigation';

export default function BookingBox({title, price}: {title: string; price: string | null}) {
  const t = useTranslations('packageDetail');
  const p = useTranslations('packages');
  const w = useTranslations('wa');
  const sp = useSearchParams();
  const [pax, setPax] = useState(Math.min(6, Math.max(1, Number(sp.get('pax')) || 2)));
  const [date, setDate] = useState(sp.get('date') ?? '');
  const [lang, setLang] = useState('en');

  const book = () => {
    const name = `${title} | ${date || '-'} | ${pax} | ${t(lang === 'ar' ? 'langArabic' : 'langEnglish')}`;
    window.open(waLink(w('book', {name})), '_blank', 'noopener');
  };

  const box = 'flex w-full items-center gap-3 rounded-xl border border-navy/20 bg-snow px-4 py-3 font-bold text-navy';
  const input = 'w-full bg-transparent focus:outline-none';

  return (
    <aside className="h-fit rounded-3xl border border-navy/10 bg-snow p-6 shadow-[0_16px_40px_rgba(15,24,89,0.08)] lg:sticky lg:top-28">
      <p className="text-sm text-navy/60">{p('from')}</p>
      <p className="font-display text-3xl font-bold text-navy">
        {price} <span className="text-base font-normal text-navy/60">{p('perPerson')}</span>
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
        className="mt-5 w-full rounded-full bg-brand-warm py-4 font-bold text-navy shadow-[0_8px_24px_rgba(254,153,98,0.4)] transition-transform hover:scale-[1.02]"
      >
        {t('check')}
      </button>

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