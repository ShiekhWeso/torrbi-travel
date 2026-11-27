import {saveSearchRegion} from '@/app/[locale]/admin/actions';
import type {searchRegions} from '@/lib/db/schema';
import {tr} from '@/lib/adminT';

type Region = typeof searchRegions.$inferSelect;
const inp = 'w-full rounded-lg border border-navy/20 bg-snow px-3 py-2 text-sm text-navy';
const SHOW_EN = false;
const Field = ({label, children, en = false}: {label: string; children: React.ReactNode; en?: boolean}) => (
  <label className={`block text-sm font-bold text-navy ${en && !SHOW_EN ? 'hidden' : ''}`}>
    {label}
    <div className="mt-1 font-normal">{children}</div>
  </label>
);

export default async function SearchRegionForm({region}: {region?: Region}) {
  const t = tr('ar');
  return (
    <form action={saveSearchRegion} className="grid gap-4 rounded-2xl bg-snow p-6 md:grid-cols-2">
      {region && <input type="hidden" name="id" value={region.id} />}
      <Field en label={t.regionName}>
        <input name="name_en" defaultValue={region?.i18n.en.name} className={inp} />
      </Field>
      <Field label={t.regionName}>
        <input name="name_ar" dir="rtl" defaultValue={region?.i18n.ar.name} required className={inp} />
      </Field>
        {region && <input type="hidden" name="slug" value={region.slug} />}
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
