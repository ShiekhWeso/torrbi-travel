import {saveOffer} from '@/app/[locale]/admin/actions';
import type {offers, packages} from '@/lib/db/schema';
import {tr} from '@/lib/adminT';
import ImageUpload from '@/components/admin/ImageUpload';

type O = typeof offers.$inferSelect;
type P = Pick<typeof packages.$inferSelect, 'id' | 'i18n'>;
const inp = 'w-full rounded-lg border border-navy/20 bg-snow px-3 py-2 text-sm text-navy';
const SHOW_EN = false;
const Field = ({label, children, en = false}: {label: string; children: React.ReactNode; en?: boolean}) => (
  <label className={`block text-sm font-bold text-navy ${en && !SHOW_EN ? 'hidden' : ''}`}>
    {label}
    <div className="mt-1 font-normal">{children}</div>
  </label>
);

export default async function OfferForm({o, pkgs}: {o?: O; pkgs: P[]}) {
  const t = tr('ar');
  return (
    <form action={saveOffer} className="grid gap-4 rounded-2xl bg-snow p-6 md:grid-cols-2">
      {o && <input type="hidden" name="id" value={o.id} />}
      <Field en label={t.title}><input name="title_en" defaultValue={o?.i18n.en.title} className={inp} /></Field>
      <Field label={t.title}><input name="title_ar" dir="rtl" defaultValue={o?.i18n.ar.title} required className={inp} /></Field>
      <Field en label={t.text}><textarea name="text_en" rows={3} defaultValue={o?.i18n.en.text} className={inp} /></Field>
      <Field label={t.text}><textarea name="text_ar" dir="rtl" defaultValue={o?.i18n.ar.text} className={inp} /></Field>
      <Field en label={t.badge}><input name="badge_en" defaultValue={o?.i18n.en.badge} className={inp} /></Field>
      <Field label={t.badge}><input name="badge_ar" dir="rtl" defaultValue={o?.i18n.ar.badge} className={inp} /></Field>
      <ImageUpload name="image" defaultValue={o?.image ?? ''} label={t.image} />
      <Field label={t.linkedPackage}>
        <select name="packageId" defaultValue={o?.packageId ?? ''} className={inp}>
          <option value="">{t.none}</option>
          {pkgs.map((p) => <option key={p.id} value={p.id}>{p.i18n.ar.title}</option>)}
        </select>
      </Field>
      <Field label={t.validUntil}>
        <input name="validUntil" type="date" defaultValue={o?.validUntil?.toISOString().slice(0, 10) ?? ''} className={inp} />
      </Field>
      <Field label={t.sort}><input name="sort" type="number" defaultValue={o?.sort ?? 0} className={inp} /></Field>
      <label className="flex items-center gap-2 text-sm font-bold text-navy">
        <input type="checkbox" name="published" defaultChecked={o?.published ?? true} /> {t.published}
      </label>
      <button className="rounded-full bg-navy px-6 py-2 font-bold text-snow md:col-span-2 md:w-fit">{t.save}</button>
    </form>
  );
}