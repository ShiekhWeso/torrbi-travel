'use client';

import {useEffect, useState} from 'react';
import {useTranslations} from 'next-intl';

type Review = {name: string; country: string; date: string; text: string};
const colors = ['bg-[#6B7FFF]', 'bg-[#0E8F6A]', 'bg-brand-warm', 'bg-sky', 'bg-navy'];
const filled = {fontVariationSettings: "'FILL' 1"};

export default function ReviewsModal({reviews, rating}: {reviews: Review[]; rating: number}) {
  const t = useTranslations('packageDetail');
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const stars = (cls: string) => (
    <span className="flex text-brand-warm">
      {[0, 1, 2, 3, 4].map((i) => (
        <span key={i} className={`material-symbols-outlined ${cls}`} style={filled}>star</span>
      ))}
    </span>
  );

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

      {open && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-navy/60 p-4 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            onClick={(e) => e.stopPropagation()}
            className="pop-in flex max-h-[85vh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl bg-snow shadow-[0_24px_64px_rgba(15,24,89,0.35)]"
          >
            <div className="relative border-b border-navy/10 px-6 py-5 text-center">
              <button
                onClick={() => setOpen(false)}
                aria-label={t('close')}
                className="absolute start-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-mist text-navy transition-colors hover:bg-sky-light/40"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
              <h3 className="font-display text-xl font-bold text-navy">{t('customerReviews')}</h3>
              <div className="mt-2 flex items-center justify-center gap-2 font-bold text-navy">
                {stars('text-[24px]')}
                <span>{rating} / 5</span>
              </div>
            </div>

            <div className="divide-y divide-navy/10 overflow-y-auto px-6">
              {reviews.map((r, i) => (
                <div key={r.name} className="py-6">
                  {stars('text-[18px]')}
                  <div className="mt-3 flex items-center gap-3">
                    <span className={`flex h-11 w-11 items-center justify-center rounded-full font-bold text-snow ${colors[i % colors.length]}`}>
                      {r.name[0]}
                    </span>
                    <div>
                      <p className="font-bold text-navy">{r.name} – {r.country}</p>
                      <p className="text-xs text-navy/60">{r.date} · {t('verified')}</p>
                    </div>
                  </div>
                  <p className="mt-3 text-navy/80">{r.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}