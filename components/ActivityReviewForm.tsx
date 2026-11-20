'use client';

import {useState, useTransition, type FormEvent} from 'react';
import {useLocale, useTranslations} from 'next-intl';
import {saveReview} from '@/lib/review-actions';

export default function ActivityReviewForm({activityId}: {activityId: number}) {
  const locale = useLocale();
  const t = useTranslations('activityReviews');
  const [rating, setRating] = useState(5);
  const [error, setError] = useState(false);
  const [saved, setSaved] = useState(false);
  const [pending, startTransition] = useTransition();

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const comment = String(new FormData(form).get('comment') ?? '');
    setError(false);
    setSaved(false);
    startTransition(async () => {
      try {
        await saveReview({activityId, rating, comment});
        setSaved(true);
      } catch (reason) {
        console.error('Failed to save activity review', reason);
        setError(true);
      }
    });
  };

  return (
    <form onSubmit={submit} className="mt-6 rounded-2xl bg-snow p-5" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
      <h3 className="font-display text-xl font-bold text-navy">{t('writeReview')}</h3>
      <fieldset className="mt-4">
        <legend className="mb-2 text-sm font-bold text-navy">{t('rating')}</legend>
        <div className="flex gap-1" dir="ltr" role="radiogroup" aria-label={t('rating')}>
          {[1, 2, 3, 4, 5].map((value) => (
            <button
              key={value}
              type="button"
              role="radio"
              aria-checked={rating === value}
              aria-label={t('chooseRating', {rating: value})}
              onClick={() => setRating(value)}
              className={`text-3xl leading-none ${value <= rating ? 'text-amber-500' : 'text-navy/20'}`}
            >
              ★
            </button>
          ))}
        </div>
      </fieldset>
      <label className="mt-4 block text-sm font-bold text-navy">
        {t('comment')}
        <textarea
          name="comment"
          rows={4}
          maxLength={1000}
          className="mt-2 w-full rounded-xl border border-navy/15 bg-snow p-3 font-normal text-navy"
          placeholder={t('commentPlaceholder')}
        />
      </label>
      {error && <p role="alert" className="mt-3 text-sm font-bold text-red-700">{t('saveError')}</p>}
      {saved && <p role="status" className="mt-3 text-sm font-bold text-emerald-700">{t('saved')}</p>}
      <button
        type="submit"
        disabled={pending}
        className="mt-4 rounded-full bg-navy px-6 py-3 text-sm font-bold text-snow disabled:opacity-60"
      >
        {pending ? t('saving') : t('submit')}
      </button>
    </form>
  );
}
