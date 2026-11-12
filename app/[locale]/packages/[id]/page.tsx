import Image from 'next/image';
import {notFound} from 'next/navigation';
import {getTranslations, setRequestLocale} from 'next-intl/server';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import {getPackages, getPackage} from '@/lib/queries';
import {packageDetails, reviews} from '@/lib/packageDetails';
import BookingBox from '@/components/BookingBox';
import ItineraryPath from '@/components/ItineraryPath';
import ReviewsModal from '@/components/ReviewsModal';
import { Suspense } from 'react';

export async function generateStaticParams() {
  const packages = await getPackages('en');
  return ['en', 'ar'].flatMap((locale) => packages.map((p) => ({locale, id: p.id})));
}

export default async function PackagePage({params}: {params: Promise<{locale: string; id: string}>}) {
  const {locale, id} = await params;
  setRequestLocale(locale);
  const pkg = await getPackage(locale, id);
  if (!pkg) notFound();
  const det = Object.assign({rating: 4.8, reviews: 100}, packageDetails[id]);

  const t = await getTranslations('packageDetail');
  const p = await getTranslations('packages');
  const gallery = pkg.gallery.length ? pkg.gallery : [pkg.image];

  return (
    <>
      <Header />
      <main className="bg-snow pt-32 pb-20">
        <div className="mx-auto max-w-[1440px] px-4 lg:px-12">
          <h1 className="font-display text-3xl font-bold text-navy lg:text-5xl">{pkg.title}</h1>
          <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-navy/70">
            <span className="rounded-md bg-navy px-2 py-1 text-xs font-bold text-snow">{t('topRated')}</span>
            <span className="flex items-center gap-1 font-bold text-navy">
              <span className="material-symbols-outlined text-[18px] text-brand-warm">star</span>
              {det.rating}
            </span>
            <span className="underline">{det.reviews.toLocaleString('en-US')} {t('reviews')}</span>
          </div>

          <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_380px]">
            <div>
              <div className="grid grid-cols-2 gap-2 overflow-hidden rounded-3xl lg:grid-cols-4">
                {gallery.map((src, i) => (
                  <div
                    key={src + i}
                    className={`relative ${i === 0 ? 'col-span-2 row-span-2 min-h-[240px]' : 'aspect-[4/3]'}`}
                  >
                    <Image src={src} alt="" fill sizes="(min-width: 1024px) 25vw, 50vw" className="object-cover" />
                  </div>
                ))}
              </div>
              <p className="mt-6 text-lg text-navy/80">{pkg.intro}</p>
              <div className="mt-8 grid gap-6 sm:grid-cols-2">
                {([
                    ['event_available', 'freeCancel'],
                    ['account_balance_wallet', 'payLater'],
                    ['schedule', 'duration'],
                    ['flag', 'guide'],
                    ['airport_shuttle', 'pickup']
                ] as const).map(([icon, k]) => (
                    <div key={k} className="flex gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-mist">
                        <span className="material-symbols-outlined text-sky">{icon}</span>
                    </div>
                    <div>
                        <h3 className="font-bold text-navy">{t(k)}</h3>
                        <p className="text-sm text-navy/70">
                        {k === 'duration' ? p('days', {days: pkg.days ?? 1}) : t(`${k}Text`)}
                        </p>
                    </div>
                  </div>
                ))}
              </div>
                <h2 className="mt-12 font-display text-2xl font-bold text-navy">{t('loved')}</h2>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                {reviews[locale === 'ar' ? 'ar' : 'en'].slice(0, 2).map((r) => (
                    <div key={r.name} className="rounded-2xl border border-navy/10 p-5">
                    <div className="flex text-brand-warm">
                        {[0, 1, 2, 3, 4].map((i) => (
                        <span key={i} className="material-symbols-outlined text-[20px]">star</span>
                        ))}
                    </div>
                    <div className="mt-3 flex items-center gap-3">
                        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-navy font-bold text-snow">
                        {r.name[0]}
                        </span>
                        <div>
                        <p className="font-bold text-navy">{r.name} – {r.country}</p>
                        <p className="text-xs text-navy/60">{r.date} · {t('verified')}</p>
                        </div>
                    </div>
                    <p className="mt-3 text-sm text-navy/80">{r.text}</p>
                    </div>
                ))}
                </div>

                <ReviewsModal reviews={reviews[locale === 'ar' ? 'ar' : 'en']} rating={det.rating} />

                <h2 className="mt-12 font-display text-2xl font-bold text-navy">{t('itinerary')}</h2>
                <ItineraryPath
                  steps={[
                    {title: t('pickupPoint'), text: t('pickupPointText')},
                    ...pkg.steps.map((s) => ({title: s.title, text: s.text || t('stopText')})),
                    {title: t('returnPoint'), text: t('returnPointText')}
                  ]}
                />
                <section className="mt-14 space-y-6">
                  <div className="rounded-3xl bg-mist p-6 lg:p-8">
                    <h2 className="font-display text-2xl font-bold text-navy">{t('highlights')}</h2>
                    <ul className="mt-5 grid gap-4 sm:grid-cols-2">
                      {pkg.highlights.map((h) => (
                        <li key={h} className="flex gap-3 text-navy/80">
                          <span className="material-symbols-outlined text-brand-warm">auto_awesome</span>
                          {h}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="px-1">
                    <h2 className="font-display text-2xl font-bold text-navy">{t('fullDescription')}</h2>
                    <p className="mt-3 text-navy/80">{t('descShort')}</p>
                    <details className="group mt-2">
                      <summary className="cursor-pointer list-none font-bold text-sky">
                        <span className="group-open:hidden">{t('seeMore')}</span>
                        <span className="hidden group-open:inline">{t('seeLess')}</span>
                      </summary>
                      <p className="mt-2 text-navy/80">{t('descLong')}</p>
                    </details>
                  </div>

                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="rounded-3xl border border-navy/10 p-6 lg:p-8">
                      <h2 className="font-display text-2xl font-bold text-navy">{t('includes')}</h2>
                      <ul className="mt-4 space-y-3">
                        {pkg.includes.map((i) => (
                          <li key={i} className="flex gap-3 text-navy/80">
                            <span className="material-symbols-outlined text-[20px] text-[#16a34a]">check_circle</span>
                            {i}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="rounded-3xl border border-navy/10 p-6 lg:p-8">
                      <h2 className="font-display text-2xl font-bold text-navy">{t('excludes')}</h2>
                      <ul className="mt-4 space-y-3">
                        {pkg.excludes.map((i) => (
                          <li key={i} className="flex gap-3 text-navy/80">
                            <span className="material-symbols-outlined text-[20px] text-[#ef4444]">cancel</span>
                            {i}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="rounded-3xl bg-navy p-6 text-snow lg:p-8">
                    <h2 className="font-display text-2xl font-bold">{t('important')}</h2>
                    <p className="mt-4 text-sm font-bold text-snow/60">{t('bring')}</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {(t.raw('bringList') as string[]).map((b) => (
                        <span key={b} className="rounded-full bg-snow/10 px-4 py-2 text-sm">{b}</span>
                      ))}
                    </div>
                  </div>
                </section>
            </div>
            <Suspense fallback={null}>
              <BookingBox title={pkg.title} price={pkg.price ? `$${pkg.price}` : ''} />
            </Suspense>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}