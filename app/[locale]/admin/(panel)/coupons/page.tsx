import {Link} from '@/i18n/navigation';
import {getLocale} from 'next-intl/server';
import {asc} from 'drizzle-orm';
import {tr} from '@/lib/adminT';
import {db} from '@/lib/db';
import {activities, coupons, packages} from '@/lib/db/schema';
import {deleteCoupon, toggleCoupon} from '../../actions';
import ConfirmButton from '@/components/admin/ConfirmButton';

function dateLabel(date: Date | null, locale: string) {
  return date ? date.toLocaleString(locale === 'ar' ? 'ar' : 'en', {dateStyle: 'medium', timeStyle: 'short'}) : '—';
}

export default async function Page() {
  const locale = await getLocale();
  const t = tr(locale);
  const [rows, pkgs, acts] = await Promise.all([
    db.select().from(coupons).orderBy(asc(coupons.createdAt), asc(coupons.id)),
    db.select({id: packages.id, title: packages.i18n}).from(packages),
    db.select({id: activities.id, title: activities.i18n}).from(activities)
  ]);
  const packageTitles = new Map(pkgs.map((p) => [p.id, p.title.en.title]));
  const activityTitles = new Map(acts.map((a) => [a.id, a.title.en.title]));
  const targetLabel = (coupon: typeof rows[number]) => {
    if (coupon.scope === 'package') {
      return `${t.scopePackage}: ${coupon.packageId ? packageTitles.get(coupon.packageId) ?? t.scopePackage : t.allPackages}`;
    }
    if (coupon.scope === 'activity') {
      return `${t.scopeActivity}: ${coupon.activityId ? activityTitles.get(coupon.activityId) ?? t.scopeActivity : t.allActivities}`;
    }
    return coupon.scope === 'hotel' ? t.scopeHotel : t.scopeAll;
  };
  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-display text-3xl text-navy">{t.coupons}</h1>
        <Link href="/admin/coupons/new" className="rounded-full bg-navy px-5 py-2 text-sm font-bold text-snow">{t.add}</Link>
      </div>
      <div className="overflow-x-auto rounded-2xl bg-snow">
        <table className="w-full min-w-[900px] text-start text-sm">
          <thead className="border-b border-navy/10 text-navy/60">
            <tr>
              <th className="px-4 py-3 text-start font-bold">{t.code}</th>
              <th className="px-4 py-3 text-start font-bold">{t.scope} / {t.target}</th>
              <th className="px-4 py-3 text-start font-bold">{t.discount}</th>
              <th className="px-4 py-3 text-start font-bold">{t.usedCount} / {t.maxUses}</th>
              <th className="px-4 py-3 text-start font-bold">{t.validFrom} / {t.validUntil}</th>
              <th className="px-4 py-3 text-start font-bold">{t.active}</th>
              <th className="px-4 py-3 text-start font-bold">{t.edit}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-navy/10">
            {rows.length === 0 && <tr><td colSpan={7} className="p-6 text-navy/60">{t.noItems}</td></tr>}
            {rows.map((coupon) => (
              <tr key={coupon.id} className="text-navy">
                <td className="px-4 py-3 font-bold">{coupon.code}</td>
                <td className="px-4 py-3">{targetLabel(coupon)}</td>
                <td className="px-4 py-3">{coupon.discountValue}{coupon.discountType === 'percent' ? '%' : ' USD'}</td>
                <td className="px-4 py-3">{coupon.usedCount} / {coupon.maxUses ?? t.unlimited}</td>
                <td className="px-4 py-3">{dateLabel(coupon.validFrom, locale)} – {dateLabel(coupon.validUntil, locale)}</td>
                <td className="px-4 py-3">
                  <form action={toggleCoupon}>
                    <input type="hidden" name="id" value={coupon.id} />
                    <input type="hidden" name="active" value={String(!coupon.active)} />
                    <button className={coupon.active ? 'font-bold text-emerald-700 underline' : 'font-bold text-red-600 underline'}>
                      {coupon.active ? t.active : t.inactive}
                    </button>
                  </form>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <Link href={`/admin/coupons/${coupon.id}`} className="font-bold underline">{t.edit}</Link>
                    <form action={deleteCoupon}>
                      <input type="hidden" name="id" value={coupon.id} />
                      <ConfirmButton className="font-bold text-red-600">{t.delete}</ConfirmButton>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
