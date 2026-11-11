'use client';

import {useState} from 'react';
import {useTranslations} from 'next-intl';
import {waLink} from '@/lib/whatsapp';

const trending = ['bali', 'istanbul', 'phuket'] as const;

export default function Hero() {
  const t = useTranslations('hero');
  const d = useTranslations('destinations');
  const w = useTranslations('wa');
  const [dest, setDest] = useState('');
  const [date, setDate] = useState('');
  const [pax, setPax] = useState(2);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const text = w('search', {
      dest: dest.trim() || '-',
      date: date || '-',
      pax: t('travelersCount', {count: pax})
    });
    window.open(waLink(text), '_blank', 'noopener');
  };

  const field = 'flex flex-col justify-center rounded-xl bg-mist px-4 py-3 hover:bg-sky-light/25 transition-colors';
  const label = 'text-[11px] font-bold uppercase tracking-wider text-navy/60';
  const input = 'w-full bg-transparent font-bold text-navy placeholder:text-navy/40 focus:outline-none';

  return (
    <section id="top" className="relative w-full overflow-hidden bg-brand-mist pt-36 pb-20 lg:pt-44 lg:pb-28">
      {/* soft brand-colored glows */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden>
        <div className="absolute -top-40 -left-32 w-[560px] h-[560px] rounded-full bg-sky-light/30 blur-[130px]" />
        <div className="absolute top-24 right-0 w-[480px] h-[480px] rounded-full bg-sunset/20 blur-[140px]" />
      </div>

      <div className="relative max-w-[1440px] mx-auto px-4 lg:px-12 flex flex-col items-center">
        <div className="text-center max-w-4xl space-y-4 mb-12">
          <h1 className="font-display font-bold text-4xl sm:text-5xl lg:text-6xl leading-[1.25] text-navy">
            {t('title1')} <br className="hidden sm:inline" />
            <span className="text-sky">{t('title2')}</span>
          </h1>
          <p className="text-lg text-navy/70 max-w-2xl mx-auto">{t('subtitle')}</p>
        </div>

        <form
          onSubmit={submit}
          className="w-full max-w-5xl rounded-2xl bg-snow p-4 lg:p-6 shadow-[0_16px_40px_rgba(15,24,89,0.08)]"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_auto] gap-3">
            <label className={field}>
              <span className={label}>{t('destination')}</span>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="material-symbols-outlined text-[20px] text-sky">flight_takeoff</span>
                <input
                  id="search-input"
                  type="text"
                  value={dest}
                  onChange={(e) => setDest(e.target.value)}
                  placeholder={t('destinationPlaceholder')}
                  className={input}
                />
              </div>
            </label>

            <label className={field}>
              <span className={label}>{t('date')}</span>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="material-symbols-outlined text-[20px] text-sky">calendar_today</span>
                <input
                  type="date"
                  value={date}
                  min={new Date().toISOString().slice(0, 10)}
                  onChange={(e) => setDate(e.target.value)}
                  className={input}
                />
              </div>
            </label>

            <label className={field}>
              <span className={label}>{t('travelers')}</span>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="material-symbols-outlined text-[20px] text-sky">person</span>
                <select value={pax} onChange={(e) => setPax(Number(e.target.value))} className={input}>
                  {[1, 2, 3, 4, 5, 6].map((n) => (
                    <option key={n} value={n}>
                      {t('travelersCount', {count: n})}
                    </option>
                  ))}
                </select>
              </div>
            </label>

            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-bold text-navy bg-brand-warm shadow-[0_8px_24px_rgba(254,153,98,0.4)] hover:scale-[1.02] active:scale-[0.99] transition-transform"
            >
              <span className="material-symbols-outlined text-[20px]">search</span>
              <span>{t('search')}</span>
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2 mt-4 px-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-navy/50">{t('trending')}</span>
            {trending.map((k) => (
              <button
                key={k}
                type="button"
                onClick={() => {
                  setDest(d(`items.${k}.name`));
                  document.getElementById('search-input')?.focus();
                }}
                className="px-3 py-1 rounded-full bg-mist text-navy text-xs font-bold hover:bg-sky-light/40 transition-colors"
              >
                {d(`items.${k}.name`)}
              </button>
            ))}
          </div>
        </form>
      </div>
    </section>
  );
}
