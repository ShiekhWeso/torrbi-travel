import type {Metadata} from 'next';
import {notFound} from 'next/navigation';
import {hasLocale, NextIntlClientProvider} from 'next-intl';
import {getTranslations, setRequestLocale} from 'next-intl/server';
import {Noto_Serif, Plus_Jakarta_Sans, Noto_Naskh_Arabic, IBM_Plex_Sans_Arabic} from 'next/font/google';
import {routing} from '@/i18n/routing';
import '../globals.css';

const notoSerif = Noto_Serif({subsets: ['latin'], variable: '--f-noto-serif', display: 'swap'});
const jakarta = Plus_Jakarta_Sans({subsets: ['latin'], variable: '--f-jakarta', display: 'swap'});
const naskh = Noto_Naskh_Arabic({subsets: ['arabic'], variable: '--f-naskh', display: 'swap'});
const plexAr = IBM_Plex_Sans_Arabic({
  subsets: ['arabic'],
  weight: ['400', '500', '600', '700'],
  variable: '--f-plex-ar',
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
    <html
      lang={locale}
      dir={locale === 'ar' ? 'rtl' : 'ltr'}
      className={`${notoSerif.variable} ${jakarta.variable} ${naskh.variable} ${plexAr.variable}`}
    >
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
        />
      </head>
      <body className="bg-surface font-body-md text-on-surface antialiased min-h-screen flex flex-col">
        <NextIntlClientProvider>{children}</NextIntlClientProvider>
      </body>
    </html>
  );
}
