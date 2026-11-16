import {db} from '@/lib/db';
import {activities, packages} from '@/lib/db/schema';
import CouponForm from '@/components/admin/CouponForm';
import {getLocale} from 'next-intl/server';
import {tr} from '@/lib/adminT';

export default async function Page() {
  const t = tr(await getLocale());
  const [pkgs, acts] = await Promise.all([
    db.select({id: packages.id, i18n: packages.i18n}).from(packages),
    db.select({id: activities.id, i18n: activities.i18n}).from(activities)
  ]);
  return (
    <div>
      <h1 className="mb-6 font-display text-3xl text-navy">{t.newCoupon}</h1>
      <CouponForm pkgs={pkgs} acts={acts} />
    </div>
  );
}
