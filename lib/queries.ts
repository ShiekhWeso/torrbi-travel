import {asc, eq} from 'drizzle-orm';
import {db} from '@/lib/db';
import {packages, packageDays, destinations, offers, faqs} from '@/lib/db/schema';

const lang = (l: string) => (l === 'ar' ? 'ar' : 'en');

export async function getPackages(locale: string) {
  const l = lang(locale);
  const rows = await db.select().from(packages).where(eq(packages.published, true)).orderBy(asc(packages.sort), asc(packages.id));
  const days = await db.select().from(packageDays).orderBy(asc(packageDays.dayNo));
  return rows.map((r) => {
    const mine = days.filter((d) => d.packageId === r.id);
    return {
      id: r.slug, image: r.cover ?? '', days: r.days, nights: r.nights, price: r.priceUsd,
      region: r.region, featured: r.featured, gallery: r.gallery,
      ...r.i18n[l],
      stops: [...new Set(mine.map((d) => d.i18n[l].stage ?? d.i18n[l].title))],
      steps: mine.map((d) => ({title: d.i18n[l].title, text: d.i18n[l].items.join(' · ')}))
    };
  });
}
export type Pkg = Awaited<ReturnType<typeof getPackages>>[number];
export const getPackage = async (locale: string, slug: string) =>
  (await getPackages(locale)).find((p) => p.id === slug) ?? null;

export async function getDestinations(locale: string) {
  const l = lang(locale);
  const rows = await db.select().from(destinations).where(eq(destinations.published, true)).orderBy(asc(destinations.sort), asc(destinations.id));
  return rows.map((r) => ({
    id: r.slug, image: r.image ?? '', region: r.region, rating: r.rating ?? 0,
    flight: r.flightHours ?? 0, temp: r.temp ?? '',
    best: [r.bestFrom ?? 1, r.bestTo ?? 12] as [number, number],
    ...r.i18n[l]
  }));
}
export type Dest = Awaited<ReturnType<typeof getDestinations>>[number];
export const getDestination = async (locale: string, slug: string) =>
  (await getDestinations(locale)).find((d) => d.id === slug) ?? null;

export async function getOffers(locale: string) {
  const l = lang(locale);
  const rows = await db
    .select({o: offers, slug: packages.slug})
    .from(offers)
    .leftJoin(packages, eq(offers.packageId, packages.id))
    .where(eq(offers.published, true))
    .orderBy(asc(offers.sort), asc(offers.id));
  return rows
    .filter(({o}) => !o.validUntil || o.validUntil.getTime() + 86400000 >= Date.now())
    .map(({o, slug}) => ({id: o.id, image: o.image ?? '', slug, until: o.validUntil, ...o.i18n[l]}));
}

export async function getFaqs(locale: string) {
  const l = lang(locale);
  const rows = await db.select().from(faqs).where(eq(faqs.published, true)).orderBy(asc(faqs.sort), asc(faqs.id));
  return rows.map((row) => ({
    id: row.id,
    question: row.i18n[l].question,
    answer: row.i18n[l].answer
  }));
}