import 'dotenv/config';
import {isNull, sql} from 'drizzle-orm';
import {db} from '../lib/db';
import {activities} from '../lib/db/schema';

async function main() {
  const updated = await db.update(activities).set({
    carPrice1Usd: sql`coalesce(${activities.carPrice1Usd}, 60)`,
    carPrice2Usd: sql`coalesce(${activities.carPrice2Usd}, 85)`,
    carPrice3Usd: sql`coalesce(${activities.carPrice3Usd}, 120)`
  }).where(isNull(activities.carPrice1Usd)).returning({id: activities.id});

  console.log(`Seeded car prices for ${updated.length} activities.`);
  process.exit(0);
}

main().catch((e) => {
  console.error('FAILED:', e);
  process.exit(1);
});
