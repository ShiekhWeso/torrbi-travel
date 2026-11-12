import {notFound} from 'next/navigation';
import {asc, eq} from 'drizzle-orm';
import {db} from '@/lib/db';
import {packages, packageDays} from '@/lib/db/schema';
import PackageForm from '@/components/admin/PackageForm';
import DayForm from '@/components/admin/DayForm';

export default async function Page({params}: {params: Promise<{id: string}>}) {
  const {id} = await params;
  const pid = Number(id);
  const [p] = await db.select().from(packages).where(eq(packages.id, pid)).limit(1);
  if (!p) notFound();
  const days = await db.select().from(packageDays).where(eq(packageDays.packageId, pid)).orderBy(asc(packageDays.dayNo));
  return (
    <div className="space-y-8">
      <div>
        <h1 className="mb-6 font-display text-3xl text-navy">Edit package</h1>
        <PackageForm p={p} />
      </div>
      <div>
        <h2 className="mb-4 font-display text-2xl text-navy">Itinerary days</h2>
        <div className="space-y-4 rounded-2xl bg-snow p-6">
          {days.map((d) => <DayForm key={d.id} packageId={pid} d={d} />)}
          <DayForm packageId={pid} nextNo={days.length + 1} />
        </div>
      </div>
    </div>
  );
}