import {saveOffer} from '@/app/[locale]/admin/actions';
import type {offers, packages} from '@/lib/db/schema';

type O = typeof offers.$inferSelect;
type P = Pick<typeof packages.$inferSelect, 'id' | 'i18n'>;
const inp = 'w-full rounded-lg border border-navy/20 bg-snow px-3 py-2 text-sm text-navy';
const Field = ({label, children}: {label: string; children: React.ReactNode}) => (
  <label className="block text-sm font-bold text-navy">
    {label}
    <div className="mt-1 font-normal">{children}</div>
  </label>
);

export default function OfferForm({o, pkgs}: {o?: O; pkgs: P[]}) {
  return (
    <form action={saveOffer} className="grid gap-4 rounded-2xl bg-snow p-6 md:grid-cols-2">
      {o && <input type="hidden" name="id" value={o.id} />}
      <Field label="Title (EN)"><input name="title_en" defaultValue={o?.i18n.en.title} required className={inp} /></Field>
      <Field label="Title (AR)"><input name="title_ar" dir="rtl" defaultValue={o?.i18n.ar.title} required className={inp} /></Field>
      <Field label="Text (EN)"><textarea name="text_en" rows={3} defaultValue={o?.i18n.en.text} className={inp} /></Field>
      <Field label="Text (AR)"><textarea name="text_ar" dir="rtl" rows={3} defaultValue={o?.i18n.ar.text} className={inp} /></Field>
      <Field label="Badge (EN) e.g. -20%"><input name="badge_en" defaultValue={o?.i18n.en.badge} className={inp} /></Field>
      <Field label="Badge (AR)"><input name="badge_ar" dir="rtl" defaultValue={o?.i18n.ar.badge} className={inp} /></Field>
      <Field label="Image URL / path"><input name="image" defaultValue={o?.image ?? ''} className={inp} /></Field>
      <Field label="Linked package">
        <select name="packageId" defaultValue={o?.packageId ?? ''} className={inp}>
          <option value="">None</option>
          {pkgs.map((p) => <option key={p.id} value={p.id}>{p.i18n.en.title}</option>)}
        </select>
      </Field>
      <Field label="Valid until">
        <input name="validUntil" type="date" defaultValue={o?.validUntil?.toISOString().slice(0, 10) ?? ''} className={inp} />
      </Field>
      <Field label="Sort order"><input name="sort" type="number" defaultValue={o?.sort ?? 0} className={inp} /></Field>
      <label className="flex items-center gap-2 text-sm font-bold text-navy">
        <input type="checkbox" name="published" defaultChecked={o?.published ?? true} /> Published
      </label>
      <button className="rounded-full bg-navy px-6 py-2 font-bold text-snow md:col-span-2 md:w-fit">Save</button>
    </form>
  );
}