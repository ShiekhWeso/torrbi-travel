import {setRequestLocale} from 'next-intl/server';
import {Suspense} from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ActivitiesExplorer from '@/components/ActivitiesExplorer';
import {getActivities} from '@/lib/queries';

export function generateStaticParams() {
  return ['en', 'ar'].map((locale) => ({locale}));
}

export default async function ActivitiesPage({params}: {params: Promise<{locale: string}>}) {
  const {locale} = await params;
  setRequestLocale(locale);
  const items = await getActivities(locale);
  const ar = locale === 'ar';

  return (
    <>
      <Header />
      <main className="bg-snow pb-20 pt-32">
        <div className="mx-auto max-w-[1440px] px-4 lg:px-12">
          <h1 className="font-display text-3xl font-bold text-navy lg:text-5xl">
            {ar ? 'الأنشطة والجولات السياحية' : 'Tours & Activities'}
          </h1>
          <p className="mb-8 mt-3 max-w-2xl text-lg text-navy/70">
            {ar ? 'تصفح جميع الأنشطة والجولات المتوفرة.' : 'Browse all available activities and tours.'}
          </p>
          <Suspense fallback={null}>
            <ActivitiesExplorer items={items} />
          </Suspense>
        </div>
      </main>
      <Footer />
    </>
  );
}