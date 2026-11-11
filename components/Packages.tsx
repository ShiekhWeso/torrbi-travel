import Image from 'next/image';
import {useTranslations} from 'next-intl';
import {packages} from '@/lib/data';
import {waLink} from '@/lib/whatsapp';

// Which destinations are shown as packages (ids from lib/data.ts)

export default function Packages() {
  const t = useTranslations('packageCards');
  const d = useTranslations('destinations');
  const p = useTranslations('packages');
  const w = useTranslations('wa');

  const items = packages;

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
          {items.map((item) => {
            const title = t('item', {name: d(`items.${item.id}.name`)});
            return (
              <article
                key={item.id}
                className="group flex flex-col rounded-3xl bg-mist p-4 lg:p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_44px_rgba(15,24,89,0.14)]"
              >
                {/* Big photo. bg-navy keeps the illustration style seamless if a card still uses one */}
                <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-navy">
                  <Image
                    src={item.image}
                    alt={title}
                    fill
                    sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>

                <h3 className="font-display font-bold text-2xl lg:text-3xl text-navy mt-5 px-1">{title}</h3>

                <p className="text-sm text-navy/70 mt-2 px-1">
                  {(p.raw(`items.${item.id}.stops`) as string[]).join(' → ')}
                </p>
                <ul className="mt-3 flex flex-wrap gap-2 px-1">
                  {(p.raw(`items.${item.id}.includes`) as string[]).map((inc) => (
                    <li key={inc} className="rounded-full bg-sky/10 px-3 py-1 text-xs">{inc}</li>
                  ))}
                </ul>
                {item.days && (
                  <p className="mt-3 px-1 text-sm font-bold text-navy">{p('days', {days: item.days})}</p>
                )}
                
                <div className="mt-4 flex items-center justify-between gap-4 border-t border-navy/10 pt-4 px-1">
                  <span className="font-display text-lg lg:text-xl text-navy">{t('price')}</span>
                  <a
                    href={waLink(w('book', {name: title}))}
                    target="_blank"
                    rel="noopener"
                    className="inline-flex items-center gap-2 rounded-xl bg-brand-warm px-5 py-3 text-sm lg:text-base font-bold text-navy shadow-[0_8px_20px_rgba(254,153,98,0.35)] transition-all hover:shadow-[0_12px_28px_rgba(254,153,98,0.5)] hover:scale-[1.02]"
                  >
                    {t('book')}
                    <span className="material-symbols-outlined text-[20px] rtl:rotate-180">arrow_forward</span>
                  </a>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
