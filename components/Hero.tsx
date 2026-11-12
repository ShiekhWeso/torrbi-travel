'use client';

import {useState} from 'react';
import {useRouter} from 'next/navigation';
import {useLocale, useTranslations} from 'next-intl';
import {waLink} from '@/lib/whatsapp';
import HeroBackground from './HeroBackground';

const trending = ['bali', 'istanbul', 'phuket'] as const;
const durations = ['any', 'short', 'medium', 'long'] as const;

export default function Hero() {
  const t = useTranslations('hero');
  const d = useTranslations('destinations');
  const w = useTranslations('wa');
  const v = useTranslations('values');
  const locale = useLocale();
  const router = useRouter();
  const [type, setType] = useState<'packages' | 'flights'>('packages');
  const [dest, setDest] = useState('');
  const [from, setFrom] = useState('');
  const [date, setDate] = useState('');
  const [pax, setPax] = useState(2);
  const [duration, setDuration] = useState<(typeof durations)[number]>('any');

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (type === 'flights') {
      const text = w('flight', {
        from: from.trim() || '-',
        to: dest.trim() || '-',
        date: date || '-',
        pax: t('travelersCount', {count: pax})
      });
      window.open(waLink(text), '_blank', 'noopener');
      return;
    }
    const params = new URLSearchParams();
    if (dest.trim()) params.set('q', dest.trim());
    if (duration !== 'any') params.set('duration', duration);
    if (date) params.set('date', date);
    params.set('pax', String(pax));
    router.push(`/${locale}/packages?${params}`);
  };

  const field = 'flex flex-col justify-center rounded-xl bg-mist px-4 py-3 hover:bg-sky-light/25 transition-colors';
  const label = 'text-[11px] font-bold uppercase tracking-wider text-navy/60';
  const input = 'w-full bg-transparent font-bold text-navy placeholder:text-navy/40 focus:outline-none';

  return (
    <section id="top" className="relative w-full overflow-hidden bg-brand-mist pt-36 pb-20 lg:pt-44 lg:pb-28">
      <HeroBackground />
      <div className="absolute inset-0 pointer-events-none" aria-hidden>
        <div className="absolute -top-40 -left-32 w-[560px] h-[560px] rounded-full bg-sky-light/30 blur-[130px]" />
        <div className="absolute top-24 right-0 w-[480px] h-[480px] rounded-full bg-sunset/20 blur-[140px]" />
      </div>

      <h1 className="sr-only">{t('title1')} {t('title2')}</h1>
      <div aria-hidden className="relative w-full overflow-hidden pt-2 pb-10 mb-2" dir="ltr">
        <div className="hero-marquee flex w-max whitespace-nowrap">
          {[0, 1, 2, 3].map((i) => (
            <span key={i} className="font-display font-bold text-5xl lg:text-8xl leading-[1.4] text-navy pe-16">
              {t('title1')} <span className="text-sky">{t('title2')}</span>
              <span className="material-symbols-outlined mx-10 align-middle text-brand-warm text-[48px]">flight</span>
            </span>
          ))}
        </div>
      </div>

      <div className="relative max-w-[1440px] mx-auto px-4 lg:px-12 flex flex-col items-center">
        <p className="text-lg text-navy/70 max-w-2xl mx-auto mb-12 text-center">{t('subtitle')}</p>

        <form
          onSubmit={submit}
          className="w-full max-w-5xl rounded-2xl bg-snow p-4 lg:p-6 shadow-[0_16px_40px_rgba(15,24,89,0.08)]"
        >
          <div className="flex flex-wrap gap-2 mb-4">
            {(['packages', 'flights'] as const).map((k) => (
              <button
                key={k}
                type="button"
                onClick={() => setType(k)}
                className={`px-4 py-2 rounded-full text-sm font-bold transition-colors ${
                  type === k ? 'bg-navy text-snow' : 'bg-mist text-navy hover:bg-sky-light/40'
                }`}
              >
                {t(`types.${k}`)}
              </button>
            ))}
            <button
              type="button"
              disabled
              className="flex cursor-not-allowed items-center gap-2 rounded-full bg-mist px-4 py-2 text-sm font-bold text-navy/40"
            >
              {t('types.activities')}
              <span className="rounded-full bg-brand-warm/30 px-2 py-0.5 text-[10px] text-navy">{t('soon')}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr_auto] gap-3">
            {type === 'flights' && (
              <label className={field}>
                <span className={label}>{t('from')}</span>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="material-symbols-outlined text-[20px] text-sky">flight_land</span>
                  <input
                    type="text"
                    value={from}
                    onChange={(e) => setFrom(e.target.value)}
                    placeholder={t('fromPlaceholder')}
                    className={input}
                  />
                </div>
              </label>
            )}

            <label className={field}>
              <span className={label}>{type === 'flights' ? t('to') : t('destination')}</span>
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

            {type === 'packages' && (
              <label className={field}>
                <span className={label}>{t('duration')}</span>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="material-symbols-outlined text-[20px] text-sky">schedule</span>
                  <select
                    value={duration}
                    onChange={(e) => setDuration(e.target.value as typeof duration)}
                    className={input}
                  >
                    {durations.map((k) => (
                      <option key={k} value={k}>{t(`durations.${k}`)}</option>
                    ))}
                  </select>
                </div>
              </label>
            )}

            <button
              type="submit"
              aria-label={type === 'flights' ? t('searchFlights') : t('search')}
              className="group flex min-h-14 items-center justify-center overflow-hidden rounded-xl bg-brand-warm font-bold text-navy shadow-[0_8px_24px_rgba(254,153,98,0.4)] transition-all duration-300 lg:w-16 lg:hover:w-56"
            >
              <span className="material-symbols-outlined text-[22px]">search</span>
              <span className="ms-2 whitespace-nowrap lg:ms-0 lg:max-w-0 lg:opacity-0 lg:transition-all lg:duration-300 lg:group-hover:ms-2 lg:group-hover:max-w-[160px] lg:group-hover:opacity-100">
                {type === 'flights' ? t('searchFlights') : t('search')}
              </span>
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

          <div className="mt-5 grid grid-cols-1 gap-3 border-t border-navy/10 pt-4 sm:grid-cols-3">
            {([['v1', 'lock'], ['v2', 'confirmation_number'], ['v3', 'translate']] as const).map(([k, icon]) => (
              <div key={k} className="flex items-center gap-2 text-xs font-bold text-navy/70">
                <span className="material-symbols-outlined text-[20px] text-sky">{icon}</span>
                {v(`${k}.title`)}
              </div>
            ))}
          </div>
        </form>
      </div>
    </section>
  );
}