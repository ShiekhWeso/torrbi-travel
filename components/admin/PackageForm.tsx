import {savePackage} from '@/app/[locale]/admin/actions';
import type {packages} from '@/lib/db/schema';
import {getLocale} from 'next-intl/server';
import {tr} from '@/lib/adminT';

type P = typeof packages.$inferSelect;
const inp = 'w-full rounded-lg border border-navy/20 bg-snow px-3 py-2 text-sm text-navy';
const Field = ({label, children}: {label: string; children: React.ReactNode}) => (
  <label className="block text-sm font-bold text-navy">
    {label}
    <div className="mt-1 font-normal">{children}</div>
  </label>
);
const J = (a?: string[]) => (a ?? []).join('\n');

export default async function PackageForm({p}: {p?: P}) {
  const t = tr(await getLocale());
  const area = (name: string, label: string, en?: string[], ar?: string[]) => (
    <>
      <Field label={`${label} (EN) - ${t.perLine}`}><textarea name={`${name}_en`} rows={4} defaultValue={J(en)} className={inp} /></Field>
      <Field label={`${label} (AR) - ${t.perLine}`}><textarea name={`${name}_ar`} dir="rtl" rows={4} defaultValue={J(ar)} className={inp} /></Field>
    </>
  );
  return (
    <form action={savePackage} className="grid gap-4 rounded-2xl bg-snow p-6 md:grid-cols-2">
      {p && <input type="hidden" name="id" value={p.id} />}
      <Field label={`${t.title} (EN)`}><input name="title_en" defaultValue={p?.i18n.en.title} required className={inp} /></Field>
      <Field label={`${t.title} (AR)`}><input name="title_ar" dir="rtl" defaultValue={p?.i18n.ar.title} required className={inp} /></Field>
      <Field label={`${t.intro} (EN)`}><textarea name="intro_en" rows={3} defaultValue={p?.i18n.en.intro} className={inp} /></Field>
      <Field label={`${t.intro} (AR)`}><textarea name="intro_ar" dir="rtl" rows={3} defaultValue={p?.i18n.ar.intro} className={inp} /></Field>
      {area('highlights', t.highlights, p?.i18n.en.highlights, p?.i18n.ar.highlights)}
      {area('stay', t.stay, p?.i18n.en.stay, p?.i18n.ar.stay)}
      {area('includes', t.includes, p?.i18n.en.includes, p?.i18n.ar.includes)}
      {area('excludes', t.excludes, p?.i18n.en.excludes, p?.i18n.ar.excludes)}
      <Field label={t.slug}><input name="slug" defaultValue={p?.slug} required className={inp} /></Field>
      <Field label={t.region}><input name="region" defaultValue={p?.region ?? 'asia'} className={inp} /></Field>
      <Field label={t.days}><input name="days" type="number" defaultValue={p?.days ?? ''} required className={inp} /></Field>
      <Field label={t.nights}><input name="nights" type="number" defaultValue={p?.nights ?? ''} required className={inp} /></Field>
      <Field label={t.price}><input name="priceUsd" type="number" defaultValue={p?.priceUsd ?? ''} className={inp} /></Field>
      <Field label={t.sort}><input name="sort" type="number" defaultValue={p?.sort ?? 0} className={inp} /></Field>
      <Field label={t.cover}><input name="cover" defaultValue={p?.cover ?? ''} className={inp} /></Field>
      <Field label={t.gallery}><textarea name="gallery" rows={3} defaultValue={J(p?.gallery)} className={inp} /></Field>
      <label className="flex items-center gap-2 text-sm font-bold text-navy">
        <input type="checkbox" name="featured" defaultChecked={p?.featured ?? false} /> {t.featured}
      </label>
      <label className="flex items-center gap-2 text-sm font-bold text-navy">
        <input type="checkbox" name="published" defaultChecked={p?.published ?? true} /> {t.published}
      </label>
      <button className="rounded-full bg-navy px-6 py-2 font-bold text-snow md:col-span-2 md:w-fit">{t.save}</button>
    </form>
  );
}