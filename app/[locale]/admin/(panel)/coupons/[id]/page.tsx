import {notFound} from 'next/navigation';
import {eq} from 'drizzle-orm';
import {db} from '@/lib/db';
import {activities, coupons, packages} from '@/lib/db/schema';
import CouponForm from '@/components/admin/CouponForm';
import {getLocale} from 'next-intl/server';
import {tr} from '@/lib/adminT';

export default async function Page({params}: {params: Promise<{id: string}>}) {
  const t = tr(await getLocale());
  const {id} = await params;
  const couponId = Number(id);
  if (!Number.isInteger(couponId) || couponId < 1) notFound();
  const [coupon] = await db.select().from(coupons).where(eq(coupons.id, couponId)).limit(1);
  if (!coupon) notFound();
  const [pkgs, acts] = await Promise.all([
    db.select({id: packages.id, i18n: packages.i18n}).from(packages),
    db.select({id: activities.id, i18n: activities.i18n}).from(activities)
  ]);
  return (
    <div>
      <h1 className="mb-6 font-display text-3xl text-navy">{t.editCoupon}</h1>
      <CouponForm coupon={coupon} pkgs={pkgs} acts={acts} />
    </div>
  );
}
