import type {Metadata} from 'next';
import {Cairo} from 'next/font/google';
import {notFound} from 'next/navigation';
import {hasLocale, NextIntlClientProvider} from 'next-intl';
import {getTranslations, setRequestLocale} from 'next-intl/server';
import {routing} from '@/i18n/routing';
import {getRates} from '@/lib/queries';
import CurrencyProvider from '@/components/CurrencyProvider';
import Tracker from '@/components/Tracker';
import FeedbackFloat from '@/components/FeedbackFloat';
import WhatsAppFloat from '@/components/WhatsAppFloat';
import {getCurrentUser} from '@/lib/auth';
import '../globals.css';

const cairo = Cairo({
  subsets: ['arabic', 'latin'],
  weight: ['400', '600', '700'],
  variable: '--font-cairo',
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
  const [rates, currentUser] = await Promise.all([getRates(), getCurrentUser()]);

  return (
    <html lang={locale} dir={locale === 'ar' ? 'rtl' : 'ltr'} className={cairo.variable}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=block"
        />
      </head>
      <body className="bg-snow font-body text-navy antialiased min-h-screen flex flex-col">
        <NextIntlClientProvider>
          <CurrencyProvider rates={rates}>
            <Tracker />
            {children}
            <FeedbackFloat userEmail={currentUser?.email} />
            <WhatsAppFloat userName={currentUser?.name ?? undefined} />
          </CurrencyProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
