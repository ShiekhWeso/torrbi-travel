import 'dotenv/config';
import {readFileSync} from 'node:fs';
import {join} from 'node:path';
import {db} from '../lib/db';
import {destinations, packages, packageDays, offers} from '../lib/db/schema';
import {destinations as destList, packages as pkgList, destinationInfo} from '../lib/data';
import {packageDetails} from '../lib/packageDetails';

const load = (l: string) => JSON.parse(readFileSync(join(process.cwd(), 'messages', `${l}.json`), 'utf8'));
const M = {en: load('en'), ar: load('ar')};
type L = 'en' | 'ar';

const regionOf: Record<string, string> = {istanbul: 'turkey', azerbaijan: 'caucasus', georgia: 'caucasus'};
const fixImg = (s: string) => s.replace('kuala-lumpur.webp', 'kuala-lumpur.jpg');
const stopsOf = (l: L, id: string): string[] =>
  id === 'phuket' && l === 'en' ? ['Phi Phi', 'Patong', 'Old Town'] : M[l].packages.items[id].stops;
const stayOf = (l: L) => (l === 'en' ? ['3-4 star hotel with breakfast'] : ['فندق 3-4 نجوم مع الإفطار']);

async function main() {
  await db.delete(offers);
  await db.delete(packageDays);
  await db.delete(packages);
  await db.delete(destinations);

  // Destinations
  for (const [i, d] of destList.entries()) {
    const info = destinationInfo[d.id];
    const f = (l: L) => {
      const name = M[l].destinations.items[d.id].name;
      return {
        name,
        country: M[l].destinations.items[d.id].country,
        about: M[l].destinationDetail.aboutText.replaceAll('{name}', name)
      };
    };
    await db.insert(destinations).values({
      slug: d.id,
      region: regionOf[d.id] ?? 'asia',
      image: d.image,
      rating: info.rating,
      flightHours: info.flight,
      temp: info.temp,
      bestFrom: info.best[0],
      bestTo: info.best[1],
      sort: i,
      i18n: {en: f('en'), ar: f('ar')}
    });
  }

  // Packages + itinerary days
  const idBySlug: Record<string, number> = {};
  for (const [i, p] of pkgList.entries()) {
    const det = packageDetails[p.id];
    const f = (l: L) => ({
      title: M[l].packages.items[p.id].title,
      intro: det[l].description,
      stay: stayOf(l),
      includes: M[l].packageDetail.includesList as string[],
      excludes: M[l].packageDetail.excludesList as string[],
      highlights: M[l].packageDetail.highlightsList as string[]
    });
    const [row] = await db
      .insert(packages)
      .values({
        slug: p.id,
        days: p.days,
        nights: p.days - 1,
        priceUsd: p.priceNum,
        region: p.region,
        cover: p.image,
        gallery: det.gallery.map(fixImg),
        featured: i < 3,
        sort: i,
        i18n: {en: f('en'), ar: f('ar')}
      })
      .returning({id: packages.id});
    idBySlug[p.id] = row.id;

    const en = stopsOf('en', p.id);
    const ar = stopsOf('ar', p.id);
    for (const [n, stop] of en.entries()) {
      await db.insert(packageDays).values({
        packageId: row.id,
        dayNo: n + 1,
        stage: stop,
        i18n: {
          en: {title: stop, items: [M.en.packageDetail.stopText]},
          ar: {title: ar[n], items: [M.ar.packageDetail.stopText]}
        }
      });
    }
  }

  // Offers (sample)
  const until = new Date('2026-12-31');
  const sample = [
    {slug: 'bali', badge: ['-15%', 'خصم 15%'], title: ['Bali winter escape', 'هروب الشتاء إلى بالي'],
      text: ['Save on our 7-day Bali package for bookings this month.', 'وفّر على باكدج بالي لمدة 7 أيام للحجوزات هذا الشهر.']},
    {slug: 'istanbul', badge: ['Free tour', 'جولة مجانية'], title: ['Istanbul + free Bosphorus cruise', 'إسطنبول مع رحلة بوسفور مجانية'],
      text: ['Book the Istanbul package and get a Bosphorus cruise on us.', 'احجز باكدج إسطنبول واحصل على رحلة في البوسفور مجاناً.']},
    {slug: 'vietnam', badge: ['-10%', 'خصم 10%'], title: ['Vietnam early bird', 'عرض الحجز المبكر لفيتنام'],
      text: ['Book early and enjoy a better price on Vietnam.', 'احجز مبكراً واستمتع بسعر أفضل لفيتنام.']}
  ];
  for (const [i, o] of sample.entries()) {
    const pkg = pkgList.find((p) => p.id === o.slug)!;
    await db.insert(offers).values({
      image: pkg.image,
      packageId: idBySlug[o.slug],
      validUntil: until,
      sort: i,
      i18n: {
        en: {title: o.title[0], text: o.text[0], badge: o.badge[0]},
        ar: {title: o.title[1], text: o.text[1], badge: o.badge[1]}
      }
    });
  }

  console.log('Seeded:', destList.length, 'destinations,', pkgList.length, 'packages, 3 offers');
  process.exit(0);
}

main().catch((e) => {
  console.error('FAILED:', e);
  process.exit(1);
});