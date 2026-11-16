'use client';

import {useState} from 'react';
import {saveContactLink} from '@/app/[locale]/admin/actions';
import type {contactLinks, ContactSection, ContactType} from '@/lib/db/schema';
import {useLocale} from 'next-intl';
import {tr} from '@/lib/adminT';

type ContactLink = typeof contactLinks.$inferSelect;
const socialTypes: ContactType[] = ['instagram', 'facebook', 'tiktok', 'x', 'snapchat', 'youtube', 'linkedin'];
const directTypes: ContactType[] = ['whatsapp', 'phone', 'email', 'address', 'hours'];
const inp = 'w-full rounded-lg border border-navy/20 bg-snow px-3 py-2 text-sm text-navy';
const Field = ({label, children}: {label: string; children: React.ReactNode}) => (
  <label className="block text-sm font-bold text-navy">
    {label}
    <div className="mt-1 font-normal">{children}</div>
  </label>
);

export default function ContactLinkForm({link}: {link?: ContactLink}) {
  const locale = useLocale();
  const t = tr(locale);
  const [section, setSection] = useState<ContactSection>(link?.section ?? 'social');
  const types = section === 'social' ? socialTypes : directTypes;

  return (
    <form action={saveContactLink} className="grid gap-4 rounded-2xl bg-snow p-6 md:grid-cols-2">
      {link && <input type="hidden" name="id" value={link.id} />}
      <Field label={t.section}>
        <select
          name="section"
          value={section}
          onChange={(event) => setSection(event.target.value as ContactSection)}
          className={inp}
        >
          <option value="social">{t.social}</option>
          <option value="direct">{t.direct}</option>
        </select>
      </Field>
      <Field label={t.type}>
        <select name="type" key={section} defaultValue={types.includes(link?.type ?? types[0]) ? link?.type : types[0]} className={inp}>
          {types.map((type) => <option key={type} value={type}>{t[type]}</option>)}
        </select>
      </Field>
      <Field label={t.value}>
        <input name="value" defaultValue={link?.value} required className={inp} />
      </Field>
      <Field label={`${t.label} (EN)`}>
        <input name="label_en" defaultValue={link?.i18n?.en?.label} className={inp} />
      </Field>
      <Field label={`${t.label} (AR)`}>
        <input name="label_ar" dir="rtl" defaultValue={link?.i18n?.ar?.label} className={inp} />
      </Field>
      <Field label={t.sort}>
        <input name="sort" type="number" step="1" defaultValue={link?.sort ?? 0} className={inp} />
      </Field>
      <label className="flex items-center gap-2 text-sm font-bold text-navy">
        <input type="checkbox" name="published" defaultChecked={link?.published ?? true} /> {t.published}
      </label>
      <button className="rounded-full bg-navy px-6 py-2 font-bold text-snow md:col-span-2 md:w-fit">{t.save}</button>
    </form>
  );
}
