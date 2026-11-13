import {notFound} from 'next/navigation';
import {eq} from 'drizzle-orm';
import {db} from '@/lib/db';
import {activities} from '@/lib/db/schema';
import ActivityForm from '@/components/admin/ActivityForm';
import {getLocale} from 'next-intl/server';
import {tr} from '@/lib/adminT';

export default async function Page({params}: {params: Promise<{id: string}>}) {
  const t = tr(await getLocale());
  const {id} = await params;
  const [a] = await db.select().from(activities).where(eq(activities.id, Number(id))).limit(1);
  if (!a) notFound();
  return (
    <div>
      <h1 className="mb-6 font-display text-3xl text-navy">{t.editActivity}</h1>
      <ActivityForm a={a} />
    </div>
  );
}
