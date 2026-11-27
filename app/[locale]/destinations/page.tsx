import {getTranslations, setRequestLocale} from 'next-intl/server';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import DestinationsExplorer from '@/components/DestinationsExplorer';
import {getDestinations, getSearchRegions} from '@/lib/queries';

export function generateStaticParams() {
  return ['en', 'ar'].map((locale) => ({locale}));
}

export default async function AllDestinationsPage({params}: {params: Promise<{locale: string}>}) {
  const {locale} = await params;
  setRequestLocale(locale);
  const [items, searchRegions, t] = await Promise.all([
    getDestinations(locale),
    getSearchRegions(locale),
    getTranslations('destinationsPage')
  ]);
  const destinationCards = items.map(({id, image, region, name, country}) => ({
    id,
    image,
    region,
    name,
    country
  }));
  const usedRegions = new Set(destinationCards.map(({region}) => region));
  const regions = searchRegions
    .filter(({slug}) => usedRegions.has(slug))
    .map(({slug, name}) => ({slug, name}));

  return (
    <>
      <Header />
      <main className="bg-snow pb-20 pt-32">
        <div className="mx-auto max-w-[1440px] px-4 lg:px-12">
          <h1 className="font-display text-3xl font-bold text-navy lg:text-5xl">{t('title')}</h1>
          <p className="mb-8 mt-3 max-w-2xl text-lg text-navy/70">{t('subtitle')}</p>
          <DestinationsExplorer items={destinationCards} regions={regions} />
        </div>
      </main>
      <Footer />
    </>
  );
}