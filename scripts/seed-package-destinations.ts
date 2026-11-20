import 'dotenv/config';
import {and, asc, eq, isNull} from 'drizzle-orm';
import {db} from '../lib/db';
import {destinations, packages} from '../lib/db/schema';

async function main() {
  const [unassigned, allDestinations] = await Promise.all([
    db.select().from(packages).where(isNull(packages.destinationId)).orderBy(asc(packages.id)),
    db.select().from(destinations).orderBy(asc(destinations.id))
  ]);
  const unmatched: string[] = [];
  let updated = 0;

  for (const pkg of unassigned) {
    const text = `${pkg.slug} ${pkg.i18n.en.title}`.toLowerCase();
    const matches = allDestinations.filter((destination) =>
      [destination.slug, destination.i18n.en.name].some((value) => {
        const searchTerm = value.trim().toLowerCase();
        return searchTerm.length > 0 && text.includes(searchTerm);
      })
    );

    if (matches.length !== 1) {
      unmatched.push(`${pkg.slug} (${pkg.i18n.en.title})`);
      continue;
    }

    const [result] = await db.update(packages)
      .set({destinationId: matches[0].id})
      .where(and(eq(packages.id, pkg.id), isNull(packages.destinationId)))
      .returning({id: packages.id});
    if (result) updated += 1;
  }

  console.log(`Linked ${updated} packages to destinations.`);
  if (unmatched.length) {
    console.log('Packages without a unique destination match:');
    unmatched.forEach((pkg) => console.log(`- ${pkg}`));
  }
}

main().catch((error) => {
  console.error('Failed to seed package destinations:', error);
  process.exit(1);
});
