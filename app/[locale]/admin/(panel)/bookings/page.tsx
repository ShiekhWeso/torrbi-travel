import {getLocale} from 'next-intl/server';
import {desc, eq} from 'drizzle-orm';
import {tr} from '@/lib/adminT';
import {db} from '@/lib/db';
import {bookings, users} from '@/lib/db/schema';
import {bookingRef} from '@/lib/bookingRef';
import {setBookingStatus} from '../../actions';

const st = {
  pending: {cls: 'bg-[#F2C14E]/25 text-[#8a6410]', bar: 'border-[#F2C14E]', icon: '⏳', en: 'Pending', ar: 'قيد الانتظار'},
  confirmed: {cls: 'bg-[#16a34a]/15 text-[#15803d]', bar: 'border-[#16a34a]', icon: '✔', en: 'Confirmed', ar: 'مؤكد'},
  cancelled: {cls: 'bg-[#ef4444]/15 text-[#b91c1c]', bar: 'border-[#ef4444]', icon: '✖', en: 'Cancelled', ar: 'ملغي'}
} as const;

export default async function Page() {
  const locale = await getLocale();
  const t = tr(locale);
  const i = locale === 'ar' ? 1 : 0;
  const rows = await db
    .select({b: bookings, name: users.name, email: users.email, phone: users.phone, nationality: users.nationality})
    .from(bookings)
    .innerJoin(users, eq(bookings.userId, users.id))
    .orderBy(desc(bookings.createdAt));

  const Field = ({k, v}: {k: string; v: React.ReactNode}) => (
    <div><span className="text-navy/50">{k}: </span><span className="font-semibold text-navy">{v || '-'}</span></div>
  );

  return (
    <div>
      <h1 className="mb-6 font-display text-3xl text-navy">{t.bookings}</h1>
      <div className="space-y-3">
        {rows.length === 0 && <p className="rounded-2xl bg-snow p-6 text-navy/60">{t.noItems}</p>}
        {rows.map(({b, name, email, phone, nationality}) => {
          const s = st[b.status as keyof typeof st] ?? st.pending;
          return (
            <div key={b.id} className={`rounded-2xl border-s-4 bg-snow p-4 ${s.bar}`}>
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2 font-bold text-navy">
                    {bookingRef(b.id)} · {b.packageTitle}
                    <span className="rounded-full bg-mist px-2 py-1 text-[10px] font-bold text-navy/70">
                      {b.kind === 'activity' ? (i ? 'نشاط' : 'Activity') : (i ? 'باكدج' : 'Package')}
                    </span>
                    <span className={`rounded-full px-3 py-1 text-xs ${s.cls}`}>{s.icon} {s[i ? 'ar' : 'en']}</span>
                  </div>
                  <div className="text-sm text-navy/70">{name} · {email}</div>
                  <div className="text-xs text-navy/60">
                    {b.travelDate} · {b.pax} · {b.totalUsd != null ? `$${b.totalUsd}` : '-'}
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  {b.status !== 'confirmed' && (
                    <form action={setBookingStatus}>
                      <input type="hidden" name="id" value={b.id} />
                      <button name="status" value="confirmed" className="rounded-full bg-[#16a34a] px-4 py-2 font-bold text-white">
                        {i ? 'تأكيد الحجز' : 'Confirm'}
                      </button>
                    </form>
                  )}
                  {b.status !== 'cancelled' && (
                    <form action={setBookingStatus}>
                      <input type="hidden" name="id" value={b.id} />
                      <button name="status" value="cancelled" className="rounded-full border border-red-500 px-4 py-2 font-bold text-red-600">
                        {i ? 'إلغاء الحجز' : 'Cancel'}
                      </button>
                    </form>
                  )}
                </div>
              </div>
              <details className="mt-3">
                <summary className="inline-block cursor-pointer rounded-full bg-mist px-4 py-1 text-sm font-bold text-navy">
                  {i ? 'التفاصيل' : 'Details'}
                </summary>
                <div className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
                  <Field k={t.name} v={name} />
                  <Field k={t.email} v={email} />
                  <Field k={t.phone} v={b.phone || phone && <a href={`tel:${b.phone || phone}`} className="underline">{b.phone || phone}</a>} />
                  <Field k={t.nationality} v={nationality} />
                  <Field k={t.travelDate} v={b.travelDate} />
                  <Field k={t.returnDate} v={b.returnDate} />
                  <Field k={t.adults} v={b.adults} />
                  <Field k={t.children} v={b.children} />
                  <Field k={t.infants} v={b.infants} />
                  <Field k={t.total} v={b.totalUsd != null ? `$${b.totalUsd}` : null} />
                  <Field k="Coupon" v={b.couponCode && `${b.couponCode} (-$${b.discountUsd ?? 0})`} />
                  <Field k="Lang" v={b.lang.toUpperCase()} />
                  <Field k="Created" v={b.createdAt.toLocaleString()} />
                  <div className="sm:col-span-2"><Field k={t.notes} v={b.notes} /></div>
                </div>
              </details>
            </div>
          );
        })}
      </div>
    </div>
  );
}