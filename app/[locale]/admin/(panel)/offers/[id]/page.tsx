import {notFound} from 'next/navigation';
import {eq} from 'drizzle-orm';
import {db} from '@/lib/db';
import {offers, packages} from '@/lib/db/schema';
import OfferForm from '@/components/admin/OfferForm';
import PackageOfferForm from '@/components/admin/PackageOfferForm';
import {tr} from '@/lib/adminT';

export default async function Page({params}: {params: Promise<{id: string}>}) {
  const t = tr('ar');
  const {id} = await params;
  const [o] = await db.select().from(offers).where(eq(offers.id, Number(id))).limit(1);
  if (!o) notFound();
  const pkgs = await db.select({id: packages.id, i18n: packages.i18n}).from(packages);
  return (
    <div>
      <h1 className="mb-6 font-display text-3xl text-navy">{t.editOffer}</h1>
      {o.discountPercent != null ? <PackageOfferForm o={o} pkgs={pkgs} /> : <OfferForm o={o} pkgs={pkgs} />}
    </div>
  );
}