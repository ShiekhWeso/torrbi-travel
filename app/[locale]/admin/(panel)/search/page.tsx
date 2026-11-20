import {Link} from '@/i18n/navigation';
import {getLocale} from 'next-intl/server';
import {asc} from 'drizzle-orm';
import {db} from '@/lib/db';
import {searchDurations, searchRegions} from '@/lib/db/schema';
import {tr} from '@/lib/adminT';
import {deleteSearchDuration, deleteSearchRegion} from '../../actions';
import ConfirmButton from '@/components/admin/ConfirmButton';

export default async function Page() {
  const locale = await getLocale();
  const t = tr(locale);
  const [regions, durations] = await Promise.all([
    db.select().from(searchRegions).orderBy(asc(searchRegions.sort), asc(searchRegions.id)),
    db.select().from(searchDurations).orderBy(asc(searchDurations.sort), asc(searchDurations.id))
  ]);
  return (
    <div className="space-y-10">
      <h1 className="font-display text-3xl text-navy">{t.searchOptions}</h1>

      <section>
        <div className="mb-4 flex items-center justify-between gap-4">
          <h2 className="font-display text-2xl text-navy">{t.searchRegions}</h2>
          <Link href="/admin/search/regions/new" className="rounded-full bg-navy px-5 py-2 text-sm font-bold text-snow">{t.add}</Link>
        </div>
        <div className="divide-y divide-navy/10 rounded-2xl bg-snow">
          {regions.length === 0 && <p className="p-6 text-navy/60">{t.noItems}</p>}
          {regions.map((region) => (
            <div key={region.id} className="flex flex-wrap items-center justify-between gap-4 p-4">
              <div>
                <div className="font-bold text-navy">{region.i18n.en.name} · {region.i18n.ar.name}</div>
                <div className="text-xs text-navy/60">{region.slug} · {t.sort}: {region.sort} {region.published ? '' : t.hidden}</div>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Link href={`/admin/search/regions/${region.id}`} className="font-bold text-navy underline">{t.edit}</Link>
                <form action={deleteSearchRegion}>
                  <input type="hidden" name="id" value={region.id} />
                  <ConfirmButton className="font-bold text-red-600">{t.delete}</ConfirmButton>
                </form>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <div className="mb-4 flex items-center justify-between gap-4">
          <h2 className="font-display text-2xl text-navy">{t.searchDurations}</h2>
          <Link href="/admin/search/durations/new" className="rounded-full bg-navy px-5 py-2 text-sm font-bold text-snow">{t.add}</Link>
        </div>
        <div className="divide-y divide-navy/10 rounded-2xl bg-snow">
          {durations.length === 0 && <p className="p-6 text-navy/60">{t.noItems}</p>}
          {durations.map((duration) => (
            <div key={duration.id} className="flex flex-wrap items-center justify-between gap-4 p-4">
              <div>
                <div className="font-bold text-navy">{duration.i18n.en.label} · {duration.i18n.ar.label}</div>
                <div className="text-xs text-navy/60">
                  {t.minDays}: {duration.minDays ?? t.none} · {t.maxDays}: {duration.maxDays ?? t.none} · {t.sort}: {duration.sort} {duration.published ? '' : t.hidden}
                </div>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Link href={`/admin/search/durations/${duration.id}`} className="font-bold text-navy underline">{t.edit}</Link>
                <form action={deleteSearchDuration}>
                  <input type="hidden" name="id" value={duration.id} />
                  <ConfirmButton className="font-bold text-red-600">{t.delete}</ConfirmButton>
                </form>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
