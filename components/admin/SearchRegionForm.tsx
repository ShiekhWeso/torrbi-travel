import {saveSearchRegion} from '@/app/[locale]/admin/actions';
import type {searchRegions} from '@/lib/db/schema';
import {getLocale} from 'next-intl/server';
import {tr} from '@/lib/adminT';

type Region = typeof searchRegions.$inferSelect;
const inp = 'w-full rounded-lg border border-navy/20 bg-snow px-3 py-2 text-sm text-navy';
const Field = ({label, children}: {label: string; children: React.ReactNode}) => (
  <label className="block text-sm font-bold text-navy">
    {label}
    <div className="mt-1 font-normal">{children}</div>
  </label>
);

export default async function SearchRegionForm({region}: {region?: Region}) {
  const t = tr(await getLocale());
  return (
    <form action={saveSearchRegion} className="grid gap-4 rounded-2xl bg-snow p-6 md:grid-cols-2">
      {region && <input type="hidden" name="id" value={region.id} />}
      <Field label={`${t.regionName} (EN)`}>
        <input name="name_en" defaultValue={region?.i18n.en.name} required className={inp} />
      </Field>
      <Field label={`${t.regionName} (AR)`}>
        <input name="name_ar" dir="rtl" defaultValue={region?.i18n.ar.name} required className={inp} />
      </Field>
      <Field label={t.slug}>
        <input name="slug" defaultValue={region?.slug} required pattern="[a-z0-9]+(?:-[a-z0-9]+)*" className={inp} />
      </Field>
      <Field label={t.sort}>
        <input name="sort" type="number" min="0" defaultValue={region?.sort ?? 0} required className={inp} />
      </Field>
      <label className="flex items-center gap-2 text-sm font-bold text-navy">
        <input type="checkbox" name="published" defaultChecked={region?.published ?? true} /> {t.published}
      </label>
      <button className="rounded-full bg-navy px-6 py-2 font-bold text-snow md:col-span-2 md:w-fit">{t.save}</button>
    </form>
  );
}
