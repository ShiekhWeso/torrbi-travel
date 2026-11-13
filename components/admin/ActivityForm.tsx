import {saveActivity} from '@/app/[locale]/admin/actions';
import type {activities} from '@/lib/db/schema';
import {getLocale} from 'next-intl/server';
import {tr} from '@/lib/adminT';

type A = typeof activities.$inferSelect;
const inp = 'w-full rounded-lg border border-navy/20 bg-snow px-3 py-2 text-sm text-navy';
const Field = ({label, children}: {label: string; children: React.ReactNode}) => (
  <label className="block text-sm font-bold text-navy">
    {label}
    <div className="mt-1 font-normal">{children}</div>
  </label>
);
const J = (a?: string[]) => (a ?? []).join('\n');

export default async function ActivityForm({a}: {a?: A}) {
  const t = tr(await getLocale());
  const area = (name: string, label: string, en?: string[], ar?: string[]) => (
    <>
      <Field label={`${label} (EN) - ${t.perLine}`}><textarea name={`${name}_en`} rows={4} defaultValue={J(en)} className={inp} /></Field>
      <Field label={`${label} (AR) - ${t.perLine}`}><textarea name={`${name}_ar`} dir="rtl" rows={4} defaultValue={J(ar)} className={inp} /></Field>
    </>
  );
  return (
    <form action={saveActivity} className="grid gap-4 rounded-2xl bg-snow p-6 md:grid-cols-2">
      {a && <input type="hidden" name="id" value={a.id} />}
      <Field label={`${t.title} (EN)`}><input name="title_en" defaultValue={a?.i18n.en.title} required className={inp} /></Field>
      <Field label={`${t.title} (AR)`}><input name="title_ar" dir="rtl" defaultValue={a?.i18n.ar.title} required className={inp} /></Field>
      <Field label={`${t.description} (EN)`}><textarea name="description_en" rows={4} defaultValue={a?.i18n.en.description} className={inp} /></Field>
      <Field label={`${t.description} (AR)`}><textarea name="description_ar" dir="rtl" rows={4} defaultValue={a?.i18n.ar.description} className={inp} /></Field>
      {area('highlights', t.highlights, a?.i18n.en.highlights, a?.i18n.ar.highlights)}
      {area('includes', t.includes, a?.i18n.en.includes, a?.i18n.ar.includes)}
      <Field label={t.slug}><input name="slug" defaultValue={a?.slug} required className={inp} /></Field>
      <Field label={t.city}><input name="city" defaultValue={a?.city} required className={inp} /></Field>
      <Field label={t.image}><input name="image" defaultValue={a?.image ?? ''} className={inp} /></Field>
      <Field label={t.gallery}><textarea name="gallery" rows={3} defaultValue={J(a?.gallery)} className={inp} /></Field>
      <Field label={t.price}><input name="priceUsd" type="number" defaultValue={a?.priceUsd ?? ''} className={inp} /></Field>
      <Field label={t.duration}><input name="durationHours" type="number" defaultValue={a?.durationHours ?? ''} className={inp} /></Field>
      <Field label={t.sort}><input name="sort" type="number" defaultValue={a?.sort ?? 0} className={inp} /></Field>
      <label className="flex items-center gap-2 text-sm font-bold text-navy">
        <input type="checkbox" name="featured" defaultChecked={a?.featured ?? false} /> {t.featured}
      </label>
      <label className="flex items-center gap-2 text-sm font-bold text-navy">
        <input type="checkbox" name="published" defaultChecked={a?.published ?? true} /> {t.published}
      </label>
      <button className="rounded-full bg-navy px-6 py-2 font-bold text-snow md:col-span-2 md:w-fit">{t.save}</button>
    </form>
  );
}
