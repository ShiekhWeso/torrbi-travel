import PackageForm from '@/components/admin/PackageForm';
import {getLocale} from 'next-intl/server';
import {tr} from '@/lib/adminT';

export default async function Page() {
  const t = tr(await getLocale());
  return (
    <div>
      <h1 className="mb-6 font-display text-3xl text-navy">{t.newPackage}</h1>
      <PackageForm />
    </div>
  );
}