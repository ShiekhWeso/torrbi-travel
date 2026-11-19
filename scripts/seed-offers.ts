import 'dotenv/config';
import {and, eq, isNotNull, isNull} from 'drizzle-orm';
import {db} from '../lib/db';
import {offers} from '../lib/db/schema';

async function main() {
  const rows = await db.select({
    id: offers.id,
    packageId: offers.packageId,
    discountPercent: offers.discountPercent,
    badge: offers.i18n
  }).from(offers).where(and(isNotNull(offers.packageId), isNull(offers.discountPercent)));

  let updated = 0;
  for (const offer of rows) {
    const match = offer.badge.en.badge.match(/^-(\d+)%$/);
    if (!match) continue;

    const result = await db.update(offers)
      .set({discountPercent: Number(match[1])})
      .where(and(
        eq(offers.id, offer.id),
        isNotNull(offers.packageId),
        isNull(offers.discountPercent)
      ))
      .returning({id: offers.id});
    updated += result.length;
  }

  console.log(`Updated ${updated} offer${updated === 1 ? '' : 's'}.`);
  process.exit(0);
}

main().catch((e) => {
  console.error('FAILED:', e);
  process.exit(1);
});
