import {notFound} from 'next/navigation';
import {eq} from 'drizzle-orm';
import {db} from '@/lib/db';
import {searchRegions} from '@/lib/db/schema';
import SearchRegionForm from '@/components/admin/SearchRegionForm';
import {getLocale} from 'next-intl/server';
import {tr} from '@/lib/adminT';

export default async function Page({params}: {params: Promise<{id: string}>}) {
  const t = tr(await getLocale());
  const {id} = await params;
  const regionId = Number(id);
  if (!Number.isSafeInteger(regionId) || regionId < 1) notFound();
  const [region] = await db.select().from(searchRegions).where(eq(searchRegions.id, regionId)).limit(1);
  if (!region) notFound();
  return (
    <div>
      <h1 className="mb-6 font-display text-3xl text-navy">{t.editSearchRegion}</h1>
      <SearchRegionForm region={region} />
    </div>
  );
}
