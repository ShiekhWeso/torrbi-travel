import FaqForm from '@/components/admin/FaqForm';
import {getLocale} from 'next-intl/server';
import {tr} from '@/lib/adminT';

export default async function Page() {
  const t = tr(await getLocale());
  return (
    <div>
      <h1 className="mb-6 font-display text-3xl text-navy">{t.newFaq}</h1>
      <FaqForm />
    </div>
  );
}
