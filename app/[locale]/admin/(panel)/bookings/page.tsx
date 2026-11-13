import {getLocale} from 'next-intl/server';
import {desc, eq} from 'drizzle-orm';
import {tr} from '@/lib/adminT';
import {db} from '@/lib/db';
import {bookings, users} from '@/lib/db/schema';
import {bookingRef} from '@/lib/bookingRef';
import {setBookingStatus} from '../../actions';

const badge: Record<string, string> = {
  pending: 'bg-[#F2C14E]/25 text-[#8a6410]',
  confirmed: 'bg-[#16a34a]/15 text-[#15803d]',
  cancelled: 'bg-[#ef4444]/15 text-[#b91c1c]'
};
const label = {
  pending: ['Pending', 'قيد الانتظار'],
  confirmed: ['Confirmed', 'مؤكد'],
  cancelled: ['Cancelled', 'ملغي']
} as const;
const action = {
  confirmed: ['Confirm', 'تأكيد'],
  cancelled: ['Cancel', 'إلغاء'],
  pending: ['Set pending', 'إعادة للانتظار']
} as const;

export default async function Page() {
  const locale = await getLocale();
  const t = tr(locale);
  const i = locale === 'ar' ? 1 : 0;
  const rows = await db
    .select({b: bookings, name: users.name, email: users.email, phone: users.phone})
    .from(bookings)
    .innerJoin(users, eq(bookings.userId, users.id))
    .orderBy(desc(bookings.createdAt));

  return (
    <div>
      <h1 className="mb-6 font-display text-3xl text-navy">{t.bookings}</h1>
      <div className="divide-y divide-navy/10 rounded-2xl bg-snow">
        {rows.length === 0 && <p className="p-6 text-navy/60">{t.noItems}</p>}
        {rows.map(({b, name, email, phone}) => (
          <div key={b.id} className="flex flex-wrap items-center justify-between gap-4 p-4">
            <div className="space-y-1">
              <div className="font-bold text-navy">
                {bookingRef(b.id)} · {b.packageTitle}
                <span className="ms-2 rounded-full bg-mist px-2 py-1 text-[10px] font-bold text-navy/70">
                  {b.kind === 'activity' ? (i ? 'نشاط' : 'Activity') : (i ? 'باكدج' : 'Package')}
                </span>
                <span className={`ms-3 rounded-full px-3 py-1 text-xs ${badge[b.status] ?? ''}`}>
                  {(label[b.status as keyof typeof label] ?? [b.status, b.status])[i]}
                </span>
              </div>
              <div className="text-sm text-navy/70">
                {name} · {email}
                {phone && <> · <a href={`tel:${phone}`} className="underline">{phone}</a></>}
              </div>
              <div className="text-xs text-navy/60">
                {b.travelDate} · {b.pax} · {b.lang.toUpperCase()} · {b.totalUsd != null ? `$${b.totalUsd}` : '-'}
              </div>
            </div>
            <div className="flex items-center gap-3 text-sm">
              {(['confirmed', 'cancelled', 'pending'] as const)
                .filter((s) => s !== b.status)
                .map((s) => (
                  <form key={s} action={setBookingStatus}>
                    <input type="hidden" name="id" value={b.id} />
                    <button
                      name="status"
                      value={s}
                      className={`font-bold ${s === 'cancelled' ? 'text-red-600' : 'text-navy underline'}`}
                    >
                      {action[s][i]}
                    </button>
                  </form>
                ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}