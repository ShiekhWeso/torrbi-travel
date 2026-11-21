'use client';

import dynamic from 'next/dynamic';
import {useState} from 'react';
import {useTranslations} from 'next-intl';

type Review = {name: string; country: string; date: string; text: string};

const ReviewsDialog = dynamic(() => import('@/components/ReviewsDialog'), {
  ssr: false,
  loading: () => null
});

export default function ReviewsModal({reviews, rating}: {reviews: Review[]; rating: number}) {
  const t = useTranslations('packageDetail');
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="mt-5 text-end">
        <button
          onClick={() => setOpen(true)}
          className="font-bold text-navy underline underline-offset-4 transition-colors hover:text-sky"
        >
          {t('seeMoreReviews')}
        </button>
      </div>
      {open && <ReviewsDialog reviews={reviews} rating={rating} onClose={() => setOpen(false)} />}
    </>
  );
}
