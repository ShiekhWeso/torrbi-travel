import {notFound} from 'next/navigation';
import {eq} from 'drizzle-orm';
import {db} from '@/lib/db';
import {destinations} from '@/lib/db/schema';
import DestinationForm from '@/components/admin/DestinationForm';

export default async function Page({params}: {params: Promise<{id: string}>}) {
  const {id} = await params;
  const [d] = await db.select().from(destinations).where(eq(destinations.id, Number(id))).limit(1);
  if (!d) notFound();
  return (
    <div>
      <h1 className="mb-6 font-display text-3xl text-navy">Edit destination</h1>
      <DestinationForm d={d} />
    </div>
  );
}