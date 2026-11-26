'use client';

import {useState} from 'react';
import {useLocale, useTranslations} from 'next-intl';
import {useSearchParams} from 'next/navigation';
import {useCurrency} from '@/components/CurrencyProvider';
import {useRouter} from '@/i18n/navigation';
import {validateCoupon} from '@/lib/booking-actions';
import Price from '@/components/Price';

type Props = {
  id: number;
  slug: string;
  adult: number | null;
  child: number | null;
  infant: number | null;
  carPrice1: number | null;
  carPrice2: number | null;
  carPrice3: number | null;
  bookingMode?: 'both' | 'people' | 'car';
  policies?: string[];
  user?: {phone: string | null} | null;
};

export default function ActivityBookingBox({id, slug, adult, child, infant, carPrice1, carPrice2, carPrice3, bookingMode = 'both', policies, user}: Props) {
  const t = useTranslations('packageDetail');
  const p = useTranslations('packages');
  const c = useTranslations('activityBooking');
  const sp = useSearchParams();
  const router = useRouter();
  const {cur, money} = useCurrency();
  const locale = useLocale();
  const ar = locale === 'ar';
  const L = (en: string, a: string) => (ar ? a : en);

  const [adults, setAdults] = useState(Math.min(10, Math.max(1, Number(sp.get('pax')) || 2)));
  const [children, setChildren] = useState(0);
  const [infants, setInfants] = useState(0);
  const [carMode, setCarMode] = useState(bookingMode === 'car');
  const [carTier, setCarTier] = useState<1 | 2 | 3 | null>(null);
  const [date, setDate] = useState(sp.get('date') ?? '');
  const [notes, setNotes] = useState('');
  const [err, setErr] = useState('');
  const [couponInput, setCouponInput] = useState('');
  const [couponError, setCouponError] = useState('');
  const [checkingCoupon, setCheckingCoupon] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<{code: string; discountUsd: number; totalUsd: number} | null>(null);
  const [saving, setSaving] = useState(false);

  const rows = [
    {n: adults, price: adult},
    {n: children, price: child},
    {n: infants, price: infant}
  ];
  const carTiers = [
    {id: 1 as const, label: c('carTier1'), price: carPrice1},
    {id: 2 as const, label: c('carTier2'), price: carPrice2},
    {id: 3 as const, label: c('carTier3'), price: carPrice3}
  ].filter((tier) => tier.price != null);
  const peopleAllowed = bookingMode !== 'car';
  const carAllowed = bookingMode !== 'people' && carTiers.length > 0;
  const modeAvailable = carMode ? carAllowed : peopleAllowed;
  const minCar = carTiers.length ? Math.min(...carTiers.map((tier) => tier.price as number)) : null;
  const headerPrice = carMode ? minCar : adult;
  const selectedCar = carTiers.find((tier) => tier.id === carTier);
  const peopleKnown = rows.reduce((s, r) => s + (r.price != null ? r.n * r.price : 0), 0);
  const known = carMode ? selectedCar?.price ?? 0 : peopleKnown;
  const unknown = carMode ? selectedCar == null : rows.some((r) => r.n > 0 && r.price == null);
  const currentCoupon = appliedCoupon && appliedCoupon.totalUsd === known && known > 0 && !unknown ? appliedCoupon : null;
  const payableKnown = known - (currentCoupon?.discountUsd ?? 0);
  const usdTotal = '$' + payableKnown;
  const total = carMode
    ? selectedCar ? `${money(payableKnown)}` : c('selectCarTier')
    : unknown && known === 0 ? p('onRequest') : `${money(payableKnown)}${unknown ? ` + ${p('onRequest')}` : ''}`;

  const couponErrorText = (reason: 'invalid' | 'expired' | 'min' | 'used_up' | 'scope' | 'already_used') => ({
    invalid: L('Invalid coupon code', 'كود الخصم غير صالح'),
    expired: L('This coupon has expired', 'انتهت صلاحية هذا الكوبون'),
    min: L('Minimum order total not met', 'لم يتم استيفاء الحد الأدنى للطلب'),
    used_up: L('Coupon has reached its usage limit', 'تم بلوغ الحد الأقصى لاستخدام الكوبون'),
    scope: L('Coupon is not valid for this item', 'الكوبون غير صالح لهذا المنتج'),
    already_used: L('You have already used this coupon', 'لقد استخدمت هذا الكوبون من قبل')
  })[reason];

  const switchMode = (toCar: boolean) => {
    setCarMode(toCar);
    setErr('');
    setCouponError('');
  };

  const applyCoupon = async () => {
    setCouponError('');
    setAppliedCoupon(null);
    if (known <= 0 || unknown) {
      setCouponError(carMode
        ? c('chooseCarTierError')
        : L('Total must be known to apply a coupon', 'يجب أن يكون الإجمالي معروفاً لتطبيق الكوبون'));
      return;
    }
    setCheckingCoupon(true);
    try {
      const result = await validateCoupon({code: couponInput, kind: 'activity', id, totalUsd: known});
      if (!result.ok) {
        setCouponError(couponErrorText(result.reason));
        return;
      }
      setAppliedCoupon({code: couponInput.trim().toUpperCase(), discountUsd: result.discountUsd, totalUsd: known});
    } catch (error) {
      console.error('Failed to validate coupon', error);
      setCouponError(L('Unable to validate coupon. Please try again.', 'تعذر التحقق من الكوبون. حاول مرة أخرى.'));
    } finally {
      setCheckingCoupon(false);
    }
  };

  const bookNow = async () => {
    if (!modeAvailable) return;
    if (!date) return setErr(L('Choose a date', 'اختر التاريخ'));
    if (carMode && !selectedCar) return setErr(c('chooseCarTierError'));
    setErr('');
    setSaving(true);
    const params = new URLSearchParams({date});
    if (carMode && selectedCar) {
      params.set('car', '1');
      params.set('tier', String(selectedCar.id));
    } else {
      params.set('adults', String(adults));
      params.set('children', String(children));
      params.set('infants', String(infants));
    }
    if (currentCoupon) params.set('coupon', currentCoupon.code);
    sessionStorage.setItem(`activity-booking-notes:${slug}`, notes);
    const path = `/activities/${encodeURIComponent(slug)}/book?${params}`;
    if (!user) {
      const returnTo = `/${locale}${path}`;
      router.push(`/login?returnTo=${encodeURIComponent(returnTo)}`);
      return;
    }
    router.push(path);
  };

  const box = 'flex w-full items-center gap-3 rounded-xl border border-navy/20 bg-snow px-4 py-3 font-bold text-navy';
  const input = 'w-full bg-transparent focus:outline-none';
  const price = (v: number | null) => (v != null ? money(v) : p('onRequest'));

  const counter = (label: string, v: number, set: (n: number) => void, unit: number | null, min: number) => (
    <label className={box}>
      <span className="material-symbols-outlined text-sky">person</span>
      <span className="shrink-0">{label} <span className="text-xs font-normal text-navy/60">({price(unit)})</span></span>
      <select value={v} onChange={(e) => set(Number(e.target.value))} className={`${input} text-end`}>
        {Array.from({length: 11 - min}, (_, i) => i + min).map((n) => (
          <option key={n} value={n}>{n}</option>
        ))}
      </select>
    </label>
  );

  const parsed = (policies ?? [])
    .map((line) => {
      const [a, ...b] = line.split('|');
      return {title: a.trim(), text: b.join('|').trim()};
    })
    .filter((x) => x.title);
  const list = parsed.length
    ? parsed
    : (['freeCancel', 'payLater'] as const).map((k) => ({title: t(k), text: t(`${k}Text`)}));

  return (
    <aside className="h-fit rounded-3xl border border-navy/10 bg-snow p-6 shadow-[0_16px_40px_rgba(15,24,89,0.08)] lg:sticky lg:top-28 lg:max-h-[calc(100vh-8rem)] lg:overflow-y-auto">
      <p className="text-sm text-navy/60">{p('from')}</p>
      <p className="font-display text-3xl font-bold text-navy">
        {headerPrice != null ? money(headerPrice) : p('onRequest')}
        {headerPrice != null && (
          <span className="text-base font-normal text-navy/60"> {carMode ? L('/ car', '/ للسيارة') : p('perPerson')}</span>
        )}
      </p>

      <div className="mt-5 space-y-3">
        {peopleAllowed && carAllowed && (
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => switchMode(false)}
              aria-pressed={!carMode}
              className={`rounded-xl border px-3 py-2 text-sm font-bold ${carMode ? 'border-navy/20 text-navy/60' : 'border-navy bg-navy text-snow'}`}
            >
              {c('peopleMode')}
            </button>
            <button
              type="button"
              onClick={() => switchMode(true)}
              aria-pressed={carMode}
              className={`rounded-xl border px-3 py-2 text-sm font-bold ${carMode ? 'border-navy bg-navy text-snow' : 'border-navy/20 text-navy/60'}`}
            >
              {c('carMode')}
            </button>
          </div>
        )}

        {!modeAvailable ? (
          <p className="rounded-xl bg-mist px-4 py-4 text-sm font-bold text-navy/70">
            {carMode
              ? L('Car booking is not available for this activity.', 'الحجز بالسيارة غير متاح لهذا النشاط.')
              : L('Booking per person is not available for this activity.', 'الحجز بالأشخاص غير متاح لهذا النشاط.')}
          </p>
        ) : (
          <>
            {carMode ? (
              <div>
                <p className="mb-2 text-sm font-bold text-navy">{c('carTier')}</p>
                <div className="space-y-2">
                  {carTiers.map((tier) => (
                    <button
                      key={tier.id}
                      type="button"
                      onClick={() => setCarTier(tier.id)}
                      aria-pressed={carTier === tier.id}
                      className={`flex w-full items-center justify-between rounded-xl border px-4 py-3 text-sm ${carTier === tier.id ? 'border-navy bg-mist font-bold text-navy' : 'border-navy/20 text-navy'}`}
                    >
                      <span>{tier.label}</span>
                      <span><Price usd={tier.price} /></span>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <>
                {counter(t('adult'), adults, setAdults, adult, 1)}
                {counter(L('Child 2–11', 'طفل 2–11'), children, setChildren, child, 0)}
                {counter(L('Infant <2', 'رضيع أقل من سنتين'), infants, setInfants, infant, 0)}
              </>
            )}

            <label className={box}>
              <span className="material-symbols-outlined text-sky">calendar_today</span>
              <input
                type="date"
                value={date}
                min={new Date().toISOString().slice(0, 10)}
                onChange={(e) => setDate(e.target.value)}
                className={input}
              />
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder={L('Notes', 'ملاحظات')}
              className="w-full rounded-xl border border-navy/20 bg-snow px-4 py-3 text-sm text-navy focus:outline-none"
            />
            <div className="flex gap-2">
              <input
                value={couponInput}
                onChange={(e) => setCouponInput(e.target.value)}
                placeholder={L('Coupon code', 'كود الخصم')}
                className="min-w-0 flex-1 rounded-xl border border-navy/20 bg-snow px-4 py-3 text-sm text-navy focus:outline-none"
              />
              <button
                type="button"
                onClick={applyCoupon}
                disabled={checkingCoupon}
                className="rounded-xl bg-mist px-4 py-3 text-sm font-bold text-navy disabled:opacity-60"
              >
                {checkingCoupon ? '…' : L('Apply', 'تطبيق')}
              </button>
            </div>
            {couponError && <p className="text-sm font-bold text-[#ef4444]">{couponError}</p>}
          </>
        )}
      </div>

      {modeAvailable && (
        <>
          <div className="mt-5 flex items-center justify-between border-t border-navy/10 pt-4">
            <span className="font-bold text-navy">{L('Total', 'الإجمالي')}</span>
            <span className="font-display text-xl font-bold text-navy">
              {currentCoupon && <del className="me-2 text-base font-normal text-navy/50">{money(known)}</del>}
              {total}
            </span>
          </div>
          {currentCoupon && <p className="mt-2 text-sm font-bold text-[#15803d]">{L('Coupon applied: -$', 'تم تطبيق الكوبون: -$')}{currentCoupon.discountUsd}</p>}
          {cur !== 'USD' && known > 0 && (
            <p className="mt-2 text-xs text-navy/60">{L(`Shown in ${cur} for reference. Payment is charged in USD (${usdTotal}).`, `السعر معروض بعملة ${cur} للاسترشاد. يتم الدفع بالدولار الأمريكي (${usdTotal}).`)}</p>
          )}

          <button
            type="button"
            onClick={bookNow}
            disabled={saving}
            className="mt-5 w-full rounded-full bg-brand-warm py-4 font-bold text-navy shadow-[0_8px_24px_rgba(254,153,98,0.4)] transition-transform hover:scale-[1.02]"
          >
            {saving ? c('opening') : L('Book now', 'احجز الآن')}
          </button>
          {err && <p className="mt-3 text-sm font-bold text-[#ef4444]">{err}</p>}
        </>
      )}
      <ul className="mt-5 space-y-3 border-t border-navy/10 pt-5 text-sm">
        {list.map((x) => (
          <li key={x.title} className="flex gap-3">
            <span className="material-symbols-outlined text-[20px] text-sky">check_circle</span>
            <div>
              <p className="font-bold text-navy">{x.title}</p>
              {x.text && <p className="text-navy/70">{x.text}</p>}
            </div>
          </li>
        ))}
      </ul>
    </aside>
  );
}