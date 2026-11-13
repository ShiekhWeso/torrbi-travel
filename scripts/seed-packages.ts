import 'dotenv/config';
import {eq, inArray, notInArray, sql} from 'drizzle-orm';
import {db} from '../lib/db';
import {packages, packageDays} from '../lib/db/schema';

type D = [string, string, string, string]; // enTitle, enLine, arTitle, arLine
type S = [string, string]; // en, ar
const KL: S = ['Kuala Lumpur', 'كوالالمبور'];
const BALI: S = ['Bali', 'بالي'];
const LKW: S = ['Langkawi', 'لنكاوي'];
const img = (f: string) => `/destinations/real/${f}.jpg`;

const arrive: D = ['Arrival in Kuala Lumpur', 'Airport pickup, hotel check-in and free time.', 'الوصول إلى كوالالمبور', 'استقبال من المطار، تسجيل الدخول ووقت حر.'];
const klTour: D = ['Kuala Lumpur highlights', 'Batu Caves, Negara Zoo, ATV and waterfalls, KLCC Aquarium, Petronas Towers.', 'اكتشاف معالم كوالالمبور', 'كهوف باتو، حديقة نيغارا، الدراجات الرباعية والشلالات، أكواريوم KLCC والبرجان التوأم.'];
const genting: D = ['Genting Highlands & French Village', 'Genting cable car, Chin Swee Temple, SkyAvenue and the French Village.', 'مرتفعات جنتنج والقرية الفرنسية', 'تلفريك جنتنج، معبد Chin Swee، SkyAvenue والقرية الفرنسية.'];
const safari: D = ["A'Famosa Safari", 'A day of wildlife, animal shows and fun activities.', 'سفاري أفاموسا', 'يوم من الحياة البرية وعروض الحيوانات والأنشطة الترفيهية.'];
const putra: D = ['Putrajaya & more', 'Thean Hou Temple, IOI City Mall, the Floating Mosque and a cow farm.', 'بوتراجايا ومعالم ماليزيا', 'معبد ثيان هو، IOI City Mall، مسجد بوتراجايا العائم ومزرعة الأبقار.'];
const free: D = ['Free day in Kuala Lumpur', 'Shopping, cafés and hotel relaxation at your own pace.', 'يوم حر في كوالالمبور', 'تسوق ومقاهٍ واسترخاء بالفندق على راحتك.'];
const free2: D = ['Free day & extras', 'Shopping, cafés and optional photo sessions.', 'يوم حر وتجارب إضافية', 'تسوق ومقاهٍ وجلسات تصوير اختيارية.'];
const home: D = ['Return home', 'Hotel check-out and private transfer to the airport.', 'العودة إلى الوطن', 'تسجيل الخروج والتوصيل الخاص إلى المطار.'];

const bali: [S, D][] = [
  [BALI, ['Flight to Bali', 'Private transfer, flight to Bali and hotel pickup.', 'من كوالالمبور إلى بالي', 'توصيل خاص، رحلة جوية إلى بالي والاستقبال في المطار.']],
  [BALI, ['Private villa & relaxation', 'A relaxed day at the luxury villa with its private pool.', 'استجمام في الكوخ الفاخر', 'يوم هادئ في الكوخ الفاخر مع المسبح الخاص.']],
  [BALI, ['Ubud & Kintamani', 'Monkey Forest, Tegenungan Waterfall, Tegallalang rice terraces, Mount Batur.', 'أوبود وكينتاماني', 'غابة القرود، شلال تيغينونغان، مدرجات الأرز وجبل باتور.']],
  [BALI, ['South Bali beaches', 'Nusa Dua, Pandawa, Jimbaran and the Uluwatu sunset Kecak dance.', 'شواطئ جنوب بالي', 'نوسا دوا، بانداوا، جيمباران وغروب أولواتو مع رقصة كيتشاك.']],
  [BALI, ['Lakes, mountains & waterfalls', 'Ulun Danu Beratan temple, spice garden, Munduk waterfall, coffee farms.', 'الجبال والبحيرات والشلالات', 'معبد أولون دانو، حديقة البهارات، شلال موندك ومزارع القهوة.']],
  [BALI, ['Islands & sea activities', 'Nusa Penida or Lembongan (weather permitting), snorkeling and optional water sports.', 'الجزر والأنشطة البحرية', 'نوسا بينيدا أو ليمبونغان حسب الطقس، سنوركلنغ وأنشطة بحرية اختيارية.']],
  [BALI, home]
];

const langkawi: [S, D][] = [
  [LKW, ['Flight to Langkawi', 'Flight to Langkawi, private transfer and beach time.', 'من كوالالمبور إلى لنكاوي', 'رحلة جوية إلى لنكاوي، توصيل خاص ووقت على الشاطئ.']],
  [LKW, ['Langkawi nature highlights', 'SkyCab, Sky Bridge, crocodile park, waterfalls, Underwater World, Eagle Square.', 'معالم لنكاوي الطبيعية', 'التلفريك، الجسر السماوي، حديقة التماسيح، الشلالات وعالم ما تحت الماء.']],
  [LKW, ['Sea adventure', 'Mangroves, caves, eagle watching, Pregnant Maiden Lake and Cenang Beach.', 'مغامرة بحرية', 'المانغروف والكهوف، النسور، بحيرة الحوامل وشاطئ سينانج.']],
  [LKW, home]
];

const pkgs = [
  {
    slug: 'malaysia-bali', days: 13, nights: 12, price: 1450, cover: img('terraces'),
    gallery: ['terraces', 'petronas', 'batu-1', 'farm', 'beach'].map(img),
    en: {
      title: 'Malaysia & Bali Package',
      intro: 'Thirteen days of luxury and relaxation between lively Kuala Lumpur and tropical Bali, with private tours and a villa with a private pool.',
      stay: ['Kuala Lumpur: 6 nights', 'Bali: 2 nights in a luxury villa with private pool', 'Bali: 4 nights in a 4-star hotel near the sea'],
      includes: ['Accommodation with daily breakfast', 'Airport pickup and drop-off', '7 private-car sightseeing tours', 'Flight Kuala Lumpur – Bali', 'Indonesia visa', 'Local SIM card per person'],
      highlights: ['Two destinations in one trip', '12 nights with daily breakfast', 'Luxury villa with private pool', 'Volcanoes, waterfalls and rice terraces', 'Uluwatu sunset and sea activities']
    },
    ar: {
      title: 'باكدج ماليزيا وبالي',
      intro: '13 يوماً من الفخامة والاستجمام بين كوالالمبور النابضة بالحياة وبالي الاستوائية، مع جولات خاصة وكوخ بمسبح خاص.',
      stay: ['كوالالمبور: 6 ليالٍ', 'بالي: ليلتان في كوخ فاخر مع مسبح خاص', 'بالي: 4 ليالٍ في فندق 4 نجوم قرب البحر'],
      includes: ['إقامة مع الإفطار اليومي', 'الاستقبال والتوديع من المطارات', '7 جولات سياحية بسيارة خاصة', 'طيران داخلي كوالالمبور – بالي', 'تأشيرة إندونيسيا', 'شريحة إنترنت لكل شخص'],
      highlights: ['وجهتان في رحلة واحدة', '12 ليلة مع الإفطار اليومي', 'كوخ فاخر مع مسبح خاص', 'البراكين والشلالات ومدرجات الأرز', 'غروب أولواتو والأنشطة البحرية']
    },
    itinerary: [...[arrive, klTour, genting, putra, free, free2].map((d) => [KL, d] as [S, D]), ...bali]
  },
  {
    slug: 'kuala-lumpur', days: 8, nights: 7, price: 780, cover: img('petronas'),
    gallery: ['petronas', 'batu-2', 'city-road', 'jungle', 'pavilion'].map(img),
    en: {
      title: 'Kuala Lumpur Package',
      intro: 'Eight relaxed days exploring Kuala Lumpur, Genting Highlands and Putrajaya, with private tours and free time for shopping.',
      stay: ['Kuala Lumpur: 7 nights in a 4-star hotel'],
      includes: ['4-star hotel with daily breakfast', 'Airport pickup and drop-off', '4 private-car sightseeing tours', 'Local SIM card per person'],
      highlights: ['7 nights in a 4-star hotel', 'Kuala Lumpur landmarks', 'Genting Highlands and cable car', "A'Famosa Safari adventure", '2 free days for shopping and relaxing']
    },
    ar: {
      title: 'باكدج كوالالمبور',
      intro: '8 أيام مريحة لاكتشاف كوالالمبور ومرتفعات جنتنج وبوتراجايا، مع جولات خاصة ووقت حر للتسوق.',
      stay: ['كوالالمبور: 7 ليالٍ في فندق 4 نجوم'],
      includes: ['فندق 4 نجوم مع الإفطار اليومي', 'الاستقبال والتوديع من المطار', '4 جولات سياحية بسيارة خاصة', 'شريحة إنترنت لكل شخص'],
      highlights: ['7 ليالٍ في فندق 4 نجوم', 'أشهر معالم كوالالمبور', 'مرتفعات جنتنج وتلفريكها', 'مغامرة سفاري أفاموسا', 'يومان حران للتسوق والاستجمام']
    },
    itinerary: [arrive, klTour, genting, safari, putra, free, free2, home].map((d) => [KL, d] as [S, D])
  },
  {
    slug: 'kl-langkawi', days: 10, nights: 9, price: 1050, cover: img('lagoon'),
    gallery: ['lagoon', 'beach', 'petronas', 'batu-1', 'pavilion'].map(img),
    en: {
      title: 'Kuala Lumpur & Langkawi Package',
      intro: "Ten days combining Kuala Lumpur's landmarks and Genting Highlands with Langkawi's beaches, cable car and sea adventures.",
      stay: ['Kuala Lumpur: 6 nights', 'Langkawi: 3 nights', 'Selected hotels with daily breakfast'],
      includes: ['Hotels with daily breakfast', 'Airport pickup and drop-off', '6 private-car sightseeing tours', 'Flight Kuala Lumpur – Langkawi', 'Local SIM cards for two'],
      highlights: ['Kuala Lumpur and Langkawi in one trip', '9 nights with daily breakfast', '6 private-car tours', "Genting and A'Famosa Safari", 'Langkawi SkyCab, Sky Bridge and sea adventure']
    },
    ar: {
      title: 'باكدج كوالالمبور ولنكاوي',
      intro: '10 أيام تجمع معالم كوالالمبور ومرتفعات جنتنج مع شواطئ لنكاوي وتلفريكها ومغامراتها البحرية.',
      stay: ['كوالالمبور: 6 ليالٍ', 'لنكاوي: 3 ليالٍ', 'فنادق مختارة مع الإفطار اليومي'],
      includes: ['فنادق مع الإفطار اليومي', 'الاستقبال والتوديع من المطارات', '6 جولات سياحية بسيارة خاصة', 'طيران داخلي كوالالمبور – لنكاوي', 'شرائح إنترنت لشخصين'],
      highlights: ['كوالالمبور ولنكاوي في رحلة واحدة', '9 ليالٍ مع الإفطار اليومي', '6 جولات بسيارات خاصة', 'جنتنج وسفاري أفاموسا', 'تلفريك لنكاوي والجسر السماوي والمغامرة البحرية']
    },
    itinerary: [...[arrive, klTour, genting, safari, putra, free].map((d) => [KL, d] as [S, D]), ...langkawi]
  }
];

const excludes = {
  en: ['International flights', 'Personal expenses and tips', 'Travel insurance', 'Meals and optional activities not listed'],
  ar: ['تذاكر الطيران الدولي', 'المصاريف الشخصية والإكراميات', 'التأمين الصحي للسفر', 'الوجبات والأنشطة الاختيارية غير المذكورة']
};

async function main() {
  const slugs = pkgs.map((p) => p.slug);
  await db.delete(packages).where(inArray(packages.slug, ['phuket', 'penang', 'georgia']));

  for (const [i, p] of pkgs.entries()) {
    const values = {
      slug: p.slug, days: p.days, nights: p.nights, priceUsd: p.price, region: 'asia',
      cover: p.cover, gallery: p.gallery, featured: true, published: true, sort: i,
      i18n: {en: {...p.en, excludes: excludes.en}, ar: {...p.ar, excludes: excludes.ar}}
    };
    const [row] = await db.insert(packages).values(values)
      .onConflictDoUpdate({target: packages.slug, set: values}).returning({id: packages.id});

    await db.delete(packageDays).where(eq(packageDays.packageId, row.id));
    for (const [n, [stage, d]] of p.itinerary.entries()) {
      await db.insert(packageDays).values({
        packageId: row.id, dayNo: n + 1, stage: stage[0],
        i18n: {
          en: {title: d[0], items: [d[1]], stage: stage[0]},
          ar: {title: d[2], items: [d[3]], stage: stage[1]}
        }
      });
    }
  }

  await db.update(packages).set({featured: false, sort: sql`10 + ${packages.id}`}).where(notInArray(packages.slug, slugs));
  console.log('Done');
  process.exit(0);
}
main().catch((e) => { console.error(e); process.exit(1); });