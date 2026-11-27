import {saveDestination} from '@/app/[locale]/admin/actions';
import {asc} from 'drizzle-orm';
import {db} from '@/lib/db';
import {searchRegions} from '@/lib/db/schema';
import {getCountries, findCountryByName} from '@/lib/countries';
import type {destinations} from '@/lib/db/schema';
import {tr} from '@/lib/adminT';
import FeaturesEditor from '@/components/admin/FeaturesEditor';
import ImageUpload from '@/components/admin/ImageUpload';
import GalleryUpload from '@/components/admin/GalleryUpload';

type D = typeof destinations.$inferSelect;
const inp = 'w-full rounded-lg border border-navy/20 bg-snow px-3 py-2 text-sm text-navy';
const SHOW_EN = false;
const Field = ({label, children, en = false}: {label: string; children: React.ReactNode; en?: boolean}) => (
  <label className={`block text-sm font-bold text-navy ${en && !SHOW_EN ? 'hidden' : ''}`}>
    {label}
    <div className="mt-1 font-normal">{children}</div>
  </label>
);
const J = (a?: string[]) => (a ?? []).join('\n');

export default async function DestinationForm({d}: {d?: D}) {
  const t = tr('ar');
  const regionRows = await db.select().from(searchRegions).orderBy(asc(searchRegions.sort), asc(searchRegions.id));
  const countries = getCountries();
  const currentCountry = findCountryByName(d?.i18n.ar.country) ?? findCountryByName(d?.i18n.en.country);
  const enFeatures = d?.i18n.en.features ?? [];
  const arFeatures = d?.i18n.ar.features ?? [];
  const initialFeatures = Array.from({length: Math.max(enFeatures.length, arFeatures.length)}, (_, i) => ({
    icon: arFeatures[i]?.icon ?? enFeatures[i]?.icon ?? 'check_circle',
    title_en: enFeatures[i]?.title ?? '',
    text_en: enFeatures[i]?.text ?? '',
    title_ar: arFeatures[i]?.title ?? '',
    text_ar: arFeatures[i]?.text ?? ''
  }));
  const area = (label: string, en?: string[], ar?: string[]) => (
    <>
      <Field en label={`${label} - ${t.perLine}`}><textarea name="tips_en" rows={4} defaultValue={J(en)} className={inp} /></Field>
      <Field label={`${label} - ${t.perLine}`}><textarea name="tips_ar" dir="rtl" rows={4} defaultValue={J(ar)} className={inp} /></Field>
    </>
  );
  return (
    <form action={saveDestination} className="grid gap-4 rounded-2xl bg-snow p-6 md:grid-cols-2">
      {d && <input type="hidden" name="id" value={d.id} />}
      <Field label={t.slug}><input name="slug" defaultValue={d?.slug} required className={inp} /></Field>

      <Field label={t.region}>
        <select name="region" required defaultValue={d?.region ?? ''} className={inp}>
          <option value="">اختر المنطقة</option>
          {regionRows.map((r) => (
            <option key={r.slug} value={r.slug}>{r.i18n.ar.name}{r.published ? '' : ' (مخفية)'}</option>
          ))}
        </select>
      </Field>

      <Field en label={t.name}><input name="name_en" defaultValue={d?.i18n.en.name} className={inp} /></Field>
      <Field label={t.name}><input name="name_ar" dir="rtl" defaultValue={d?.i18n.ar.name} required className={inp} /></Field>
 
      <Field label={t.country}>
        <select name="country" required defaultValue={currentCountry?.code ?? ''} className={inp}>
          <option value="">اختر الدولة</option>
          {countries.map((c) => (
            <option key={c.code} value={c.code}>{c.ar}</option>
          ))}
        </select>
      </Field>

      <Field en label={t.about}><textarea name="about_en" rows={4} defaultValue={d?.i18n.en.about} className={inp} /></Field>
      <Field label={t.about}><textarea name="about_ar" dir="rtl" rows={4} defaultValue={d?.i18n.ar.about} className={inp} /></Field>
      <FeaturesEditor initial={initialFeatures} />
      <Field label={t.currency}><input name="currency" defaultValue={d?.currency ?? ''} className={inp} /></Field>
      <Field label={t.timezone}><input name="timezone" defaultValue={d?.timezone ?? ''} className={inp} /></Field>
      <Field en label={t.language}><input name="language_en" defaultValue={d?.i18n.en.language ?? ''} className={inp} /></Field>
      <Field label={t.language}><input name="language_ar" dir="rtl" defaultValue={d?.i18n.ar.language ?? ''} className={inp} /></Field>
      <Field en label={t.visa}><input name="visa_en" defaultValue={d?.i18n.en.visa ?? ''} className={inp} /></Field>
      <Field label={t.visa}><input name="visa_ar" dir="rtl" defaultValue={d?.i18n.ar.visa ?? ''} className={inp} /></Field>
      {area(t.travelTips, d?.i18n.en.tips, d?.i18n.ar.tips)}
      <ImageUpload name="image" defaultValue={d?.image ?? ''} label={t.image} />
      <GalleryUpload name="gallery" defaultValue={J(d?.gallery)} label={t.gallery} />
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