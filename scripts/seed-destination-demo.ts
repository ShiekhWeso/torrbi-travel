import 'dotenv/config';
import {asc, eq} from 'drizzle-orm';
import {db} from '../lib/db';
import {destinations} from '../lib/db/schema';

const localImages = [
  '/destinations/real/beach.jpg',
  '/destinations/real/city-road.jpg',
  '/destinations/real/jungle.jpg',
  '/destinations/real/lagoon.jpg'
];

const currencies: Record<string, string> = {
  indonesia: 'IDR',
  malaysia: 'MYR',
  türkiye: 'TRY',
  turkey: 'TRY',
  thailand: 'THB',
  vietnam: 'VND',
  azerbaijan: 'AZN',
  georgia: 'GEL'
};

const timezones: Record<string, string> = {
  indonesia: 'UTC+7',
  malaysia: 'UTC+8',
  türkiye: 'UTC+3',
  turkey: 'UTC+3',
  thailand: 'UTC+7',
  vietnam: 'UTC+7',
  azerbaijan: 'UTC+4',
  georgia: 'UTC+4'
};

const tipsEn = [
  'Book popular tours in advance',
  'Carry a light jacket for evenings',
  'Keep some local cash for small shops',
  'Try street food from busy stalls'
];

const tipsAr = [
  'احجز الجولات المشهورة مسبقاً',
  'خذ سترة خفيفة للمساء',
  'احتفظ بنقود محلية للمحلات الصغيرة',
  'جرّب أكل الشارع من الأكشاك المزدحمة'
];

function demoFeatures(nameEn: string, nameAr: string) {
  return {
    en: [
      {icon: 'restaurant', title: 'Local food', text: `Discover local dishes and food spots in ${nameEn}.`},
      {icon: 'beach_access', title: 'Nature & beaches', text: `Enjoy the natural scenery and beaches around ${nameEn}.`},
      {icon: 'museum', title: 'Culture & history', text: `Explore the culture and history of ${nameEn}.`},
      {icon: 'shopping_bag', title: 'Shopping', text: `Browse local shops and markets in ${nameEn}.`},
      {icon: 'hiking', title: 'Hiking trails', text: `Find scenic hiking trails near ${nameEn}.`},
      {icon: 'photo_camera', title: 'Photo spots', text: `Capture memorable views across ${nameEn}.`}
    ],
    ar: [
      {icon: 'restaurant', title: 'الأكل المحلي', text: `اكتشف الأطباق المحلية وأماكن الطعام في ${nameAr}.`},
      {icon: 'beach_access', title: 'الطبيعة والشواطئ', text: `استمتع بالطبيعة والشواطئ حول ${nameAr}.`},
      {icon: 'museum', title: 'الثقافة والتاريخ', text: `استكشف ثقافة ${nameAr} وتاريخها.`},
      {icon: 'shopping_bag', title: 'التسوق', text: `تجول في المتاجر والأسواق المحلية في ${nameAr}.`},
      {icon: 'hiking', title: 'مسارات المشي', text: `اكتشف مسارات المشي ذات المناظر الجميلة قرب ${nameAr}.`},
      {icon: 'photo_camera', title: 'أماكن التصوير', text: `التقط صوراً مميزة في أنحاء ${nameAr}.`}
    ]
  };
}

async function main() {
  const rows = await db.select().from(destinations).orderBy(asc(destinations.id));

  for (const [index, destination] of rows.entries()) {
    const country = destination.i18n.en.country.toLowerCase();
    const place = `${country} ${destination.slug.toLowerCase()}`;
    const findCountry = (values: Record<string, string>, fallback: string) =>
      Object.entries(values).find(([key]) => place.includes(key))?.[1] ?? fallback;
    const gallery = destination.image ? [destination.image] : [];
    for (let offset = 0; gallery.length < 4; offset += 1) {
      gallery.push(localImages[(index + offset) % localImages.length]);
    }
    const features = demoFeatures(destination.i18n.en.name, destination.i18n.ar.name);

    await db.update(destinations).set({
      currency: findCountry(currencies, 'USD'),
      timezone: findCountry(timezones, 'UTC+0'),
      gallery,
      i18n: {
        ...destination.i18n,
        en: {
          ...destination.i18n.en,
          language: 'Local language, English widely spoken',
          visa: 'Visa on arrival or e-visa available',
          tips: tipsEn,
          features: features.en
        },
        ar: {
          ...destination.i18n.ar,
          language: 'اللغة المحلية والإنجليزية منتشرة',
          visa: 'تأشيرة عند الوصول أو إلكترونية',
          tips: tipsAr,
          features: features.ar
        }
      }
    }).where(eq(destinations.id, destination.id));
  }

  console.log(`Updated ${rows.length} destinations`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
