import {getLocale, getTranslations} from 'next-intl/server';
import {getAbout} from '@/lib/queries';

export default async function About() {
  const locale = await getLocale();
  const t = await getTranslations('aboutPage');
  const about = await getAbout(locale);
  const fallbackItems = t.raw('items') as {title: string; text: string}[];
  const content = about ?? {
    title: t('title'),
    subtitle: t('subtitle'),
    storyTitle: t('storyTitle'),
    story: t('story'),
    whatTitle: t('whatTitle'),
    cards: fallbackItems.map((item, index) => ({
      icon: ['luggage', 'flight', 'hiking'][index] ?? 'check_circle',
      ...item
    }))
  };

  return (
    <section id="about" className="w-full bg-snow py-16 lg:py-24">
      <div className="mx-auto max-w-[1440px] px-4 lg:px-12">
        <h2 className="font-display text-3xl font-bold text-navy lg:text-5xl">{content.title}</h2>
        <p className="mt-3 max-w-2xl text-lg text-navy/70">{content.subtitle}</p>

        <h2 className="mt-12 font-display text-2xl font-bold text-navy lg:text-3xl">{content.storyTitle}</h2>
        <p className="mt-3 max-w-3xl text-lg text-navy/80">{content.story}</p>

        <h2 className="mt-12 font-display text-2xl font-bold text-navy lg:text-3xl">{content.whatTitle}</h2>
        <div className="mt-6 grid gap-5 md:grid-cols-3">
          {content.cards.map((it, i) => (
            <div key={`${it.title}-${i}`} className="rounded-3xl bg-mist p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-snow">
                <span className="material-symbols-outlined text-sky">{it.icon}</span>
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
