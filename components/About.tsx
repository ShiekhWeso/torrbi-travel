import {getTranslations} from 'next-intl/server';

export default async function About() {
  const t = await getTranslations('aboutPage');
  const items = t.raw('items') as {title: string; text: string}[];
  const icons = ['luggage', 'flight', 'hiking'];

  return (
    <section id="about" className="w-full bg-snow py-16 lg:py-24">
      <div className="mx-auto max-w-[1440px] px-4 lg:px-12">
        <h2 className="font-display text-3xl font-bold text-navy lg:text-5xl">{t('title')}</h2>
        <p className="mt-3 max-w-2xl text-lg text-navy/70">{t('subtitle')}</p>

        <h2 className="mt-12 font-display text-2xl font-bold text-navy lg:text-3xl">{t('storyTitle')}</h2>
        <p className="mt-3 max-w-3xl text-lg text-navy/80">{t('story')}</p>

        <h2 className="mt-12 font-display text-2xl font-bold text-navy lg:text-3xl">{t('whatTitle')}</h2>
        <div className="mt-6 grid gap-5 md:grid-cols-3">
          {items.map((it, i) => (
            <div key={it.title} className="rounded-3xl bg-mist p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-snow">
                <span className="material-symbols-outlined text-sky">{icons[i]}</span>
              </div>
              <h3 className="mt-4 font-display text-xl font-bold text-navy">{it.title}</h3>
              <p className="mt-2 text-sm text-navy/70">{it.text}</p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
