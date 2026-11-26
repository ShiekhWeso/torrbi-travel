'use client';
import {useLocale} from 'next-intl';
import {usePathname, useRouter} from '@/i18n/navigation';

export default function LangSwitch() {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  const SHOW_LANG_SWITCH = false; // set to true when English is re-enabled
  if (!SHOW_LANG_SWITCH) return null;

  return (
    <button
      type="button"
      onClick={() => router.replace(pathname, {locale: locale === 'ar' ? 'en' : 'ar'})}
      className="rounded-full bg-mist px-3 py-2 text-sm font-bold text-navy"
    >
      {locale === 'ar' ? 'EN' : 'عربي'}
    </button>
  );
}