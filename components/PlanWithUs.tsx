import Image from 'next/image';
import {useTranslations} from 'next-intl';
import {waLink} from '@/lib/whatsapp';

export default function PlanWithUs() {
  const t = useTranslations('plan');
  const w = useTranslations('wa');
  return (
    <section className="w-full bg-snow py-16 lg:py-24">
      <div className="max-w-[1440px] mx-auto px-4 lg:px-12">
        <div className="relative overflow-hidden rounded-3xl bg-navy text-snow p-8 lg:p-14 shadow-2xl">
          <div className="absolute -right-24 -bottom-24 w-96 h-96 rounded-full bg-sky/30 blur-[100px] pointer-events-none" />
          <div className="absolute -left-24 -top-24 w-96 h-96 rounded-full bg-sunset/15 blur-[120px] pointer-events-none" />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-8 space-y-6">
              <h2 className="font-display font-bold text-3xl lg:text-5xl leading-[1.3]">
                {t('title1')} <br />
                <span className="text-sun">{t('title2')}</span>
              </h2>
              <p className="text-lg text-snow/80 max-w-xl">{t('text')}</p>
              <a
                href={waLink(w('plan'))}
                target="_blank"
                rel="noopener"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-bold text-navy bg-brand-warm shadow-[0_8px_20px_rgba(254,153,98,0.35)] hover:scale-[1.02] transition-transform"
              >
                <span>{t('whatsapp')}</span>
                <span className="material-symbols-outlined text-[18px] rtl:rotate-180">east</span>
              </a>
            </div>

            <div className="hidden lg:flex lg:col-span-4 justify-center">
              <Image src="/logo.webp" alt="TORRBI TRAVEL" width={256} height={256} className="w-56 h-56 rounded-full" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
