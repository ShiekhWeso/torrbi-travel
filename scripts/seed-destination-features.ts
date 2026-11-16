import 'dotenv/config';
import {eq} from 'drizzle-orm';
import {db} from '../lib/db';
import {destinations} from '../lib/db/schema';
import en from '../messages/en.json';
import ar from '../messages/ar.json';

const items = [
  ['restaurant', 'food'],
  ['beach_access', 'nature'],
  ['museum', 'culture'],
  ['shopping_bag', 'shopping']
] as const;

async function main() {
  const rows = await db.select().from(destinations);
  let updated = 0;

  for (const destination of rows) {
    if (destination.i18n.en.features?.length) continue;

    await db.update(destinations).set({
      i18n: {
        ...destination.i18n,
        en: {
          ...destination.i18n.en,
          features: items.map(([icon, key]) => ({
            icon,
            title: en.destinationDetail[key],
            text: en.destinationDetail[`${key}Text` as keyof typeof en.destinationDetail].replace('{name}', destination.i18n.en.name)
          }))
        },
        ar: {
          ...destination.i18n.ar,
          features: items.map(([icon, key]) => ({
            icon,
            title: ar.destinationDetail[key],
            text: ar.destinationDetail[`${key}Text` as keyof typeof ar.destinationDetail].replace('{name}', destination.i18n.ar.name)
          }))
        }
      }
    }).where(eq(destinations.id, destination.id));
    updated += 1;
  }

  console.log(`Updated ${updated} destinations`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
