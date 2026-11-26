import {Link} from '@/i18n/navigation';
import {tr} from '@/lib/adminT';
import {asc} from 'drizzle-orm';
import {db} from '@/lib/db';
import {faqs} from '@/lib/db/schema';
import {deleteFaq} from '../../actions';
import ConfirmButton from '@/components/admin/ConfirmButton';

export default async function Page() {
  const t = tr('ar');
  const rows = await db.select().from(faqs).orderBy(asc(faqs.sort), asc(faqs.id));
  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-display text-3xl text-navy">{t.faq}</h1>
        <Link href="/admin/faqs/new" className="rounded-full bg-navy px-5 py-2 text-sm font-bold text-snow">{t.add}</Link>
      </div>
      <div className="divide-y divide-navy/10 rounded-2xl bg-snow">
        {rows.length === 0 && <p className="p-6 text-navy/60">{t.noItems}</p>}
        {rows.map((r) => (
          <div key={r.id} className="flex items-center justify-between gap-4 p-4">
            <div>
              <div className="font-bold text-navy">{r.i18n.ar.question}</div>
              <div className="text-xs text-navy/60">{r.published ? '' : t.hidden}</div>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Link href={`/admin/faqs/${r.id}`} className="font-bold text-navy underline">{t.edit}</Link>
              <form action={deleteFaq}>
                <input type="hidden" name="id" value={r.id} />
                <ConfirmButton className="font-bold text-red-600">{t.delete}</ConfirmButton>
              </form>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
