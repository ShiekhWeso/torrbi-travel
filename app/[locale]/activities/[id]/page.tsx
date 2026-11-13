import Image from 'next/image';
import {notFound} from 'next/navigation';
import {setRequestLocale} from 'next-intl/server';
import {getActivities, getActivity} from '@/lib/queries';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ActivityBookingBox from '@/components/ActivityBookingBox';
import {Suspense} from 'react';

export async function generateStaticParams() {
  const activities = await getActivities('en');
  return ['en', 'ar'].flatMap((locale) => activities.map((activity) => ({locale, id: activity.id})));
}

export default async function ActivityPage({params}: {params: Promise<{locale: string; id: string}>}) {
  const {locale, id} = await params;
  setRequestLocale(locale);
  const activity = await getActivity(locale, id);
  if (!activity) notFound();
  const ar = locale === 'ar';
  const t = (en: string, a: string) => (ar ? a : en);
  const gallery = activity.gallery.length ? activity.gallery : activity.image ? [activity.image] : [];

  return (
    <>
      <Header />
      <main className="bg-snow pb-20 pt-32">
        <div className="mx-auto max-w-[1440px] px-4 lg:px-12">
          <h1 className="font-display text-3xl font-bold text-navy lg:text-5xl">{activity.title}</h1>
          <p className="mt-3 text-sm text-navy/70">{activity.city} · {activity.durationHours ?? '—'} {t('hours', 'ساعات')}</p>
          <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_380px]">
            <div>
              {gallery.length > 0 && (
                <div className="grid grid-cols-2 gap-2 overflow-hidden rounded-3xl lg:grid-cols-4">
                  {gallery.map((src, i) => (
                    <div key={src + i} className={`relative ${i === 0 ? 'col-span-2 row-span-2 min-h-[240px]' : 'aspect-[4/3]'}`}>
                      <Image src={src} alt="" fill sizes="(min-width: 1024px) 25vw, 50vw" className="object-cover" />
                    </div>
                  ))}
                </div>
              )}
              <p className="mt-6 text-lg text-navy/80">{activity.description}</p>
              <section className="mt-10 rounded-3xl bg-mist p-6 lg:p-8">
                <h2 className="font-display text-2xl font-bold text-navy">{t('Highlights', 'أبرز النقاط')}</h2>
                <ul className="mt-5 grid gap-4 sm:grid-cols-2">
                  {activity.highlights.map((highlight) => (
                    <li key={highlight} className="flex gap-3 text-navy/80">
                      <span className="material-symbols-outlined text-brand-warm">auto_awesome</span>
                      {highlight}
                    </li>
                  ))}
                </ul>
              </section>
              <section className="mt-6 rounded-3xl border border-navy/10 p-6 lg:p-8">
                <h2 className="font-display text-2xl font-bold text-navy">{t('Includes', 'يشمل')}</h2>
                <ul className="mt-4 space-y-3">
                  {activity.includes.map((item) => (
                    <li key={item} className="flex gap-3 text-navy/80">
                      <span className="material-symbols-outlined text-[20px] text-[#16a34a]">check_circle</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </section>
            </div>
            <Suspense fallback={null}>
              <ActivityBookingBox slug={activity.id} price={activity.price} />
            </Suspense>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
