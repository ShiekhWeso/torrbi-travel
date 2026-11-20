import {desc, eq} from 'drizzle-orm';
import {getLocale} from 'next-intl/server';
import {tr} from '@/lib/adminT';
import {db} from '@/lib/db';
import {activities, activityReviews, users} from '@/lib/db/schema';
import {deleteActivityReview, setActivityReviewHidden} from '../../actions';
import ConfirmButton from '@/components/admin/ConfirmButton';

function dateLabel(date: Date, locale: string) {
  return date.toLocaleDateString(locale === 'ar' ? 'ar' : 'en', {dateStyle: 'medium'});
}

export default async function Page() {
  const locale = await getLocale();
  const t = tr(locale);
  const rows = await db.select({
    review: activityReviews,
    activityI18n: activities.i18n,
    customerName: users.name
  }).from(activityReviews)
    .innerJoin(activities, eq(activityReviews.activityId, activities.id))
    .innerJoin(users, eq(activityReviews.userId, users.id))
    .orderBy(desc(activityReviews.createdAt));
  const language = locale === 'ar' ? 'ar' : 'en';

  return (
    <div>
      <h1 className="mb-6 font-display text-3xl text-navy">{t.reviews}</h1>
      <div className="overflow-x-auto rounded-2xl bg-snow">
        <table className="w-full min-w-[1000px] text-start text-sm">
          <thead className="border-b border-navy/10 text-navy/60">
            <tr>
              <th className="px-4 py-3 text-start font-bold">{t.activityTitle}</th>
              <th className="px-4 py-3 text-start font-bold">{t.reviewer}</th>
              <th className="px-4 py-3 text-start font-bold">{t.reviewRating}</th>
              <th className="px-4 py-3 text-start font-bold">{t.reviewComment}</th>
              <th className="px-4 py-3 text-start font-bold">{t.date}</th>
              <th className="px-4 py-3 text-start font-bold">{t.reviewStatus}</th>
              <th className="px-4 py-3 text-start font-bold">{t.delete}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-navy/10">
            {rows.length === 0 && <tr><td colSpan={7} className="p-6 text-navy/60">{t.noItems}</td></tr>}
            {rows.map(({review, activityI18n, customerName}) => (
              <tr key={review.id} className="align-top text-navy">
                <td className="px-4 py-3 font-bold">{activityI18n[language].title}</td>
                <td className="px-4 py-3">{customerName}</td>
                <td className="px-4 py-3 whitespace-nowrap"><span className="text-amber-500">★</span> {review.rating}/5</td>
                <td className="max-w-md whitespace-pre-wrap px-4 py-3">{review.comment}</td>
                <td className="whitespace-nowrap px-4 py-3">{dateLabel(review.createdAt, locale)}</td>
                <td className="px-4 py-3">
                  <form action={setActivityReviewHidden} className="flex items-center gap-3">
                    <span className={review.hidden ? 'text-red-700' : 'text-emerald-700'}>
                      {review.hidden ? t.hiddenReview : t.visibleReview}
                    </span>
                    <input type="hidden" name="id" value={review.id} />
                    <input type="hidden" name="hidden" value={String(!review.hidden)} />
                    <button className="font-bold underline">{review.hidden ? t.showReview : t.hideReview}</button>
                  </form>
                </td>
                <td className="px-4 py-3">
                  <form action={deleteActivityReview}>
                    <input type="hidden" name="id" value={review.id} />
                    <ConfirmButton className="font-bold text-red-600">{t.delete}</ConfirmButton>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
