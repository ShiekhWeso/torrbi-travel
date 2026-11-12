'use client';

import {useState} from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {useLocale, useTranslations} from 'next-intl';
import type {Dest} from '@/lib/queries';

const regions = ['all', 'asia', 'turkey', 'caucasus'] as const;

export default function DestinationsExplorer({items}: {items: Dest[]}) {
  const f = useTranslations('packagesPage');
  const locale = useLocale();
  const [q, setQ] = useState('');
  const [region, setRegion] = useState<(typeof regions)[number]>('all');

  const list = items.filter(
    (x) =>
      x.name.toLowerCase().includes(q.trim().toLowerCase()) &&
      (region === 'all' || x.region === region)
  );

  return (
    <>
      <div className="flex flex-col gap-4 rounded-3xl bg-snow p-5 shadow-[0_16px_40px_rgba(15,24,89,0.08)] lg:flex-row lg:items-center lg:justify-between">
        <label className="flex items-center gap-3 rounded-xl bg-mist px-4 py-3 lg:w-80">
          <span className="material-symbols-outlined text-sky">search</span>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={f('search')}
            className="w-full bg-transparent font-bold text-navy placeholder:text-navy/40 focus:outline-none"
          />
        </label>
        <div className="flex flex-wrap gap-2">
          {regions.map((k) => (
            <button
              key={k}
              onClick={() => setRegion(k)}
              className={`rounded-full px-4 py-2 text-sm font-bold transition-colors ${
                region === k ? 'bg-navy text-snow' : 'bg-mist text-navy hover:bg-sky-light/40'
              }`}
            >
              {f(`regions.${k}`)}
            </button>
          ))}
        </div>
      </div>

      {list.length === 0 ? (
        <p className="mt-16 text-center text-lg text-navy/60">{f('empty')}</p>
      ) : (
        <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 lg:gap-6">
          {list.map((x) => (
            <Link
              key={x.id}
              href={`/${locale}/destinations/${x.id}`}
              className="group relative aspect-[3/4] overflow-hidden rounded-3xl bg-navy"
            >
              <Image
                src={x.image}
                alt={x.name}
                fill
                sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw"
                className="object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-navy/85 via-navy/10 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-2 p-4 text-snow lg:p-5">
                <div>
                  <h3 className="font-display text-xl font-bold lg:text-2xl">{x.name}</h3>
                  <p className="text-xs text-snow/70 lg:text-sm">{x.country}</p>
                </div>
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-warm text-navy transition-transform duration-300 group-hover:-rotate-45 rtl:rotate-180 rtl:group-hover:rotate-[225deg]">
                  <span className="material-symbols-outlined text-[20px] leading-none">arrow_forward</span>
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}