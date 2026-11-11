'use client';

import {useState} from 'react';
import {useTranslations} from 'next-intl';
import {destinations} from '@/lib/data';
import {waLink} from '@/lib/whatsapp';

type Filter = 'all' | 'europe' | 'asia';

export default function Destinations() {
  const t = useTranslations('destinations');
  const w = useTranslations('wa');
  const [filter, setFilter] = useState<Filter>('all');
  const filters: Filter[] = ['europe', 'asia', 'all'];

  return (
    <section id="destinations" className="w-full bg-surface-container-lowest py-space-xl lg:py-24">
      <div className="max-w-[1440px] mx-auto px-margin-mobile lg:px-margin">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-space-md mb-space-xl">
          <div className="space-y-space-xs">
            <div className="inline-flex items-center gap-space-xs text-secondary">
              <span className="material-symbols-outlined text-[18px]">explore</span>
              <span className="font-label-sm text-label-sm uppercase tracking-widest font-semibold">{t('kicker')}</span>
            </div>
            <h2 className="font-headline-lg text-headline-lg text-primary tracking-tight">{t('title')}</h2>
          </div>
          <div className="flex items-center gap-space-sm">
            {filters.map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setFilter(f)}
                className={`px-space-md py-2.5 rounded-lg font-label-md text-label-md transition-colors ${
                  filter === f
                    ? 'bg-primary text-on-primary shadow-sm'
                    : 'bg-surface-container text-primary hover:bg-surface-container-high'
                }`}
              >
                {t(`filters.${f}`)}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-gutter">
          {destinations
            .filter((d) => filter === 'all' || d.region === filter)
            .map((d) => {
              const title = t(`items.${d.id}.title`);
              const area = t(`items.${d.id}.area`);
              return (
                <article
                  key={d.id}
                  className={`${d.span} ${d.height} group relative flex flex-col justify-end rounded-2xl overflow-hidden shadow-[0_12px_32px_rgba(15,24,89,0.06)] hover:shadow-[0_20px_48px_rgba(15,24,89,0.14)] transition-all`}
                >
                  {/* TODO: replace hotlinked image with your own file in /public */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    loading="lazy"
                    alt={title}
                    src={d.image}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-primary/95 via-primary/40 to-transparent" />
                  <div className="absolute top-space-md start-space-md end-space-md flex items-center justify-between pointer-events-none">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface-container-lowest/90 backdrop-blur-md font-label-sm text-label-sm uppercase tracking-wider text-on-tertiary-container font-bold shadow-sm">
                      {t(`items.${d.id}.badge`)}
                    </span>
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-surface-container-lowest/80 backdrop-blur-md font-label-sm text-label-sm text-primary font-semibold">
                      <span className="material-symbols-outlined text-[16px] text-secondary">{d.icon}</span>
                      {t(`items.${d.id}.tag`)}
                    </span>
                  </div>

                  <div className="relative z-10 p-space-lg lg:p-space-xl text-on-primary flex flex-col justify-end">
                    <div className="flex items-center gap-space-sm font-label-sm text-label-sm uppercase tracking-widest text-secondary-fixed">
                      <span>{t(`items.${d.id}.country`)}</span>
                      {area && (
                        <>
                          <span>•</span>
                          <span>{area}</span>
                        </>
                      )}
                      {d.days && (
                        <>
                          <span>•</span>
                          <span className="inline-flex items-center gap-1">
                            <span className="material-symbols-outlined text-[14px]">timer</span>
                            {t('days', {days: d.days})}
                          </span>
                        </>
                      )}
                    </div>
                    <h3
                      className={`${
                        d.big ? 'font-headline-md text-headline-md lg:font-headline-lg lg:text-headline-lg' : 'font-headline-md text-headline-md'
                      } text-on-primary mt-1 mb-2 font-normal`}
                    >
                      {title}
                    </h3>
                    <p className="font-body-md text-body-md text-surface-container-highest/90 max-w-xl mb-space-md line-clamp-2">
                      {t(`items.${d.id}.text`)}
                    </p>
                    <div className="flex flex-wrap items-center justify-between gap-space-md pt-space-sm">
                      <div>
                        <span className="font-label-sm text-label-sm text-surface-container-highest uppercase tracking-wider">
                          {d.big ? t('packagesFrom') : t('startingAt')}
                        </span>
                        <div className="font-headline-sm text-headline-sm font-bold text-on-primary">
                          {d.price ? (
                            <>
                              {d.price}{' '}
                              <span className="font-body-sm text-body-sm font-normal text-surface-container">
                                {t('perPerson')}
                              </span>
                            </>
                          ) : (
                            <span className="font-body-md text-body-md font-semibold">{t('priceOnRequest')}</span>
                          )}
                        </div>
                      </div>
                      <a
                        href={waLink(w('book', {name: title}))}
                        target="_blank"
                        rel="noopener"
                        className="inline-flex items-center gap-space-xs px-space-md py-2.5 rounded-xl bg-surface-container-lowest text-primary font-label-md text-label-md font-bold hover:bg-secondary-fixed transition-colors"
                      >
                        <span>{t('book')}</span>
                        <span className="material-symbols-outlined text-[18px] rtl:rotate-180">arrow_forward</span>
                      </a>
                    </div>
                  </div>
                </article>
              );
            })}
        </div>
      </div>
    </section>
  );
}
