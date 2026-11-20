import {saveSearchDuration} from '@/app/[locale]/admin/actions';
import type {searchDurations} from '@/lib/db/schema';
import {getLocale} from 'next-intl/server';
import {tr} from '@/lib/adminT';

type Duration = typeof searchDurations.$inferSelect;
const inp = 'w-full rounded-lg border border-navy/20 bg-snow px-3 py-2 text-sm text-navy';
const Field = ({label, children}: {label: string; children: React.ReactNode}) => (
  <label className="block text-sm font-bold text-navy">
    {label}
    <div className="mt-1 font-normal">{children}</div>
  </label>
);

export default async function SearchDurationForm({duration}: {duration?: Duration}) {
  const t = tr(await getLocale());
  return (
    <form action={saveSearchDuration} className="grid gap-4 rounded-2xl bg-snow p-6 md:grid-cols-2">
      {duration && <input type="hidden" name="id" value={duration.id} />}
      <Field label={`${t.durationLabel} (EN)`}>
        <input name="label_en" defaultValue={duration?.i18n.en.label} required className={inp} />
      </Field>
      <Field label={`${t.durationLabel} (AR)`}>
        <input name="label_ar" dir="rtl" defaultValue={duration?.i18n.ar.label} required className={inp} />
      </Field>
      <Field label={t.minDays}>
        <input name="minDays" type="number" min="1" defaultValue={duration?.minDays ?? ''} className={inp} />
      </Field>
      <Field label={t.maxDays}>
        <input name="maxDays" type="number" min="1" defaultValue={duration?.maxDays ?? ''} className={inp} />
      </Field>
      <Field label={t.sort}>
        <input name="sort" type="number" min="0" defaultValue={duration?.sort ?? 0} required className={inp} />
      </Field>
      <label className="flex items-center gap-2 text-sm font-bold text-navy">
        <input type="checkbox" name="published" defaultChecked={duration?.published ?? true} /> {t.published}
      </label>
      <button className="rounded-full bg-navy px-6 py-2 font-bold text-snow md:col-span-2 md:w-fit">{t.save}</button>
    </form>
  );
}
