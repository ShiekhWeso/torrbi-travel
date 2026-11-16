import {pgTable, serial, text, integer, boolean, jsonb, timestamp, real, date, index, uniqueIndex} from 'drizzle-orm/pg-core';

export type Lang = 'ar' | 'en';

export const packages = pgTable('packages', {
  id: serial('id').primaryKey(),
  slug: text('slug').notNull().unique(),
  days: integer('days').notNull(),
  nights: integer('nights').notNull(),
  priceUsd: integer('price_usd'),
  childPriceUsd: integer('child_price_usd'),
  infantPriceUsd: integer('infant_price_usd'),
  region: text('region').notNull().default('asia'),
  cover: text('cover'),
  gallery: jsonb('gallery').$type<string[]>().notNull().default([]),
  featured: boolean('featured').notNull().default(false),
  published: boolean('published').notNull().default(true),
  sort: integer('sort').notNull().default(0),
  i18n: jsonb('i18n')
    .$type<Record<Lang, {title: string; intro: string; stay: string[]; includes: string[]; excludes: string[]; highlights: string[]; policies?: string[]; features?: {icon: string; title: string; text: string}[]}>>()
    .notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull()
});

export const packageDays = pgTable('package_days', {
  id: serial('id').primaryKey(),
  packageId: integer('package_id').notNull().references(() => packages.id, {onDelete: 'cascade'}),
  dayNo: integer('day_no').notNull(),
  stage: text('stage'),
  i18n: jsonb('i18n').$type<Record<Lang, {title: string; items: string[]; stage?: string}>>().notNull()
});

export const destinations = pgTable('destinations', {
  id: serial('id').primaryKey(),
  slug: text('slug').notNull().unique(),
  region: text('region').notNull().default('asia'),
  image: text('image'),
  rating: real('rating'),
  flightHours: integer('flight_hours'),
  temp: text('temp'),
  bestFrom: integer('best_from'),
  bestTo: integer('best_to'),
  published: boolean('published').notNull().default(true),
  sort: integer('sort').notNull().default(0),
  i18n: jsonb('i18n').$type<Record<Lang, {name: string; country: string; about: string}>>().notNull()
});

export const activities = pgTable('activities', {
  id: serial('id').primaryKey(),
  slug: text('slug').notNull().unique(),
  city: text('city').notNull(),
  image: text('image'),
  gallery: jsonb('gallery').$type<string[]>().notNull().default([]),
  priceUsd: integer('price_usd'),
  childPriceUsd: integer('child_price_usd'),
  infantPriceUsd: integer('infant_price_usd'),
  durationHours: integer('duration_hours'),
  featured: boolean('featured').notNull().default(false),
  published: boolean('published').notNull().default(true),
  sort: integer('sort').notNull().default(0),
  i18n: jsonb('i18n')
    .$type<Record<Lang, {title: string; description: string; includes: string[]; highlights: string[]; policies?: string[]}>>()
    .notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull()
});

export const offers = pgTable('offers', {
  id: serial('id').primaryKey(),
  image: text('image'),
  packageId: integer('package_id').references(() => packages.id, {onDelete: 'set null'}),
  validUntil: timestamp('valid_until'),
  published: boolean('published').notNull().default(true),
  sort: integer('sort').notNull().default(0),
  i18n: jsonb('i18n').$type<Record<Lang, {title: string; text: string; badge: string}>>().notNull()
});

export const faqs = pgTable('faqs', {
  id: serial('id').primaryKey(),
  published: boolean('published').notNull().default(true),
  sort: integer('sort').notNull().default(0),
  i18n: jsonb('i18n').$type<Record<Lang, {question: string; answer: string}>>().notNull()
});

export const admins = pgTable('admins', {
  id: serial('id').primaryKey(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull()
});

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  firstName: text('first_name'),
  lastName: text('last_name'),
  nationality: text('nationality'),
  email: text('email').notNull().unique(),
  name: text('name').notNull(),
  phone: text('phone'),
  passwordHash: text('password_hash'), // null for Google-only accounts
  googleId: text('google_id').unique(),
  createdAt: timestamp('created_at').defaultNow().notNull()
});

export const pageViews = pgTable('page_views', {
  id: serial('id').primaryKey(),
  visitorId: text('visitor_id').notNull(),
  userId: integer('user_id').references(() => users.id, {onDelete: 'set null'}),
  path: text('path').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull()
}, (table) => [
  index('page_views_created_at_idx').on(table.createdAt),
  index('page_views_user_id_idx').on(table.userId)
]);

export const favorites = pgTable('favorites', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id, {onDelete: 'cascade'}),
  kind: text('kind').$type<'package' | 'activity'>().notNull(),
  packageId: integer('package_id').references(() => packages.id, {onDelete: 'cascade'}),
  activityId: integer('activity_id').references(() => activities.id, {onDelete: 'cascade'}),
  createdAt: timestamp('created_at').defaultNow().notNull()
}, (table) => [
  uniqueIndex('favorites_user_kind_package_activity_unique').on(table.userId, table.kind, table.packageId, table.activityId)
]);

export const bookings = pgTable('bookings', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id, {onDelete: 'cascade'}),
  kind: text('kind').$type<'package' | 'activity'>().notNull().default('package'),
  packageId: integer('package_id').references(() => packages.id, {onDelete: 'set null'}),
  activityId: integer('activity_id').references(() => activities.id, {onDelete: 'set null'}),
  packageTitle: text('package_title').notNull(),
  travelDate: date('travel_date').notNull(),
  returnDate: date('return_date'),
  pax: integer('pax').notNull(),
  adults: integer('adults'),
  children: integer('children'),
  infants: integer('infants'),
  notes: text('notes'),
  phone: text('phone'),
  lang: text('lang').notNull().default('en'),
  totalUsd: integer('total_usd'),
  status: text('status').notNull().default('pending'),
  createdAt: timestamp('created_at').defaultNow().notNull()
});

export const settings = pgTable('settings', {
  key: text('key').primaryKey(),
  value: jsonb('value').$type<Record<string, number>>().notNull()
});