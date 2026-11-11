'use client';

import {useState} from 'react';
import {useTranslations} from 'next-intl';
import {flights} from '@/lib/data';
import {waLink} from '@/lib/whatsapp';

type Filter = 'all' | 'na' | 'eu';
const noteStyle: Record<string, {icon: string; cls: string}> = {
  limited: {icon: 'bolt', cls: 'text-on-tertiary-container'},
  value: {icon: 'star', cls: 'text-secondary'},
  transfer: {icon: 'train', cls: 'text-secondary'}
};

export default function FlightDeals() {
  const t = useTranslations('flights');
  const w = useTranslations('wa');
  const [filter, setFilter] = useState<Filter>('all');
  const filters: Filter[] = ['all', 'na', 'eu'];

  return (
    <section id="offers" className="w-full bg-surface py-space-xl lg:py-24">
      <div className="max-w-[1440px] mx-auto px-margin-mobile lg:px-margin space-y-space-xl">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-space-md">
          <div>
            <span className="font-label-sm text-label-sm uppercase tracking-widest text-secondary font-bold">
              {t('kicker')}
            </span>
            <h2 className="font-headline-lg text-headline-md lg:text-headline-lg text-primary tracking-tight mt-1">
              {t('title')}
            </h2>
          </div>
          <div className="flex flex-wrap items-center gap-space-xs p-1 bg-surface-container rounded-xl">
            {filters.map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-lg font-label-md text-label-md transition-colors ${
                  filter === f
                    ? 'bg-surface-container-lowest text-primary font-semibold shadow-sm'
                    : 'text-on-surface-variant hover:text-primary'
                }`}
              >
                {t(`filters.${f}`)}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-space-md">
          {flights
            .filter((f) => filter === 'all' || f.region === filter)
            .map((f) => {
              const from = t(`cities.${f.from}`);
              const to = t(`cities.${f.to}`);
              const n = noteStyle[f.note];
              return (
                <div
                  key={f.id}
                  className="group flex flex-col lg:flex-row lg:items-center justify-between gap-space-lg p-space-lg rounded-2xl bg-surface-container-lowest shadow-[0_4px_16px_rgba(15,24,89,0.04)] hover:shadow-[0_12px_28px_rgba(15,24,89,0.08)] transition-all"
                >
                  <div className="flex items-center gap-space-md">
                    <div className="w-12 h-12 rounded-xl bg-surface-container-low flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-on-primary transition-colors">
                      <span className="material-symbols-outlined text-[24px]">flight</span>
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-space-xs">
                        <span className="font-title-lg text-title-lg text-primary font-bold">{from}</span>
                        <span className="material-symbols-outlined text-secondary text-[20px] rtl:rotate-180">
                          arrow_right_alt
                        </span>
                        <span className="font-title-lg text-title-lg text-primary font-bold">{to}</span>
                      </div>
                      <div className="flex flex-wrap items-center gap-space-md text-on-surface-variant font-body-sm text-body-sm mt-0.5">
                        <span>{t('nonstop', {h: f.h, m: f.m})}</span>
                        <span>{t('liveFares')}</span>
                        <span className={`inline-flex items-center font-semibold ${n.cls}`}>
                          <span className="material-symbols-outlined text-[15px] me-1">{n.icon}</span>
                          {t(`notes.${f.note}`)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="hidden xl:flex items-center gap-space-lg text-center" dir="ltr">
                    <div>
                      <div className="font-title-md text-title-md text-primary font-bold">{f.dep}</div>
                      <div className="font-body-sm text-body-sm text-outline">{f.depPlace}</div>
                    </div>
                    <div className="w-36 flex flex-col items-center">
                      <span className="font-label-sm text-label-sm text-secondary font-semibold">{t('direct')}</span>
                      <div className="relative w-full h-0.5 bg-secondary my-1.5">
                        <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3.5 h-3.5 rounded-full bg-surface-container-lowest shadow flex items-center justify-center">
                          <div className="w-1.5 h-1.5 rounded-full bg-secondary" />
                        </div>
                      </div>
                      <span className="font-label-sm text-label-sm text-outline">{t('duration', {h: f.h, m: f.m})}</span>
                    </div>
                    <div>
                      <div className="font-title-md text-title-md text-primary font-bold">
                        {f.arr} <sup className="text-secondary font-normal">+1</sup>
                      </div>
                      <div className="font-body-sm text-body-sm text-outline">{f.arrPlace}</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between lg:justify-end gap-space-lg pt-space-sm lg:pt-0">
                    <div className="text-end">
                      <span className="line-through font-body-sm text-body-sm text-outline">${f.old.toLocaleString('en-US')}</span>
                      <div className="font-headline-sm text-headline-sm font-bold text-primary">${f.price}</div>
                      <span className="font-label-sm text-label-sm text-secondary font-semibold">{t(f.taxes)}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => window.open(waLink(w('flight', {from, to})), '_blank', 'noopener')}
                      className="px-space-lg py-3 rounded-xl bg-primary text-on-primary font-label-md text-label-md font-semibold hover:bg-primary-container transition-all shadow-sm"
                    >
                      {t('request')}
                    </button>
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    </section>
  );
}
