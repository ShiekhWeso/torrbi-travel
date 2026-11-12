'use client';

import {useState} from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {useLocale, useTranslations} from 'next-intl';
import {destinations, destinationInfo} from '@/lib/data';

const SHOWN = 5; // rows on the home page, change as needed

export default function Destinations() {
  const t = useTranslations('destinations');
  const locale = useLocale();
  const list = destinations.slice(0, SHOWN);
  const [active, setActive] = useState<string | null>(null);
  const cur = destinations.find((x) => x.id === active);
  const info = cur ? destinationInfo[cur.id] : null;
  const href = (id: string) => `/${locale}/destinations/${id}`;
  const month = (m: number) =>
    new Intl.DateTimeFormat(locale, {month: 'short'}).format(new Date(2026, m - 1, 1));

  return (
    <section id="destinations" className="w-full bg-snow py-16 lg:py-24">
      <div className="mx-auto max-w-[1440px] px-4 lg:px-12">
        <h2 className="mb-10 font-display text-3xl font-bold text-navy lg:mb-14 lg:text-5xl">{t('title')}</h2>

        <div
          className="grid gap-10 lg:grid-cols-[1.1fr_1fr] lg:gap-16"
          onMouseLeave={() => setActive(null)}
        >
          <ul className="border-t border-navy/15">
            {list.map((x, i) => (
              <li key={x.id} onMouseEnter={() => setActive(x.id)}>
                <Link
                  href={href(x.id)}
                  className="group flex items-center gap-4 border-b border-navy/15 py-5 transition-all duration-300 hover:ps-4 lg:py-7"
                >
                  <span className="w-8 font-display text-sm text-navy/40 transition-colors group-hover:text-brand-warm">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full lg:hidden">
                    <Image src={x.image} alt="" fill sizes="48px" className="object-cover" />
                  </span>
                  <div className="flex-1">
                    <h3 className={`font-display text-2xl font-bold transition-colors lg:text-4xl ${active === x.id ? 'text-sky' : 'text-navy'}`}>
                      {t(`items.${x.id}.name`)}
                    </h3>
                    <p className="text-sm text-navy/60">{t(`items.${x.id}.country`)}</p>
                  </div>
                  <span className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-navy/20 text-navy transition-colors group-hover:border-brand-warm group-hover:bg-brand-warm">
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
                  <Image src={cur.image} alt="" fill sizes="30vw" className="object-cover" />
                </div>
                <div className="mt-5 flex items-center justify-between">
                  <h3 className="font-display text-3xl font-bold">{t(`items.${cur.id}.name`)}</h3>
                  <span className="flex items-center gap-1 font-bold">
                    <span className="material-symbols-outlined text-[20px] text-brand-warm">star</span>
                    {info.rating}
                  </span>
                </div>
                <p className="mt-2 text-sm text-snow/70">{t('tagline', {name: t(`items.${cur.id}.name`)})}</p>

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