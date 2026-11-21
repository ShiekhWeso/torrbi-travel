import {and, desc, eq, gt, gte, isNull, lte, or} from 'drizzle-orm';
import {getLocale} from 'next-intl/server';
import {getTranslations} from 'next-intl/server';
import {redirect} from 'next/navigation';
import CopyCouponCode from '@/components/CopyCouponCode';
import {getCurrentUser} from '@/lib/auth';
import {db} from '@/lib/db';
import {couponRedemptions, coupons} from '@/lib/db/schema';

const scopeLabels = {
  all: ['All bookings', 'جميع الحجوزات'],
  package: ['Packages', 'الباقات'],
  activity: ['Activities', 'الأنشطة'],
  hotel: ['Hotels', 'الفنادق']
} as const;

export default async function CouponsPage() {
  const locale = await getLocale();
  const user = await getCurrentUser();
  if (!user) redirect(`/${locale}/login`);
  const couponT = await getTranslations({locale, namespace: 'accountCouponUsage'});
  const ar = locale === 'ar';
  const now = new Date();
  const [rows, redemptions] = await Promise.all([
    db.select().from(coupons).where(and(
      eq(coupons.active, true),
      eq(coupons.isPublic, true),
      or(isNull(coupons.validFrom), lte(coupons.validFrom, now)),
      or(isNull(coupons.validUntil), gte(coupons.validUntil, now)),
      or(isNull(coupons.maxUses), gt(coupons.maxUses, coupons.usedCount))
    )).orderBy(desc(coupons.createdAt)),
    db.select({couponId: couponRedemptions.couponId}).from(couponRedemptions)
      .where(eq(couponRedemptions.userId, user.id))
  ]);
  const usedCouponIds = new Set(redemptions.map(({couponId}) => couponId));
  const t = (en: string, arabic: string) => ar ? arabic : en;

  return (
    <section className="rounded-3xl bg-snow p-6 shadow-[0_16px_40px_rgba(15,24,89,0.06)] lg:p-8">
      <h1 className="font-display text-2xl font-bold leading-normal text-navy">{t('Coupons', 'الكوبونات')}</h1>
      {rows.length === 0 ? (
        <div className="mt-6 rounded-2xl bg-mist p-8 text-center">
          <p className="text-navy/70">{t('No coupons available', 'لا توجد كوبونات متاحة')}</p>
        </div>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {rows.map((coupon) => {
            const alreadyUsed = usedCouponIds.has(coupon.id);
            const title = ar ? coupon.i18n.ar.title : coupon.i18n.en.title;
            const terms = ar ? coupon.i18n.ar.terms : coupon.i18n.en.terms;
            const discount = coupon.discountType === 'percent'
              ? t(`${coupon.discountValue}% off`, `خصم ${coupon.discountValue}%`)
              : t(`$${coupon.discountValue} off`, `خصم $${coupon.discountValue}`);
            const scope = scopeLabels[coupon.scope][ar ? 1 : 0];
            const validUntil = coupon.validUntil
              ? coupon.validUntil.toLocaleDateString(ar ? 'ar' : 'en-US', {year: 'numeric', month: 'long', day: 'numeric'})
              : t('No expiry', 'بدون تاريخ انتهاء');
            return (
              <article key={coupon.id} className={`rounded-2xl bg-mist p-5 ${alreadyUsed ? 'opacity-60' : ''}`}>
                {alreadyUsed && (
                  <span className="mb-3 inline-flex rounded-full bg-brand-warm px-3 py-1 text-xs font-bold text-navy">
                    {couponT('alreadyUsed')}
                  </span>
                )}
                <div className="flex items-start justify-between gap-3">
                  <h2 className="font-display text-lg font-bold text-navy">{title}</h2>
                  <span className="shrink-0 rounded-full bg-brand-warm px-3 py-1 text-sm font-bold text-navy">{discount}</span>
                </div>
                {terms && <p className="mt-2 text-sm text-navy/70">{terms}</p>}
                <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-xs text-navy/60">
                  <span>{scope}</span>
                  <span>{t('Valid until', 'صالح حتى')}: {validUntil}</span>
                </div>
                <div className="mt-4 flex items-center justify-between gap-3 rounded-xl bg-snow p-3">
                  <span className="font-mono font-bold tracking-wider text-navy">{coupon.code}</span>
                  <CopyCouponCode code={coupon.code} ar={ar} />
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
