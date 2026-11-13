import 'dotenv/config';
import {db} from '../lib/db';
import {activities} from '../lib/db/schema';

const samples = [
  {
    slug: 'mount-batur-sunrise-trek',
    city: 'Bali',
    image: '/destinations/real/terraces.jpg',
    gallery: ['/destinations/real/terraces.jpg', '/destinations/real/jungle.jpg', '/destinations/real/beach.jpg'],
    priceUsd: 85,
    durationHours: 8,
    featured: true,
    sort: 0,
    i18n: {
      en: {
        title: 'Mount Batur sunrise trek',
        description: 'Hike before dawn to watch the sunrise from Mount Batur, with sweeping views across Bali.',
        includes: ['Hotel pickup', 'Local guide', 'Breakfast at the summit'],
        highlights: ['Sunrise over Bali', 'Volcanic summit views', 'Guided early-morning trek']
      },
      ar: {
        title: 'رحلة شروق الشمس إلى جبل باتور',
        description: 'انطلق قبل الفجر لمشاهدة شروق الشمس من جبل باتور والاستمتاع بإطلالات واسعة على بالي.',
        includes: ['النقل من الفندق', 'مرشد محلي', 'الإفطار عند القمة'],
        highlights: ['شروق الشمس فوق بالي', 'إطلالات القمة البركانية', 'رحلة صباحية بصحبة مرشد']
      }
    }
  },
  {
    slug: 'langkawi-island-hopping',
    city: 'Langkawi',
    image: '/destinations/real/lagoon.jpg',
    gallery: ['/destinations/real/lagoon.jpg', '/destinations/real/beach.jpg'],
    priceUsd: 45,
    durationHours: 4,
    featured: true,
    sort: 1,
    i18n: {
      en: {
        title: 'Langkawi island-hopping boat tour',
        description: 'Cruise between Langkawi islands and enjoy clear waters, quiet beaches, and tropical scenery.',
        includes: ['Boat transfer', 'Life jacket', 'Island stops'],
        highlights: ['Island-hopping cruise', 'Tropical lagoons', 'Relaxing beach time']
      },
      ar: {
        title: 'جولة بالقارب بين جزر لنكاوي',
        description: 'تنقل بالقارب بين جزر لنكاوي واستمتع بالمياه الصافية والشواطئ الهادئة والمناظر الاستوائية.',
        includes: ['النقل بالقارب', 'سترة نجاة', 'التوقف في الجزر'],
        highlights: ['رحلة بين الجزر', 'بحيرات استوائية', 'وقت للاسترخاء على الشاطئ']
      }
    }
  },
  {
    slug: 'batu-caves-kuala-lumpur-city-tour',
    city: 'Kuala Lumpur',
    image: '/destinations/real/batu-1.jpg',
    gallery: ['/destinations/real/batu-1.jpg', '/destinations/real/petronas.jpg', '/destinations/real/city-road.jpg'],
    priceUsd: 55,
    durationHours: 6,
    featured: true,
    sort: 2,
    i18n: {
      en: {
        title: 'Batu Caves & Kuala Lumpur city tour',
        description: 'Discover the colorful Batu Caves and Kuala Lumpur landmarks on a guided city outing.',
        includes: ['Hotel pickup', 'English-speaking guide', 'Air-conditioned transport'],
        highlights: ['Batu Caves', 'Petronas Towers photo stop', 'Kuala Lumpur city sights']
      },
      ar: {
        title: 'جولة كهوف باتو ومدينة كوالالمبور',
        description: 'اكتشف كهوف باتو الملونة ومعالم كوالالمبور في جولة بصحبة مرشد.',
        includes: ['النقل من الفندق', 'مرشد يتحدث الإنجليزية', 'مواصلات مكيفة'],
        highlights: ['كهوف باتو', 'التوقف للتصوير عند برجي بتروناس', 'معالم مدينة كوالالمبور']
      }
    }
  },
  {
    slug: 'genting-highlands-day-trip',
    city: 'Kuala Lumpur',
    image: '/destinations/real/jungle.jpg',
    gallery: ['/destinations/real/jungle.jpg', '/destinations/real/petronas.jpg', '/destinations/real/terraces.jpg'],
    priceUsd: 70,
    durationHours: 8,
    featured: false,
    sort: 3,
    i18n: {
      en: {
        title: 'Genting Highlands day trip',
        description: 'Escape to the cool mountain air of Genting Highlands for a full day of views and attractions.',
        includes: ['Round-trip transport', 'Hotel pickup', 'Free time at the resort'],
        highlights: ['Scenic mountain drive', 'Cool highland climate', 'Resort and shopping time']
      },
      ar: {
        title: 'رحلة يومية إلى مرتفعات جنتنج',
        description: 'استمتع بيوم كامل في أجواء مرتفعات جنتنج الباردة وإطلالاتها ومعالمها.',
        includes: ['مواصلات ذهاباً وإياباً', 'النقل من الفندق', 'وقت حر في المنتجع'],
        highlights: ['طريق جبلي ذو مناظر خلابة', 'أجواء المرتفعات المنعشة', 'وقت في المنتجع والتسوق']
      }
    }
  }
];

async function main() {
  for (const activity of samples) {
    await db.insert(activities).values(activity).onConflictDoUpdate({
      target: activities.slug,
      set: {
        city: activity.city,
        image: activity.image,
        gallery: activity.gallery,
        priceUsd: activity.priceUsd,
        durationHours: activity.durationHours,
        featured: activity.featured,
        published: true,
        sort: activity.sort,
        i18n: activity.i18n
      }
    });
  }
  console.log('Seeded:', samples.length, 'activities');
  process.exit(0);
}

main().catch((e) => {
  console.error('FAILED:', e);
  process.exit(1);
});
