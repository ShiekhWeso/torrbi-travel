import Image from 'next/image';
import Link from 'next/link';
import {getTranslations, getLocale} from 'next-intl/server';
import {getPackages} from '@/lib/queries';

export default async function Packages() {
  const locale = await getLocale();
  const t = await getTranslations('packageCards');
  const p = await getTranslations('packages');
  const all = await getPackages(locale);
  const items = (all.some((x) => x.featured) ? all.filter((x) => x.featured) : all).slice(0, 3);

  return (
    <section id="packages" className="w-full bg-snow py-16 lg:py-24">
      <div className="max-w-[1440px] mx-auto px-4 lg:px-12">
        <Image
          src="/icons/packages.webp"
          alt=""
          width={80}
          height={80}
          className="mx-auto mb-4 h-16 w-16 lg:h-20 lg:w-20"
        />
        <h2 className="font-display font-bold text-3xl lg:text-5xl text-navy text-center mb-10 lg:mb-14">
          {t('title')}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 max-w-7xl mx-auto">
          {items.map((item) => (
              <article
                key={item.id}
                className="group flex flex-col rounded-3xl bg-mist p-4 lg:p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_44px_rgba(15,24,89,0.14)]"
              >
                {/* Big photo. bg-navy keeps the illustration style seamless if a card still uses one */}
                <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-navy">
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>

                <h3 className="font-display font-bold text-2xl lg:text-3xl text-navy mt-5 px-1">{item.title}</h3>

                <p className="text-sm text-navy/70 mt-2 px-1">
                  {item.stops.join(' → ')}
                </p>
                <ul className="mt-3 flex flex-wrap gap-2 px-1">
                  {item.includes.slice(0, 3).map((inc) => (
                    <li key={inc} className="rounded-full bg-sky/10 px-3 py-1 text-xs">{inc}</li>
                  ))}
                </ul>
                {item.days && (
                  <p className="mt-3 px-1 text-sm font-bold text-navy">{p('days', {days: item.days})}</p>
                )}
                
                <div className="mt-4 flex items-center justify-between gap-4 border-t border-navy/10 pt-4 px-1">
                  <span className="font-display text-lg lg:text-xl text-navy">{item.price ? `${p('from')} $${item.price}` : t('price')}</span>
                  <Link
                    href={`/${locale}/packages/${item.id}`}
                    className="group/btn inline-flex items-center gap-2 rounded-full border-2 border-navy px-5 py-2.5 text-sm font-bold text-navy transition-colors duration-300 hover:bg-navy hover:text-snow"
                  >
                    {t('details')}
                    <span className="material-symbols-outlined text-[20px] leading-none transition-transform duration-300 group-hover/btn:translate-x-1 rtl:rotate-180 rtl:group-hover/btn:-translate-x-1">
                      arrow_forward
                    </span>
                  </Link>
                </div>
              </article>
            ))}
        </div>
        <div className="mt-10 text-center">
          <Link
            href={`/${locale}/packages`}
            className="group/all inline-flex items-center gap-4 rounded-full bg-navy py-2 ps-8 pe-2 font-bold text-snow shadow-[0_12px_28px_rgba(15,24,89,0.25)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_16px_36px_rgba(15,24,89,0.35)]"
          >
            {t('seeMore')}
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-warm text-navy transition-transform duration-300 group-hover/all:rotate-[-45deg] rtl:rotate-180 rtl:group-hover/all:rotate-[225deg]">
              <span className="material-symbols-outlined text-[22px] leading-none">arrow_forward</span>
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}
