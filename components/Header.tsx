'use client';

import {useEffect, useState} from 'react';
import Image from 'next/image';
import {useLocale, useTranslations} from 'next-intl';
import {Link, usePathname} from '@/i18n/navigation';
import {waLink} from '@/lib/whatsapp';

const items = [
  {id: 'top', key: 'home'},
  {id: 'packages', key: 'packages'},
  {id: 'destinations', key: 'destinations'},
  {id: 'why', key: 'why'},
  {id: 'about', key: 'about'},
  {id: 'contact', key: 'contact'}
] as const;

export default function Header() {
  const t = useTranslations('nav');
  const h = useTranslations('header');
  const w = useTranslations('wa');
  const locale = useLocale();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [cur, setCur] = useState('');
  const active = cur;

  useEffect(() => {
    if (!document.getElementById('top')) {
      setCur('');
      return;
    }
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
  }, [pathname]);

  const other = locale === 'ar' ? 'en' : 'ar';

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-snow/90 backdrop-blur-xl shadow-[0_4px_24px_rgba(15,24,89,0.06)]">
      <div className="h-20 max-w-[1440px] mx-auto px-4 lg:px-12 flex items-center justify-between gap-6">
        <div className="flex items-center gap-8">
          <Link href={{pathname: '/', hash: 'top'}} className="flex items-center gap-3">
            <Image src="/logo.webp" alt="" width={44} height={44} priority className="rounded-full" />
            <span className="font-display font-bold text-xl text-navy tracking-wide">TORRBI TRAVEL</span>
          </Link>
          <nav className="hidden lg:flex items-center gap-1">
            {items.map(({id, key}) => (
              <Link
                key={id}
                href={{pathname: '/', hash: id}}
                aria-current={active === id ? 'page' : undefined}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${
                  active === id ? 'bg-navy text-snow shadow-sm' : 'text-navy/70 hover:text-navy hover:bg-mist'
                }`}
              >
                {t(key)}
              </Link>
            ))}
            <Link
              href="/faq"
              aria-current={pathname === '/faq' ? 'page' : undefined}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${
                pathname === '/faq' ? 'bg-navy text-snow shadow-sm' : 'text-navy/70 hover:text-navy hover:bg-mist'
              }`}
            >
              {t('faq')}
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href={pathname}
            locale={other}
            aria-label={h('switchLang')}
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-mist text-navy text-sm font-bold hover:bg-sky-light/40 transition-colors"
          >
            <span className="material-symbols-outlined text-[18px] text-sky">language</span>
            <span>{locale === 'ar' ? 'EN' : 'عربي'}</span>
          </Link>
          <a
            href={waLink(w('plan'))}
            target="_blank"
            rel="noopener"
            className="hidden sm:inline-flex items-center justify-center px-6 py-2.5 rounded-lg text-sm font-bold text-navy bg-brand-warm shadow-[0_8px_20px_rgba(254,153,98,0.35)] hover:scale-[1.02] transition-transform"
          >
            {h('bookWhatsapp')}
          </a>
          <button
            type="button"
            onClick={() => setOpen(!open)}
            aria-label={h('menu')}
            aria-expanded={open}
            className="lg:hidden flex items-center justify-center w-10 h-10 rounded-full bg-mist text-navy"
          >
            <span className="material-symbols-outlined">{open ? 'close' : 'menu'}</span>
          </button>
        </div>
      </div>

      {open && (
        <nav className="lg:hidden flex flex-col border-t border-navy/10 bg-snow px-4 py-3">
          {items.map(({id, key}) => (
            <Link
              key={id}
              href={{pathname: '/', hash: id}}
              onClick={() => setOpen(false)}
              aria-current={active === id ? 'page' : undefined}
              className={`py-3 text-sm font-bold ${
                active === id ? 'rounded-lg bg-navy text-snow shadow-sm' : 'text-navy'
              }`}
            >
              {t(key)}
            </Link>
          ))}
          <Link
            href="/faq"
            onClick={() => setOpen(false)}
            aria-current={pathname === '/faq' ? 'page' : undefined}
            className={`py-3 text-sm font-bold ${
              pathname === '/faq' ? 'rounded-lg bg-navy text-snow shadow-sm' : 'text-navy'
            }`}
          >
            {t('faq')}
          </Link>
          <Link href={pathname} locale={other} onClick={() => setOpen(false)} className="py-3 text-sm font-bold text-sky">
            {locale === 'ar' ? 'English' : 'العربية'}
          </Link>
        </nav>
      )}
    </header>
  );
}
