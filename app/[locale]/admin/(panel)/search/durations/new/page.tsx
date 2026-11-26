import SearchDurationForm from '@/components/admin/SearchDurationForm';
import {tr} from '@/lib/adminT';

export default async function Page() {
  const t = tr('ar');
  return (
    <div>
      <h1 className="mb-6 font-display text-3xl text-navy">{t.newSearchDuration}</h1>
      <SearchDurationForm />
    </div>
  );
}
