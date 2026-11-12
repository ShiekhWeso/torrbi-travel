import {saveDestination} from '@/app/[locale]/admin/actions';
import type {destinations} from '@/lib/db/schema';
import {getLocale} from 'next-intl/server';
import {tr} from '@/lib/adminT';

type D = typeof destinations.$inferSelect;
const inp = 'w-full rounded-lg border border-navy/20 bg-snow px-3 py-2 text-sm text-navy';
const Field = ({label, children}: {label: string; children: React.ReactNode}) => (
  <label className="block text-sm font-bold text-navy">
    {label}
    <div className="mt-1 font-normal">{children}</div>
  </label>
);

export default async function DestinationForm({d}: {d?: D}) {
  const t = tr(await getLocale());
  return (
    <form action={saveDestination} className="grid gap-4 rounded-2xl bg-snow p-6 md:grid-cols-2">
      {d && <input type="hidden" name="id" value={d.id} />}
      <Field label={t.slug}><input name="slug" defaultValue={d?.slug} required className={inp} /></Field>
      <Field label={t.region}><input name="region" defaultValue={d?.region ?? 'asia'} className={inp} /></Field>
      <Field label={`${t.name} (EN)`}><input name="name_en" defaultValue={d?.i18n.en.name} required className={inp} /></Field>
      <Field label={`${t.name} (AR)`}><input name="name_ar" dir="rtl" defaultValue={d?.i18n.ar.name} required className={inp} /></Field>
      <Field label={`${t.country} (EN)`}><input name="country_en" defaultValue={d?.i18n.en.country} className={inp} /></Field>
      <Field label={`${t.country} (AR)`}><input name="country_ar" dir="rtl" defaultValue={d?.i18n.ar.country} className={inp} /></Field>
      <Field label={`${t.about} (EN)`}><textarea name="about_en" rows={4} defaultValue={d?.i18n.en.about} className={inp} /></Field>
      <Field label={`${t.about} (AR)`}><textarea name="about_ar" dir="rtl" rows={4} defaultValue={d?.i18n.ar.about} className={inp} /></Field>
      <Field label={t.image}><input name="image" defaultValue={d?.image ?? ''} className={inp} /></Field>
      <Field label={t.temp}><input name="temp" defaultValue={d?.temp ?? ''} className={inp} /></Field>
      <Field label={t.rating}><input name="rating" type="number" step="0.1" defaultValue={d?.rating ?? ''} className={inp} /></Field>
      <Field label={t.flightHours}><input name="flightHours" type="number" defaultValue={d?.flightHours ?? ''} className={inp} /></Field>
      <Field label={t.bestFrom}><input name="bestFrom" type="number" min={1} max={12} defaultValue={d?.bestFrom ?? ''} className={inp} /></Field>
      <Field label={t.bestTo}><input name="bestTo" type="number" min={1} max={12} defaultValue={d?.bestTo ?? ''} className={inp} /></Field>
      <Field label={t.sort}><input name="sort" type="number" defaultValue={d?.sort ?? 0} className={inp} /></Field>
      <label className="flex items-center gap-2 text-sm font-bold text-navy">
        <input type="checkbox" name="published" defaultChecked={d?.published ?? true} /> {t.published}
      </label>
      <button className="rounded-full bg-navy px-6 py-2 font-bold text-snow md:col-span-2 md:w-fit">{t.save}</button>
    </form>
  );
}