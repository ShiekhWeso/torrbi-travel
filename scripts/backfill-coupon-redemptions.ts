import 'dotenv/config';
import {and, eq, isNotNull, ne} from 'drizzle-orm';
import {db} from '../lib/db';
import {bookings, couponRedemptions, coupons} from '../lib/db/schema';

async function main() {
  const rows = await db.select({
    couponId: coupons.id,
    userId: bookings.userId,
    bookingId: bookings.id
  }).from(bookings)
    .innerJoin(coupons, eq(coupons.code, bookings.couponCode))
    .where(and(isNotNull(bookings.couponCode), ne(bookings.status, 'cancelled')));
  let inserted = 0;

  for (const redemption of rows) {
    const result = await db.insert(couponRedemptions).values(redemption)
      .onConflictDoNothing()
      .returning({id: couponRedemptions.id});
    inserted += result.length;
  }
  console.log(`Created ${inserted} coupon redemptions`);
}

main().catch((error) => {
  console.error('Failed to backfill coupon redemptions', error);
  process.exitCode = 1;
});
