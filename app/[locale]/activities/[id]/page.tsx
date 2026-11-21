import Image from 'next/image';
import {notFound} from 'next/navigation';
import {getTranslations, setRequestLocale} from 'next-intl/server';
import {and, eq, ne} from 'drizzle-orm';
import {getActivities, getActivity} from '@/lib/queries';
import {db} from '@/lib/db';
import {bookings, favorites} from '@/lib/db/schema';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ActivityBookingBox from '@/components/ActivityBookingBox';
import ActivityReviewForm from '@/components/ActivityReviewForm';
import {getActivityReviews} from '@/lib/review-actions';
import {Link} from '@/i18n/navigation';
import {Suspense} from 'react';
import {getCurrentUser} from '@/lib/auth';
import FavoriteButton from '@/components/FavoriteButton';

export async function generateStaticParams() {
  const activities = await getActivities('en');
  return ['en', 'ar'].flatMap((locale) => activities.map((activity) => ({locale, id: activity.id})));
}

export default async function ActivityPage({params}: {params: Promise<{locale: string; id: string}>}) {
  const {locale, id} = await params;
  setRequestLocale(locale);
  const [reviewT, activity, user] = await Promise.all([
    getTranslations({locale, namespace: 'activityReviews'}),
    getActivity(locale, id),
    getCurrentUser()
  ]);
  if (!activity) notFound();
  const [favorite] = user ? await db.select({id: favorites.id}).from(favorites).where(and(
    eq(favorites.activityId, activity.databaseId),
    eq(favorites.userId, user.id),
    eq(favorites.kind, 'activity')
  )).limit(1) : [];
  const eligibleBookingsQuery = user ? db.select({id: bookings.id}).from(bookings).where(and(
    eq(bookings.userId, user.id),
    eq(bookings.activityId, activity.databaseId),
    eq(bookings.kind, 'activity'),
    ne(bookings.status, 'cancelled')
  )).limit(1) : Promise.resolve([]);
  const [reviews, eligibleBookings] = await Promise.all([
    getActivityReviews(activity.databaseId),
    eligibleBookingsQuery
  ]);
  const eligibleBooking = eligibleBookings[0];
  const ar = locale === 'ar';
  const t = (en: string, a: string) => (ar ? a : en);
  const gallery = activity.gallery.length ? activity.gallery : activity.image ? [activity.image] : [];
  const reviewDate = new Intl.DateTimeFormat(locale, {dateStyle: 'medium'});
  const averageRating = new Intl.NumberFormat(locale, {minimumFractionDigits: 1, maximumFractionDigits: 1}).format(reviews.averageRating);

  return (
    <>
      <Header />
      <main className="bg-snow pb-20 pt-32">
        <div className="mx-auto max-w-[1440px] px-4 lg:px-12">
          <div className="flex items-center justify-between gap-4">
            <h1 className="font-display text-3xl font-bold text-navy lg:text-5xl">{activity.title}</h1>
            <FavoriteButton kind="activity" id={activity.databaseId} active={favorite != null} loggedIn={Boolean(user)} />
          </div>
          <p className="mt-3 text-sm text-navy/70">{activity.city} · {activity.durationHours ?? '—'} {t('hours', 'ساعات')}</p>
          <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_380px]">
            <div>
              {gallery.length > 0 && (
                <div className="grid grid-cols-2 gap-2 overflow-hidden rounded-3xl lg:grid-cols-4">
                  {gallery.map((src, i) => (
                    <div key={src + i} className={`relative ${i === 0 ? 'col-span-2 row-span-2 min-h-[240px]' : 'aspect-[4/3]'}`}>
                      <Image
                        src={src}
                        alt=""
                        fill
                        sizes={i === 0
                          ? '(min-width: 1440px) 466px, (min-width: 1024px) calc((100vw - 508px) / 2), calc(100vw - 32px)'
                          : '(min-width: 1440px) 227px, (min-width: 1024px) calc((100vw - 532px) / 4), calc((100vw - 40px) / 2)'}
                        priority={i === 0}
                        className="object-cover"
                      />
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
              <ActivityBookingBox id={activity.databaseId} slug={activity.id} adult={activity.price} child={activity.childPrice} infant={activity.infantPrice} carPrice1={activity.carPrice1} carPrice2={activity.carPrice2} carPrice3={activity.carPrice3} policies={activity.policies} user={user} />
            </Suspense>
          </div>
          <section className="mt-10 rounded-3xl bg-mist p-6 lg:p-8" aria-labelledby="activity-reviews-title">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <h2 id="activity-reviews-title" className="font-display text-2xl font-bold text-navy">
                {reviewT('title')}
              </h2>
              <div className="flex items-center gap-2 text-sm font-bold text-navy" dir="ltr">
                <span className="text-amber-500">★</span>
                <span aria-label={reviewT('averageRating', {rating: averageRating})}>{averageRating}</span>
                <span className="font-normal text-navy/60">{reviewT('reviewCount', {count: reviews.count})}</span>
              </div>
            </div>
            {reviews.count === 0 ? (
              <p className="mt-5 text-sm text-navy/60">{reviewT('noReviews')}</p>
            ) : (
              <ul className="mt-5 grid gap-4 md:grid-cols-2">
                {reviews.reviews.map((review) => {
                  const createdAt = review.createdAt ? new Date(review.createdAt) : null;
                  const validCreatedAt = createdAt && !Number.isNaN(createdAt.getTime()) ? createdAt : null;
                  return (
                    <li key={review.id} className="rounded-2xl bg-snow p-5">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="font-bold text-navy">{review.reviewerFirstName}</span>
                        {validCreatedAt && (
                          <time dateTime={validCreatedAt.toISOString()} className="text-xs text-navy/60">
                            {reviewDate.format(validCreatedAt)}
                          </time>
                        )}
                      </div>
                      <div className="mt-2 text-lg text-amber-500" dir="ltr" aria-label={reviewT('starRating', {rating: review.rating})}>
                        {'★'.repeat(review.rating)}<span className="text-navy/20">{'★'.repeat(5 - review.rating)}</span>
                      </div>
                      <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-navy/80">{review.comment}</p>
                    </li>
                  );
                })}
              </ul>
            )}
            {user ? eligibleBooking ? (
              <ActivityReviewForm activityId={activity.databaseId} />
            ) : (
              <p className="mt-6 rounded-2xl bg-snow p-5 text-sm text-navy/70">
                {reviewT('onlyBooked')}
              </p>
            ) : (
              <Link href="/login" className="mt-6 inline-flex rounded-full bg-navy px-6 py-3 text-sm font-bold text-snow">
                {reviewT('loginToReview')}
              </Link>
            )}
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}
