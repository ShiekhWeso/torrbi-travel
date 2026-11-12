import {savePackage} from '@/app/[locale]/admin/actions';
import type {packages} from '@/lib/db/schema';

type P = typeof packages.$inferSelect;
const inp = 'w-full rounded-lg border border-navy/20 bg-snow px-3 py-2 text-sm text-navy';
const Field = ({label, children}: {label: string; children: React.ReactNode}) => (
  <label className="block text-sm font-bold text-navy">
    {label}
    <div className="mt-1 font-normal">{children}</div>
  </label>
);
const J = (a?: string[]) => (a ?? []).join('\n');

export default function PackageForm({p}: {p?: P}) {
  const area = (name: string, label: string, en?: string[], ar?: string[]) => (
    <>
      <Field label={`${label} (EN) - one per line`}><textarea name={`${name}_en`} rows={4} defaultValue={J(en)} className={inp} /></Field>
      <Field label={`${label} (AR) - one per line`}><textarea name={`${name}_ar`} dir="rtl" rows={4} defaultValue={J(ar)} className={inp} /></Field>
    </>
  );
  return (
    <form action={savePackage} className="grid gap-4 rounded-2xl bg-snow p-6 md:grid-cols-2">
      {p && <input type="hidden" name="id" value={p.id} />}
      <Field label="Title (EN)"><input name="title_en" defaultValue={p?.i18n.en.title} required className={inp} /></Field>
      <Field label="Title (AR)"><input name="title_ar" dir="rtl" defaultValue={p?.i18n.ar.title} required className={inp} /></Field>
      <Field label="Intro (EN)"><textarea name="intro_en" rows={3} defaultValue={p?.i18n.en.intro} className={inp} /></Field>
      <Field label="Intro (AR)"><textarea name="intro_ar" dir="rtl" rows={3} defaultValue={p?.i18n.ar.intro} className={inp} /></Field>
      {area('highlights', 'Highlights', p?.i18n.en.highlights, p?.i18n.ar.highlights)}
      {area('stay', 'Stay (hotels)', p?.i18n.en.stay, p?.i18n.ar.stay)}
      {area('includes', 'Includes', p?.i18n.en.includes, p?.i18n.ar.includes)}
      {area('excludes', 'Excludes', p?.i18n.en.excludes, p?.i18n.ar.excludes)}
      <Field label="Slug (url)"><input name="slug" defaultValue={p?.slug} required className={inp} /></Field>
      <Field label="Region"><input name="region" defaultValue={p?.region ?? 'asia'} className={inp} /></Field>
      <Field label="Days"><input name="days" type="number" defaultValue={p?.days ?? ''} required className={inp} /></Field>
      <Field label="Nights"><input name="nights" type="number" defaultValue={p?.nights ?? ''} required className={inp} /></Field>
      <Field label="Price USD (empty = on request)"><input name="priceUsd" type="number" defaultValue={p?.priceUsd ?? ''} className={inp} /></Field>
      <Field label="Sort order"><input name="sort" type="number" defaultValue={p?.sort ?? 0} className={inp} /></Field>
      <Field label="Cover image URL / path"><input name="cover" defaultValue={p?.cover ?? ''} className={inp} /></Field>
      <Field label="Gallery - one URL per line"><textarea name="gallery" rows={3} defaultValue={J(p?.gallery)} className={inp} /></Field>
      <label className="flex items-center gap-2 text-sm font-bold text-navy">
        <input type="checkbox" name="featured" defaultChecked={p?.featured ?? false} /> Featured (home page)
      </label>
      <label className="flex items-center gap-2 text-sm font-bold text-navy">
        <input type="checkbox" name="published" defaultChecked={p?.published ?? true} /> Published
      </label>
      <button className="rounded-full bg-navy px-6 py-2 font-bold text-snow md:col-span-2 md:w-fit">Save</button>
    </form>
  );
}