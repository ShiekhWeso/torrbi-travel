'use client';

import {useEffect, useState, type FormEvent} from 'react';
import {useLocale, useTranslations} from 'next-intl';
import {useRouter} from '@/i18n/navigation';
import {saveBookingFromBox} from '@/lib/booking-actions';

type Props = {
  slug: string;
  date: string;
  adults: number;
  children: number;
  infants: number;
  carMode: boolean;
  carTier: 1 | 2 | 3 | null;
  couponCode: string | null;
  fullName: string;
  phone: string;
};

export default function ActivityBookingForm(props: Props) {
  const t = useTranslations('activityBooking');
  const locale = useLocale();
  const router = useRouter();
  const [fullName, setFullName] = useState(props.fullName);
  const [phone, setPhone] = useState(props.phone);
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const key = `activity-booking-notes:${props.slug}`;
    const savedNotes = sessionStorage.getItem(key);
    if (savedNotes != null) {
      setNotes(savedNotes);
      sessionStorage.removeItem(key);
    }
  }, [props.slug]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setSaving(true);
    try {
      const bookingId = await saveBookingFromBox({
        kind: 'activity',
        slug: props.slug,
        date: props.date,
        returnDate: null,
        adults: props.adults,
        children: props.children,
        infants: props.infants,
        carMode: props.carMode,
        carTier: props.carTier,
        fullName,
        notes,
        phone,
        couponCode: props.couponCode
      });
      if (bookingId == null) {
        const params = new URLSearchParams({date: props.date});
        if (props.carMode && props.carTier != null) {
          params.set('car', '1');
          params.set('tier', String(props.carTier));
        } else {
          params.set('adults', String(props.adults));
          params.set('children', String(props.children));
          params.set('infants', String(props.infants));
        }
        if (props.couponCode) params.set('coupon', props.couponCode);
        const returnTo = `/${locale}/activities/${encodeURIComponent(props.slug)}/book?${params}`;
        router.push(`/login?returnTo=${encodeURIComponent(returnTo)}`);
        return;
      }
      router.push(`/activities/${encodeURIComponent(props.slug)}/pay?booking=${bookingId}`);
    } catch (e) {
      console.error('Failed to create activity booking', e);
      setError(e instanceof Error && e.message.includes('already_used')
        ? t('alreadyUsedCoupon')
        : t('bookingError'));
    } finally {
      setSaving(false);
    }
  };

  const input = 'w-full rounded-xl border border-navy/15 bg-snow px-4 py-3 text-navy focus:outline-none focus:ring-2 focus:ring-sky/30';
  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-3xl bg-snow p-6 shadow-[0_16px_40px_rgba(15,24,89,0.06)] lg:p-8">
      <h2 className="font-display text-2xl font-bold text-navy">{t('detailsTitle')}</h2>
      <label className="block text-sm font-bold text-navy">
        {t('fullName')}
        <input required autoComplete="name" value={fullName} onChange={(e) => setFullName(e.target.value)} className={`${input} mt-2`} />
      </label>
      <label className="block text-sm font-bold text-navy">
        {t('phone')}
        <input required type="tel" autoComplete="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className={`${input} mt-2`} />
      </label>
      <label className="block text-sm font-bold text-navy">
        {t('notes')}
        <textarea rows={4} value={notes} onChange={(e) => setNotes(e.target.value)} className={`${input} mt-2`} />
      </label>
      {error && <p role="alert" className="text-sm font-bold text-[#ef4444]">{error}</p>}
      <button disabled={saving} className="w-full rounded-full bg-brand-warm py-4 font-bold text-navy shadow-[0_8px_24px_rgba(254,153,98,0.4)] disabled:opacity-60">
        {saving ? t('saving') : t('continuePayment')}
      </button>
    </form>
  );
}
