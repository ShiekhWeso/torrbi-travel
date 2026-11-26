'use client';

import {useRef, useState} from 'react';
import {tr} from '@/lib/adminT';

type DraftDay = {
  key: number;
  dayNo: string;
  stage: string;
  title_en: string;
  title_ar: string;
  items_en: string;
  items_ar: string;
};

const inp = 'w-full rounded-lg border border-navy/20 bg-mist px-3 py-2 text-sm text-navy';
const SHOW_EN = false;

export default function ItineraryDraftEditor() {
  const t = tr('ar');
  const nextKey = useRef(0);
  const [days, setDays] = useState<DraftDay[]>([]);
  const serializedDays = JSON.stringify(days.map(({key: _key, ...day}) => day));

  const addDay = () => {
    const key = nextKey.current++;
    setDays((current) => {
      const highestDayNo = current.reduce((highest, day) => {
        const dayNo = Number(day.dayNo);
        return Number.isInteger(dayNo) ? Math.max(highest, dayNo) : highest;
      }, 0);
      return [...current, {
        key,
        dayNo: String(highestDayNo + 1),
        stage: '',
        title_en: '',
        title_ar: '',
        items_en: '',
        items_ar: ''
      }];
    });
  };

  const updateDay = (key: number, patch: Partial<Omit<DraftDay, 'key'>>) => {
    setDays((current) => current.map((day) => day.key === key ? {...day, ...patch} : day));
  };

  const removeDay = (key: number) => {
    setDays((current) => current.filter((day) => day.key !== key));
  };

  return (
    <section className="space-y-4 md:col-span-2">
      <h2 className="font-display text-2xl text-navy">{t.itinerary}</h2>
      <div className="space-y-4 rounded-2xl bg-mist p-6">
        <input type="hidden" name="days" value={serializedDays} />
        {days.map((day) => (
          <div key={day.key} className="grid gap-3 rounded-xl border border-navy/10 bg-snow p-4 md:grid-cols-2">
            <label className="block text-sm font-bold text-navy">
              {t.dayNo}
              <input
                type="number"
                required
                value={day.dayNo}
                onChange={(event) => updateDay(day.key, {dayNo: event.target.value})}
                className={`${inp} mt-1`}
              />
            </label>
            <label className="block text-sm font-bold text-navy">
              {t.stage}
              <input
                value={day.stage}
                onChange={(event) => updateDay(day.key, {stage: event.target.value})}
                className={`${inp} mt-1`}
              />
            </label>
            <label className="block text-sm font-bold text-navy">
              {t.title}
              <input
                value={day.title_en}
                onChange={(event) => updateDay(day.key, {title_en: event.target.value})}
                className={`${inp} mt-1 ${SHOW_EN ? '' : 'hidden'}`}
              />
            </label>
            <label className="block text-sm font-bold text-navy">
              {t.title}
              <input
                dir="rtl"
                required
                value={day.title_ar}
                onChange={(event) => updateDay(day.key, {title_ar: event.target.value})}
                className={`${inp} mt-1`}
              />
            </label>
            <label className="block text-sm font-bold text-navy">
              {t.items} - {t.perLine}
              <textarea
                rows={3}
                value={day.items_en}
                onChange={(event) => updateDay(day.key, {items_en: event.target.value})}
                className={`${inp} mt-1 ${SHOW_EN ? '' : 'hidden'}`}
              />
            </label>
            <label className="block text-sm font-bold text-navy">
              {t.items} - {t.perLine}
              <textarea
                dir="rtl"
                rows={3}
                value={day.items_ar}
                onChange={(event) => updateDay(day.key, {items_ar: event.target.value})}
                className={`${inp} mt-1`}
              />
            </label>
            <button
              type="button"
              onClick={() => removeDay(day.key)}
              className="w-fit text-sm font-bold text-red-600"
            >
              {t.removeDay}
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={addDay}
          className="rounded-full bg-navy px-5 py-2 text-sm font-bold text-snow"
        >
          {t.addDay}
        </button>
      </div>
    </section>
  );
}
