import {Link} from '@/i18n/navigation';
import {getLocale} from 'next-intl/server';
import {tr} from '@/lib/adminT';
import {asc} from 'drizzle-orm';
import {db} from '@/lib/db';
import {activities} from '@/lib/db/schema';
import {deleteActivity} from '../../actions';

export default async function Page() {
  const t = tr(await getLocale());
  const rows = await db.select().from(activities).orderBy(asc(activities.sort), asc(activities.id));
  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-display text-3xl text-navy">{t.activities}</h1>
        <Link href="/admin/activities/new" className="rounded-full bg-navy px-5 py-2 text-sm font-bold text-snow">{t.add}</Link>
      </div>
      <div className="divide-y divide-navy/10 rounded-2xl bg-snow">
        {rows.length === 0 && <p className="p-6 text-navy/60">{t.noItems}</p>}
        {rows.map((r) => (
          <div key={r.id} className="flex items-center justify-between gap-4 p-4">
            <div>
              <div className="font-bold text-navy">{r.i18n.en.title} · {r.i18n.ar.title}</div>
              <div className="text-xs text-navy/60">{r.slug} {r.published ? '' : t.hidden}</div>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Link href={`/admin/activities/${r.id}`} className="font-bold text-navy underline">{t.edit}</Link>
              <form action={deleteActivity}>
                <input type="hidden" name="id" value={r.id} />
                <button className="font-bold text-red-600">{t.delete}</button>
              </form>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
