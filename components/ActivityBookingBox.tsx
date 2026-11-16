'use client';

import {useState} from 'react';
import {useLocale, useTranslations} from 'next-intl';
import {useSearchParams} from 'next/navigation';
import {useCurrency} from '@/components/CurrencyProvider';
import {useRouter} from '@/i18n/navigation';
import {saveBookingFromBox, startActivityPayment, validateCoupon} from '@/lib/booking-actions';

type Props = {
  id: number;
  slug: string;
  adult: number | null;
  child: number | null;
  infant: number | null;
  policies?: string[];
  user?: {phone: string | null} | null;
};

export default function ActivityBookingBox({id, slug, adult, child, infant, policies, user}: Props) {
  const t = useTranslations('packageDetail');
  const p = useTranslations('packages');
  const sp = useSearchParams();
  const router = useRouter();
  const {cur, money} = useCurrency();
  const ar = useLocale() === 'ar';
  const L = (en: string, a: string) => (ar ? a : en);

  const [adults, setAdults] = useState(Math.min(10, Math.max(1, Number(sp.get('pax')) || 2)));
  const [children, setChildren] = useState(0);
  const [infants, setInfants] = useState(0);
  const [date, setDate] = useState(sp.get('date') ?? '');
  const [lang, setLang] = useState(ar ? 'ar' : 'en');
  const [notes, setNotes] = useState('');
  const [err, setErr] = useState('');
  const [couponInput, setCouponInput] = useState('');
  const [couponError, setCouponError] = useState('');
  const [checkingCoupon, setCheckingCoupon] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<{code: string; discountUsd: number; totalUsd: number} | null>(null);
  const [phone, setPhone] = useState(user?.phone ?? '');
  const [saving, setSaving] = useState(false);
  const [paymentSoon, setPaymentSoon] = useState(false);

  const rows = [
    {n: adults, price: adult},
    {n: children, price: child},
    {n: infants, price: infant}
  ];
  const known = rows.reduce((s, r) => s + (r.price != null ? r.n * r.price : 0), 0);
  const unknown = rows.some((r) => r.n > 0 && r.price == null);
  const currentCoupon = appliedCoupon && appliedCoupon.totalUsd === known && known > 0 && !unknown ? appliedCoupon : null;
  const payableKnown = known - (currentCoupon?.discountUsd ?? 0);
  const usdTotal = '$' + payableKnown;
  const total =
    unknown && known === 0 ? p('onRequest') : `${money(payableKnown)}${unknown ? ` + ${p('onRequest')}` : ''}`;

  const couponErrorText = (reason: 'invalid' | 'expired' | 'min' | 'used_up' | 'scope') => ({
    invalid: L('Invalid coupon code', 'كود الخصم غير صالح'),
    expired: L('This coupon has expired', 'انتهت صلاحية هذا الكوبون'),
    min: L('Minimum order total not met', 'لم يتم استيفاء الحد الأدنى للطلب'),
    used_up: L('Coupon has reached its usage limit', 'تم بلوغ الحد الأقصى لاستخدام الكوبون'),
    scope: L('Coupon is not valid for this item', 'الكوبون غير صالح لهذا المنتج')
  })[reason];

  const applyCoupon = async () => {
    setCouponError('');
    setAppliedCoupon(null);
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
    if (!user) {
      router.push('/login');
      return;
    }
    if (!date) return setErr(L('Choose a date', 'اختر التاريخ'));
    setErr('');
    setPaymentSoon(false);
    setSaving(true);
    try {
      const bookingId = await saveBookingFromBox({
        kind: 'activity',
        slug,
        date,
        returnDate: null,
        adults,
        children,
        infants,
        lang,
        notes,
        phone,
        couponCode: currentCoupon?.code
      });
      if (bookingId == null) {
        router.push('/login');
        return;
      }
      const payment = await startActivityPayment(bookingId);
      if (payment.ok) {
        window.location.assign(payment.url);
      } else if (payment.reason === 'soon') {
        setPaymentSoon(true);
      }
    } catch (error) {
      console.error('Failed to book activity', error);
      setErr(L('Unable to save your booking. Please try again.', 'تعذر حفظ حجزك. حاول مرة أخرى.'));
    } finally {
      setSaving(false);
    }
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
        {adult != null ? money(adult) : p('onRequest')}
        {adult != null && <span className="text-base font-normal text-navy/60"> {p('perPerson')}</span>}
      </p>

      <div className="mt-5 space-y-3">
        {counter(t('adult'), adults, setAdults, adult, 1)}
        {counter(L('Child 2–11', 'طفل 2–11'), children, setChildren, child, 0)}
        {counter(L('Infant <2', 'رضيع أقل من سنتين'), infants, setInfants, infant, 0)}

        <input
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder={L('Phone', 'رقم الهاتف')}
          className="w-full rounded-xl border border-navy/20 bg-snow px-4 py-3 text-sm text-navy focus:outline-none"
        />
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
        <label className={box}>
          <span className="material-symbols-outlined text-sky">language</span>
          <select value={lang} onChange={(e) => setLang(e.target.value)} className={input}>
            <option value="en">{t('langEnglish')}</option>
            <option value="ar">{t('langArabic')}</option>
          </select>
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          placeholder={L('Notes', 'ملاحظات')}
          className="w-full rounded-xl border border-navy/20 bg-snow px-4 py-3 text-sm text-navy focus:outline-none"
        />
        {known > 0 && !unknown && (
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
        )}
        {couponError && <p className="text-sm font-bold text-[#ef4444]">{couponError}</p>}
      </div>

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
        {saving ? L('Saving…', 'جارٍ الحفظ…') : L('Book now', 'احجز الآن')}
      </button>
      {err && <p className="mt-3 text-sm font-bold text-[#ef4444]">{err}</p>}
      {paymentSoon && <p className="mt-3 text-sm text-navy/70">{L('Online payment is coming soon. Your booking was saved as pending.', 'الدفع الإلكتروني قريباً. تم حفظ حجزك قيد الانتظار.')}</p>}
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