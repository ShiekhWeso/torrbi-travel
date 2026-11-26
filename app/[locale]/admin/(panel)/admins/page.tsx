import {redirect} from 'next/navigation';
import {getLocale} from 'next-intl/server';
import {asc} from 'drizzle-orm';
import {db} from '@/lib/db';
import {admins} from '@/lib/db/schema';
import {getSession, isOwner} from '@/lib/auth';
import {tr} from '@/lib/adminT';
import {AddAdminForm, AdminRowActions} from '@/components/admin/AdminManagementForms';

export default async function AdminsPage() {
  const [locale, session] = await Promise.all([getLocale(), getSession()]);
  if (!session) redirect(`/${locale}/admin/login`);
  if (!isOwner(session)) redirect(`/${locale}/admin`);
  const t = tr('ar');
  const rows = await db.select({
    id: admins.id,
    email: admins.email,
    role: admins.role,
    lastLoginAt: admins.lastLoginAt,
    mustChangePassword: admins.mustChangePassword
  }).from(admins).orderBy(asc(admins.email));

  return (
    <div className="space-y-8">
      <h1 className="font-display text-3xl font-bold text-navy">{t.admins}</h1>
      <AddAdminForm />
      <section className="space-y-3">
        <h2 className="font-display text-xl font-bold text-navy">{t.adminAccounts}</h2>
        {rows.length === 0 && <p className="rounded-2xl bg-snow p-5 text-navy/60">{t.noAdmins}</p>}
        {rows.map((admin) => (
          <article key={admin.id} className="rounded-2xl bg-snow p-5 shadow-sm">
            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
              <div className="min-w-0">
                <p className="break-all font-bold text-navy">{admin.email}</p>
                <div className="mt-2 flex flex-wrap items-center gap-2 text-sm">
                  <span className={`rounded-full px-3 py-1 font-bold ${admin.role === 'owner' ? 'bg-brand-warm text-navy' : 'bg-mist text-navy'}`}>
                    {admin.role === 'owner' ? t.owner : t.staff}
                  </span>
                  <span className="text-navy/60">
                    {t.lastLogin}: {admin.lastLoginAt
                      ? new Intl.DateTimeFormat('ar', {dateStyle: 'medium', timeStyle: 'short'}).format(admin.lastLoginAt)
                      : t.never}
                  </span>
                  <span className="text-navy/60">
                    {admin.mustChangePassword ? t.mustChangePassword : t.active}
                  </span>
                </div>
              </div>
            </div>
            <AdminRowActions id={admin.id} role={admin.role} isSelf={admin.id === session.id} />
          </article>
        ))}
      </section>
    </div>
  );
}
