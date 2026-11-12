import Image from 'next/image';
import Link from 'next/link';
import {notFound} from 'next/navigation';
import {getTranslations, setRequestLocale} from 'next-intl/server';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import {destinations, destinationInfo, packages} from '@/lib/data';
import {waLink} from '@/lib/whatsapp';

export function generateStaticParams() {
  return ['en', 'ar'].flatMap((locale) => destinations.map((d) => ({locale, id: d.id})));
}

export default async function DestinationPage({params}: {params: Promise<{locale: string; id: string}>}) {
  const {locale, id} = await params;
  setRequestLocale(locale);
  const dest = destinations.find((d) => d.id === id);
  const info = destinationInfo[id];
  if (!dest || !info) notFound();

  const t = await getTranslations('destinations');
  const dd = await getTranslations('destinationDetail');
  const w = await getTranslations('wa');
  const name = t(`items.${id}.name`);
  const hasPackage = packages.some((p) => p.id === id);
  const month = (m: number) =>
    new Intl.DateTimeFormat(locale, {month: 'long'}).format(new Date(2026, m - 1, 1));

  const facts = [
    ['calendar_month', t('bestTime'), `${month(info.best[0])} – ${month(info.best[1])}`],
    ['flight', t('flight'), t('hours', {n: info.flight})],
    ['thermostat', t('climate'), info.temp]
  ] as const;

  const todo = [
    ['restaurant', 'food'],
    ['beach_access', 'nature'],
    ['museum', 'culture'],
    ['shopping_bag', 'shopping']
  ] as const;

  return (
    <>
      <Header />
      <main className="bg-snow pb-20 pt-32">
        <div className="mx-auto max-w-[1440px] px-4 lg:px-12">
          <div className="relative h-[320px] overflow-hidden rounded-3xl lg:h-[480px]">
            <Image src={dest.image} alt={name} fill priority sizes="100vw" className="object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-navy/80 via-navy/10 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-6 text-snow lg:p-10">
              <div>
                <p className="text-sm font-bold uppercase tracking-wider text-snow/80">{t(`items.${id}.country`)}</p>
                <h1 className="font-display text-4xl font-bold lg:text-7xl">{name}</h1>
              </div>
              <span className="flex items-center gap-1 rounded-full bg-snow/90 px-4 py-2 font-bold text-navy">
                <span className="material-symbols-outlined text-[20px] text-brand-warm">star</span>
                {info.rating}
              </span>
            </div>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {facts.map(([icon, label, value]) => (
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
              <p className="mt-3 text-lg text-navy/80">{dd('aboutText', {name})}</p>

              <h2 className="mt-12 font-display text-2xl font-bold text-navy lg:text-3xl">{dd('todo')}</h2>
              <div className="mt-5 grid gap-5 sm:grid-cols-2">
                {todo.map(([icon, k]) => (
                  <div key={k} className="flex gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-mist">
                      <span className="material-symbols-outlined text-sky">{icon}</span>
                    </div>
                    <div>
                      <h3 className="font-bold text-navy">{dd(k)}</h3>
                      <p className="text-sm text-navy/70">{dd(`${k}Text`, {name})}</p>
                    </div>
                  </div>
                ))}
              </div>
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