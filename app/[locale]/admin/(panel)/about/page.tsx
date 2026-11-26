import {getTranslations} from 'next-intl/server';
import {eq} from 'drizzle-orm';
import AboutForm from '@/components/admin/AboutForm';
import {tr} from '@/lib/adminT';
import {db} from '@/lib/db';
import {aboutContent, type AboutLocaleContent} from '@/lib/db/schema';

const icons = ['luggage', 'flight', 'hiking'];

export default async function AboutAdminPage() {
  const [row, arMessages, enMessages] = await Promise.all([
    db.select().from(aboutContent).where(eq(aboutContent.id, 1)).limit(1).then(([content]) => content),
    getTranslations({locale: 'ar', namespace: 'aboutPage'}),
    getTranslations({locale: 'en', namespace: 'aboutPage'})
  ]);
  const arItems = arMessages.raw('items') as {title: string; text: string}[];
  const enItems = enMessages.raw('items') as {title: string; text: string}[];
  const fallback: Record<'ar' | 'en', AboutLocaleContent> = {
    ar: {
      title: arMessages('title'),
      subtitle: arMessages('subtitle'),
      storyTitle: arMessages('storyTitle'),
      story: arMessages('story'),
      whatTitle: arMessages('whatTitle'),
      cards: arItems.map((item, index) => ({icon: icons[index] ?? 'check_circle', ...item}))
    },
    en: {
      title: enMessages('title'),
      subtitle: enMessages('subtitle'),
      storyTitle: enMessages('storyTitle'),
      story: enMessages('story'),
      whatTitle: enMessages('whatTitle'),
      cards: enItems.map((item, index) => ({icon: icons[index] ?? 'check_circle', ...item}))
    }
  };
  const initial = row?.i18n ?? fallback;

  return (
    <div>
      <h1 className="mb-6 font-display text-3xl font-bold text-navy">{tr('ar').aboutPage}</h1>
      <AboutForm initial={initial} />
    </div>
  );
}
