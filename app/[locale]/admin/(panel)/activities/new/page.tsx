import ActivityForm from '@/components/admin/ActivityForm';
import {tr} from '@/lib/adminT';

export default async function Page() {
  const t = tr('ar');
  return (
    <div>
      <h1 className="mb-6 font-display text-3xl text-navy">{t.newActivity}</h1>
      <ActivityForm />
    </div>
  );
}
