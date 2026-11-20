import 'dotenv/config';
import {asc, count} from 'drizzle-orm';
import {db} from '../lib/db';
import {activities, activityReviews, users} from '../lib/db/schema';

const samples = [
  {rating: 5, comment: 'Our guide was friendly and made the day easy from start to finish.'},
  {rating: 4, comment: 'The experience was well organized and the views were wonderful.'},
  {rating: 5, comment: 'A memorable activity with a helpful team. I would happily recommend it.'}
];

async function main() {
  const [existing] = await db.select({value: count()}).from(activityReviews);
  if (existing.value > 0) {
    console.log('Skipped review seeding because reviews already exist.');
    return;
  }

  const [activityRows, userRows] = await Promise.all([
    db.select({id: activities.id}).from(activities).orderBy(asc(activities.id)),
    db.select({id: users.id}).from(users).orderBy(asc(users.id)).limit(3)
  ]);
  if (activityRows.length === 0) {
    console.log('No activities found; no reviews were inserted.');
    return;
  }
  if (userRows.length < 2) {
    throw new Error('At least two existing users are required to seed activity reviews.');
  }

  const reviews = activityRows.flatMap((activity, activityIndex) =>
    userRows.map((user, userIndex) => ({
      activityId: activity.id,
      userId: user.id,
      ...samples[(activityIndex + userIndex) % samples.length]
    }))
  );
  await db.insert(activityReviews).values(reviews).onConflictDoNothing();
  console.log(`Seeded ${reviews.length} activity reviews.`);
}

main().then(() => process.exit(0)).catch((error) => {
  console.error('FAILED:', error);
  process.exit(1);
});
