import {notFound} from 'next/navigation';
import {eq} from 'drizzle-orm';
import {db} from '@/lib/db';
import {faqs} from '@/lib/db/schema';
import FaqForm from '@/components/admin/FaqForm';
import {getLocale} from 'next-intl/server';
import {tr} from '@/lib/adminT';

export default async function Page({params}: {params: Promise<{id: string}>}) {
  const t = tr(await getLocale());
  const {id} = await params;
  const [faq] = await db.select().from(faqs).where(eq(faqs.id, Number(id))).limit(1);
  if (!faq) notFound();
  return (
    <div>
      <h1 className="mb-6 font-display text-3xl text-navy">{t.editFaq}</h1>
      <FaqForm faq={faq} />
    </div>
  );
}
