import {pgTable, serial, text, integer, boolean, jsonb, timestamp, real} from 'drizzle-orm/pg-core';

export type Lang = 'ar' | 'en';

export const packages = pgTable('packages', {
  id: serial('id').primaryKey(),
  slug: text('slug').notNull().unique(),
  days: integer('days').notNull(),
  nights: integer('nights').notNull(),
  priceUsd: integer('price_usd'),
  region: text('region').notNull().default('asia'),
  cover: text('cover'),
  gallery: jsonb('gallery').$type<string[]>().notNull().default([]),
  featured: boolean('featured').notNull().default(false),
  published: boolean('published').notNull().default(true),
  sort: integer('sort').notNull().default(0),
  i18n: jsonb('i18n')
    .$type<Record<Lang, {title: string; intro: string; stay: string[]; includes: string[]; excludes: string[]; highlights: string[]}>>()
    .notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull()
});

export const packageDays = pgTable('package_days', {
  id: serial('id').primaryKey(),
  packageId: integer('package_id').notNull().references(() => packages.id, {onDelete: 'cascade'}),
  dayNo: integer('day_no').notNull(),
  stage: text('stage'),
  i18n: jsonb('i18n').$type<Record<Lang, {title: string; items: string[]}>>().notNull()
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

export const offers = pgTable('offers', {
  id: serial('id').primaryKey(),
  image: text('image'),
  packageId: integer('package_id').references(() => packages.id, {onDelete: 'set null'}),
  validUntil: timestamp('valid_until'),
  published: boolean('published').notNull().default(true),
  sort: integer('sort').notNull().default(0),
  i18n: jsonb('i18n').$type<Record<Lang, {title: string; text: string; badge: string}>>().notNull()
});

export const admins = pgTable('admins', {
  id: serial('id').primaryKey(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull()
});