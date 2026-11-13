import Image from 'next/image';
import Link from 'next/link';
import {getTranslations, getLocale} from 'next-intl/server';
import {getOffers} from '@/lib/queries';
import {waLink} from '@/lib/whatsapp';

export default async function Offers() {
  const locale = await getLocale();
  const t = await getTranslations('offers');
  const w = await getTranslations('wa');
  const items = await getOffers(locale);
  if (items.length === 0) return null;
  const fmt = new Intl.DateTimeFormat(locale, {day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC'});
  const btn =
    'inline-flex items-center gap-2 rounded-full border-2 border-navy px-5 py-2.5 text-sm font-bold text-navy transition-colors duration-300 hover:bg-navy hover:text-snow';

  return (
    <section id="offers" className="w-full bg-mist py-16 lg:py-24">
      <div className="mx-auto max-w-[1440px] px-4 lg:px-12">
        <h2 className="mb-10 text-center font-display text-3xl font-bold text-navy lg:mb-14 lg:text-5xl">{t('title')}</h2>
        <div className="mx-auto grid max-w-7xl gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-8">
          {items.map((o) => (
            <article
              key={o.id}
              className="flex flex-col overflow-hidden rounded-3xl bg-snow transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_44px_rgba(15,24,89,0.14)]"
            >
              <div className="relative aspect-[16/10] w-full bg-navy">
                {o.image && (
                  <Image src={o.image} alt={o.title} fill sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw" className="object-cover" />
                )}
                {o.badge && (
                  <span className="absolute start-4 top-4 rounded-full bg-brand-warm px-4 py-1.5 text-sm font-bold text-navy">{o.badge}</span>
                )}
              </div>
              <div className="flex flex-1 flex-col p-5 lg:p-6">
                <h3 className="font-display text-xl font-bold text-navy lg:text-2xl">{o.title}</h3>
                <p className="mt-2 text-sm text-navy/70">{o.text}</p>
                {o.until && <p className="mt-3 text-xs text-navy/50">{t('until', {date: fmt.format(o.until)})}</p>}
                <div className="mt-auto pt-5">
                  {o.slug ? (
                    <Link href={`/${locale}/packages/${o.slug}`} className={btn}>{t('view')}</Link>
                  ) : (
                    <a href={waLink(w('book', {name: o.title}))} target="_blank" rel="noopener" className={btn}>{t('view')}</a>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}