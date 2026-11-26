import {Link} from '@/i18n/navigation';
import {asc} from 'drizzle-orm';
import {tr} from '@/lib/adminT';
import {db} from '@/lib/db';
import {contactLinks} from '@/lib/db/schema';
import {deleteContactLink, toggleContactLink} from '../../actions';
import ConfirmButton from '@/components/admin/ConfirmButton';

export default async function Page() {
  const t = tr('ar');
  const rows = await db.select().from(contactLinks).orderBy(asc(contactLinks.sort), asc(contactLinks.id));
  const sections = [
    {key: 'social', label: t.social},
    {key: 'direct', label: t.direct}
  ] as const;
  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-display text-3xl text-navy">{t.contact}</h1>
        <Link href="/admin/contact/new" className="rounded-full bg-navy px-5 py-2 text-sm font-bold text-snow">{t.add}</Link>
      </div>
      <div className="space-y-8">
        {sections.map(({key, label}) => {
          const sectionRows = rows.filter((row) => row.section === key);
          return (
            <section key={key}>
              <h2 className="mb-3 font-display text-2xl font-bold text-navy">{label}</h2>
              <div className="divide-y divide-navy/10 rounded-2xl bg-snow">
                {sectionRows.length === 0 && <p className="p-6 text-navy/60">{t.noItems}</p>}
                {sectionRows.map((row) => (
                  <div key={row.id} className="flex flex-wrap items-center justify-between gap-4 p-4">
                    <div className="min-w-0">
                      <div className="font-bold text-navy">{t[row.type]}</div>
                      <div className="break-all text-sm text-navy/70">{row.value}</div>
                      {!row.published && <div className="text-xs text-navy/60">{t.hidden}</div>}
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <form action={toggleContactLink}>
                        <input type="hidden" name="id" value={row.id} />
                        <input type="hidden" name="published" value={String(!row.published)} />
                        <button className={row.published ? 'font-bold text-emerald-700 underline' : 'font-bold text-red-600 underline'}>
                          {row.published ? t.published : t.hidden}
                        </button>
                      </form>
                      <Link href={`/admin/contact/${row.id}`} className="font-bold text-navy underline">{t.edit}</Link>
                      <form action={deleteContactLink}>
                        <input type="hidden" name="id" value={row.id} />
                        <ConfirmButton className="font-bold text-red-600">{t.delete}</ConfirmButton>
                      </form>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
