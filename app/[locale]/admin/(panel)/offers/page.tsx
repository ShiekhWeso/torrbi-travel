import Link from 'next/link';
import {asc} from 'drizzle-orm';
import {db} from '@/lib/db';
import {offers} from '@/lib/db/schema';
import {deleteOffer} from '../../actions';

export default async function Page() {
  const rows = await db.select().from(offers).orderBy(asc(offers.sort), asc(offers.id));
  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-display text-3xl text-navy">Offers</h1>
        <Link href="/en/admin/offers/new" className="rounded-full bg-navy px-5 py-2 text-sm font-bold text-snow">+ Add</Link>
      </div>
      <div className="divide-y divide-navy/10 rounded-2xl bg-snow">
        {rows.length === 0 && <p className="p-6 text-navy/60">No offers yet.</p>}
        {rows.map((r) => (
          <div key={r.id} className="flex items-center justify-between gap-4 p-4">
            <div>
              <div className="font-bold text-navy">{r.i18n.en.title} · {r.i18n.ar.title}</div>
              <div className="text-xs text-navy/60">{r.published ? '' : '(hidden)'}</div>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Link href={`/en/admin/offers/${r.id}`} className="font-bold text-navy underline">Edit</Link>
              <form action={deleteOffer}>
                <input type="hidden" name="id" value={r.id} />
                <button className="font-bold text-red-600">Delete</button>
              </form>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}