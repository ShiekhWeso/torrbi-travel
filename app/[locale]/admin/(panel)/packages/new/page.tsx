import PackageForm from '@/components/admin/PackageForm';

export default function Page() {
  return (
    <div>
      <h1 className="mb-6 font-display text-3xl text-navy">New package</h1>
      <PackageForm />
    </div>
  );
}