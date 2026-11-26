import {savePackage} from '@/app/[locale]/admin/actions';
import type {destinations as destinationTable, packages, searchRegions} from '@/lib/db/schema';
import {tr} from '@/lib/adminT';
import FeaturesEditor from '@/components/admin/FeaturesEditor';
import ItineraryDraftEditor from '@/components/admin/ItineraryDraftEditor';
import ImageUpload from '@/components/admin/ImageUpload';
import GalleryUpload from '@/components/admin/GalleryUpload';

type P = typeof packages.$inferSelect;
type D = Pick<typeof destinationTable.$inferSelect, 'id' | 'slug' | 'i18n'>;
type R = Pick<typeof searchRegions.$inferSelect, 'slug' | 'i18n'>;
const inp = 'w-full rounded-lg border border-navy/20 bg-snow px-3 py-2 text-sm text-navy';

const SHOW_EN = false;
const Field = ({label, children, en = false}: {label: string; children: React.ReactNode; en?: boolean}) => (
  <label className={`block text-sm font-bold text-navy ${en && !SHOW_EN ? 'hidden' : ''}`}>
    {label}
    <div className="mt-1 font-normal">{children}</div>
  </label>
);

const J = (a?: string[]) => (a ?? []).join('\n');

export default async function PackageForm({p, destinations, regions}: {p?: P; destinations: D[]; regions: R[]}) {
  const t = tr('ar');
  const region = p?.region ?? regions[0]?.slug ?? 'asia';
  const hasRegion = regions.some((item) => item.slug === region);
  const enFeatures = p?.i18n.en.features ?? [];
  const arFeatures = p?.i18n.ar.features ?? [];
  const initialFeatures = Array.from({length: Math.max(enFeatures.length, arFeatures.length)}, (_, i) => ({
    icon: arFeatures[i]?.icon ?? enFeatures[i]?.icon ?? 'check_circle',
    title_en: enFeatures[i]?.title ?? '',
    text_en: enFeatures[i]?.text ?? '',
    title_ar: arFeatures[i]?.title ?? '',
    text_ar: arFeatures[i]?.text ?? ''
  }));
  const area = (name: string, label: string, en?: string[], ar?: string[]) => (
    <>
      <Field en label={`${label} - ${t.perLine}`}><textarea name={`${name}_en`} rows={4} defaultValue={J(en)} className={inp} /></Field>
      <Field label={`${label} - ${t.perLine}`}><textarea name={`${name}_ar`} dir="rtl" rows={4} defaultValue={J(ar)} className={inp} /></Field>
    </>
  );
  return (
    <form action={savePackage} className="grid gap-4 rounded-2xl bg-snow p-6 md:grid-cols-2">
      {p && <input type="hidden" name="id" value={p.id} />}
      <Field en label={t.title}><input name="title_en" defaultValue={p?.i18n.en.title} className={inp} /></Field>
      <Field label={t.title}><input name="title_ar" dir="rtl" defaultValue={p?.i18n.ar.title} required className={inp} /></Field>
      <Field en label={t.intro}><textarea name="intro_en" rows={3} defaultValue={p?.i18n.en.intro} className={inp} /></Field>
      <Field label={t.intro}><textarea name="intro_ar" dir="rtl" rows={3} defaultValue={p?.i18n.ar.intro} className={inp} /></Field>
      {area('highlights', t.highlights, p?.i18n.en.highlights, p?.i18n.ar.highlights)}
      {area('stay', t.stay, p?.i18n.en.stay, p?.i18n.ar.stay)}
      {area('includes', t.includes, p?.i18n.en.includes, p?.i18n.ar.includes)}
      {area('policies', 'السياسات (العنوان | النص)', p?.i18n.en.policies, p?.i18n.ar.policies)}
      <FeaturesEditor initial={initialFeatures} />
      {area('excludes', t.excludes, p?.i18n.en.excludes, p?.i18n.ar.excludes)}
      <Field label={t.slug}><input name="slug" defaultValue={p?.slug} required className={inp} /></Field>
      <Field label="الوجهة">
        <select name="destinationId" defaultValue={p?.destinationId?.toString() ?? ''} className={inp}>
          <option value="">{t.none}</option>
          {destinations.map((destination) => (
            <option key={destination.id} value={destination.id}>
              {destination.i18n.ar.name}
            </option>
          ))}
        </select>
      </Field>
      <Field label={t.region}>
        <select name="region" defaultValue={region} className={inp}>
          {!hasRegion && <option value={region}>{region}</option>}
          {regions.map((item) => (
            <option key={item.slug} value={item.slug}>
              {item.i18n.ar.name}
            </option>
          ))}
        </select>
      </Field>
      <Field label={t.days}><input name="packageDaysCount" type="number" defaultValue={p?.days ?? ''} required className={inp} /></Field>
      <Field label={t.nights}><input name="nights" type="number" defaultValue={p?.nights ?? ''} required className={inp} /></Field>
      <Field label="سعر البالغ (بالدولار)"><input name="priceUsd" type="number" defaultValue={p?.priceUsd ?? ''} className={inp} /></Field>
      <Field label="سعر الطفل 2–11 (بالدولار)"><input name="childPriceUsd" type="number" defaultValue={p?.childPriceUsd ?? ''} className={inp} /></Field>
      <Field label="سعر الرضيع تحت 2 (بالدولار)"><input name="infantPriceUsd" type="number" defaultValue={p?.infantPriceUsd ?? ''} className={inp} /></Field>
      <Field label={t.sort}><input name="sort" type="number" defaultValue={p?.sort ?? 0} className={inp} /></Field>
      <ImageUpload name="cover" defaultValue={p?.cover ?? ''} label={t.cover} />
      <GalleryUpload name="gallery" defaultValue={(p?.gallery ?? []).join('\n')} label={t.gallery} />
      <label className="flex items-center gap-2 text-sm font-bold text-navy">
        <input type="checkbox" name="featured" defaultChecked={p?.featured ?? false} /> {t.featured}
      </label>
      <label className="flex items-center gap-2 text-sm font-bold text-navy">
        <input type="checkbox" name="published" defaultChecked={p?.published ?? true} /> {t.published}
      </label>
      {!p && <ItineraryDraftEditor />}
      <button className="rounded-full bg-navy px-6 py-2 font-bold text-snow md:col-span-2 md:w-fit">{t.save}</button>
    </form>
  );
}