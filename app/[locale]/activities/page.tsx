import Image from 'next/image';
import {setRequestLocale} from 'next-intl/server';
import {Link} from '@/i18n/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import {getActivities} from '@/lib/queries';

export function generateStaticParams() {
  return ['en', 'ar'].map((locale) => ({locale}));
}

export default async function ActivitiesPage({params}: {params: Promise<{locale: string}>}) {
  const {locale} = await params;
  setRequestLocale(locale);
  const activities = await getActivities(locale);
  const ar = locale === 'ar';
  const t = (en: string, a: string) => (ar ? a : en);

  return (
    <>
      <Header />
      <main className="bg-snow pb-20 pt-32">
        <div className="mx-auto max-w-[1440px] px-4 lg:px-12">
          <h1 className="mb-8 font-display text-3xl font-bold text-navy lg:text-5xl">{t('Activities', 'الأنشطة')}</h1>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-8">
            {activities.map((activity) => (
              <article key={activity.id} className="flex flex-col rounded-3xl bg-mist p-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_44px_rgba(15,24,89,0.14)] lg:p-5">
                <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-navy">
                  {activity.image && (
                    <Image src={activity.image} alt={activity.title} fill sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw" className="object-cover" />
                  )}
                </div>
                <h2 className="mt-5 px-1 font-display text-2xl font-bold text-navy">{activity.title}</h2>
                <p className="mt-2 px-1 text-sm text-navy/70">{activity.city} · {activity.durationHours ?? '—'} {t('hours', 'ساعات')}</p>
                <div className="mt-4 flex items-center justify-between gap-4 border-t border-navy/10 px-1 pt-4">
                  <span className="font-display text-lg text-navy">
                    {activity.price != null ? `${t('From', 'ابتداءً من')} $${activity.price}` : t('Price on request', 'السعر عند الطلب')}
                  </span>
                  <Link href={`/activities/${activity.id}`} className="group/btn inline-flex items-center gap-2 rounded-full border-2 border-navy px-5 py-2.5 text-sm font-bold text-navy transition-colors duration-300 hover:bg-navy hover:text-snow">
                    {t('Details', 'التفاصيل')}
                    <span className="material-symbols-outlined text-[20px] leading-none transition-transform duration-300 group-hover/btn:translate-x-1 rtl:rotate-180 rtl:group-hover/btn:-translate-x-1">arrow_forward</span>
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
