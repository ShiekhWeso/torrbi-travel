'use client';

import {useState} from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {useLocale, useTranslations} from 'next-intl';
import type {Dest} from '@/lib/queries';

const SHOWN = 5; // rows on the home page, change as needed
type HomeDestination = Pick<Dest, 'id' | 'image' | 'name' | 'country' | 'rating' | 'best' | 'flight' | 'temp'>;

export default function Destinations({destinations}: {destinations: HomeDestination[]}) {
  const t = useTranslations('destinations');
  const locale = useLocale();
  const list = destinations.slice(0, SHOWN);
  const [active, setActive] = useState<string | null>(null);
  const cur = destinations.find((x) => x.id === active);
  const info = cur ?? null;
  const href = (id: string) => `/${locale}/destinations/${id}`;
  const month = (m: number) =>
    new Intl.DateTimeFormat(locale, {month: 'short'}).format(new Date(2026, m - 1, 1));

  return (
    <section id="destinations" className="w-full bg-snow py-20 lg:py-28">
      <div className="mx-auto max-w-[1440px] px-4 lg:px-12">
        <div className="mb-12 lg:mb-16">
          <h2 className="font-display text-4xl font-bold text-navy lg:text-5xl xl:text-6xl">{t('title')}</h2>
          <span className="mt-4 block h-1.5 w-16 rounded-full bg-gradient-to-r from-brand-warm to-sun" />
          <p className="mt-4 max-w-2xl text-lg text-navy/70">{t('subtitle')}</p>
        </div>

        <div
          className="grid gap-10 lg:grid-cols-[1.1fr_1fr] lg:gap-16"
          onMouseLeave={() => setActive(null)}
        >
          <ul className="flex flex-col gap-3">
            {list.map((x, i) => (
              <li key={x.id} onMouseEnter={() => setActive(x.id)} onFocus={() => setActive(x.id)}>
                <Link
                  href={href(x.id)}
                  className={`group flex items-center gap-4 rounded-full px-4 py-3 transition-all duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy lg:px-5 lg:py-4 ${
                    active === x.id
                      ? 'bg-navy text-snow shadow-[0_12px_28px_rgba(15,24,89,0.2)]'
                      : 'bg-mist text-navy hover:bg-navy hover:text-snow'
                  }`}
                >
                  <span className={`w-8 font-display text-sm transition-colors ${active === x.id ? 'text-brand-warm' : 'text-navy/40 group-hover:text-brand-warm'}`}>
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full lg:hidden">
                    <Image src={x.image} alt="" fill sizes="48px" className="object-cover" />
                  </span>
                  <div className="flex-1">
                    <h3 className={`font-display text-2xl font-bold transition-colors lg:text-3xl ${active === x.id ? 'text-snow' : 'text-navy group-hover:text-snow'}`}>
                      {x.name}
                    </h3>
                    <p className={`text-sm ${active === x.id ? 'text-snow/70' : 'text-navy/60 group-hover:text-snow/70'}`}>{x.country}</p>
                  </div>
                  <span className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-navy/20 text-navy transition-colors group-hover:border-brand-warm group-hover:bg-brand-warm group-hover:text-navy">
                    <span className="material-symbols-outlined text-[22px] leading-none rtl:rotate-180">arrow_forward</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>

          <aside className="hidden lg:block">
            {cur && info && (
              <div
                key={cur.id}
                className="dest-in sticky top-28 rounded-3xl bg-navy p-6 text-snow shadow-[0_24px_56px_rgba(15,24,89,0.3)]"
              >
                <div className="relative mx-auto aspect-[4/4.4] w-4/5 overflow-hidden rounded-t-full rounded-b-3xl">
                  <Image src={cur.image} alt="" fill sizes="(min-width: 1440px) 500px, (min-width: 1024px) 40vw, 48px" className="object-cover" />
                </div>
                <div className="mt-5 flex items-center justify-between">
                  <h3 className="font-display text-3xl font-bold">{cur.name}</h3>
                  <span className="flex items-center gap-1 font-bold">
                    <span className="material-symbols-outlined text-[20px] text-brand-warm">star</span>
                    {info.rating}
                  </span>
                </div>
                <p className="mt-2 text-sm text-snow/70">{t('tagline', {name: cur.name})}</p>

                <div className="mt-5 grid grid-cols-3 gap-3 border-t border-snow/15 pt-5 text-sm">
                  <div>
                    <p className="text-xs text-snow/50">{t('bestTime')}</p>
                    <p className="font-bold">{month(info.best[0])} – {month(info.best[1])}</p>
                  </div>
                  <div>
                    <p className="text-xs text-snow/50">{t('flight')}</p>
                    <p className="font-bold">{t('hours', {n: info.flight})}</p>
                  </div>
                  <div>
                    <p className="text-xs text-snow/50">{t('climate')}</p>
                    <p className="font-bold" dir="ltr">{info.temp}</p>
                  </div>
                </div>

                <Link
                  href={href(cur.id)}
                  className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-brand-warm py-3 font-bold text-navy transition-transform hover:scale-[1.02]"
                >
                  {t('details')}
                  <span className="material-symbols-outlined text-[20px] leading-none rtl:rotate-180">arrow_forward</span>
                </Link>
                <Link
                  href={`/${locale}/packages?destination=${encodeURIComponent(cur.id)}`}
                  className="mt-3 inline-flex w-full items-center justify-center rounded-full border-2 border-snow/40 py-3 font-bold transition-colors hover:bg-snow hover:text-navy"
                >
                  {t('browsePackages')}
                </Link>
              </div>
            )}
          </aside>
        </div>

        <div className="mt-10 text-center">
          <Link
            href={`/${locale}/destinations`}
            className="group/all inline-flex items-center gap-4 rounded-full bg-navy py-2 ps-8 pe-2 font-bold text-snow shadow-[0_12px_28px_rgba(15,24,89,0.25)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_16px_36px_rgba(15,24,89,0.35)]"
          >
            {t('seeAll')}
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-warm text-navy transition-transform duration-300 group-hover/all:rotate-[-45deg] rtl:rotate-180 rtl:group-hover/all:rotate-[225deg]">
              <span className="material-symbols-outlined text-[22px] leading-none">arrow_forward</span>
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}