import Image from 'next/image';
import Link from 'next/link';
import {notFound} from 'next/navigation';
import {getTranslations, setRequestLocale} from 'next-intl/server';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import {getDestinations, getDestination, getPackage} from '@/lib/queries';
import {waLink} from '@/lib/whatsapp';

export async function generateStaticParams() {
  const destinations = await getDestinations('en');
  return ['en', 'ar'].flatMap((locale) => destinations.map((d) => ({locale, id: d.id})));
}

export default async function DestinationPage({params}: {params: Promise<{locale: string; id: string}>}) {
  const {locale, id} = await params;
  setRequestLocale(locale);
  const [dest, matchingPackage, t, dd, w] = await Promise.all([
    getDestination(locale, id),
    getPackage(locale, id),
    getTranslations('destinations'),
    getTranslations('destinationDetail'),
    getTranslations('wa')
  ]);
  if (!dest) notFound();
  const info = dest;

  const name = dest.name;
  const country = dest.country;
  const hasPackage = matchingPackage !== null;
  const month = (m: number) =>
    new Intl.DateTimeFormat(locale, {month: 'long'}).format(new Date(2026, m - 1, 1));

  const facts = [
    {icon: 'calendar_month', label: t('bestTime'), value: `${month(info.best[0])} – ${month(info.best[1])}`},
    {icon: 'flight', label: t('flight'), value: t('hours', {n: info.flight})},
    {icon: 'thermostat', label: t('climate'), value: info.temp},
    ...(info.currency ? [{icon: 'payments', label: dd('currency'), value: info.currency}] : []),
    ...(info.language ? [{icon: 'translate', label: dd('language'), value: info.language}] : []),
    ...(info.timezone ? [{icon: 'schedule', label: dd('timezone'), value: info.timezone}] : []),
    ...(info.visa ? [{icon: 'confirmation_number', label: dd('visa'), value: info.visa}] : [])
  ];

  const todo = info.features?.length
    ? info.features
    : [
        {icon: 'restaurant', title: dd('food'), text: dd('foodText', {name})},
        {icon: 'beach_access', title: dd('nature'), text: dd('natureText', {name})},
        {icon: 'museum', title: dd('culture'), text: dd('cultureText', {name})},
        {icon: 'shopping_bag', title: dd('shopping'), text: dd('shoppingText', {name})}
      ];

  return (
    <>
      <Header />
      <main className="bg-snow pb-20 pt-32">
        <div className="mx-auto max-w-[1440px] px-4 lg:px-12">
          <div className="relative h-[320px] overflow-hidden rounded-3xl lg:h-[480px]">
            <Image src={dest.image} alt={name} fill priority sizes="(min-width: 1440px) 1344px, (min-width: 1024px) calc(100vw - 96px), calc(100vw - 32px)" className="object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-navy/80 via-navy/10 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-6 text-snow lg:p-10">
              <div>
                <p className="text-sm font-bold uppercase tracking-wider text-snow/80">{country}</p>
                <h1 className="font-display text-4xl font-bold lg:text-7xl">{name}</h1>
              </div>
              <span className="flex items-center gap-1 rounded-full bg-snow/90 px-4 py-2 font-bold text-navy">
                <span className="material-symbols-outlined text-[20px] text-brand-warm">star</span>
                {info.rating}
              </span>
            </div>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {facts.map(({icon, label, value}) => (
              <div key={label} className="flex items-center gap-4 rounded-2xl bg-mist p-5">
                <span className="material-symbols-outlined text-[28px] text-sky">{icon}</span>
                <div>
                  <p className="text-xs text-navy/60">{label}</p>
                  <p className="font-bold text-navy" dir="auto">{value}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_380px]">
            <div>
              <h2 className="font-display text-2xl font-bold text-navy lg:text-3xl">{dd('about', {name})}</h2>
              <p className="mt-3 text-lg text-navy/80">{dest.about}</p>

              <h2 className="mt-12 font-display text-2xl font-bold text-navy lg:text-3xl">{dd('todo')}</h2>
              <div className="mt-5 grid gap-5 sm:grid-cols-2">
                {todo.map((item, index) => (
                  <div key={`${item.title}-${index}`} className="rounded-2xl bg-mist p-6 transition-transform duration-200 hover:-translate-y-1">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-sky-light/50">
                      <span className="material-symbols-outlined text-[28px] text-sky">{item.icon}</span>
                    </div>
                    <h3 className="mt-4 text-lg font-bold text-navy">{item.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-navy/70">{item.text}</p>
                  </div>
                ))}
              </div>

              {info.gallery.length > 0 && (
                <section className="mt-12">
                  <h2 className="font-display text-2xl font-bold text-navy lg:text-3xl">{dd('gallery')}</h2>
                  <div className="mt-5 grid auto-rows-[180px] gap-3 sm:grid-cols-3 sm:auto-rows-[220px]">
                    {info.gallery.map((src, index) => (
                      <div key={`${src}-${index}`} className={`relative overflow-hidden rounded-2xl ${index === 0 ? 'sm:col-span-2 sm:row-span-2' : ''}`}>
                        <Image
                          src={src}
                          alt={`${name} ${index + 1}`}
                          fill
                          sizes={index === 0
                            ? '(min-width: 1440px) 896px, (min-width: 640px) 66vw, calc(100vw - 32px)'
                            : '(min-width: 1440px) 440px, (min-width: 640px) calc((100vw - 48px) / 3), calc(100vw - 32px)'}
                          className="object-cover transition-transform duration-300 hover:scale-105"
                        />
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {!!info.tips?.length && (
                <section className="mt-12">
                  <h2 className="font-display text-2xl font-bold text-navy lg:text-3xl">{dd('tips')}</h2>
                  <ul className="mt-5 space-y-3">
                    {info.tips.map((tip, index) => (
                      <li key={`${tip}-${index}`} className="flex gap-3 text-navy/80">
                        <span className="material-symbols-outlined shrink-0 text-[22px] text-sky">check_circle</span>
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </section>
              )}
            </div>

            <aside className="h-fit rounded-3xl bg-navy p-6 text-snow shadow-[0_24px_56px_rgba(15,24,89,0.3)] lg:sticky lg:top-28">
              <h2 className="font-display text-2xl font-bold">{dd('plan', {name})}</h2>
              <p className="mt-2 text-sm text-snow/70">{dd('planText')}</p>
              <a
                href={waLink(w('book', {name}))}
                target="_blank"
                rel="noopener"
                className="mt-6 flex w-full items-center justify-center rounded-full bg-brand-warm py-3 font-bold text-navy transition-transform hover:scale-[1.02]"
              >
                {dd('chat')}
              </a>
              <Link
                href={`/${locale}/packages?destination=${encodeURIComponent(id)}`}
                className="mt-3 flex w-full items-center justify-center rounded-full border-2 border-snow/40 py-3 font-bold transition-colors hover:bg-snow hover:text-navy"
              >
                {dd('browsePackages')}
              </Link>
              {hasPackage && (
                <Link
                  href={`/${locale}/packages/${id}`}
                  className="mt-3 flex w-full items-center justify-center rounded-full border-2 border-snow/40 py-3 font-bold transition-colors hover:bg-snow hover:text-navy"
                >
                  {dd('viewPackage', {name})}
                </Link>
              )}
            </aside>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}