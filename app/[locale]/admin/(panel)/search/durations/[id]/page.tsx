import {notFound} from 'next/navigation';
import {eq} from 'drizzle-orm';
import {db} from '@/lib/db';
import {searchDurations} from '@/lib/db/schema';
import SearchDurationForm from '@/components/admin/SearchDurationForm';
import {tr} from '@/lib/adminT';

export default async function Page({params}: {params: Promise<{id: string}>}) {
  const t = tr('ar');
  const {id} = await params;
  const durationId = Number(id);
  if (!Number.isSafeInteger(durationId) || durationId < 1) notFound();
  const [duration] = await db.select().from(searchDurations).where(eq(searchDurations.id, durationId)).limit(1);
  if (!duration) notFound();
  return (
    <div>
      <h1 className="mb-6 font-display text-3xl text-navy">{t.editSearchDuration}</h1>
      <SearchDurationForm duration={duration} />
    </div>
  );
}
