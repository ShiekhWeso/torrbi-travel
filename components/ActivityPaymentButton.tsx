'use client';

import {useState} from 'react';
import {useTranslations} from 'next-intl';
import {Link} from '@/i18n/navigation';
import {startActivityPayment} from '@/lib/booking-actions';

export default function ActivityPaymentButton({bookingId, activityId}: {bookingId: number; activityId: string}) {
  const t = useTranslations('activityBooking');
  const [soon, setSoon] = useState(false);
  const [error, setError] = useState('');
  const [working, setWorking] = useState(false);

  const pay = async () => {
    setWorking(true);
    setError('');
    try {
      const result = await startActivityPayment(bookingId);
      if (result.ok) window.location.assign(result.url);
      else setSoon(true);
    } catch (e) {
      console.error('Failed to start activity payment', e);
      setError(t('paymentError'));
    } finally {
      setWorking(false);
    }
  };

  if (soon) {
    return (
      <div className="space-y-4">
        <p role="status" className="rounded-2xl bg-[#16a34a]/10 p-4 text-sm font-bold text-[#15803d]">{t('paymentComingSoon')}</p>
        <Link href={`/activities/${encodeURIComponent(activityId)}/confirmed?booking=${bookingId}`} className="block rounded-full bg-brand-warm px-6 py-3 text-center font-bold text-navy">
          {t('continueConfirmation')}
        </Link>
      </div>
    );
  }

  return (
    <div>
      {error && <p role="alert" className="mb-3 text-sm font-bold text-[#ef4444]">{error}</p>}
      <button type="button" onClick={pay} disabled={working} className="w-full rounded-full bg-brand-warm px-6 py-3 font-bold text-navy disabled:opacity-60">
        {working ? t('processingPayment') : t('payNow')}
      </button>
    </div>
  );
}
