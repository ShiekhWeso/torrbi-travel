'use client';

import {useState} from 'react';
import {saveAbout} from '@/app/[locale]/admin/actions';
import type {AboutLocaleContent} from '@/lib/db/schema';

type CardForm = {icon: string; title_en: string; title_ar: string; text_en: string; text_ar: string};
type AboutInitial = Record<'ar' | 'en', AboutLocaleContent>;

const ABOUT_ICONS = [
  'luggage', 'flight', 'hiking', 'hotel', 'beach_access', 'restaurant', 'directions_car', 'map',
  'camera_alt', 'support_agent', 'payments', 'verified', 'favorite', 'star', 'public', 'sailing',
  'tour', 'explore', 'airport_shuttle', 'flight_takeoff', 'flight_land', 'connecting_airports',
  'airplane_ticket', 'travel_explore', 'directions_bus', 'directions_railway', 'directions_boat',
  'directions_bike', 'directions_walk', 'local_taxi', 'hotel_class', 'bed', 'room_service', 'pool',
  'spa', 'local_cafe', 'local_dining', 'restaurant_menu', 'shopping_bag', 'local_mall',
  'location_on', 'pin_drop', 'near_me', 'navigation', 'route', 'landscape', 'nature', 'park',
  'forest', 'water', 'museum', 'castle', 'monument', 'photo_camera', 'photo_library',
  'event_available', 'calendar_month', 'schedule', 'wifi', 'translate'
];

const SHOW_EN = false;
const input = 'w-full rounded-lg border border-navy/20 bg-snow px-3 py-2 text-sm text-navy';
const label = 'block text-sm font-bold text-navy';

export default function AboutForm({initial}: {initial: AboutInitial}) {
  const [openIconCard, setOpenIconCard] = useState<number | null>(null);
  const [cards, setCards] = useState<CardForm[]>(Array.from({
    length: Math.max(initial.ar.cards.length, initial.en.cards.length)
  }, (_, index) => {
    const arabic = initial.ar.cards[index];
    const english = initial.en.cards[index];
    return {
      icon: arabic?.icon ?? english?.icon ?? 'check_circle',
      title_ar: arabic?.title ?? '',
      title_en: english?.title ?? arabic?.title ?? '',
      text_ar: arabic?.text ?? '',
      text_en: english?.text ?? arabic?.text ?? ''
    };
  }));

  const moveCard = (index: number, direction: -1 | 1) => {
    setOpenIconCard(null);
    setCards((current) => {
      const target = index + direction;
      if (target < 0 || target >= current.length) return current;
      const next = [...current];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  };
  const updateCard = (index: number, patch: Partial<CardForm>) => {
    setCards((current) => current.map((card, i) => i === index ? {...card, ...patch} : card));
  };

  return (
    <form action={saveAbout} className="grid gap-4 rounded-2xl bg-snow p-6 md:grid-cols-2">
      <label className={`${label} ${SHOW_EN ? '' : 'hidden'}`}>
        العنوان
        <input name="title_en" defaultValue={initial.en.title} className={`${input} mt-1`} />
      </label>
      <label className={label}>
        العنوان
        <input name="title_ar" defaultValue={initial.ar.title} required dir="rtl" className={`${input} mt-1`} />
      </label>
      <label className={`${label} ${SHOW_EN ? '' : 'hidden'}`}>
        العنوان الفرعي
        <textarea name="subtitle_en" defaultValue={initial.en.subtitle} rows={3} className={`${input} mt-1`} />
      </label>
      <label className={label}>
        العنوان الفرعي
        <textarea name="subtitle_ar" defaultValue={initial.ar.subtitle} rows={3} required dir="rtl" className={`${input} mt-1`} />
      </label>
      <label className={`${label} ${SHOW_EN ? '' : 'hidden'}`}>
        عنوان القصة
        <input name="storyTitle_en" defaultValue={initial.en.storyTitle} className={`${input} mt-1`} />
      </label>
      <label className={label}>
        عنوان القصة
        <input name="storyTitle_ar" defaultValue={initial.ar.storyTitle} required dir="rtl" className={`${input} mt-1`} />
      </label>
      <label className={`${label} ${SHOW_EN ? '' : 'hidden'}`}>
        القصة
        <textarea name="story_en" defaultValue={initial.en.story} rows={6} className={`${input} mt-1`} />
      </label>
      <label className={label}>
        القصة
        <textarea name="story_ar" defaultValue={initial.ar.story} rows={6} required dir="rtl" className={`${input} mt-1`} />
      </label>
      <label className={`${label} ${SHOW_EN ? '' : 'hidden'}`}>
        عنوان البطاقات
        <input name="whatTitle_en" defaultValue={initial.en.whatTitle} className={`${input} mt-1`} />
      </label>
      <label className={label}>
        عنوان البطاقات
        <input name="whatTitle_ar" defaultValue={initial.ar.whatTitle} required dir="rtl" className={`${input} mt-1`} />
      </label>

      <section className="space-y-3 md:col-span-2">
        <h2 className="font-display text-xl font-bold text-navy">البطاقات</h2>
        <input type="hidden" name="cards" value={JSON.stringify(cards)} />
        {cards.map((card, index) => (
          <div key={index} className="space-y-3 rounded-xl border border-navy/10 p-4">
            <div className="flex items-center justify-between gap-3">
              <span className="font-bold text-navy">البطاقة {index + 1}</span>
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={index === 0}
                  aria-label="تحريك البطاقة للأعلى"
                  onClick={() => moveCard(index, -1)}
                  className="rounded-lg bg-mist px-3 py-1 font-bold text-navy disabled:opacity-40"
                >
                  ↑
                </button>
                <button
                  type="button"
                  disabled={index === cards.length - 1}
                  aria-label="تحريك البطاقة للأسفل"
                  onClick={() => moveCard(index, 1)}
                  className="rounded-lg bg-mist px-3 py-1 font-bold text-navy disabled:opacity-40"
                >
                  ↓
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setOpenIconCard(null);
                    setCards((current) => current.filter((_, i) => i !== index));
                  }}
                  className="rounded-lg bg-red-50 px-3 py-1 font-bold text-red-600"
                >
                  حذف
                </button>
              </div>
            </div>
            <div className="space-y-2">
              <label htmlFor={`about-card-icon-${index}`} className={label}>اسم الأيقونة</label>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-mist text-sky" aria-hidden="true">
                  {card.icon}
                </span>
                <input
                  id={`about-card-icon-${index}`}
                  value={card.icon}
                  onChange={(event) => updateCard(index, {icon: event.target.value})}
                  required
                  className={`${input} min-w-0 flex-1`}
                />
                <button
                  type="button"
                  aria-expanded={openIconCard === index}
                  aria-controls={`about-icon-grid-${index}`}
                  onClick={() => setOpenIconCard(openIconCard === index ? null : index)}
                  className="shrink-0 rounded-lg bg-mist px-3 py-2 text-sm font-bold text-navy hover:bg-sky-light/40"
                >
                  اختر أيقونة
                </button>
              </div>
              <a
                href="https://fonts.google.com/icons?icon.set=Material+Symbols"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block text-xs font-semibold text-sky underline underline-offset-2"
              >
                كل الأيقونات
              </a>
              {openIconCard === index && (
                <div id={`about-icon-grid-${index}`} className="grid max-h-48 grid-cols-6 gap-2 overflow-y-auto rounded-xl bg-mist p-3 sm:grid-cols-10">
                  {ABOUT_ICONS.map((icon) => (
                    <button
                      key={icon}
                      type="button"
                      title={icon}
                      aria-label={`اختيار الأيقونة ${icon}`}
                      onClick={() => {
                        updateCard(index, {icon});
                        setOpenIconCard(null);
                      }}
                      className={`flex h-10 w-10 items-center justify-center rounded-lg ${card.icon === icon ? 'bg-navy text-snow' : 'bg-snow text-sky hover:bg-sky-light/40'}`}
                    >
                      <span className="material-symbols-outlined" aria-hidden="true">{icon}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <label className={`${label} ${SHOW_EN ? '' : 'hidden'}`}>
              العنوان
              <input value={card.title_en} onChange={(event) => updateCard(index, {title_en: event.target.value})} className={`${input} mt-1`} />
            </label>
            <label className={label}>
              العنوان
              <input value={card.title_ar} onChange={(event) => updateCard(index, {title_ar: event.target.value})} required dir="rtl" className={`${input} mt-1`} />
            </label>
            <label className={`${label} ${SHOW_EN ? '' : 'hidden'}`}>
              النص
              <textarea value={card.text_en} onChange={(event) => updateCard(index, {text_en: event.target.value})} rows={3} className={`${input} mt-1`} />
            </label>
            <label className={label}>
              النص
              <textarea value={card.text_ar} onChange={(event) => updateCard(index, {text_ar: event.target.value})} rows={3} required dir="rtl" className={`${input} mt-1`} />
            </label>
          </div>
        ))}
        <button
          type="button"
          onClick={() => setCards((current) => [...current, {icon: 'check_circle', title_en: '', title_ar: '', text_en: '', text_ar: ''}])}
          className="rounded-full bg-mist px-5 py-2 text-sm font-bold text-navy"
        >
          + إضافة بطاقة
        </button>
      </section>
      <button className="rounded-full bg-navy px-6 py-2 font-bold text-snow md:col-span-2 md:w-fit">حفظ</button>
    </form>
  );
}
