import {getTranslations, setRequestLocale} from 'next-intl/server';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import PackagesExplorer from '@/components/PackagesExplorer';
import { Suspense } from 'react';
import {getPackages, getSearchDurations, getSearchRegions} from '@/lib/queries';

export function generateStaticParams() {
  return ['en', 'ar'].map((locale) => ({locale}));
}

export default async function AllPackagesPage({params}: {params: Promise<{locale: string}>}) {
  const {locale} = await params;
  setRequestLocale(locale);
  const [items, regions, durations, t] = await Promise.all([
    getPackages(locale),
    getSearchRegions(locale),
    getSearchDurations(locale),
    getTranslations('packagesPage')
  ]);
  const explorerItems = items.map(({
    id,
    image,
    days,
    price,
    region,
    destinationId,
    destinationSlug,
    destinationName,
    title,
    stops,
    includes
  }) => ({
    id,
    image,
    days,
    price,
    region,
    destinationId,
    destinationSlug,
    destinationName,
    title,
    stops,
    includes
  }));

  return (
    <>
      <Header />
      <main className="bg-snow pt-32 pb-20">
        <div className="mx-auto max-w-[1440px] px-4 lg:px-12">
          <h1 className="font-display text-3xl font-bold text-navy lg:text-5xl">{t('title')}</h1>
          <p className="mb-8 mt-3 max-w-2xl text-lg text-navy/70">{t('subtitle')}</p>
          <Suspense fallback={null}>
            <PackagesExplorer items={explorerItems} regions={regions} durations={durations} />
          </Suspense>
        </div>
      </main>
      <Footer />
    </>
  );
}