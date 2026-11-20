import {notFound} from 'next/navigation';
import {asc, eq} from 'drizzle-orm';
import {db} from '@/lib/db';
import {packages, packageDays, destinations, searchRegions} from '@/lib/db/schema';
import PackageForm from '@/components/admin/PackageForm';
import DayForm from '@/components/admin/DayForm';
import {getLocale} from 'next-intl/server';
import {tr} from '@/lib/adminT';

export default async function Page({params}: {params: Promise<{id: string}>}) {
  const t = tr(await getLocale());
  const {id} = await params;
  const pid = Number(id);
  const [p] = await db.select().from(packages).where(eq(packages.id, pid)).limit(1);
  if (!p) notFound();
  const [days, destinationRows, regionRows] = await Promise.all([
    db.select().from(packageDays).where(eq(packageDays.packageId, pid)).orderBy(asc(packageDays.dayNo)),
    db.select({id: destinations.id, slug: destinations.slug, i18n: destinations.i18n})
      .from(destinations).orderBy(asc(destinations.id)),
    db.select({slug: searchRegions.slug, i18n: searchRegions.i18n})
      .from(searchRegions).orderBy(asc(searchRegions.sort), asc(searchRegions.id))
  ]);
  return (
    <div className="space-y-8">
      <div>
        <h1 className="mb-6 font-display text-3xl text-navy">{t.editPackage}</h1>
        <PackageForm p={p} destinations={destinationRows} regions={regionRows} />
      </div>
      <div>
        <h2 className="mb-4 font-display text-2xl text-navy">{t.itinerary}</h2>
        <div className="space-y-4 rounded-2xl bg-snow p-6">
          {days.map((d) => <DayForm key={d.id} packageId={pid} d={d} />)}
          <DayForm packageId={pid} nextNo={days.length + 1} />
        </div>
      </div>
    </div>
  );
}