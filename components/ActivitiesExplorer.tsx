'use client';

import {useState} from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {useLocale, useTranslations} from 'next-intl';
import {useSearchParams} from 'next/navigation';
import type {Activity} from '@/lib/queries';
import {waLink} from '@/lib/whatsapp';
import {useCurrency} from '@/components/CurrencyProvider';

const chip = (on: boolean) =>
  `rounded-full px-4 py-2 text-sm font-bold transition-colors ${
    on ? 'bg-navy text-snow' : 'bg-mist text-navy hover:bg-sky-light/40'
  }`;

type ActivityCard = Pick<Activity, 'id' | 'city' | 'image' | 'price' | 'durationHours' | 'title'>;

export default function ActivitiesExplorer({items}: {items: ActivityCard[]}) {
  const locale = useLocale();
  const ar = locale === 'ar';
  const t = (en: string, a: string) => (ar ? a : en);
  const w = useTranslations('wa');
  const {money} = useCurrency();
  const sp = useSearchParams();
  const carry = new URLSearchParams();
  ['date', 'pax'].forEach((k) => {
    const val = sp.get(k);
    if (val) carry.set(k, val);
  });
  const suffix = carry.toString() ? `?${carry}` : '';

  const [q, setQ] = useState(sp.get('q') ?? '');
  const [city, setCity] = useState('all');
  const [sort, setSort] = useState('default');
  const cities = [...new Set(items.map((x) => x.city))];

  const list = items.filter((x) => {
    const okQ = `${x.title} ${x.city}`.toLowerCase().includes(q.trim().toLowerCase());
    const okC = city === 'all' || x.city === city;
    return okQ && okC;
  });
  if (sort === 'low') list.sort((a, b) => (a.price ?? 0) - (b.price ?? 0));
  if (sort === 'high') list.sort((a, b) => (b.price ?? 0) - (a.price ?? 0));

  const reset = () => { setQ(''); setCity('all'); setSort('default'); };

  return (
    <>
      <div className="space-y-5 rounded-3xl bg-snow p-5 shadow-[0_16px_40px_rgba(15,24,89,0.08)] lg:p-6">
        <label className="flex items-center gap-3 rounded-xl bg-mist px-4 py-3">
          <span className="material-symbols-outlined text-sky">search</span>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={t('Search activities', 'ابحث عن نشاط')}
            className="w-full bg-transparent font-bold text-navy placeholder:text-navy/40 focus:outline-none"
          />
        </label>

        {cities.length > 1 && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="me-2 text-xs font-bold uppercase tracking-wider text-navy/50">{t('Destination', 'الوجهة')}</span>
            <button onClick={() => setCity('all')} className={chip(city === 'all')}>{t('All', 'الكل')}</button>
            {cities.map((c) => (
              <button key={c} onClick={() => setCity(c)} className={chip(city === c)}>{c}</button>
            ))}
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-navy/10 pt-4">
          <p className="font-bold text-navy">{list.length} {t('activities', 'نشاط')}</p>
          <div className="flex items-center gap-3">
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="rounded-full bg-mist px-4 py-2 text-sm font-bold text-navy focus:outline-none"
            >
              <option value="default">{t('Recommended', 'الموصى بها')}</option>
              <option value="low">{t('Price: low to high', 'السعر: من الأقل للأعلى')}</option>
              <option value="high">{t('Price: high to low', 'السعر: من الأعلى للأقل')}</option>
            </select>
            <button onClick={reset} className="text-sm font-bold text-sky hover:underline">{t('Reset', 'إعادة تعيين')}</button>
          </div>
        </div>
      </div>

      {list.length === 0 ? (
        <div className="mt-16 text-center">
          <p className="text-lg text-navy/60">{t('No activities match your filters.', 'لا توجد أنشطة مطابقة.')}</p>
          <a
            href={waLink(w('plan'))}
            target="_blank"
            rel="noopener"
            className="mt-5 inline-flex items-center gap-2 rounded-full bg-brand-warm px-6 py-3 font-bold text-navy shadow-[0_8px_24px_rgba(254,153,98,0.4)] transition-transform hover:scale-[1.02]"
          >
            {t("Can't find it? Ask us on WhatsApp", 'ما وجدت ما تبحث عنه؟ اسألنا على واتساب')}
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
                {x.image && (
                  <Image
                    src={x.image}
                    alt={x.title}
                    fill
                    sizes="(min-width: 1440px) 427px, (min-width: 1024px) 29vw, (min-width: 768px) 50vw, calc(100vw - 32px)"
                    priority={index === 0}
                    className="object-cover"
                  />
                )}
              </div>
              <h3 className="mt-5 px-1 font-display text-2xl font-bold text-navy">{x.title}</h3>
              <p className="mt-2 px-1 text-sm text-navy/70">{x.city}</p>
              <p className="mt-3 px-1 text-sm font-bold text-navy">{x.durationHours ?? '—'} {t('hours', 'ساعات')}</p>
              <div className="mt-4 flex items-center justify-between gap-4 border-t border-navy/10 px-1 pt-4">
                <span className="font-display text-lg text-navy">
                  {x.price != null ? `${t('From', 'ابتداءً من')} ${money(x.price)}` : t('Price on request', 'السعر عند الطلب')}
                </span>
                <Link
                  href={`/${locale}/activities/${x.id}${suffix}`}
                  className="group/btn inline-flex items-center gap-2 rounded-full border-2 border-navy px-5 py-2.5 text-sm font-bold text-navy transition-colors duration-300 hover:bg-navy hover:text-snow"
                >
                  {t('More details', 'المزيد من التفاصيل')}
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