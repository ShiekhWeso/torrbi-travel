import {useTranslations} from 'next-intl';
import {waLink} from '@/lib/whatsapp';

export default function PlanWithUs() {
  const t = useTranslations('plan');
  const w = useTranslations('wa');
  return (
    <section id="contact" className="w-full bg-surface-container-low py-space-xl lg:py-24">
      <div className="max-w-[1440px] mx-auto px-margin-mobile lg:px-margin">
        <div className="rounded-3xl bg-primary text-on-primary p-space-lg lg:p-space-xl overflow-hidden relative shadow-2xl">
          <div className="absolute -right-24 -bottom-24 w-96 h-96 rounded-full bg-secondary/20 blur-[100px] pointer-events-none" />
          <div className="absolute -left-24 -top-24 w-96 h-96 rounded-full bg-tertiary-container/30 blur-[120px] pointer-events-none" />
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-gutter items-center">
            <div className="lg:col-span-7 space-y-space-md">
              <div className="inline-flex items-center gap-space-xs px-3 py-1 rounded-full bg-surface-container-lowest/10 backdrop-blur-md">
                <span className="material-symbols-outlined text-secondary-fixed text-[16px]">support_agent</span>
                <span className="font-label-sm text-label-sm uppercase tracking-wider text-secondary-fixed font-bold">
                  {t('badge')}
                </span>
              </div>
              <h2 className="font-display-hero text-headline-lg lg:text-display-hero font-light text-on-primary tracking-tight">
                {t('title1')} <br />
                <span className="italic font-normal text-secondary-fixed">{t('title2')}</span>
              </h2>
              <p className="font-body-lg text-body-lg text-surface-container-highest/80 max-w-xl">{t('text')}</p>
              <div className="flex flex-wrap items-center gap-space-md pt-2">
                <a
                  href={waLink(w('plan'))}
                  target="_blank"
                  rel="noopener"
                  className="inline-flex items-center gap-space-sm px-space-xl py-3.5 rounded-xl font-label-md text-label-md font-bold text-primary-container bg-gradient-to-r from-[#EFC44D] to-[#FE9962] shadow-[0_8px_20px_rgba(203,112,61,0.3)] hover:scale-[1.01] transition-all"
                >
                  <span>{t('whatsapp')}</span>
                  <span className="material-symbols-outlined text-[18px] rtl:rotate-180">east</span>
                </a>
                <a
                  href="mailto:EMAIL@EXAMPLE.COM"
                  className="inline-flex items-center gap-space-sm px-space-lg py-3.5 rounded-xl font-label-md text-label-md font-semibold text-on-primary bg-surface-container-lowest/15 hover:bg-surface-container-lowest/25 transition-all"
                >
                  <span className="material-symbols-outlined text-[18px]">mail</span>
                  <span>{t('email')}</span>
                </a>
              </div>
            </div>

            <div className="lg:col-span-5 relative">
              <div className="rounded-2xl overflow-hidden bg-surface-container-lowest/10 p-space-sm backdrop-blur-md shadow-inner">
                <div
                  className="w-full h-80 rounded-xl bg-cover bg-center relative"
                  style={{
                    backgroundImage:
                      "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCkUHJY4GxRhczRJiddWsyyiI2RFx0mlY7gB1A5c5QFnFk_qBS_1GdXi0ysBH2JABOsqihPbfNWHlWybwSEgJvR4BfWzgmGDAgiAtYBK9xSWrKwlZy_fAZVSwKUd41QFzCPWc4l9B1w7Hs0rUzUx0qX6crXXr2CYgQ3inEgrD315qrfhWNmsg8FqxDidJE8B3Qm-e8v5ehi1MkFKVbn8vVbrIUb8cdR0JVt1nhdOvk')"
                  }}
                >
                  <div className="absolute inset-0 bg-primary/30 backdrop-blur-[2px]" />
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-space-md text-center">
                    <div className="w-12 h-12 rounded-full bg-surface-container-lowest text-primary shadow-xl flex items-center justify-center mb-2 animate-bounce">
                      <span className="material-symbols-outlined text-[24px]">location_on</span>
                    </div>
                    <span className="font-title-md text-title-md font-bold text-on-primary">{t('mapTitle')}</span>
                    <p className="font-body-sm text-body-sm text-surface-container-highest max-w-xs mt-1">{t('mapText')}</p>
                    <span className="mt-3 px-3 py-1 rounded-full bg-secondary text-on-secondary font-label-sm text-label-sm uppercase tracking-wider font-bold">
                      {t('talk')}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
