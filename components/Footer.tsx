import {useTranslations} from 'next-intl';

export default function Footer() {
  const t = useTranslations('footer');
  const n = useTranslations('nav');
  const links = [
    {href: '#top', k: 'home'},
    {href: '#destinations', k: 'destinations'},
    {href: '#offers', k: 'offers'},
    {href: '#why', k: 'why'}
  ] as const;

  return (
    <footer className="w-full bg-surface-container-low text-on-surface-variant">
      <div className="max-w-[1440px] mx-auto px-margin-mobile lg:px-margin pt-space-xl pb-space-lg">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-gutter mb-space-xl">
          <div className="space-y-space-md">
            <span className="font-headline-sm text-headline-sm text-primary">TORRBI TRAVEL</span>
            <p className="font-body-sm text-body-sm text-on-surface-variant">{t('about')}</p>
            <div className="flex items-center gap-space-md text-secondary">
              <span className="material-symbols-outlined text-[20px]">flight_takeoff</span>
              <span className="font-label-sm text-label-sm tracking-wider uppercase text-on-surface">{t('trusted')}</span>
            </div>
          </div>

          <div>
            <h4 className="font-title-md text-title-md text-on-surface mb-space-md">{t('discover')}</h4>
            <ul className="space-y-space-sm font-body-sm text-body-sm">
              {links.map((l) => (
                <li key={l.k}>
                  <a className="hover:text-primary transition-colors" href={l.href}>
                    {n(l.k)}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-title-md text-title-md text-on-surface mb-space-md">{t('why')}</h4>
            <div className="space-y-space-md">
              <div className="flex items-start gap-space-sm">
                <span className="material-symbols-outlined text-secondary text-[22px]">verified_user</span>
                <div>
                  <p className="font-label-md text-label-md text-on-surface font-semibold">{t('secureTitle')}</p>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">{t('secureText')}</p>
                </div>
              </div>
              <div className="flex items-start gap-space-sm">
                <span className="material-symbols-outlined text-secondary text-[22px]">shield_with_heart</span>
                <div>
                  <p className="font-label-md text-label-md text-on-surface font-semibold">{t('supportTitle')}</p>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">{t('supportText')}</p>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-title-md text-title-md text-on-surface mb-space-md">{t('offersTitle')}</h4>
            <p className="font-body-sm text-body-sm mb-space-md text-on-surface-variant">{t('offersText')}</p>
            {/* Newsletter signup is wired to the database in a later phase */}
            <div className="flex items-center bg-surface-container-lowest rounded-lg p-1.5 shadow-[0_2px_8px_rgba(15,24,89,0.04)]">
              <input
                className="w-full px-space-sm py-1.5 bg-transparent font-body-sm text-body-sm text-on-surface focus:outline-none placeholder:text-outline"
                aria-label={t('emailPlaceholder')}
                placeholder={t('emailPlaceholder')}
                type="email"
              />
              <button
                type="button"
                className="px-space-md py-1.5 bg-primary text-on-primary rounded font-label-sm text-label-sm uppercase tracking-wider hover:bg-primary-container transition-colors"
              >
                {t('join')}
              </button>
            </div>
          </div>
        </div>

        <div className="pt-space-lg flex flex-col sm:flex-row items-center justify-between gap-space-md font-body-sm text-body-sm">
          <div>
            <p>{t('rights')}</p>
            <p className="text-[12px] opacity-70 mt-1">{t('photos')}</p>
          </div>
          <div className="flex flex-wrap items-center gap-space-lg">
            <a className="hover:text-primary transition-colors" href="#">{t('privacy')}</a>
            <a className="hover:text-primary transition-colors" href="#">{t('terms')}</a>
            <a className="hover:text-primary transition-colors" href="#">{t('cancellation')}</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
