'use client';

import {useState} from 'react';

const ICONS = [
  'event_available', 'account_balance_wallet', 'flag', 'airport_shuttle', 'schedule', 'hotel',
  'restaurant', 'flight', 'directions_car', 'local_activity', 'photo_camera', 'beach_access',
  'pool', 'translate', 'support_agent', 'verified', 'payments', 'luggage', 'map', 'sim_card',
  'wifi', 'star', 'favorite', 'shield', 'sailing', 'hiking', 'check_circle', 'celebration'
];

export type FeatureRow = {icon: string; title_en: string; text_en: string; title_ar: string; text_ar: string};

const inp = 'w-full rounded-lg border border-navy/20 bg-snow px-3 py-2 text-sm text-navy';
const SHOW_EN = false;

export default function FeaturesEditor({initial}: {initial: FeatureRow[]}) {
  const [rows, setRows] = useState<FeatureRow[]>(initial);
  const [open, setOpen] = useState<number | null>(null);
  const set = (i: number, patch: Partial<FeatureRow>) =>
    setRows(rows.map((r, j) => (j === i ? {...r, ...patch} : r)));

  return (
    <div className="space-y-3 md:col-span-2">
      <p className="text-sm font-bold text-navy">المعلومات الأساسية</p>
      <input type="hidden" name="features" value={JSON.stringify(rows)} />
      {rows.map((r, i) => (
        <div key={i} className="rounded-xl border border-navy/10 p-3">
          <div className="grid gap-2 md:grid-cols-[auto_1fr_1fr]">
            <button
              type="button"
              onClick={() => setOpen(open === i ? null : i)}
              className="flex h-12 w-12 items-center justify-center rounded-xl bg-mist"
              title="اختر أيقونة"
            >
              <span className="material-symbols-outlined text-sky">{r.icon}</span>
            </button>
            <div className="space-y-2">
              <input className={`${inp} ${SHOW_EN ? '' : 'hidden'}`} placeholder="العنوان" value={r.title_en} onChange={(e) => set(i, {title_en: e.target.value})} />
              <input className={`${inp} ${SHOW_EN ? '' : 'hidden'}`} placeholder="النص" value={r.text_en} onChange={(e) => set(i, {text_en: e.target.value})} />
            </div>
            <div className="space-y-2">
              <input className={inp} dir="rtl" placeholder="العنوان" value={r.title_ar} onChange={(e) => set(i, {title_ar: e.target.value})} />
              <input className={inp} dir="rtl" placeholder="النص" value={r.text_ar} onChange={(e) => set(i, {text_ar: e.target.value})} />
            </div>
          </div>
          {open === i && (
            <div className="mt-3 grid grid-cols-7 gap-2 rounded-xl bg-mist p-3 sm:grid-cols-10">
              {ICONS.map((ic) => (
                <button
                  key={ic}
                  type="button"
                  title={ic}
                  onClick={() => { set(i, {icon: ic}); setOpen(null); }}
                  className={`flex h-10 w-10 items-center justify-center rounded-lg ${r.icon === ic ? 'bg-navy text-snow' : 'bg-snow text-sky hover:bg-sky-light/40'}`}
                >
                  <span className="material-symbols-outlined">{ic}</span>
                </button>
              ))}
            </div>
          )}
          <button
            type="button"
            onClick={() => setRows(rows.filter((_, j) => j !== i))}
            className="mt-2 text-sm font-bold text-red-600"
          >
            حذف
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={() => setRows([...rows, {icon: 'check_circle', title_en: '', text_en: '', title_ar: '', text_ar: ''}])}
        className="rounded-full bg-mist px-5 py-2 text-sm font-bold text-navy hover:bg-sky-light/40"
      >
        + إضافة
      </button>
    </div>
  );
}