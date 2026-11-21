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
  const regionNames = new Map(searchRegions.map(({slug, name}) => [slug, name]));
  const regions = [...new Set(destinationCards.map(({region}) => region))].map((slug) => ({
    slug,
    name: regionNames.get(slug) ?? `${slug.charAt(0).toUpperCase()}${slug.slice(1)}`
  }));

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