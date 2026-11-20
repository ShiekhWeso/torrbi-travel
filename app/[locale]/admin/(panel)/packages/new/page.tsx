import PackageForm from '@/components/admin/PackageForm';
import {getLocale} from 'next-intl/server';
import {tr} from '@/lib/adminT';
import {asc} from 'drizzle-orm';
import {db} from '@/lib/db';
import {destinations, searchRegions} from '@/lib/db/schema';

export default async function Page() {
  const t = tr(await getLocale());
  const [destinationRows, regionRows] = await Promise.all([
    db.select({id: destinations.id, slug: destinations.slug, i18n: destinations.i18n})
      .from(destinations).orderBy(asc(destinations.id)),
    db.select({slug: searchRegions.slug, i18n: searchRegions.i18n})
      .from(searchRegions).orderBy(asc(searchRegions.sort), asc(searchRegions.id))
  ]);
  return (
    <div>
      <h1 className="mb-6 font-display text-3xl text-navy">{t.newPackage}</h1>
      <PackageForm destinations={destinationRows} regions={regionRows} />
    </div>
  );
}