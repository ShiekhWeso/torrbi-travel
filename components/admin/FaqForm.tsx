import {saveFaq} from '@/app/[locale]/admin/actions';
import type {faqs} from '@/lib/db/schema';
import {getLocale} from 'next-intl/server';
import {tr} from '@/lib/adminT';

type F = typeof faqs.$inferSelect;
const inp = 'w-full rounded-lg border border-navy/20 bg-snow px-3 py-2 text-sm text-navy';
const Field = ({label, children}: {label: string; children: React.ReactNode}) => (
  <label className="block text-sm font-bold text-navy">
    {label}
    <div className="mt-1 font-normal">{children}</div>
  </label>
);

export default async function FaqForm({faq}: {faq?: F}) {
  const t = tr(await getLocale());
  return (
    <form action={saveFaq} className="grid gap-4 rounded-2xl bg-snow p-6 md:grid-cols-2">
      {faq && <input type="hidden" name="id" value={faq.id} />}
      <Field label={`${t.question} (EN)`}>
        <input name="question_en" defaultValue={faq?.i18n.en.question} required className={inp} />
      </Field>
      <Field label={`${t.question} (AR)`}>
        <input name="question_ar" dir="rtl" defaultValue={faq?.i18n.ar.question} required className={inp} />
      </Field>
      <Field label={`${t.answer} (EN)`}>
        <textarea name="answer_en" rows={4} defaultValue={faq?.i18n.en.answer} required className={inp} />
      </Field>
      <Field label={`${t.answer} (AR)`}>
        <textarea name="answer_ar" dir="rtl" rows={4} defaultValue={faq?.i18n.ar.answer} required className={inp} />
      </Field>
      <Field label={t.sort}>
        <input name="sort" type="number" defaultValue={faq?.sort ?? 0} className={inp} />
      </Field>
      <label className="flex items-center gap-2 text-sm font-bold text-navy">
        <input type="checkbox" name="published" defaultChecked={faq?.published ?? true} /> {t.published}
      </label>
      <button className="rounded-full bg-navy px-6 py-2 font-bold text-snow md:col-span-2 md:w-fit">{t.save}</button>
    </form>
  );
}
