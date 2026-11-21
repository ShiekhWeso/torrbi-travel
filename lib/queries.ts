import {cache} from 'react';
import {unstable_cache} from 'next/cache';
import {and, asc, eq, inArray} from 'drizzle-orm';
import {db} from '@/lib/db';
import {
  packages,
  packageDays,
  destinations,
  activities,
  offers,
  faqs,
  settings,
  contactLinks,
  searchRegions,
  searchDurations,
  type Lang
} from '@/lib/db/schema';
import {DEFAULT_RATES, type Rates} from '@/lib/currency';
import {PUBLIC_CACHE_TAGS} from '@/lib/public-cache';

const lang = (locale: string): Lang => (locale === 'ar' ? 'ar' : 'en');

const readRates = unstable_cache(async (): Promise<Rates> => {
  const [row] = await db.select().from(settings).where(eq(settings.key, 'rates')).limit(1);
  return {...DEFAULT_RATES, ...(row?.value ?? {}), USD: 1} as Rates;
}, ['public-rates'], {tags: [PUBLIC_CACHE_TAGS.rates], revalidate: 3600});
export const getRates = cache(readRates);

const readSearchRegions = unstable_cache(async (locale: string) => {
  const l = lang(locale);
  const rows = await db.select().from(searchRegions)
    .where(eq(searchRegions.published, true))
    .orderBy(asc(searchRegions.sort), asc(searchRegions.id));
  return rows.map((row) => ({id: row.id, slug: row.slug, name: row.i18n[l].name}));
}, ['public-search-regions'], {tags: [PUBLIC_CACHE_TAGS.searchRegions], revalidate: 3600});
export const getSearchRegions = cache(readSearchRegions);
export type SearchRegion = Awaited<ReturnType<typeof getSearchRegions>>[number];

const readSearchDurations = unstable_cache(async (locale: string) => {
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
}, ['public-search-durations'], {tags: [PUBLIC_CACHE_TAGS.searchDurations], revalidate: 3600});
export const getSearchDurations = cache(readSearchDurations);
export type SearchDuration = Awaited<ReturnType<typeof getSearchDurations>>[number];

type PackageRow = typeof packages.$inferSelect;
type DestinationRow = typeof destinations.$inferSelect;
type PackageDayRow = typeof packageDays.$inferSelect;
type PackageWithDestination = {package: PackageRow; destination: DestinationRow | null};

function packageView(
  pkg: PackageRow,
  destination: DestinationRow | null,
  days: PackageDayRow[],
  locale: Lang
) {
  return {
    id: pkg.slug,
    databaseId: pkg.id,
    image: pkg.cover ?? '',
    days: pkg.days,
    nights: pkg.nights,
    price: pkg.priceUsd,
    childPrice: pkg.childPriceUsd,
    infantPrice: pkg.infantPriceUsd,
    region: pkg.region,
    featured: pkg.featured,
    gallery: pkg.gallery,
    destinationId: pkg.destinationId,
    destinationSlug: destination?.slug ?? null,
    destinationName: destination?.i18n[locale].name ?? null,
    ...pkg.i18n[locale],
    stops: [...new Set(days.map((day) => day.i18n[locale].stage ?? day.i18n[locale].title))],
    steps: days.map((day) => ({
      title: day.i18n[locale].title,
      text: day.i18n[locale].items.join(' · ')
    }))
  };
}

async function packageViews(rows: PackageWithDestination[], locale: Lang) {
  const packageIds = rows.map(({package: pkg}) => pkg.id);
  const days = packageIds.length
    ? await db.select().from(packageDays)
        .where(inArray(packageDays.packageId, packageIds))
        .orderBy(asc(packageDays.dayNo))
    : [];
  const daysByPackage = new Map<number, PackageDayRow[]>();
  for (const day of days) {
    const packageDaysList = daysByPackage.get(day.packageId) ?? [];
    packageDaysList.push(day);
    daysByPackage.set(day.packageId, packageDaysList);
  }
  return rows.map(({package: pkg, destination}) =>
    packageView(pkg, destination, daysByPackage.get(pkg.id) ?? [], locale)
  );
}

function packageRows() {
  return db.select({package: packages, destination: destinations})
    .from(packages)
    .leftJoin(destinations, eq(packages.destinationId, destinations.id));
}

const readPackages = unstable_cache(async (locale: string) => {
  const rows = await packageRows()
    .where(eq(packages.published, true))
    .orderBy(asc(packages.sort), asc(packages.id));
  return packageViews(rows, lang(locale));
}, ['public-packages'], {tags: [PUBLIC_CACHE_TAGS.packages], revalidate: 3600});
export const getPackages = cache(readPackages);
export type Pkg = Awaited<ReturnType<typeof getPackages>>[number];

const readHomePackages = unstable_cache(async (locale: string) => {
  const featured = await packageRows()
    .where(and(eq(packages.published, true), eq(packages.featured, true)))
    .orderBy(asc(packages.sort), asc(packages.id))
    .limit(3);
  const rows = featured.length ? featured : await packageRows()
    .where(eq(packages.published, true))
    .orderBy(asc(packages.sort), asc(packages.id))
    .limit(3);
  return packageViews(rows, lang(locale));
}, ['public-home-packages'], {tags: [PUBLIC_CACHE_TAGS.packages], revalidate: 3600});
export const getHomePackages = cache(readHomePackages);

const readPackage = unstable_cache(async (locale: string, slug: string): Promise<Pkg | null> => {
  const l = lang(locale);
  const [row] = await db.select({package: packages, destination: destinations})
    .from(packages)
    .leftJoin(destinations, eq(packages.destinationId, destinations.id))
    .where(and(eq(packages.published, true), eq(packages.slug, slug)))
    .limit(1);
  if (!row) return null;
  const days = await db.select().from(packageDays)
    .where(eq(packageDays.packageId, row.package.id))
    .orderBy(asc(packageDays.dayNo));
  return packageView(row.package, row.destination, days, l);
}, ['public-package'], {tags: [PUBLIC_CACHE_TAGS.packages], revalidate: 3600});
export const getPackage = cache(readPackage);

type DestinationViewRow = typeof destinations.$inferSelect;

function destinationView(row: DestinationViewRow, locale: Lang) {
  return {
    id: row.slug,
    image: row.image ?? '',
    region: row.region,
    rating: row.rating ?? 0,
    gallery: row.gallery,
    currency: row.currency,
    timezone: row.timezone,
    flight: row.flightHours ?? 0,
    temp: row.temp ?? '',
    best: [row.bestFrom ?? 1, row.bestTo ?? 12] as [number, number],
    ...row.i18n[locale]
  };
}

const readDestinations = unstable_cache(async (locale: string) => {
  const l = lang(locale);
  const rows = await db.select().from(destinations)
    .where(eq(destinations.published, true))
    .orderBy(asc(destinations.sort), asc(destinations.id));
  return rows.map((row) => destinationView(row, l));
}, ['public-destinations'], {tags: [PUBLIC_CACHE_TAGS.destinations], revalidate: 3600});
export const getDestinations = cache(readDestinations);
export type Dest = Awaited<ReturnType<typeof getDestinations>>[number];

const readDestination = unstable_cache(async (locale: string, slug: string): Promise<Dest | null> => {
  const [row] = await db.select().from(destinations)
    .where(and(eq(destinations.published, true), eq(destinations.slug, slug)))
    .limit(1);
  return row ? destinationView(row, lang(locale)) : null;
}, ['public-destination'], {tags: [PUBLIC_CACHE_TAGS.destinations], revalidate: 3600});
export const getDestination = cache(readDestination);

type ActivityRow = typeof activities.$inferSelect;

function activityView(row: ActivityRow, locale: Lang) {
  return {
    id: row.slug,
    databaseId: row.id,
    city: row.city,
    image: row.image ?? '',
    gallery: row.gallery,
    price: row.priceUsd,
    childPrice: row.childPriceUsd,
    infantPrice: row.infantPriceUsd,
    carPrice1: row.carPrice1Usd,
    carPrice2: row.carPrice2Usd,
    carPrice3: row.carPrice3Usd,
    durationHours: row.durationHours,
    featured: row.featured,
    ...row.i18n[locale]
  };
}

const readActivities = unstable_cache(async (locale: string) => {
  const rows = await db.select().from(activities)
    .where(eq(activities.published, true))
    .orderBy(asc(activities.sort), asc(activities.id));
  return rows.map((row) => activityView(row, lang(locale)));
}, ['public-activities'], {tags: [PUBLIC_CACHE_TAGS.activities], revalidate: 3600});
export const getActivities = cache(readActivities);
export type Activity = Awaited<ReturnType<typeof getActivities>>[number];

const readActivity = unstable_cache(async (locale: string, slug: string): Promise<Activity | null> => {
  const [row] = await db.select().from(activities)
    .where(and(eq(activities.published, true), eq(activities.slug, slug)))
    .limit(1);
  return row ? activityView(row, lang(locale)) : null;
}, ['public-activity'], {tags: [PUBLIC_CACHE_TAGS.activities], revalidate: 3600});
export const getActivity = cache(readActivity);

const readOffers = unstable_cache(async (locale: string) => {
  const l = lang(locale);
  const rows = await db
    .select({offer: offers, slug: packages.slug, price: packages.priceUsd})
    .from(offers)
    .leftJoin(packages, eq(offers.packageId, packages.id))
    .where(eq(offers.published, true))
    .orderBy(asc(offers.sort), asc(offers.id));
  return rows.map(({offer, slug, price}) => ({
    id: offer.id,
    image: offer.image ?? '',
    slug,
    validFrom: offer.validFrom?.toISOString() ?? null,
    until: offer.validUntil?.toISOString() ?? null,
    price: price ?? null,
    discountPercent: offer.discountPercent,
    salePrice: price != null && offer.discountPercent != null
      ? Math.round(price * (100 - offer.discountPercent) / 100)
      : null,
    ...offer.i18n[l]
  }));
}, ['public-offers'], {tags: [PUBLIC_CACHE_TAGS.offers, PUBLIC_CACHE_TAGS.packages], revalidate: 60});
export const getOffers = cache(async (locale: string) => {
  const now = Date.now();
  return (await readOffers(locale))
    .filter(({validFrom, until}) => {
      const start = validFrom === null ? null : new Date(validFrom);
      const end = until === null ? null : new Date(until);
      return (!start || (!Number.isNaN(start.getTime()) && start.getTime() <= now)) &&
        (!end || (!Number.isNaN(end.getTime()) && end.getTime() + 86400000 >= now));
    })
    .map(({validFrom: _validFrom, ...offer}) => offer);
});

const readFaqs = unstable_cache(async (locale: string) => {
  const l = lang(locale);
  const rows = await db.select().from(faqs)
    .where(eq(faqs.published, true))
    .orderBy(asc(faqs.sort), asc(faqs.id));
  return rows.map((row) => ({
    id: row.id,
    question: row.i18n[l].question,
    answer: row.i18n[l].answer
  }));
}, ['public-faqs'], {tags: [PUBLIC_CACHE_TAGS.faqs], revalidate: 3600});
export const getFaqs = cache(readFaqs);

const readContactLinks = unstable_cache(async () =>
  db.select().from(contactLinks)
    .where(eq(contactLinks.published, true))
    .orderBy(asc(contactLinks.sort), asc(contactLinks.id)),
['public-contact-links'], {tags: [PUBLIC_CACHE_TAGS.contactLinks], revalidate: 3600});
export const getContactLinks = cache(readContactLinks);
