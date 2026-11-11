import type {Metadata} from 'next';
import localFont from 'next/font/local';
import {notFound} from 'next/navigation';
import {hasLocale, NextIntlClientProvider} from 'next-intl';
import {getTranslations, setRequestLocale} from 'next-intl/server';
import {routing} from '@/i18n/routing';
import '../globals.css';

// Brand fonts live in app/fonts
const aref = localFont({
  src: [
    {path: '../fonts/arefruqaa-regular.ttf', weight: '400', style: 'normal'},
    {path: '../fonts/arefruqaa-bold.ttf', weight: '700', style: 'normal'}
  ],
  variable: '--f-aref',
  display: 'swap'
});
const pnu = localFont({
  src: [
    {path: '../fonts/PNU-Regular.ttf', weight: '400', style: 'normal'},
    {path: '../fonts/PNU-Bold.ttf', weight: '700', style: 'normal'}
  ],
  variable: '--f-pnu',
  display: 'swap'
});

export function generateStaticParams() {
  return routing.locales.map((locale) => ({locale}));
}

export async function generateMetadata({params}: {params: Promise<{locale: string}>}): Promise<Metadata> {
  const {locale} = await params;
  const t = await getTranslations({locale, namespace: 'meta'});
  return {title: t('title'), description: t('description')};
}

export default async function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{locale: string}>;
}) {
  const {locale} = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  return (
    <html lang={locale} dir={locale === 'ar' ? 'rtl' : 'ltr'} className={`${aref.variable} ${pnu.variable}`}>
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
        />
      </head>
      <body className="bg-snow font-body text-navy antialiased min-h-screen flex flex-col">
        <NextIntlClientProvider>{children}</NextIntlClientProvider>
      </body>
    </html>
  );
}
