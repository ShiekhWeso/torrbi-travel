import {db} from '@/lib/db';
import {packages} from '@/lib/db/schema';
import OfferForm from '@/components/admin/OfferForm';

export default async function Page() {
  const pkgs = await db.select({id: packages.id, i18n: packages.i18n}).from(packages);
  return (
    <div>
      <h1 className="mb-6 font-display text-3xl text-navy">New offer</h1>
      <OfferForm pkgs={pkgs} />
    </div>
  );
}