import {getLocale} from 'next-intl/server';

export const metadata = {title: 'TORRBI Admin', robots: {index: false, follow: false}};

export default async function AdminRoot({children}: {children: React.ReactNode}) {
  const locale = await getLocale();
  return <div dir={locale === 'ar' ? 'rtl' : 'ltr'}>{children}</div>;
}