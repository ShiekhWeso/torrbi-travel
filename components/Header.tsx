'use client';

import {useEffect, useState} from 'react';
import {useLocale, useTranslations} from 'next-intl';
import {Link, usePathname} from '@/i18n/navigation';
import {waLink} from '@/lib/whatsapp';

const items = [
  {id: 'top', key: 'home'},
  {id: 'destinations', key: 'destinations'},
  {id: 'offers', key: 'offers'},
  {id: 'why', key: 'why'},
  {id: 'contact', key: 'contact'}
] as const;

export default function Header() {
  const t = useTranslations('nav');
  const h = useTranslations('header');
  const w = useTranslations('wa');
  const locale = useLocale();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [cur, setCur] = useState('top');

  useEffect(() => {
    const onScroll = () => {
      let c = 'top';
      items.forEach(({id}) => {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top < 140) c = id;
      });
      setCur(c);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, {passive: true});
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const other = locale === 'ar' ? 'en' : 'ar';
  const on = 'bg-primary-container text-on-primary font-semibold rounded-lg shadow-sm';
  const off =
    'font-label-md text-label-md text-on-surface-variant hover:text-primary hover:bg-surface-container-high rounded-lg';

  const focusSearch = () => {
    document.getElementById('top')?.scrollIntoView();
    setTimeout(() => document.getElementById('search-input')?.focus(), 400);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-surface-container-lowest/85 backdrop-blur-xl shadow-[0_4px_24px_rgba(15,24,89,0.06)]">
      <div className="h-20 max-w-[1440px] mx-auto px-margin-mobile lg:px-margin flex items-center justify-between gap-gutter">
        <div className="flex items-center gap-space-lg">
          <a href="#top" className="font-title-lg text-title-lg text-primary tracking-tight">
            TORRBI TRAVEL
          </a>
          <nav className="hidden xl:flex items-center gap-space-xs">
            {items.map(({id, key}) => (
              <a
                key={id}
                href={`#${id}`}
                aria-current={cur === id ? 'page' : undefined}
                className={`px-space-md py-space-sm transition-colors ${cur === id ? on : off}`}
              >
                {t(key)}
              </a>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-space-md">
          <Link
            href={pathname}
            locale={other}
            aria-label={h('switchLang')}
            className="hidden md:flex items-center gap-space-xs px-space-sm py-space-xs rounded-full bg-surface-container-low text-on-surface-variant font-label-sm text-label-sm hover:bg-surface-container-high"
          >
            <span className="material-symbols-outlined text-[18px] text-secondary">language</span>
            <span className="tracking-wider font-semibold">{locale === 'ar' ? 'EN' : 'عربي'}</span>
          </Link>
          <button
            type="button"
            onClick={focusSearch}
            aria-label={h('search')}
            className="flex items-center justify-center w-10 h-10 rounded-full bg-surface-container text-on-surface-variant hover:bg-surface-container-high hover:text-primary transition-all"
          >
            <span className="material-symbols-outlined text-[20px]">search</span>
          </button>
          <a
            href={waLink(w('plan'))}
            target="_blank"
            rel="noopener"
            className="hidden sm:inline-flex items-center justify-center px-space-lg py-3 rounded-lg font-label-md text-label-md font-semibold text-primary-container bg-gradient-to-r from-[#EFC44D] to-[#FE9962] shadow-[0_8px_20px_rgba(203,112,61,0.25)] hover:shadow-[0_12px_28px_rgba(203,112,61,0.35)] hover:scale-[1.01] transition-all"
          >
            {h('bookWhatsapp')}
          </a>
          <button
            type="button"
            onClick={() => setOpen(!open)}
            aria-label={h('menu')}
            aria-expanded={open}
            className="xl:hidden flex items-center justify-center w-10 h-10 rounded-full bg-surface-container text-primary"
          >
            <span className="material-symbols-outlined">{open ? 'close' : 'menu'}</span>
          </button>
          <a
            href="#"
            aria-label={h('myBookings')}
            className="flex items-center justify-center w-10 h-10 rounded-full bg-surface-container text-on-surface-variant hover:bg-surface-container-high"
          >
            <span className="material-symbols-outlined text-[20px]">person</span>
          </a>
        </div>
      </div>

      {open && (
        <nav className="xl:hidden flex flex-col border-t border-outline-variant bg-surface-container-lowest px-margin-mobile py-3">
          {items.map(({id, key}) => (
            <a
              key={id}
              href={`#${id}`}
              onClick={() => setOpen(false)}
              className="py-3 font-label-md text-label-md text-on-surface"
            >
              {t(key)}
            </a>
          ))}
          <Link
            href={pathname}
            locale={other}
            onClick={() => setOpen(false)}
            className="py-3 font-label-md text-label-md text-secondary"
          >
            {locale === 'ar' ? 'English' : 'العربية'}
          </Link>
        </nav>
      )}
    </header>
  );
}
