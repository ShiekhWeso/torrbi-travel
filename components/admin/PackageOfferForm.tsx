import {saveOfferFromPackage} from '@/app/[locale]/admin/actions';
import type {offers, packages} from '@/lib/db/schema';
import {getLocale} from 'next-intl/server';
import {tr} from '@/lib/adminT';

type O = typeof offers.$inferSelect;
type P = Pick<typeof packages.$inferSelect, 'id' | 'i18n'>;
const inp = 'w-full rounded-lg border border-navy/20 bg-snow px-3 py-2 text-sm text-navy';
const Field = ({label, children}: {label: string; children: React.ReactNode}) => (
  <label className="block text-sm font-bold text-navy">
    {label}
    <div className="mt-1 font-normal">{children}</div>
  </label>
);
const day = (d?: Date | null) => d?.toISOString().slice(0, 10) ?? '';

export default async function PackageOfferForm({o, pkgs}: {o?: O; pkgs: P[]}) {
  const locale = await getLocale();
  const t = tr(locale);
  const ar = locale === 'ar';
  return (
    <form action={saveOfferFromPackage} className="grid gap-4 rounded-2xl bg-snow p-6 md:grid-cols-2">
      {o && <input type="hidden" name="id" value={o.id} />}
      <Field label={t.linkedPackage}>
        <select name="packageId" required defaultValue={o?.packageId ?? ''} className={inp}>
          <option value="" disabled>—</option>
          {pkgs.map((p) => <option key={p.id} value={p.id}>{p.i18n[ar ? 'ar' : 'en'].title}</option>)}
        </select>
      </Field>
      <Field label={ar ? 'نسبة الخصم %' : 'Discount %'}>
        <input name="discountPercent" type="number" min={1} max={90} required defaultValue={o?.discountPercent ?? ''} className={inp} />
      </Field>
      <Field label={ar ? 'بداية العرض' : 'Starts'}>
        <input name="validFrom" type="date" defaultValue={day(o?.validFrom)} className={inp} />
      </Field>
      <Field label={t.validUntil}>
        <input name="validUntil" type="date" defaultValue={day(o?.validUntil)} className={inp} />
      </Field>
      <label className="flex items-center gap-2 text-sm font-bold text-navy">
        <input type="checkbox" name="published" defaultChecked={o?.published ?? true} /> {t.published}
      </label>
      <button className="rounded-full bg-navy px-6 py-2 font-bold text-snow md:col-span-2 md:w-fit">{t.save}</button>
    </form>
  );
}