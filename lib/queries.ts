import {asc, eq} from 'drizzle-orm';
import {db} from '@/lib/db';
import {packages, packageDays, destinations} from '@/lib/db/schema';

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
      stops: mine.map((d) => d.i18n[l].title),
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