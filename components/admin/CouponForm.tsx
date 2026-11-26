import {createCoupon, updateCoupon} from '@/app/[locale]/admin/actions';
import type {activities, coupons, packages} from '@/lib/db/schema';
import {tr} from '@/lib/adminT';

type C = typeof coupons.$inferSelect;
type P = Pick<typeof packages.$inferSelect, 'id' | 'i18n'>;
type A = Pick<typeof activities.$inferSelect, 'id' | 'i18n'>;
const inp = 'w-full rounded-lg border border-navy/20 bg-snow px-3 py-2 text-sm text-navy';
const SHOW_EN = false;
const Field = ({label, children, en = false}: {label: string; children: React.ReactNode; en?: boolean}) => (
  <label className={`block text-sm font-bold text-navy ${en && !SHOW_EN ? 'hidden' : ''}`}>
    {label}
    <div className="mt-1 font-normal">{children}</div>
  </label>
);

function dateTimeValue(date: Date | null | undefined) {
  if (!date) return '';
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 16);
}

export default async function CouponForm({
  coupon,
  pkgs,
  acts
}: {
  coupon?: C;
  pkgs: P[];
  acts: A[];
}) {
  const t = tr('ar');
  return (
    <form action={coupon ? updateCoupon : createCoupon} className="grid gap-4 rounded-2xl bg-snow p-6 md:grid-cols-2">
      {coupon && <input type="hidden" name="id" value={coupon.id} />}
      <Field label={t.code}>
        <input name="code" defaultValue={coupon?.code} required autoCapitalize="characters" className={inp} />
      </Field>
      <Field label={t.scope}>
        <select name="scope" defaultValue={coupon?.scope ?? 'all'} className={inp}>
          <option value="all">{t.scopeAll}</option>
          <option value="package">{t.scopePackage}</option>
          <option value="activity">{t.scopeActivity}</option>
        </select>
      </Field>
      <Field label={`${t.target} · ${t.scopePackage}`}>
        <select name="packageId" defaultValue={coupon?.packageId ?? ''} className={inp}>
          <option value="">{t.allPackages}</option>
          {pkgs.map((p) => <option key={p.id} value={p.id}>{p.i18n.ar.title}</option>)}
        </select>
      </Field>
      <Field label={`${t.target} · ${t.scopeActivity}`}>
        <select name="activityId" defaultValue={coupon?.activityId ?? ''} className={inp}>
          <option value="">{t.allActivities}</option>
          {acts.map((a) => <option key={a.id} value={a.id}>{a.i18n.ar.title}</option>)}
        </select>
      </Field>
      <Field label={t.discount}>
        <select name="discountType" defaultValue={coupon?.discountType ?? 'percent'} className={inp}>
          <option value="percent">{t.percent}</option>
          <option value="fixed">{t.fixedUsd}</option>
        </select>
      </Field>
      <Field label={t.discountValue}>
        <input name="discountValue" type="number" min="1" step="1" defaultValue={coupon?.discountValue} required className={inp} />
      </Field>
      <Field label={t.minTotalUsd}>
        <input name="minTotalUsd" type="number" min="0" step="1" defaultValue={coupon?.minTotalUsd ?? ''} className={inp} />
      </Field>
      <Field label={t.maxUses}>
        <div>
          <input name="maxUses" type="number" min="1" step="1" defaultValue={coupon?.maxUses ?? ''} className={inp} />
          <p className="mt-1 text-xs text-navy/60">{t.usedCount}: {coupon?.usedCount ?? 0}</p>
        </div>
      </Field>
      <Field label={t.validFrom}>
        <input name="validFrom" type="datetime-local" defaultValue={dateTimeValue(coupon?.validFrom)} className={inp} />
      </Field>
      <Field label={t.validUntil}>
        <input name="validUntil" type="datetime-local" defaultValue={dateTimeValue(coupon?.validUntil)} className={inp} />
      </Field>
      <Field en label={t.title}>
        <input name="title_en" defaultValue={coupon?.i18n.en.title} className={inp} />
      </Field>
      <Field label={t.title}>
        <input name="title_ar" dir="rtl" defaultValue={coupon?.i18n.ar.title} required className={inp} />
      </Field>
      <Field en label={t.terms}>
        <textarea name="terms_en" rows={3} defaultValue={coupon?.i18n.en.terms} className={inp} />
      </Field>
      <Field label={t.terms}>
        <textarea name="terms_ar" dir="rtl" rows={3} defaultValue={coupon?.i18n.ar.terms} className={inp} />
      </Field>
      <label className="flex items-center gap-2 text-sm font-bold text-navy">
        <input type="checkbox" name="isPublic" defaultChecked={coupon?.isPublic ?? false} /> {t.isPublic}
      </label>
      <label className="flex items-center gap-2 text-sm font-bold text-navy">
        <input type="checkbox" name="active" defaultChecked={coupon?.active ?? true} /> {t.active}
      </label>
      <button className="rounded-full bg-navy px-6 py-2 font-bold text-snow md:col-span-2 md:w-fit">{t.save}</button>
    </form>
  );
}
