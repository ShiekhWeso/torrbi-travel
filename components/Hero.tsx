'use client';

import {useState} from 'react';
import {useTranslations} from 'next-intl';
import {waLink} from '@/lib/whatsapp';

type Tab = 'package' | 'activity' | 'flight';
const tabs: Tab[] = ['package', 'activity', 'flight'];

export default function Hero() {
  const t = useTranslations('hero');
  const w = useTranslations('wa');
  const [tab, setTab] = useState<Tab>('package');
  const [v1, setV1] = useState('');
  const [v2, setV2] = useState('');
  const [date, setDate] = useState('');
  const [pax, setPax] = useState(2);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const text = w('search', {
      type: t(`tabs.${tab}`),
      l1: t(`fields.${tab}.l1`),
      v1: v1.trim() || '-',
      l2: t(`fields.${tab}.l2`),
      v2: v2.trim() || '-',
      date: date || '-',
      pax: t('travelersCount', {count: pax})
    });
    window.open(waLink(text), '_blank', 'noopener');
  };

  const field =
    'group relative flex flex-col justify-center px-space-md py-3 rounded-xl bg-surface-container-low hover:bg-surface-container-high transition-colors';
  const input = 'w-full bg-transparent font-title-md text-title-md text-primary font-semibold focus:outline-none';
  const labelCls = 'font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider';

  const stats = [
    {k: 's1', icon: 'public', box: 'bg-secondary-fixed/50 text-secondary'},
    {k: 's2', icon: 'schedule', box: 'bg-primary-fixed/40 text-primary-container'},
    {k: 's3', icon: 'workspace_premium', box: 'bg-tertiary-fixed/60 text-on-tertiary-container'}
  ] as const;

  return (
    <section
      id="top"
      className="relative w-full overflow-hidden bg-gradient-to-b from-surface via-surface-container-low to-surface pt-12 pb-24 lg:pt-16 lg:pb-32"
    >
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-60">
        <div className="absolute -top-40 -left-32 w-[600px] h-[600px] rounded-full bg-secondary-fixed/30 blur-[130px]" />
        <div className="absolute top-20 right-0 w-[550px] h-[550px] rounded-full bg-tertiary-fixed/25 blur-[140px]" />
        <div className="absolute bottom-10 left-1/3 w-[700px] h-[350px] rounded-full bg-surface-container-highest/60 blur-[110px]" />
        <svg
          className="absolute top-12 left-1/2 -translate-x-1/2 w-[1280px] h-[480px] stroke-secondary/20 fill-none"
          viewBox="0 0 1280 480"
        >
          <path d="M 50,420 C 320,380 450,120 720,160 C 980,200 1100,60 1230,40" strokeDasharray="6 8" strokeWidth="2" />
          <circle className="fill-secondary animate-pulse" cx="720" cy="160" r="5" />
        </svg>
      </div>

      <div className="relative max-w-[1440px] mx-auto px-margin-mobile lg:px-margin flex flex-col items-center">
        <div className="inline-flex items-center gap-space-sm px-space-md py-1.5 rounded-full bg-surface-container-lowest/80 backdrop-blur-md shadow-sm mb-space-md">
          <span className="material-symbols-outlined text-[16px] text-secondary">flight_takeoff</span>
          <span className="font-label-sm text-label-sm uppercase tracking-widest text-primary">{t('badge1')}</span>
          <span className="w-1.5 h-1.5 rounded-full bg-on-tertiary-container" />
          <span className="font-label-sm text-label-sm text-on-surface-variant font-medium">{t('badge2')}</span>
        </div>

        <div className="text-center max-w-4xl space-y-space-sm mb-space-xl">
          <h1 className="font-display-hero text-display-hero-mobile lg:text-display-hero text-primary tracking-tight font-normal">
            {t('title1')} <br className="hidden sm:inline" />
            <span className="italic font-display-hero font-light text-secondary">{t('title2')}</span>
          </h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl mx-auto font-normal">
            {t('subtitle')}
          </p>
        </div>

        <div className="w-full max-w-6xl rounded-2xl bg-surface-container-lowest/90 backdrop-blur-xl p-space-md lg:p-space-lg shadow-[0_16px_40px_rgba(15,24,89,0.08)]">
          <div className="flex flex-wrap items-center justify-between gap-space-md pb-space-md">
            <div className="flex items-center gap-space-xs p-1 bg-surface-container-low rounded-xl">
              {tabs.map((k) => (
                <button
                  key={k}
                  type="button"
                  aria-pressed={tab === k}
                  onClick={() => setTab(k)}
                  className={`px-space-md py-2 rounded-lg font-label-md text-label-md transition-all ${
                    tab === k
                      ? 'bg-primary-container text-on-primary shadow-sm'
                      : 'text-on-surface-variant hover:text-primary'
                  }`}
                >
                  {t(`tabs.${k}`)}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-space-lg">
              <span className="font-label-md text-label-md text-on-surface-variant">{t('consult')}</span>
              <div className="flex items-center gap-1.5 text-secondary">
                <span className="material-symbols-outlined text-[18px]">verified</span>
                <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface font-semibold">
                  {t('secure')}
                </span>
              </div>
            </div>
          </div>

          <form onSubmit={submit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-space-sm pt-2">
            <label className={`lg:col-span-3 ${field}`}>
              <span className={labelCls}>{t(`fields.${tab}.l1`)}</span>
              <div className="flex items-center gap-space-xs mt-0.5">
                <span className="material-symbols-outlined text-[20px] text-secondary">flight_takeoff</span>
                <input
                  id="search-input"
                  value={v1}
                  onChange={(e) => setV1(e.target.value)}
                  placeholder={t(`fields.${tab}.p1`)}
                  className={input}
                  type="text"
                />
              </div>
              <span className="font-body-sm text-body-sm text-outline truncate">{t(`fields.${tab}.h1`)}</span>
            </label>

            <label className={`lg:col-span-3 ${field}`}>
              <span className={labelCls}>{t(`fields.${tab}.l2`)}</span>
              <div className="flex items-center gap-space-xs mt-0.5">
                <span className="material-symbols-outlined text-[20px] text-secondary">flight_land</span>
                <input
                  value={v2}
                  onChange={(e) => setV2(e.target.value)}
                  placeholder={t(`fields.${tab}.p2`)}
                  className={input}
                  type="text"
                />
              </div>
              <span className="font-body-sm text-body-sm text-outline truncate">{t(`fields.${tab}.h2`)}</span>
            </label>

            <label className={`lg:col-span-3 ${field}`}>
              <span className={labelCls}>{t('date')}</span>
              <div className="flex items-center gap-space-xs mt-0.5">
                <span className="material-symbols-outlined text-[20px] text-secondary">calendar_today</span>
                <input
                  type="date"
                  value={date}
                  min={new Date().toISOString().slice(0, 10)}
                  onChange={(e) => setDate(e.target.value)}
                  className={input}
                />
              </div>
              <span className="font-body-sm text-body-sm text-outline">{t('dateHint')}</span>
            </label>

            <label className={`lg:col-span-3 ${field}`}>
              <span className={labelCls}>{t('travelers')}</span>
              <div className="flex items-center gap-space-xs mt-0.5">
                <span className="material-symbols-outlined text-[20px] text-secondary">person</span>
                <select value={pax} onChange={(e) => setPax(Number(e.target.value))} className={input}>
                  {[1, 2, 3, 4, 5, 6].map((n) => (
                    <option key={n} value={n}>
                      {t('travelersCount', {count: n})}
                    </option>
                  ))}
                </select>
              </div>
              <span className="font-body-sm text-body-sm text-outline">{t('travelersHint')}</span>
            </label>

            <div className="lg:col-span-12 flex flex-col sm:flex-row items-center justify-between gap-space-md pt-space-sm mt-1">
              <div className="flex flex-wrap items-center gap-space-xs text-on-surface-variant font-body-sm text-body-sm">
                <span className="font-label-sm text-label-sm uppercase tracking-wider text-outline me-1">
                  {t('trending')}
                </span>
                {(['maldives', 'kyoto', 'dubai'] as const).map((k) => (
                  <button
                    key={k}
                    type="button"
                    onClick={() => {
                      setV1(t(`trendingItems.${k}`));
                      document.getElementById('search-input')?.focus();
                    }}
                    className="px-space-sm py-1 rounded-full bg-surface-container text-primary font-label-sm text-label-sm hover:bg-surface-container-high"
                  >
                    {t(`trendingItems.${k}`)}
                  </button>
                ))}
              </div>
              <button
                type="submit"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-space-sm px-space-xl py-3.5 rounded-xl font-label-md text-label-md font-bold text-primary-container bg-gradient-to-r from-[#EFC44D] to-[#FE9962] shadow-[0_8px_24px_rgba(203,112,61,0.3)] hover:shadow-[0_12px_32px_rgba(203,112,61,0.45)] hover:scale-[1.01] active:scale-[0.99] transition-all"
              >
                <span className="material-symbols-outlined text-[20px]">search</span>
                <span>{t(`fields.${tab}.go`)}</span>
              </button>
            </div>
          </form>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter w-full max-w-5xl mt-space-xl pt-4">
          {stats.map((s) => (
            <div
              key={s.k}
              className="flex items-center gap-space-md p-space-md rounded-xl bg-surface-container-lowest/60 backdrop-blur-sm shadow-sm"
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${s.box}`}>
                <span className="material-symbols-outlined text-[26px]">{s.icon}</span>
              </div>
              <div>
                <div className="font-headline-sm text-headline-sm text-primary font-bold">{t(`stats.${s.k}.title`)}</div>
                <div className="font-body-sm text-body-sm text-on-surface-variant">{t(`stats.${s.k}.text`)}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
