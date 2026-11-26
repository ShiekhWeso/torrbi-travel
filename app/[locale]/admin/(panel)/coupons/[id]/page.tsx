import {notFound} from 'next/navigation';
import {and, count, desc, eq, ne} from 'drizzle-orm';
import {db} from '@/lib/db';
import {activities, bookings, couponRedemptions, coupons, packages, users} from '@/lib/db/schema';
import CouponForm from '@/components/admin/CouponForm';
import CouponEmailSender from '@/components/admin/CouponEmailSender';
import {tr} from '@/lib/adminT';
import {bookingRef} from '@/lib/bookingRef';
import {Link} from '@/i18n/navigation';

export default async function Page({params}: {params: Promise<{id: string}>}) {
  const t = tr('ar');
  const {id} = await params;
  const couponId = Number(id);
  if (!Number.isInteger(couponId) || couponId < 1) notFound();
  const [coupon] = await db.select().from(coupons).where(eq(coupons.id, couponId)).limit(1);
  if (!coupon) notFound();
  const [pkgs, acts, customers, redemptions, previousUses, [{total: useCount}], couponBookings] = await Promise.all([
    db.select({id: packages.id, i18n: packages.i18n}).from(packages),
    db.select({id: activities.id, i18n: activities.i18n}).from(activities),
    db.select({id: users.id, name: users.name, email: users.email, nationality: users.nationality}).from(users).orderBy(users.name),
    db.select({userId: couponRedemptions.userId}).from(couponRedemptions).where(eq(couponRedemptions.couponId, coupon.id)),
    db.select({userId: bookings.userId}).from(bookings).where(and(
      eq(bookings.couponCode, coupon.code),
      ne(bookings.status, 'cancelled')
    )),
    db.select({total: count()}).from(bookings).where(eq(bookings.couponCode, coupon.code)),
    db.select({booking: bookings, customerName: users.name})
      .from(bookings)
      .innerJoin(users, eq(bookings.userId, users.id))
      .where(eq(bookings.couponCode, coupon.code))
      .orderBy(desc(bookings.createdAt))
      .limit(100)
  ]);
  const usedUserIds = [...new Set([...redemptions, ...previousUses].map(({userId}) => userId))];
  return (
    <div>
      <h1 className="mb-6 font-display text-3xl text-navy">{t.editCoupon}</h1>
      <CouponForm coupon={coupon} pkgs={pkgs} acts={acts} />
      <section className="mt-8 rounded-2xl bg-snow p-6">
        <h2 className="mb-4 font-display text-2xl text-navy">{t.sendCouponByEmail}</h2>
        <CouponEmailSender couponId={coupon.id} customers={customers} usedUserIds={usedUserIds} />
      </section>
      <section className="mt-8">
        <h2 className="mb-2 font-display text-2xl font-bold text-navy">{t.usedBy}</h2>
        <p className="mb-4 text-sm text-navy/60">{t.couponUseCount.replace('{count}', String(useCount))}</p>
        {couponBookings.length === 0 ? (
          <p className="rounded-2xl bg-snow p-6 text-navy/60">{t.notUsedYet}</p>
        ) : (
          <div className="overflow-x-auto rounded-2xl bg-snow">
            <table className="w-full min-w-[700px] text-start text-sm">
              <thead className="border-b border-navy/10 text-navy/60">
                <tr>
                  <th className="px-4 py-3 font-bold">{t.name}</th>
                  <th className="px-4 py-3 font-bold">{t.bookingReference}</th>
                  <th className="px-4 py-3 font-bold">{t.status}</th>
                  <th className="px-4 py-3 font-bold">{t.discount}</th>
                  <th className="px-4 py-3 font-bold">{t.date}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-navy/10">
                {couponBookings.map(({booking, customerName}) => (
                  <tr key={booking.id}>
                    <td className="px-4 py-3 font-bold text-navy">
                      <Link href={`/admin/customers/${booking.userId}`} className="underline">{customerName}</Link>
                    </td>
                    <td className="px-4 py-3 text-navy">
                      <Link href="/admin/bookings" className="underline">{bookingRef(booking.id)}</Link>
                    </td>
                    <td className="px-4 py-3 text-navy/70">
                      {booking.status === 'pending' ? t.pending : booking.status === 'confirmed' ? t.confirmed : booking.status === 'cancelled' ? t.cancelled : booking.status}
                    </td>
                    <td className="px-4 py-3 text-navy/70">{booking.discountUsd == null ? '—' : `-$${booking.discountUsd} USD`}</td>
                    <td className="px-4 py-3 text-navy/70">{booking.createdAt.toLocaleDateString('ar')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
