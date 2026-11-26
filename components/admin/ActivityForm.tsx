import {saveActivity} from '@/app/[locale]/admin/actions';
import type {activities} from '@/lib/db/schema';
import {tr} from '@/lib/adminT';
import ImageUpload from '@/components/admin/ImageUpload';
import GalleryUpload from '@/components/admin/GalleryUpload';

type A = typeof activities.$inferSelect;
const inp = 'w-full rounded-lg border border-navy/20 bg-snow px-3 py-2 text-sm text-navy';
const SHOW_EN = false;
const Field = ({label, children, en = false}: {label: string; children: React.ReactNode; en?: boolean}) => (
  <label className={`block text-sm font-bold text-navy ${en && !SHOW_EN ? 'hidden' : ''}`}>
    {label}
    <div className="mt-1 font-normal">{children}</div>
  </label>
);
const J = (a?: string[]) => (a ?? []).join('\n');

export default async function ActivityForm({a}: {a?: A}) {
  const t = tr('ar');
  const area = (name: string, label: string, en?: string[], ar?: string[]) => (
    <>
      <Field en label={`${label} - ${t.perLine}`}><textarea name={`${name}_en`} rows={4} defaultValue={J(en)} className={inp} /></Field>
      <Field label={`${label} - ${t.perLine}`}><textarea name={`${name}_ar`} dir="rtl" rows={4} defaultValue={J(ar)} className={inp} /></Field>
    </>
  );
  return (
    <form action={saveActivity} className="grid gap-4 rounded-2xl bg-snow p-6 md:grid-cols-2">
      {a && <input type="hidden" name="id" value={a.id} />}
      <Field en label={t.title}><input name="title_en" defaultValue={a?.i18n.en.title} className={inp} /></Field>
      <Field label={t.title}><input name="title_ar" dir="rtl" defaultValue={a?.i18n.ar.title} required className={inp} /></Field>
      <Field en label={t.description}><textarea name="description_en" rows={4} defaultValue={a?.i18n.en.description} className={inp} /></Field>
      <Field label={t.description}><textarea name="description_ar" dir="rtl" rows={4} defaultValue={a?.i18n.ar.description} className={inp} /></Field>
      {area('highlights', t.highlights, a?.i18n.en.highlights, a?.i18n.ar.highlights)}
      {area('includes', t.includes, a?.i18n.en.includes, a?.i18n.ar.includes)}
      {area('policies', 'السياسات (العنوان | النص)', a?.i18n.en.policies, a?.i18n.ar.policies)}
      <Field label={t.slug}><input name="slug" defaultValue={a?.slug} required className={inp} /></Field>
      <Field label={t.city}><input name="city" defaultValue={a?.city} required className={inp} /></Field>
      <ImageUpload name="image" defaultValue={a?.image ?? ''} label={t.image} />
      <GalleryUpload name="gallery" defaultValue={(a?.gallery ?? []).join('\n')} label={t.gallery} />
      <Field label="سعر البالغ (بالدولار)"><input name="priceUsd" type="number" defaultValue={a?.priceUsd ?? ''} className={inp} /></Field>
      <Field label="سعر الطفل 2–11 (بالدولار)"><input name="childPriceUsd" type="number" defaultValue={a?.childPriceUsd ?? ''} className={inp} /></Field>
      <Field label="سعر الرضيع تحت 2 (بالدولار)"><input name="infantPriceUsd" type="number" defaultValue={a?.infantPriceUsd ?? ''} className={inp} /></Field>
      <Field label={t.carPrice1}><input name="carPrice1Usd" type="number" defaultValue={a?.carPrice1Usd ?? ''} className={inp} /></Field>
      <Field label={t.carPrice2}><input name="carPrice2Usd" type="number" defaultValue={a?.carPrice2Usd ?? ''} className={inp} /></Field>
      <Field label={t.carPrice3}><input name="carPrice3Usd" type="number" defaultValue={a?.carPrice3Usd ?? ''} className={inp} /></Field>
      
      <div className="md:col-span-2">
        <p className="text-sm font-bold text-navy">نوع الحجز</p>
        <div className="mt-2 flex flex-wrap gap-6 text-sm font-bold text-navy">
          <label className="flex items-center gap-2">
            <input type="radio" name="bookingMode" value="both" defaultChecked={(a?.bookingMode ?? 'both') === 'both'} /> أشخاص وسيارة
          </label>
          <label className="flex items-center gap-2">
            <input type="radio" name="bookingMode" value="people" defaultChecked={a?.bookingMode === 'people'} /> أشخاص فقط
          </label>
          <label className="flex items-center gap-2">
            <input type="radio" name="bookingMode" value="car" defaultChecked={a?.bookingMode === 'car'} /> سيارة فقط
          </label>
        </div>
      </div>
      
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
