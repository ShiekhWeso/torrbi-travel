'use client';

import {useState} from 'react';
import {useLocale, useTranslations} from 'next-intl';
import {useSearchParams} from 'next/navigation';
import {waLink} from '@/lib/whatsapp';

type Props = {
  title: string;
  days: number;
  adult: number | null;
  child: number | null;
  infant: number | null;
  policies?: string[];
};

const addDays = (iso: string, n: number) => {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d + n)).toISOString().slice(0, 10);
};

export default function BookingBox({title, days, adult, child, infant, policies}: Props) {
  const t = useTranslations('packageDetail');
  const p = useTranslations('packages');
  const sp = useSearchParams();
  const ar = useLocale() === 'ar';
  const L = (en: string, a: string) => (ar ? a : en);

  const [adults, setAdults] = useState(Math.min(10, Math.max(1, Number(sp.get('pax')) || 2)));
  const [children, setChildren] = useState(0);
  const [infants, setInfants] = useState(0);
  const [date, setDate] = useState(sp.get('date') ?? '');
  const [lang, setLang] = useState(ar ? 'ar' : 'en');
  const [notes, setNotes] = useState('');
  const [err, setErr] = useState('');

  const ret = date ? addDays(date, days - 1) : '';
  const rows = [
    {n: adults, price: adult},
    {n: children, price: child},
    {n: infants, price: infant}
  ];
  const known = rows.reduce((s, r) => s + (r.price != null ? r.n * r.price : 0), 0);
  const unknown = rows.some((r) => r.n > 0 && r.price == null);
  const total =
    unknown && known === 0 ? p('onRequest') : `$${known}${unknown ? ` + ${p('onRequest')}` : ''}`;

  const send = () => {
    if (!date) return setErr(L('Choose a travel date', 'اختر تاريخ السفر'));
    setErr('');
    const langName = lang === 'ar' ? L('Arabic', 'العربية') : L('English', 'الإنجليزية');
    const text = ar
      ? [
          'مرحباً TORRBI TRAVEL، أرغب في التحقق من تفاصيل الباقة التالية:',
          `الباقة: ${title}`,
          `تاريخ السفر: ${date}`,
          `تاريخ العودة: ${ret}`,
          `البالغين: ${adults}`,
          `الأطفال (2-11): ${children}`,
          `الرضع (أقل من سنتين): ${infants}`,
          `اللغة: ${langName}`,
          `الإجمالي التقريبي: ${total}`,
          notes.trim() ? `ملاحظات: ${notes.trim()}` : ''
        ]
      : [
          'Hello TORRBI TRAVEL, I would like to check the details of this package:',
          `Package: ${title}`,
          `Travel date: ${date}`,
          `Return date: ${ret}`,
          `Adults: ${adults}`,
          `Children (2-11): ${children}`,
          `Infants (under 2): ${infants}`,
          `Language: ${langName}`,
          `Estimated total: ${total}`,
          notes.trim() ? `Notes: ${notes.trim()}` : ''
        ];
    window.open(waLink(text.filter(Boolean).join('\n')), '_blank', 'noopener');
  };

  const box = 'flex w-full items-center gap-3 rounded-xl border border-navy/20 bg-snow px-4 py-3 font-bold text-navy';
  const input = 'w-full bg-transparent focus:outline-none';
  const price = (v: number | null) => (v != null ? `$${v}` : p('onRequest'));

  const counter = (
    label: string,
    v: number,
    set: (n: number) => void,
    unit: number | null,
    min: number
  ) => (
    <label className={box}>
      <span className="material-symbols-outlined text-sky">person</span>
      <span className="shrink-0">{label} <span className="text-xs font-normal text-navy/60">({price(unit)})</span></span>
      <select value={v} onChange={(e) => set(Number(e.target.value))} className={`${input} text-end`}>
        {Array.from({length: 11 - min}, (_, i) => i + min).map((n) => (
          <option key={n} value={n}>{n}</option>
        ))}
      </select>
    </label>
  );

  const parsed = (policies ?? [])
    .map((line) => {
      const [a, ...b] = line.split('|');
      return {title: a.trim(), text: b.join('|').trim()};
    })
    .filter((x) => x.title);
  const list = parsed.length
    ? parsed
    : (['freeCancel', 'payLater'] as const).map((k) => ({title: t(k), text: t(`${k}Text`)}));

  return (
    <aside className="h-fit rounded-3xl border border-navy/10 bg-snow p-6 shadow-[0_16px_40px_rgba(15,24,89,0.08)] lg:sticky lg:top-28 lg:max-h-[calc(100vh-8rem)] lg:overflow-y-auto">
      <p className="text-sm text-navy/60">{p('from')}</p>
      <p className="font-display text-3xl font-bold text-navy">
        {adult != null ? `$${adult}` : p('onRequest')}
        {adult != null && <span className="text-base font-normal text-navy/60"> {p('perPerson')}</span>}
      </p>

      <div className="mt-5 space-y-3">
        {counter(t('adult'), adults, setAdults, adult, 1)}
        {counter(L('Child 2–11', 'طفل 2–11'), children, setChildren, child, 0)}
        {counter(L('Infant <2', 'رضيع أقل من سنتين'), infants, setInfants, infant, 0)}

        <label className={box}>
          <span className="material-symbols-outlined text-sky">calendar_today</span>
          <input
            type="date"
            value={date}
            min={new Date().toISOString().slice(0, 10)}
            onChange={(e) => setDate(e.target.value)}
            className={input}
          />
        </label>
        <div className={`${box} text-navy/70`}>
          <span className="material-symbols-outlined text-sky">event_repeat</span>
          <span className="shrink-0 font-normal">{L('Return', 'العودة')}</span>
          <span className="w-full text-end">{ret || '—'}</span>
        </div>
        <label className={box}>
          <span className="material-symbols-outlined text-sky">language</span>
          <select value={lang} onChange={(e) => setLang(e.target.value)} className={input}>
            <option value="en">{t('langEnglish')}</option>
            <option value="ar">{t('langArabic')}</option>
          </select>
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          placeholder={L('Notes', 'ملاحظات')}
          className="w-full rounded-xl border border-navy/20 bg-snow px-4 py-3 text-sm text-navy focus:outline-none"
        />
      </div>

      <div className="mt-5 flex items-center justify-between border-t border-navy/10 pt-4">
        <span className="font-bold text-navy">{L('Total', 'الإجمالي')}</span>
        <span className="font-display text-xl font-bold text-navy">{total}</span>
      </div>
      <button
        onClick={send}
        className="mt-5 w-full rounded-full bg-brand-warm py-4 font-bold text-navy shadow-[0_8px_24px_rgba(254,153,98,0.4)] transition-transform hover:scale-[1.02]"
      >
        {t('check')}
      </button>
      {err && <p className="mt-3 text-sm font-bold text-[#ef4444]">{err}</p>}

      <ul className="mt-5 space-y-3 border-t border-navy/10 pt-5 text-sm">
        {list.map((x) => (
          <li key={x.title} className="flex gap-3">
            <span className="material-symbols-outlined text-[20px] text-sky">check_circle</span>
            <div>
              <p className="font-bold text-navy">{x.title}</p>
              {x.text && <p className="text-navy/70">{x.text}</p>}
            </div>
          </li>
        ))}
      </ul>
    </aside>
  );
}