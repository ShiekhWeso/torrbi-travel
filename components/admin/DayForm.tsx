import {saveDay, deleteDay} from '@/app/[locale]/admin/actions';
import type {packageDays} from '@/lib/db/schema';

type D = typeof packageDays.$inferSelect;
const inp = 'w-full rounded-lg border border-navy/20 bg-mist px-3 py-2 text-sm text-navy';

export default function DayForm({packageId, d, nextNo}: {packageId: number; d?: D; nextNo?: number}) {
  return (
    <div className="rounded-xl border border-navy/10 p-4">
      <form action={saveDay} className="grid gap-3 md:grid-cols-2">
        {d && <input type="hidden" name="id" value={d.id} />}
        <input type="hidden" name="packageId" value={packageId} />
        <input name="dayNo" type="number" placeholder="Day #" defaultValue={d?.dayNo ?? nextNo} required className={inp} />
        <input name="stage" placeholder="Stage / city" defaultValue={d?.stage ?? ''} className={inp} />
        <input name="title_en" placeholder="Title (EN)" defaultValue={d?.i18n.en.title} required className={inp} />
        <input name="title_ar" dir="rtl" placeholder="Title (AR)" defaultValue={d?.i18n.ar.title} required className={inp} />
        <textarea name="items_en" rows={3} placeholder="Items (EN), one per line" defaultValue={d?.i18n.en.items.join('\n')} className={inp} />
        <textarea name="items_ar" dir="rtl" rows={3} placeholder="Items (AR), one per line" defaultValue={d?.i18n.ar.items.join('\n')} className={inp} />
        <button className="w-fit rounded-full bg-navy px-5 py-2 text-sm font-bold text-snow">{d ? 'Save day' : '+ Add day'}</button>
      </form>
      {d && (
        <form action={deleteDay} className="mt-2">
          <input type="hidden" name="id" value={d.id} />
          <input type="hidden" name="packageId" value={packageId} />
          <button className="text-sm font-bold text-red-600">Delete day</button>
        </form>
      )}
    </div>
  );
}