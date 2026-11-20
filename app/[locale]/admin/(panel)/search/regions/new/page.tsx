import SearchRegionForm from '@/components/admin/SearchRegionForm';
import {getLocale} from 'next-intl/server';
import {tr} from '@/lib/adminT';

export default async function Page() {
  const t = tr(await getLocale());
  return (
    <div>
      <h1 className="mb-6 font-display text-3xl text-navy">{t.newSearchRegion}</h1>
      <SearchRegionForm />
    </div>
  );
}
