import 'dotenv/config';
import {db} from '../lib/db';
import {searchDurations, searchRegions} from '../lib/db/schema';

async function main() {
  const [regionRows, durationRows] = await Promise.all([
    db.select({id: searchRegions.id}).from(searchRegions).limit(1),
    db.select({id: searchDurations.id}).from(searchDurations).limit(1)
  ]);

  if (regionRows.length === 0) {
    await db.insert(searchRegions).values([
      {slug: 'asia', sort: 1, published: true, i18n: {en: {name: 'Asia'}, ar: {name: 'آسيا'}}},
      {slug: 'turkey', sort: 2, published: true, i18n: {en: {name: 'Türkiye'}, ar: {name: 'تركيا'}}},
      {slug: 'caucasus', sort: 3, published: true, i18n: {en: {name: 'Caucasus'}, ar: {name: 'القوقاز'}}}
    ]);
  }

  if (durationRows.length === 0) {
    await db.insert(searchDurations).values([
      {
        sort: 1,
        published: true,
        minDays: null,
        maxDays: 5,
        i18n: {en: {label: 'Up to 5 days'}, ar: {label: 'حتى 5 أيام'}}
      },
      {
        sort: 2,
        published: true,
        minDays: 6,
        maxDays: 7,
        i18n: {en: {label: '6–7 days'}, ar: {label: '6–7 أيام'}}
      },
      {
        sort: 3,
        published: true,
        minDays: 8,
        maxDays: null,
        i18n: {en: {label: '8+ days'}, ar: {label: '8 أيام فأكثر'}}
      }
    ]);
  }

  console.log('Search options seeded where tables were empty.');
  process.exit(0);
}

main().catch((error) => {
  console.error('FAILED:', error);
  process.exit(1);
});
