import {notFound} from 'next/navigation';
import {eq} from 'drizzle-orm';
import {db} from '@/lib/db';
import {contactLinks} from '@/lib/db/schema';
import ContactLinkForm from '@/components/admin/ContactLinkForm';
import {getLocale} from 'next-intl/server';
import {tr} from '@/lib/adminT';

export default async function Page({params}: {params: Promise<{id: string}>}) {
  const t = tr(await getLocale());
  const {id} = await params;
  const [link] = await db.select().from(contactLinks).where(eq(contactLinks.id, Number(id))).limit(1);
  if (!link) notFound();
  return (
    <div>
      <h1 className="mb-6 font-display text-3xl text-navy">{t.editContact}</h1>
      <ContactLinkForm link={link} />
    </div>
  );
}
