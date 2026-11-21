'use client';

import {useState} from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {useLocale, useTranslations} from 'next-intl';
import type {Pkg, SearchDuration, SearchRegion} from '@/lib/queries';
import { useSearchParams } from 'next/navigation';
import { waLink } from '@/lib/whatsapp';
import {useCurrency} from '@/components/CurrencyProvider';

const legacyDurationRanges: Record<string, {minDays: number | null; maxDays: number | null}> = {
  short: {minDays: null, maxDays: 5},
  medium: {minDays: 6, maxDays: 7},
  long: {minDays: 8, maxDays: null}
};

const chip = (on: boolean) =>
  `rounded-full px-4 py-2 text-sm font-bold transition-colors ${
    on ? 'bg-brand-sky text-snow' : 'bg-mist text-navy hover:bg-sky-light/40'
  }`;

type PackageCard = Pick<
  Pkg,
  'id' | 'image' | 'days' | 'price' | 'region' | 'destinationId' | 'destinationSlug' | 'destinationName' | 'title' | 'stops' | 'includes'
>;

export default function PackagesExplorer({
  items,
  regions,
  durations
}: {
  items: PackageCard[];
  regions: SearchRegion[];
  durations: SearchDuration[];
}) {
  const t = useTranslations('packagesPage');
  const c = useTranslations('packageCards');
  const p = useTranslations('packages');
  const locale = useLocale();
  const w = useTranslations('wa');
  const sp = useSearchParams();
  const {money} = useCurrency();
  const destinationOptions = Array.from(items.reduce((options, item) => {
    if (item.destinationId != null && item.destinationSlug && item.destinationName) {
      const option = options.get(item.destinationId);
      if (option) {
        option.count += 1;
      } else {
        options.set(item.destinationId, {
          id: item.destinationId,
          slug: item.destinationSlug,
          name: item.destinationName,
          count: 1
        });
      }
    }
    return options;
  }, new Map<number, {id: number; slug: string; name: string; count: number}>()).values());
  const carry = new URLSearchParams();
  ['date', 'pax'].forEach((k) => {
    const val = sp.get(k);
    if (val) carry.set(k, val);
  });
  const suffix = carry.toString() ? `?${carry}` : '';
  const [region, setRegion] = useState('all');
  const initialDestination = sp.get('destination') ?? 'all';
  const [destination, setDestination] = useState(
    () => destinationOptions.some((option) => option.slug === initialDestination) ? initialDestination : 'all'
  );
  const [sort, setSort] = useState('default');
  const [q, setQ] = useState(sp.get('q') ?? '');
  const initD = sp.get('duration') ?? '';
  const [duration, setDuration] = useState(() => {
    const option = durations.find((item) => String(item.id) === initD);
    if (option) return String(option.id);
    const legacyRange = legacyDurationRanges[initD];
    const legacyOption = legacyRange && durations.find((item) =>
      item.minDays === legacyRange.minDays && item.maxDays === legacyRange.maxDays
    );
    return legacyOption ? String(legacyOption.id) : 'any';
  });
  const selectedDestinationId = destinationOptions.find((option) => option.slug === destination)?.id;
  const selectedDuration = durations.find((item) => String(item.id) === duration);

  const list = items.filter((x) => {
    const hay = `${x.title} ${x.stops.join(' ')} ${x.id}`.toLowerCase();
    const okQ = hay.includes(q.trim().toLowerCase());
    const okR = region === 'all' || x.region === region;
    const okDestination = destination === 'all' || x.destinationId === selectedDestinationId;
    const okD = !selectedDuration ||
      (selectedDuration.minDays == null || x.days >= selectedDuration.minDays) &&
      (selectedDuration.maxDays == null || x.days <= selectedDuration.maxDays);
    return okQ && okR && okDestination && okD;
  });
  if (sort === 'low') list.sort((a, b) => (a.price ?? 0) - (b.price ?? 0));
  if (sort === 'high') list.sort((a, b) => (b.price ?? 0) - (a.price ?? 0));

  const reset = () => { setQ(''); setRegion('all'); setDestination('all'); setDuration('any'); setSort('default'); };

  return (
    <>
      <div className="space-y-5 rounded-3xl bg-snow p-5 shadow-[0_16px_40px_rgba(15,24,89,0.08)] lg:p-6">
        <label className="flex items-center gap-3 rounded-xl bg-mist px-4 py-3 focus-within:ring-2 focus-within:ring-sky">
          <span className="material-symbols-outlined text-sky">search</span>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={t('search')}
            className="w-full bg-transparent font-bold text-navy placeholder:text-navy/40 focus:outline-none"
          />
        </label>

        <div className="flex flex-wrap items-center gap-2">
          <span className="me-2 text-xs font-bold uppercase tracking-wider text-navy/50">{t('region')}</span>
          <button onClick={() => setRegion('all')} className={chip(region === 'all')}>{t('regions.all')}</button>
          {regions.map((item) => (
            <button key={item.id} onClick={() => setRegion(item.slug)} className={chip(region === item.slug)}>{item.name}</button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="me-2 text-xs font-bold uppercase tracking-wider text-navy/50">{t('destination')}</span>
          <button onClick={() => setDestination('all')} className={chip(destination === 'all')}>
            {t('regions.all')} ({items.length})
          </button>
          {destinationOptions.map((option) => (
            <button
              key={option.id}
              onClick={() => setDestination(option.slug)}
              className={chip(destination === option.slug)}
            >
              {option.name} ({option.count})
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="me-2 text-xs font-bold uppercase tracking-wider text-navy/50">{t('duration')}</span>
          <button onClick={() => setDuration('any')} className={chip(duration === 'any')}>{t('durations.any')}</button>
          {durations.map((item) => (
            <button key={item.id} onClick={() => setDuration(String(item.id))} className={chip(duration === String(item.id))}>{item.label}</button>
          ))}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-navy/10 pt-4">
          <p className="font-bold text-navy">{t('results', {count: list.length})}</p>
          <div className="flex items-center gap-3">
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="rounded-full bg-mist px-4 py-2 text-sm font-bold text-navy focus:outline-none focus:ring-2 focus:ring-sky"
            >
              <option value="default">{t('sortDefault')}</option>
              <option value="low">{t('sortLow')}</option>
              <option value="high">{t('sortHigh')}</option>
            </select>
            <button onClick={reset} className="text-sm font-bold text-sky hover:underline">{t('reset')}</button>
          </div>
        </div>
      </div>

      {list.length === 0 ? (
        <div className="mt-16 text-center">
          <p className="text-lg text-navy/60">{t('empty')}</p>
          <a
            href={waLink(w('plan'))}
            target="_blank"
            rel="noopener"
            className="mt-5 inline-flex items-center gap-2 rounded-full bg-brand-warm px-6 py-3 font-bold text-navy shadow-[0_8px_24px_rgba(254,153,98,0.4)] transition-transform hover:scale-[1.02]"
          >
            {t('askWhatsapp')}
            <span className="material-symbols-outlined text-[20px]">chat</span>
          </a>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-8">
          {list.map((x, index) => (
            <article
              key={x.id}
              className="flex flex-col rounded-3xl bg-mist p-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_44px_rgba(15,24,89,0.14)] lg:p-5"
            >
              <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-navy">
                <Image
                  src={x.image}
                  alt={x.title}
                  fill
                  sizes="(min-width: 1440px) 427px, (min-width: 1024px) 29vw, (min-width: 768px) 50vw, calc(100vw - 32px)"
                  priority={index === 0}
                  className="object-cover"
                />
              </div>
              <h3 className="mt-5 px-1 font-display text-2xl font-bold text-navy">{x.title}</h3>
              <p className="mt-2 px-1 text-sm text-navy/70">{x.stops.join(' → ')}</p>
              <p className="mt-3 px-1 text-sm font-bold text-navy">{p('days', {days: x.days})}</p>
              <div className="mt-4 flex items-center justify-between gap-4 border-t border-navy/10 px-1 pt-4">
                <span className="font-display text-lg text-navy">{x.price ? `${p('from')} ${money(x.price)}` : c('price')}</span>
                <Link
                  href={`/${locale}/packages/${x.id}${suffix}`}
                  className="group/btn inline-flex items-center gap-2 rounded-full border-2 border-navy px-5 py-2.5 text-sm font-bold text-navy transition-colors duration-300 hover:bg-navy hover:text-snow"
                >
                  {c('details')}
                  <span className="material-symbols-outlined text-[20px] leading-none transition-transform duration-300 group-hover/btn:translate-x-1 rtl:rotate-180 rtl:group-hover/btn:-translate-x-1">
                    arrow_forward
                  </span>
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </>
  );
}