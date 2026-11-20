'use client';

import {Suspense, useEffect, useState} from 'react';
import Image from 'next/image';
import {useLocale, useTranslations} from 'next-intl';
import {useSearchParams} from 'next/navigation';
import {Link, usePathname} from '@/i18n/navigation';
import {useCurrency} from '@/components/CurrencyProvider';
import {CURRENCIES} from '@/lib/currency';

const items = [
  {id: 'top', key: 'home'},
  {id: 'packages', key: 'packages'},
  {id: 'destinations', key: 'destinations'},
  {id: 'contact', key: 'contact'}
] as const;

function LocaleSwitchLink({
  pathname,
  locale,
  className,
  ariaLabel,
  onClick,
  children
}: {
  pathname: string;
  locale: string;
  className: string;
  ariaLabel?: string;
  onClick?: () => void;
  children: React.ReactNode;
}) {
  const searchParams = useSearchParams();
  const query = searchParams.toString();
  return (
    <Link
      href={query ? `${pathname}?${query}` : pathname}
      locale={locale}
      aria-label={ariaLabel}
      onClick={onClick}
      className={className}
    >
      {children}
    </Link>
  );
}

export default function Header({hideAuth = false}: {hideAuth?: boolean}) {
  const t = useTranslations('nav');
  const h = useTranslations('header');
  const locale = useLocale();
  const ar = locale === 'ar';
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const {cur, setCur} = useCurrency();
  const [curOpen, setCurOpen] = useState(false);
  const [sectionState, setSectionState] = useState({pathname, section: ''});
  const [user, setUser] = useState<{name: string} | null | undefined>(undefined);
  const active = sectionState.pathname === pathname ? sectionState.section : '';

  useEffect(() => {
    fetch('/api/me', {cache: 'no-store'})
      .then((r) => r.json())
      .then((d) => setUser(d.user))
      .catch(() => setUser(null));
  }, [pathname]);

  useEffect(() => {
    if (!document.getElementById('top')) return;
    const onScroll = () => {
      let c = 'top';
      items.forEach(({id}) => {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top < 140) c = id;
      });
      setSectionState({pathname, section: c});
    };
    onScroll();
    window.addEventListener('scroll', onScroll, {passive: true});
    return () => window.removeEventListener('scroll', onScroll);
  }, [pathname]);

  const other = ar ? 'en' : 'ar';
  const loginLabel = ar ? 'تسجيل الدخول' : 'Log in';
  const signupLabel = ar ? 'إنشاء حساب' : 'Sign up';

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
              href="/activities"
              aria-current={pathname.startsWith('/activities') ? 'page' : undefined}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${
                pathname.startsWith('/activities') ? 'bg-navy text-snow shadow-sm' : 'text-navy/70 hover:text-navy hover:bg-mist'
              }`}
            >
              {ar ? 'الأنشطة' : 'Activities'}
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <button type="button" onClick={() => setCurOpen(!curOpen)} aria-label="Currency"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-mist text-navy text-sm font-bold hover:bg-sky-light/40 transition-colors">
              <span className="material-symbols-outlined text-[18px] text-sky">payments</span>
              <span>{cur}</span>
            </button>
            {curOpen && (
              <div className="absolute end-0 mt-2 w-28 rounded-xl bg-snow p-1 shadow-[0_12px_32px_rgba(15,24,89,0.15)]">
                {CURRENCIES.map((c) => (
                  <button key={c} type="button" onClick={() => { setCur(c); setCurOpen(false); }}
                    className={`block w-full rounded-lg px-3 py-2 text-start text-sm font-bold ${cur === c ? 'bg-navy text-snow' : 'text-navy hover:bg-mist'}`}>
                    {c}
                  </button>
                ))}
              </div>
            )}
          </div>
          <Suspense fallback={null}>
            <LocaleSwitchLink
              pathname={pathname}
              locale={other}
              ariaLabel={h('switchLang')}
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-mist text-navy text-sm font-bold hover:bg-sky-light/40 transition-colors"
            >
              <span className="material-symbols-outlined text-[18px] text-sky">language</span>
              <span>{ar ? 'EN' : 'عربي'}</span>
            </LocaleSwitchLink>
          </Suspense>

          {!hideAuth && user && (
            <Link
              href="/account"
              aria-label="Account"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-mist text-navy transition-colors hover:bg-sky-light/40"
            >
              <span className="material-symbols-outlined text-[22px]">person</span>
            </Link>
          )}
          {!hideAuth && user === null && (
            <div className="hidden sm:flex items-center gap-2">
              <Link href="/login" className="px-4 py-2.5 rounded-lg text-sm font-bold text-navy hover:bg-mist transition-colors">
                {loginLabel}
              </Link>
              <Link
                href="/signup"
                className="px-6 py-2.5 rounded-lg text-sm font-bold text-navy bg-brand-warm shadow-[0_8px_20px_rgba(254,153,98,0.35)] hover:scale-[1.02] transition-transform"
              >
                {signupLabel}
              </Link>
            </div>
          )}

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
            href="/activities"
            onClick={() => setOpen(false)}
            aria-current={pathname.startsWith('/activities') ? 'page' : undefined}
            className={`py-3 text-sm font-bold ${
              pathname.startsWith('/activities') ? 'rounded-lg bg-navy text-snow shadow-sm' : 'text-navy'
            }`}
          >
            {ar ? 'الأنشطة' : 'Activities'}
          </Link>
          {!hideAuth && user === null && (
            <>
              <Link href="/login" onClick={() => setOpen(false)} className="py-3 text-sm font-bold text-navy">
                {loginLabel}
              </Link>
              <Link href="/signup" onClick={() => setOpen(false)} className="py-3 text-sm font-bold text-navy">
                {signupLabel}
              </Link>
            </>
          )}
          <Suspense fallback={null}>
            <LocaleSwitchLink
              pathname={pathname}
              locale={other}
              onClick={() => setOpen(false)}
              className="py-3 text-sm font-bold text-sky"
            >
              {ar ? 'English' : 'العربية'}
            </LocaleSwitchLink>
          </Suspense>
        </nav>
      )}
    </header>
  );
}