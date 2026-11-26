import {pgTable, serial, text, integer, boolean, jsonb, timestamp, real, date, index, uniqueIndex} from 'drizzle-orm/pg-core';

export type Lang = 'ar' | 'en';

export const packages = pgTable('packages', {
  id: serial('id').primaryKey(),
  slug: text('slug').notNull().unique(),
  destinationId: integer('destination_id').references(() => destinations.id, {onDelete: 'set null'}),
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
}, (table) => [
  index('packages_published_sort_idx').on(table.published, table.sort),
  index('packages_destination_id_idx').on(table.destinationId)
]);

export const packageDays = pgTable('package_days', {
  id: serial('id').primaryKey(),
  packageId: integer('package_id').notNull().references(() => packages.id, {onDelete: 'cascade'}),
  dayNo: integer('day_no').notNull(),
  stage: text('stage'),
  i18n: jsonb('i18n').$type<Record<Lang, {title: string; items: string[]; stage?: string}>>().notNull()
}, (table) => [
  index('package_days_package_id_idx').on(table.packageId)
]);

export const destinations = pgTable('destinations', {
  id: serial('id').primaryKey(),
  slug: text('slug').notNull().unique(),
  region: text('region').notNull().default('asia'),
  image: text('image'),
  gallery: jsonb('gallery').$type<string[]>().notNull().default([]),
  currency: text('currency'),
  timezone: text('timezone'),
  rating: real('rating'),
  flightHours: integer('flight_hours'),
  temp: text('temp'),
  bestFrom: integer('best_from'),
  bestTo: integer('best_to'),
  published: boolean('published').notNull().default(true),
  sort: integer('sort').notNull().default(0),
  i18n: jsonb('i18n')
    .$type<Record<Lang, {
      name: string;
      country: string;
      about: string;
      language?: string;
      visa?: string;
      tips?: string[];
      features?: {icon: string; title: string; text: string}[];
    }>>()
    .notNull()
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
  carPrice1Usd: integer('car_price_1_usd'),
  carPrice2Usd: integer('car_price_2_usd'),
  carPrice3Usd: integer('car_price_3_usd'),
  bookingMode: text('booking_mode').$type<'both' | 'people' | 'car'>().notNull().default('both'),
  durationHours: integer('duration_hours'),
  featured: boolean('featured').notNull().default(false),
  published: boolean('published').notNull().default(true),
  sort: integer('sort').notNull().default(0),
  i18n: jsonb('i18n')
    .$type<Record<Lang, {title: string; description: string; includes: string[]; highlights: string[]; policies?: string[]}>>()
    .notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull()
}, (table) => [
  index('activities_published_sort_idx').on(table.published, table.sort)
]);

export const offers = pgTable('offers', {
  id: serial('id').primaryKey(),
  image: text('image'),
  packageId: integer('package_id').references(() => packages.id, {onDelete: 'set null'}),
  validUntil: timestamp('valid_until'),
  validFrom: timestamp('valid_from'),
  discountPercent: integer('discount_percent'),
  published: boolean('published').notNull().default(true),
  sort: integer('sort').notNull().default(0),
  i18n: jsonb('i18n').$type<Record<Lang, {title: string; text: string; badge: string}>>().notNull()
}, (table) => [
  index('offers_published_idx').on(table.published)
]);

export const faqs = pgTable('faqs', {
  id: serial('id').primaryKey(),
  published: boolean('published').notNull().default(true),
  sort: integer('sort').notNull().default(0),
  i18n: jsonb('i18n').$type<Record<Lang, {question: string; answer: string}>>().notNull()
});

export const searchRegions = pgTable('search_regions', {
  id: serial('id').primaryKey(),
  slug: text('slug').notNull().unique(),
  sort: integer('sort').notNull().default(0),
  published: boolean('published').notNull().default(true),
  i18n: jsonb('i18n').$type<Record<Lang, {name: string}>>().notNull()
});

export const searchDurations = pgTable('search_durations', {
  id: serial('id').primaryKey(),
  sort: integer('sort').notNull().default(0),
  published: boolean('published').notNull().default(true),
  minDays: integer('min_days'),
  maxDays: integer('max_days'),
  i18n: jsonb('i18n').$type<Record<Lang, {label: string}>>().notNull()
});

export type ContactSection = 'social' | 'direct';
export type ContactType = 'instagram' | 'facebook' | 'tiktok' | 'x' | 'snapchat' | 'youtube' | 'linkedin'
  | 'whatsapp' | 'phone' | 'email' | 'address' | 'hours';

export const contactLinks = pgTable('contact_links', {
  id: serial('id').primaryKey(),
  section: text('section').$type<ContactSection>().notNull(),
  type: text('type').$type<ContactType>().notNull(),
  value: text('value').notNull(),
  i18n: jsonb('i18n').$type<Partial<Record<Lang, {label?: string}>>>(),
  published: boolean('published').notNull().default(true),
  sort: integer('sort').notNull().default(0)
});

export type CouponScope = 'all' | 'package' | 'activity' | 'hotel';
export type CouponDiscountType = 'percent' | 'fixed';

export const coupons = pgTable('coupons', {
  id: serial('id').primaryKey(),
  code: text('code').notNull().unique(),
  scope: text('scope').$type<CouponScope>().notNull().default('all'),
  packageId: integer('package_id').references(() => packages.id, {onDelete: 'cascade'}),
  activityId: integer('activity_id').references(() => activities.id, {onDelete: 'cascade'}),
  discountType: text('discount_type').$type<CouponDiscountType>().notNull(),
  discountValue: integer('discount_value').notNull(),
  minTotalUsd: integer('min_total_usd'),
  maxUses: integer('max_uses'),
  usedCount: integer('used_count').notNull().default(0),
  validFrom: timestamp('valid_from'),
  validUntil: timestamp('valid_until'),
  isPublic: boolean('is_public').notNull().default(false),
  active: boolean('active').notNull().default(true),
  i18n: jsonb('i18n').$type<Record<Lang, {title: string; terms: string}>>().notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull()
});

export const admins = pgTable('admins', {
  id: serial('id').primaryKey(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  role: text('role').$type<'owner' | 'staff'>().notNull().default('owner'),
  sessionVersion: integer('session_version').notNull().default(0),
  mustChangePassword: boolean('must_change_password').notNull().default(false),
  lastLoginAt: timestamp('last_login_at'),
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

export type FeedbackType = 'bug' | 'complaint' | 'suggestion';
export type FeedbackStatus = 'new' | 'in_progress' | 'done';

export const feedback = pgTable('feedback', {
  id: serial('id').primaryKey(),
  type: text('type').$type<FeedbackType>().notNull(),
  title: text('title').notNull(),
  message: text('message').notNull(),
  imageUrl: text('image_url'),
  userId: integer('user_id').references(() => users.id, {onDelete: 'set null'}),
  email: text('email'),
  pageUrl: text('page_url'),
  status: text('status').$type<FeedbackStatus>().notNull().default('new'),
  adminNote: text('admin_note'),
  createdAt: timestamp('created_at').defaultNow().notNull()
}, (table) => [
  index('feedback_status_created_at_idx').on(table.status, table.createdAt),
  index('feedback_created_at_idx').on(table.createdAt)
]);

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
  couponCode: text('coupon_code'),
  discountUsd: integer('discount_usd'),
  status: text('status').notNull().default('pending'),
  createdAt: timestamp('created_at').defaultNow().notNull()
}, (table) => [
  index('bookings_user_id_idx').on(table.userId),
  index('bookings_status_idx').on(table.status),
  index('bookings_created_at_idx').on(table.createdAt),
  index('bookings_travel_date_idx').on(table.travelDate)
]);

export const couponRedemptions = pgTable('coupon_redemptions', {
  id: serial('id').primaryKey(),
  couponId: integer('coupon_id').notNull().references(() => coupons.id, {onDelete: 'cascade'}),
  userId: integer('user_id').notNull().references(() => users.id, {onDelete: 'cascade'}),
  bookingId: integer('booking_id').references(() => bookings.id, {onDelete: 'set null'}),
  createdAt: timestamp('created_at').defaultNow().notNull()
}, (table) => [
  uniqueIndex('coupon_redemptions_coupon_user_unique').on(table.couponId, table.userId),
  index('coupon_redemptions_user_id_idx').on(table.userId)
]);

export const activityReviews = pgTable('activity_reviews', {
  id: serial('id').primaryKey(),
  activityId: integer('activity_id').notNull().references(() => activities.id, {onDelete: 'cascade'}),
  userId: integer('user_id').notNull().references(() => users.id, {onDelete: 'cascade'}),
  rating: integer('rating').notNull(),
  comment: text('comment').notNull(),
  hidden: boolean('hidden').notNull().default(false),
  createdAt: timestamp('created_at').defaultNow().notNull()
}, (table) => [
  uniqueIndex('activity_reviews_activity_user_unique').on(table.activityId, table.userId)
]);

export const loginAttempts = pgTable('login_attempts', {
  id: serial('id').primaryKey(),
  scope: text('scope').$type<'admin' | 'user'>().notNull(),
  identifier: text('identifier').notNull(),
  ip: text('ip').notNull(),
  success: boolean('success').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull()
}, (table) => [
  index('login_attempts_scope_identifier_created_at_idx').on(table.scope, table.identifier, table.createdAt),
  index('login_attempts_ip_created_at_idx').on(table.ip, table.createdAt)
]);

export const settings = pgTable('settings', {
  key: text('key').primaryKey(),
  value: jsonb('value').$type<Record<string, number>>().notNull()
});