import 'dotenv/config';
import {createInterface} from 'node:readline/promises';
import {stdin as input, stdout as output} from 'node:process';
import {count, sql} from 'drizzle-orm';
import {db} from '../lib/db';
import {
  activities,
  activityReviews,
  bookings,
  couponRedemptions,
  coupons,
  favorites,
  feedback,
  loginAttempts,
  offers,
  packages,
  pageViews,
  users
} from '../lib/db/schema';

const targetTables = [
  ['coupon_redemptions', couponRedemptions],
  ['bookings', bookings],
  ['activity_reviews', activityReviews],
  ['feedback', feedback],
  ['favorites', favorites],
  ['page_views', pageViews],
  ['login_attempts', loginAttempts],
  ['users', users]
] as const;

async function printCounts(label: string, values: Record<string, number>) {
  console.log(`\n${label}:`);
  for (const [name] of targetTables) {
    console.log(`  ${name}: ${values[name]}`);
  }
}

async function main() {
  const confirmed = process.argv.includes('--confirm');
  const result = await db.transaction(async (tx) => {
    const beforeEntries = await Promise.all(targetTables.map(async ([name, table]) => {
      const [row] = await tx.select({value: count()}).from(table);
      return [name, row.value] as const;
    }));
    const before = Object.fromEntries(beforeEntries) as Record<string, number>;
    await printCounts('Before', before);

    const [couponBefore] = await tx.select({value: count()}).from(coupons);
    console.log(`  coupons: ${couponBefore.value} rows (used_count will be reset to 0)`);

    if (!confirmed) {
      console.log('\nDRY RUN: no rows or sequences were changed.');
      for (const [name, tableCount] of beforeEntries) {
        if (tableCount > 0) console.log(`  would delete ${tableCount} row(s) from ${name}`);
      }

      await printCounts('After (dry run)', before);
      return {before, after: before};
    }

    const rl = createInterface({input, output});
    const answer = await rl.question('\nType DELETE to permanently delete test data: ');
    rl.close();
    if (answer.trim() !== 'DELETE') {
      throw new Error('Confirmation cancelled: deletion not performed.');
    }

    await tx.delete(couponRedemptions);
    await tx.delete(bookings);
    await tx.delete(activityReviews);
    await tx.delete(feedback);
    await tx.delete(favorites);
    await tx.delete(pageViews);
    await tx.delete(loginAttempts);
    await tx.delete(users);

    await tx.update(coupons).set({usedCount: 0});

    for (const [name] of targetTables) {
      await tx.execute(sql.raw(
        `SELECT setval(pg_get_serial_sequence('${name}', 'id'), 1, false)`
      ));
    }

    const afterEntries = await Promise.all(targetTables.map(async ([name, table]) => {
      const [row] = await tx.select({value: count()}).from(table);
      return [name, row.value] as const;
    }));
    const after = Object.fromEntries(afterEntries) as Record<string, number>;
    await printCounts('After', after);
    return {before, after};
  });

  console.log('\nLeftover review items:');

  const packageRows = await db.select({id: packages.id, slug: packages.slug, i18n: packages.i18n})
    .from(packages)
    .orderBy(packages.id);
  console.log('\nPackages:');
  for (const row of packageRows) {
    console.log(`  id=${row.id}, slug=${row.slug}, en.title=${row.i18n.en.title}`);
  }

  const activityRows = await db.select({id: activities.id, slug: activities.slug, i18n: activities.i18n})
    .from(activities)
    .orderBy(activities.id);
  console.log('\nActivities:');
  for (const row of activityRows) {
    console.log(`  id=${row.id}, slug=${row.slug}, en.title=${row.i18n.en.title}`);
  }

  const offerRows = await db.select({id: offers.id, i18n: offers.i18n})
    .from(offers)
    .orderBy(offers.id);
  console.log('\nOffers:');
  for (const row of offerRows) {
    console.log(`  id=${row.id}, en.title=${row.i18n.en.title}`);
  }

  const couponRows = await db.select({id: coupons.id, code: coupons.code, i18n: coupons.i18n})
    .from(coupons)
    .orderBy(coupons.id);
  console.log('\nCoupons:');
  for (const row of couponRows) {
    console.log(`  id=${row.id}, code=${row.code}, en.title=${row.i18n.en.title}`);
  }

  if (!confirmed) {
    console.log('\nDry run complete. Re-run with --confirm to make changes.');
  } else {
    console.log('\nTest data cleanup complete.');
  }
  void result;
  process.exit(0);
}

main().catch((error) => {
  console.error('FAILED:', error instanceof Error ? error.message : error);
  process.exit(1);
});
