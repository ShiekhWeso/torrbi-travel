'use client';

import {useLocale} from 'next-intl';
import {Link, usePathname} from '@/i18n/navigation';
import {userLogout} from '@/lib/user-actions';

const tabs = [
  {href: '/account', icon: 'person', en: 'Personal info', ar: 'البيانات الشخصية'},
  {href: '/account/bookings', icon: 'luggage', en: 'My bookings', ar: 'حجوزاتي'},
  {href: '/account/favorites', icon: 'favorite', en: 'Favorites', ar: 'المفضلة'},
  {href: '/account/coupons', icon: 'sell', en: 'Coupons', ar: 'الكوبونات'},
  {href: '/account/security', icon: 'lock', en: 'Account settings', ar: 'إعدادات الحساب'}
] as const;

export default function AccountNav() {
  const ar = useLocale() === 'ar';
  const pathname = usePathname();
  const item = 'flex items-center gap-3 whitespace-nowrap rounded-xl px-4 py-3 text-sm font-bold transition-colors';
  return (
    <nav className="flex h-fit gap-2 overflow-x-auto rounded-3xl bg-snow p-3 shadow-[0_16px_40px_rgba(15,24,89,0.06)] lg:flex-col lg:overflow-visible">
      {tabs.map((tab) => (
        <Link
          key={tab.href}
          href={tab.href}
          className={`${item} ${pathname === tab.href ? 'bg-navy text-snow' : 'text-navy/70 hover:bg-mist hover:text-navy'}`}
        >
          <span className="material-symbols-outlined text-[20px]">{tab.icon}</span>
          {ar ? tab.ar : tab.en}
        </Link>
      ))}
      <form action={userLogout} className="lg:mt-2 lg:border-t lg:border-navy/10 lg:pt-2">
        <button className={`${item} w-full text-[#ef4444] hover:bg-[#ef4444]/10`}>
          <span className="material-symbols-outlined text-[20px]">logout</span>
          {ar ? 'تسجيل الخروج' : 'Log out'}
        </button>
      </form>
    </nav>
  );
}