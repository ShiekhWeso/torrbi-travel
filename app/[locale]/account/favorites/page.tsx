import Image from 'next/image';
import {redirect} from 'next/navigation';
import {and, desc, eq} from 'drizzle-orm';
import {getLocale} from 'next-intl/server';
import {Link} from '@/i18n/navigation';
import Price from '@/components/Price';
import {getCurrentUser} from '@/lib/auth';
import {db} from '@/lib/db';
import {activities, favorites, packages} from '@/lib/db/schema';

export default async function FavoritesPage() {
  const [locale, user] = await Promise.all([getLocale(), getCurrentUser()]);
  if (!user) redirect(`/${locale}/login`);
  const rows = await Promise.all([
    db.select({
      favoriteId: favorites.id,
      createdAt: favorites.createdAt,
      slug: packages.slug,
      image: packages.cover,
      title: packages.i18n,
      price: packages.priceUsd
    })
      .from(favorites)
      .innerJoin(packages, eq(favorites.packageId, packages.id))
      .where(and(eq(favorites.userId, user.id), eq(favorites.kind, 'package')))
      .orderBy(desc(favorites.createdAt)),
    db.select({
      favoriteId: favorites.id,
      createdAt: favorites.createdAt,
      slug: activities.slug,
      image: activities.image,
      title: activities.i18n,
      price: activities.priceUsd
    })
      .from(favorites)
      .innerJoin(activities, eq(favorites.activityId, activities.id))
      .where(and(eq(favorites.userId, user.id), eq(favorites.kind, 'activity')))
      .orderBy(desc(favorites.createdAt))
  ]);
  const ar = locale === 'ar';
  const items = [
    ...rows[0].map((row) => ({
      key: `package-${row.favoriteId}`,
      href: `/packages/${row.slug}`,
      image: row.image,
      title: ar ? row.title.ar.title : row.title.en.title,
      price: row.price,
      createdAt: row.createdAt
    })),
    ...rows[1].map((row) => ({
      key: `activity-${row.favoriteId}`,
      href: `/activities/${row.slug}`,
      image: row.image,
      title: ar ? row.title.ar.title : row.title.en.title,
      price: row.price,
      createdAt: row.createdAt
    }))
  ].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  const t = (en: string, arabic: string) => (ar ? arabic : en);

  return (
    <section className="rounded-3xl bg-snow p-6 shadow-[0_16px_40px_rgba(15,24,89,0.06)] lg:p-8">
      <h1 className="font-display text-2xl font-bold leading-normal text-navy">{t('Favorites', 'المفضلة')}</h1>
      {items.length === 0 ? (
        <div className="mt-6 rounded-2xl bg-mist p-8 text-center">
          <p className="text-navy/70">{t('No saved items yet', 'لا توجد عناصر محفوظة')}</p>
        </div>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {items.map((item) => (
            <Link key={item.key} href={item.href} className="overflow-hidden rounded-2xl bg-mist transition-transform hover:-translate-y-1">
              {item.image && (
                <div className="relative aspect-[4/3]">
                  <Image src={item.image} alt={item.title} fill sizes="(min-width: 640px) calc(50vw - 48px), calc(100vw - 80px)" className="object-cover" />
                </div>
              )}
              <div className="p-4">
                <h2 className="font-display text-lg font-bold text-navy">{item.title}</h2>
                <p className="mt-2 font-bold text-navy">
                  {item.price != null ? <Price usd={item.price} /> : t('Price on request', 'السعر عند الطلب')}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
