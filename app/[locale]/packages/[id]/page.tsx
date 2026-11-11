import Image from 'next/image';
import {notFound} from 'next/navigation';
import {getTranslations, setRequestLocale} from 'next-intl/server';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import {packages} from '@/lib/data';
import {packageDetails, reviews} from '@/lib/packageDetails';
import BookingBox from '@/components/BookingBox';

export function generateStaticParams() {
  return ['en', 'ar'].flatMap((locale) => packages.map((p) => ({locale, id: p.id})));
}

export default async function PackagePage({params}: {params: Promise<{locale: string; id: string}>}) {
  const {locale, id} = await params;
  setRequestLocale(locale);
  const pkg = packages.find((p) => p.id === id);
  const det = packageDetails[id];
  if (!pkg || !det) notFound();

  const t = await getTranslations('packageDetail');
  const p = await getTranslations('packages');
  const text = locale === 'ar' ? det.ar : det.en;

  return (
    <>
      <Header />
      <main className="bg-snow pt-32 pb-20">
        <div className="mx-auto max-w-[1440px] px-4 lg:px-12">
          <h1 className="font-display text-3xl font-bold text-navy lg:text-5xl">{p(`items.${id}.title`)}</h1>
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
                {det.gallery.map((src, i) => (
                  <div
                    key={src + i}
                    className={`relative ${i === 0 ? 'col-span-2 row-span-2 min-h-[240px]' : 'aspect-[4/3]'}`}
                  >
                    <Image src={src} alt="" fill sizes="(min-width: 1024px) 25vw, 50vw" className="object-cover" />
                  </div>
                ))}
              </div>
              <p className="mt-6 text-lg text-navy/80">{text.description}</p>
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
                {reviews[locale === 'ar' ? 'ar' : 'en'].map((r) => (
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

                <h2 className="mt-12 font-display text-2xl font-bold text-navy">{t('itinerary')}</h2>
                <ol className="mt-6 space-y-6 border-s-2 border-brand-warm ps-6">
                {[
                    {title: t('pickupPoint'), text: t('pickupPointText')},
                    ...(p.raw(`items.${id}.stops`) as string[]).map((s) => ({title: s, text: t('stopText')})),
                    {title: t('returnPoint'), text: t('returnPointText')}
                ].map((s, i) => (
                    <li key={i} className="relative">
                    <span className="absolute -start-[33px] top-1 h-4 w-4 rounded-full border-2 border-navy bg-snow" />
                    <h3 className="font-bold text-navy">{s.title}</h3>
                    <p className="text-sm text-navy/70">{s.text}</p>
                    </li>
                ))}
                </ol>
            </div>
            <BookingBox title={p(`items.${id}.title`)} price={pkg.price} />
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}