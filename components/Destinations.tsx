import Image from 'next/image';
import {useTranslations} from 'next-intl';
import {destinations} from '@/lib/data';
import {waLink} from '@/lib/whatsapp';

export default function Destinations() {
  const t = useTranslations('destinations');
  const w = useTranslations('wa');

  return (
    <section id="destinations" className="w-full bg-brand-mist py-16 lg:py-24">
      <div className="max-w-[1440px] mx-auto px-4 lg:px-12">
        <h2 className="font-display font-bold text-3xl lg:text-4xl text-navy text-center mb-12">{t('title')}</h2>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 lg:gap-6 max-w-5xl mx-auto">
          {destinations.map((d) => {
            const name = t(`items.${d.id}.name`);
            return (
              <a
                key={d.id}
                href={waLink(w('book', {name}))}
                target="_blank"
                rel="noopener"
                className="group flex flex-col items-center text-center rounded-3xl bg-snow p-5 lg:p-8 transition-all hover:-translate-y-1 hover:shadow-[0_16px_36px_rgba(15,24,89,0.12)]"
              >
                <Image
                  src={d.image}
                  alt=""
                  width={240}
                  height={240}
                  className="w-32 h-32 lg:w-44 lg:h-44 rounded-full transition-transform duration-500 group-hover:scale-105"
                />
                <h3 className="font-display font-bold text-xl lg:text-2xl text-navy mt-4">{name}</h3>
                <p className="text-sm text-navy/60">{t(`items.${d.id}.country`)}</p>
                <span className="mt-3 inline-flex items-center gap-1 text-sm font-bold text-sky">
                  {t('book')}
                  <span className="material-symbols-outlined text-[18px] rtl:rotate-180">arrow_forward</span>
                </span>
              </a>
            );
          })}
        </div>
      </div>
    </section>
  );
}
