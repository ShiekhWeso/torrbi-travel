'use server';

import {and, desc, eq, ne} from 'drizzle-orm';
import {revalidatePath} from 'next/cache';
import {getCurrentUser} from '@/lib/auth';
import {db} from '@/lib/db';
import {activities, activityReviews, bookings, users} from '@/lib/db/schema';

type SaveReviewInput = {
  activityId: number;
  rating: number;
  comment: string;
};

export async function saveReview({activityId, rating, comment}: SaveReviewInput) {
  const user = await getCurrentUser();
  if (!user) throw new Error('You must be logged in to submit a review');
  if (!Number.isInteger(activityId) || activityId < 1) throw new Error('Invalid activity');
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) throw new Error('Rating must be an integer from 1 to 5');
  if (typeof comment !== 'string' || comment.length > 1000) throw new Error('Review comment must be 1000 characters or fewer');

  const [activity] = await db.select({id: activities.id}).from(activities)
    .where(eq(activities.id, activityId)).limit(1);
  if (!activity) throw new Error('Activity not found');

  const [booking] = await db.select({id: bookings.id}).from(bookings).where(and(
    eq(bookings.userId, user.id),
    eq(bookings.activityId, activityId),
    eq(bookings.kind, 'activity'),
    ne(bookings.status, 'cancelled')
  )).limit(1);
  if (!booking) throw new Error('Only customers with a non-cancelled booking can review this activity');

  await db.insert(activityReviews).values({
    activityId,
    userId: user.id,
    rating,
    comment: comment.trim()
  }).onConflictDoUpdate({
    target: [activityReviews.activityId, activityReviews.userId],
    set: {rating, comment: comment.trim(), hidden: false}
  });
  revalidatePath('/', 'layout');
}

export async function getActivityReviews(activityId: number) {
  if (!Number.isInteger(activityId) || activityId < 1) throw new Error('Invalid activity');
  const reviews = await db.select({
    id: activityReviews.id,
    rating: activityReviews.rating,
    comment: activityReviews.comment,
    createdAt: activityReviews.createdAt,
    reviewerFirstName: users.firstName
  }).from(activityReviews)
    .innerJoin(users, eq(activityReviews.userId, users.id))
    .where(and(eq(activityReviews.activityId, activityId), eq(activityReviews.hidden, false)))
    .orderBy(desc(activityReviews.createdAt));
  const count = reviews.length;
  const averageRating = count
    ? reviews.reduce((total, review) => total + review.rating, 0) / count
    : 0;

  return {
    reviews: reviews.map(({reviewerFirstName, ...review}) => ({
      ...review,
      reviewerFirstName: reviewerFirstName?.trim() || 'Traveler'
    })),
    averageRating,
    count
  };
}
