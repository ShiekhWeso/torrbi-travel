import {asc, eq} from 'drizzle-orm';
import {db} from '@/lib/db';
import {packages, packageDays, destinations, activities, offers, faqs, settings, contactLinks, searchRegions, searchDurations} from '@/lib/db/schema';
import {DEFAULT_RATES, type Rates} from '@/lib/currency';

const lang = (l: string) => (l === 'ar' ? 'ar' : 'en');

export async function getRates(): Promise<Rates> {
  const [row] = await db.select().from(settings).where(eq(settings.key, 'rates')).limit(1);
  return {...DEFAULT_RATES, ...(row?.value ?? {}), USD: 1} as Rates;
}

export async function getSearchRegions(locale: string) {
  const l = lang(locale);
  const rows = await db.select().from(searchRegions)
    .where(eq(searchRegions.published, true))
    .orderBy(asc(searchRegions.sort), asc(searchRegions.id));
  return rows.map((row) => ({id: row.id, slug: row.slug, name: row.i18n[l].name}));
}
export type SearchRegion = Awaited<ReturnType<typeof getSearchRegions>>[number];

export async function getSearchDurations(locale: string) {
  const l = lang(locale);
  const rows = await db.select().from(searchDurations)
    .where(eq(searchDurations.published, true))
    .orderBy(asc(searchDurations.sort), asc(searchDurations.id));
  return rows.map((row) => ({
    id: row.id,
    minDays: row.minDays,
    maxDays: row.maxDays,
    label: row.i18n[l].label
  }));
}
export type SearchDuration = Awaited<ReturnType<typeof getSearchDurations>>[number];

export async function getPackages(locale: string) {
  const l = lang(locale);
  const rows = await db.select({package: packages, destination: destinations})
    .from(packages)
    .leftJoin(destinations, eq(packages.destinationId, destinations.id))
    .where(eq(packages.published, true))
    .orderBy(asc(packages.sort), asc(packages.id));
  const days = await db.select().from(packageDays).orderBy(asc(packageDays.dayNo));
  return rows.map((r) => {
    const pkg = r.package;
    const mine = days.filter((d) => d.packageId === pkg.id);
    return {
      id: pkg.slug, image: pkg.cover ?? '', days: pkg.days, nights: pkg.nights, price: pkg.priceUsd,
      childPrice: pkg.childPriceUsd, infantPrice: pkg.infantPriceUsd,
      region: pkg.region, featured: pkg.featured, gallery: pkg.gallery,
      destinationId: pkg.destinationId,
      destinationSlug: r.destination?.slug ?? null,
      destinationName: r.destination?.i18n[l].name ?? null,
      ...pkg.i18n[l],
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
    gallery: r.gallery, currency: r.currency, timezone: r.timezone,
    flight: r.flightHours ?? 0, temp: r.temp ?? '',
    best: [r.bestFrom ?? 1, r.bestTo ?? 12] as [number, number],
    ...r.i18n[l]
  }));
}
export type Dest = Awaited<ReturnType<typeof getDestinations>>[number];
export const getDestination = async (locale: string, slug: string) =>
  (await getDestinations(locale)).find((d) => d.id === slug) ?? null;

export async function getActivities(locale: string) {
  const l = lang(locale);
  const rows = await db.select().from(activities).where(eq(activities.published, true)).orderBy(asc(activities.sort), asc(activities.id));
  return rows.map((r) => ({
    id: r.slug, city: r.city, image: r.image ?? '', gallery: r.gallery,
    price: r.priceUsd, childPrice: r.childPriceUsd, infantPrice: r.infantPriceUsd,
    carPrice1: r.carPrice1Usd, carPrice2: r.carPrice2Usd, carPrice3: r.carPrice3Usd,
    durationHours: r.durationHours, featured: r.featured,
    ...r.i18n[l]
  }));
}
export type Activity = Awaited<ReturnType<typeof getActivities>>[number];
export const getActivity = async (locale: string, slug: string) =>
  (await getActivities(locale)).find((activity) => activity.id === slug) ?? null;

export async function getOffers(locale: string) {
  const l = lang(locale);
  const now = Date.now();
  const rows = await db
    .select({o: offers, slug: packages.slug, price: packages.priceUsd})
    .from(offers)
    .leftJoin(packages, eq(offers.packageId, packages.id))
    .where(eq(offers.published, true))
    .orderBy(asc(offers.sort), asc(offers.id));
  return rows
    .filter(({o}) =>
      (!o.validFrom || o.validFrom.getTime() <= now) &&
      (!o.validUntil || o.validUntil.getTime() + 86400000 >= now)
    )
    .map(({o, slug, price}) => ({
      id: o.id,
      image: o.image ?? '',
      slug,
      until: o.validUntil,
      price: price ?? null,
      discountPercent: o.discountPercent,
      salePrice: price != null && o.discountPercent != null
        ? Math.round(price * (100 - o.discountPercent) / 100)
        : null,
      ...o.i18n[l]
    }));
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

export async function getContactLinks() {
  return db.select().from(contactLinks)
    .where(eq(contactLinks.published, true))
    .orderBy(asc(contactLinks.sort), asc(contactLinks.id));
}