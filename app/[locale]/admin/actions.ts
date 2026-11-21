'use server';

import {redirect} from 'next/navigation';
import {revalidatePath, updateTag} from 'next/cache';
import bcrypt from 'bcryptjs';
import {and, desc, eq, inArray, ne, sql} from 'drizzle-orm';
import {db} from '@/lib/db';
import {admins, destinations, activities, offers, packages, packageDays, faqs, bookings, couponRedemptions, activityReviews, settings, coupons, contactLinks, users, searchRegions, searchDurations, type ContactSection, type ContactType, type CouponScope, type CouponDiscountType} from '@/lib/db/schema';
import {createSession, destroySession, getSession} from '@/lib/auth';
import {getLocale} from 'next-intl/server';
import {headers} from 'next/headers';
import {bookingRef} from '@/lib/bookingRef';
import {bookingCancelled, bookingConfirmed, couponOffer} from '@/lib/email-templates';
import {sendEmail} from '@/lib/email';
import {checkLoginRateLimit, getClientIp, recordLoginSuccess} from '@/lib/rate-limit';
import {PUBLIC_CACHE_TAGS} from '@/lib/public-cache';

const DUMMY_ADMIN_HASH = bcrypt.hashSync('not-a-real-password', 12);

async function go(path: string): Promise<never> {
  redirect(`/${await getLocale()}${path}`);
}

function revalidatePublicData(...tags: Array<(typeof PUBLIC_CACHE_TAGS)[keyof typeof PUBLIC_CACHE_TAGS]>) {
  for (const tag of new Set(tags)) updateTag(tag);
  revalidatePath('/', 'layout');
}

export async function login(_prev: string | null | undefined, formData: FormData) {
  const locale = await getLocale();
  const ar = locale === 'ar';
  const emailValue = formData.get('email');
  const rawEmail = typeof emailValue === 'string' ? emailValue.trim().toLowerCase() : '';
  const email = rawEmail.length <= 254 ? rawEmail : '';
  const passwordValue = formData.get('password');
  const password = typeof passwordValue === 'string' ? passwordValue : '';
  const ip = getClientIp(await headers());
  const blocked = await checkLoginRateLimit('admin', email, ip);
  if (blocked !== null) {
    return ar
      ? `محاولات كثيرة، حاول مرة أخرى بعد ${blocked} دقيقة`
      : `Too many attempts, try again in ${blocked} minutes`;
  }
  const [admin] = await db.select().from(admins).where(eq(admins.email, email)).limit(1);
  const ok = await bcrypt.compare(password, admin?.passwordHash ?? DUMMY_ADMIN_HASH);
  if (!admin || !ok) {
    return ar ? 'البريد أو كلمة المرور غير صحيحة' : 'Wrong email or password';
  }
  await recordLoginSuccess('admin', email, ip);
  await createSession(email);
  await go('/admin');
}

export async function logout() {
  await destroySession();
  await go('/admin/login');
}

export async function saveRates(formData: FormData) {
  if (!(await getSession())) await go('/admin/login');
  const myr = Number(str(formData.get('MYR')));
  if (!Number.isFinite(myr) || myr <= 0 || myr > 1000) throw new Error('Invalid MYR exchange rate');
  await db.insert(settings).values({key: 'rates', value: {MYR: myr}})
    .onConflictDoUpdate({target: settings.key, set: {value: {MYR: myr}}});
  revalidatePublicData(PUBLIC_CACHE_TAGS.rates);
  await go('/admin/currency');
}

const str = (v: FormDataEntryValue | null) => {
  if (v === null) return '';
  if (typeof v !== 'string' || v.length > 10_000 || v.includes('\0')) throw new Error('Invalid form value');
  return v.trim();
};
const num = (v: FormDataEntryValue | null) => {
  const s = str(v);
  if (s === '') return null;
  const value = Number(s);
  if (!Number.isFinite(value)) throw new Error('Invalid number');
  return value;
};
const checked = (formData: FormData, key: string) => {
  const value = formData.get(key);
  if (value === null) return false;
  if (value !== 'on') throw new Error(`Invalid ${key} value`);
  return true;
};
const validImageUrl = (value: string) => {
  if (!value) return null;
  if (value.startsWith('/') && !value.startsWith('//') && !/[\\\u0000-\u001f]/.test(value)) return value;
  try {
    const url = new URL(value);
    if (url.protocol === 'https:' && !url.username && !url.password &&
      /^[a-z0-9-]+\.public\.blob\.vercel-storage\.com$/i.test(url.hostname)) return value;
  } catch {
    // Rejected below.
  }
  throw new Error('Image URL must use a local path or our Vercel Blob host');
};
const imageLines = (value: FormDataEntryValue | null) => {
  const urls = lines(value);
  if (urls.length > 50) throw new Error('Too many gallery images');
  return urls.map((url) => validImageUrl(url) as string);
};
const wholeNumber = (value: number | null, label: string, min: number, max: number, fallback: number | null = null) => {
  const result = value ?? fallback;
  if (result !== null && (!Number.isSafeInteger(result) || result < min || result > max)) {
    throw new Error(`Invalid ${label}`);
  }
  return result;
};
const requiredText = (value: string, label: string, max: number) => {
  if (!value || value.length > max) throw new Error(`Invalid ${label}`);
  return value;
};
const boundedText = (value: string, label: string, max: number) => {
  if (value.length > max) throw new Error(`Invalid ${label}`);
  return value;
};
const validSlug = (value: string, label: string) => {
  if (value.length > 120 || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value)) throw new Error(`Invalid ${label}`);
  return value;
};
const validDateOnly = (value: string) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
};
const validDateTimeLocal = (value: string) => {
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value) || !validDateOnly(value.slice(0, 10))) return false;
  const [, hour, minute] = value.match(/T(\d{2}):(\d{2})$/) ?? [];
  return Number(hour) < 24 && Number(minute) < 60;
};
function parsePackageDays(value: unknown) {
  if (!Array.isArray(value) || value.length > 365) throw new Error('Package itinerary days must be an array of at most 365 days');
  return value.flatMap((row) => {
    if (typeof row !== 'object' || row === null || Array.isArray(row)) throw new Error('Invalid package itinerary day');
    const day = row as Record<string, unknown>;
    if (typeof day.title_en !== 'string' || typeof day.title_ar !== 'string' ||
      typeof day.items_en !== 'string' || typeof day.items_ar !== 'string' ||
      typeof day.stage !== 'string' ||
      (typeof day.dayNo !== 'string' && typeof day.dayNo !== 'number')) {
      throw new Error('Invalid package itinerary day fields');
    }
    const titleEn = day.title_en.trim();
    const titleAr = day.title_ar.trim();
    const dayNo = Number(day.dayNo);
    if (!Number.isSafeInteger(dayNo) || dayNo < 1 || dayNo > 365 ||
      titleEn.length > 160 || titleAr.length > 160 ||
      day.items_en.length > 5000 || day.items_ar.length > 5000 || day.stage.length > 120) {
      throw new Error('Invalid package itinerary values');
    }
    if (!titleEn && !titleAr) return [];
    return [{
      dayNo,
      stage: day.stage.trim() || null,
      i18n: {
        en: {title: titleEn, items: lines(day.items_en)},
        ar: {title: titleAr, items: lines(day.items_ar)}
      }
    }];
  });
}

export async function saveDestination(formData: FormData) {
  if (!(await getSession())) await go('/admin/login');
  const id = num(formData.get('id'));
  if (id !== null && (!Number.isSafeInteger(id) || id < 1)) throw new Error('Invalid destination id');
  const f = (k: string) => str(formData.get(k));
  const l = (k: string) => lines(formData.get(k));
  type FRow = {icon: string; title_en: string; text_en: string; title_ar: string; text_ar: string};
  let rows: FRow[] = [];
  try {
    const parsed: unknown = JSON.parse(f('features') || '[]');
    if (!Array.isArray(parsed) || parsed.length > 50 || parsed.some((row) =>
      typeof row !== 'object' || row === null || Array.isArray(row) ||
      typeof row.icon !== 'string' || typeof row.title_en !== 'string' ||
      typeof row.text_en !== 'string' || typeof row.title_ar !== 'string' ||
      typeof row.text_ar !== 'string'
    )) throw new Error('Invalid destination features');
    rows = parsed;
  } catch (error) {
    console.error('Failed to parse destination features', error);
    throw error;
  }
  rows = rows.filter((r) => r.title_en?.trim() || r.title_ar?.trim());
  const slug = validSlug(f('slug'), 'destination slug');
  const image = validImageUrl(f('image'));
  const gallery = imageLines(formData.get('gallery'));
  const rating = num(formData.get('rating'));
  const flightHours = num(formData.get('flightHours'));
  const bestFrom = num(formData.get('bestFrom'));
  const bestTo = num(formData.get('bestTo'));
  const sort = num(formData.get('sort')) ?? 0;
  if (rating !== null && (rating < 0 || rating > 5)) throw new Error('Invalid destination rating');
  if (flightHours !== null && (!Number.isInteger(flightHours) || flightHours < 0 || flightHours > 100)) throw new Error('Invalid flight duration');
  if ([bestFrom, bestTo].some((month) => month !== null && (!Number.isInteger(month) || month < 1 || month > 12))) throw new Error('Invalid best travel month');
  if (!Number.isSafeInteger(sort) || sort < 0) throw new Error('Invalid sort order');
  const region = requiredText(f('region') || 'asia', 'destination region', 40);
  if (!/^[a-z0-9-]+$/.test(region)) throw new Error('Invalid destination region');
  const nameEn = requiredText(f('name_en'), 'English destination name', 160);
  const nameAr = requiredText(f('name_ar'), 'Arabic destination name', 160);
  const countryEn = boundedText(f('country_en'), 'English country name', 120);
  const countryAr = boundedText(f('country_ar'), 'Arabic country name', 120);
  const aboutEn = boundedText(f('about_en'), 'English destination description', 10000);
  const aboutAr = boundedText(f('about_ar'), 'Arabic destination description', 10000);
  if ([f('currency'), f('timezone'), f('temp'), f('language_en'), f('language_ar'), f('visa_en'), f('visa_ar')].some((value) => value.length > 200)) {
    throw new Error('Destination text is too long');
  }
  if (rows.some((row) => row.icon.length > 60 || row.title_en.length > 160 || row.title_ar.length > 160 || row.text_en.length > 2000 || row.text_ar.length > 2000)) {
    throw new Error('Destination feature text is too long');
  }
  const data = {
    slug,
    region,
    image,
    gallery,
    currency: f('currency') || null,
    timezone: f('timezone') || null,
    rating,
    flightHours,
    temp: f('temp') || null,
    bestFrom,
    bestTo,
    published: checked(formData, 'published'),
    sort,
    i18n: {
      en: {name: nameEn, country: countryEn, about: aboutEn, language: f('language_en'), visa: f('visa_en'), tips: l('tips_en'), features: rows.map((r) => ({icon: r.icon, title: r.title_en.trim(), text: r.text_en.trim()}))},
      ar: {name: nameAr, country: countryAr, about: aboutAr, language: f('language_ar'), visa: f('visa_ar'), tips: l('tips_ar'), features: rows.map((r) => ({icon: r.icon, title: r.title_ar.trim(), text: r.text_ar.trim()}))}
    }
  };
  if (id) await db.update(destinations).set(data).where(eq(destinations.id, id));
  else await db.insert(destinations).values(data);
  revalidatePublicData(PUBLIC_CACHE_TAGS.destinations, PUBLIC_CACHE_TAGS.packages);
  await go('/admin/destinations');
}

export async function deleteDestination(formData: FormData) {
  if (!(await getSession())) await go('/admin/login');
  await db.delete(destinations).where(eq(destinations.id, validId(formData.get('id'), 'destination')));
  revalidatePublicData(PUBLIC_CACHE_TAGS.destinations, PUBLIC_CACHE_TAGS.packages);
  await go('/admin/destinations');
}

export async function saveOffer(formData: FormData) {
  if (!(await getSession())) await go('/admin/login');
  const id = num(formData.get('id'));
  if (id !== null && (!Number.isSafeInteger(id) || id < 1)) throw new Error('Invalid offer id');
  const f = (k: string) => str(formData.get(k));
  const until = f('validUntil');
  const packageId = num(formData.get('packageId'));
  const image = validImageUrl(f('image'));
  const sort = wholeNumber(num(formData.get('sort')), 'sort order', 0, 1_000_000, 0)!;
  if (packageId !== null && (!Number.isSafeInteger(packageId) || packageId < 1)) throw new Error('Invalid offer package');
  if (until && !validDateOnly(until)) throw new Error('Invalid offer end date');
  const titleEn = requiredText(f('title_en'), 'English offer title', 160);
  const titleAr = requiredText(f('title_ar'), 'Arabic offer title', 160);
  const textEn = boundedText(f('text_en'), 'English offer text', 5000);
  const textAr = boundedText(f('text_ar'), 'Arabic offer text', 5000);
  const badgeEn = boundedText(f('badge_en'), 'English offer badge', 120);
  const badgeAr = boundedText(f('badge_ar'), 'Arabic offer badge', 120);
  const data = {
    image,
    packageId,
    validUntil: until ? new Date(until) : null,
    published: checked(formData, 'published'),
    sort,
    i18n: {
      en: {title: titleEn, text: textEn, badge: badgeEn},
      ar: {title: titleAr, text: textAr, badge: badgeAr}
    }
  };
  if (id) await db.update(offers).set(data).where(eq(offers.id, id));
  else await db.insert(offers).values(data);
  revalidatePublicData(PUBLIC_CACHE_TAGS.offers);
  await go('/admin/offers');
}

export async function deleteOffer(formData: FormData) {
  if (!(await getSession())) await go('/admin/login');
  await db.delete(offers).where(eq(offers.id, validId(formData.get('id'), 'offer')));
  revalidatePublicData(PUBLIC_CACHE_TAGS.offers);
  await go('/admin/offers');
}

export async function saveFaq(formData: FormData) {
  if (!(await getSession())) await go('/admin/login');
  const id = num(formData.get('id'));
  const f = (k: string) => str(formData.get(k));
  if (id !== null && (!Number.isSafeInteger(id) || id < 1)) throw new Error('Invalid FAQ id');
  const sort = wholeNumber(num(formData.get('sort')), 'sort order', 0, 1_000_000, 0)!;
  const questionEn = requiredText(f('question_en'), 'English FAQ question', 500);
  const questionAr = requiredText(f('question_ar'), 'Arabic FAQ question', 500);
  const answerEn = requiredText(f('answer_en'), 'English FAQ answer', 5000);
  const answerAr = requiredText(f('answer_ar'), 'Arabic FAQ answer', 5000);
  const data = {
    sort,
    published: checked(formData, 'published'),
    i18n: {
      en: {question: questionEn, answer: answerEn},
      ar: {question: questionAr, answer: answerAr}
    }
  };
  if (id) await db.update(faqs).set(data).where(eq(faqs.id, id));
  else await db.insert(faqs).values(data);
  revalidatePublicData(PUBLIC_CACHE_TAGS.faqs);
  await go('/admin/faqs');
}

export async function deleteFaq(formData: FormData) {
  if (!(await getSession())) await go('/admin/login');
  await db.delete(faqs).where(eq(faqs.id, validId(formData.get('id'), 'FAQ')));
  revalidatePublicData(PUBLIC_CACHE_TAGS.faqs);
  await go('/admin/faqs');
}

function validId(value: FormDataEntryValue | null, label: string) {
  const id = num(value);
  if (id === null || !Number.isSafeInteger(id) || id < 1) throw new Error(`Invalid ${label} id`);
  return id;
}

function validSort(value: FormDataEntryValue | null) {
  const sort = num(value);
  if (sort === null || !Number.isSafeInteger(sort) || sort < 0 || sort > 1_000_000) throw new Error('Invalid search option sort order');
  return sort;
}

function optionalDayBound(value: FormDataEntryValue | null, label: string) {
  const days = num(value);
  if (days !== null && (!Number.isSafeInteger(days) || days < 1 || days > 3650)) throw new Error(`Invalid ${label}`);
  return days;
}

export async function saveSearchRegion(formData: FormData) {
  if (!(await getSession())) await go('/admin/login');
  const rawId = num(formData.get('id'));
  if (rawId !== null && (!Number.isSafeInteger(rawId) || rawId < 1)) throw new Error('Invalid search region id');
  const f = (key: string) => str(formData.get(key));
  const slug = f('slug');
  const nameEn = f('name_en');
  const nameAr = f('name_ar');
  if (slug.length > 80 || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) throw new Error('Invalid search region slug');
  if (!nameEn || !nameAr || nameEn.length > 120 || nameAr.length > 120) throw new Error('Invalid search region names');
  const data = {
    slug,
    sort: validSort(formData.get('sort')),
    published: checked(formData, 'published'),
    i18n: {en: {name: nameEn}, ar: {name: nameAr}}
  };
  if (rawId !== null) {
    const updated = await db.update(searchRegions).set(data)
      .where(eq(searchRegions.id, rawId)).returning({id: searchRegions.id});
    if (updated.length === 0) throw new Error('Search region not found');
  } else {
    await db.insert(searchRegions).values(data);
  }
  revalidatePublicData(PUBLIC_CACHE_TAGS.searchRegions);
  await go('/admin/search');
}

export async function deleteSearchRegion(formData: FormData) {
  if (!(await getSession())) await go('/admin/login');
  const id = validId(formData.get('id'), 'search region');
  const deleted = await db.delete(searchRegions).where(eq(searchRegions.id, id)).returning({id: searchRegions.id});
  if (deleted.length === 0) throw new Error('Search region not found');
  revalidatePublicData(PUBLIC_CACHE_TAGS.searchRegions);
  await go('/admin/search');
}

export async function saveSearchDuration(formData: FormData) {
  if (!(await getSession())) await go('/admin/login');
  const rawId = num(formData.get('id'));
  if (rawId !== null && (!Number.isSafeInteger(rawId) || rawId < 1)) throw new Error('Invalid search duration id');
  const f = (key: string) => str(formData.get(key));
  const labelEn = f('label_en');
  const labelAr = f('label_ar');
  const minDays = optionalDayBound(formData.get('minDays'), 'minimum days');
  const maxDays = optionalDayBound(formData.get('maxDays'), 'maximum days');
  if (!labelEn || !labelAr || labelEn.length > 120 || labelAr.length > 120) throw new Error('Invalid search duration labels');
  if (minDays !== null && maxDays !== null && minDays > maxDays) {
    throw new Error('Minimum days cannot exceed maximum days');
  }
  const data = {
    sort: validSort(formData.get('sort')),
    published: checked(formData, 'published'),
    minDays,
    maxDays,
    i18n: {en: {label: labelEn}, ar: {label: labelAr}}
  };
  if (rawId !== null) {
    const updated = await db.update(searchDurations).set(data)
      .where(eq(searchDurations.id, rawId)).returning({id: searchDurations.id});
    if (updated.length === 0) throw new Error('Search duration not found');
  } else {
    await db.insert(searchDurations).values(data);
  }
  revalidatePublicData(PUBLIC_CACHE_TAGS.searchDurations);
  await go('/admin/search');
}

export async function deleteSearchDuration(formData: FormData) {
  if (!(await getSession())) await go('/admin/login');
  const id = validId(formData.get('id'), 'search duration');
  const deleted = await db.delete(searchDurations).where(eq(searchDurations.id, id)).returning({id: searchDurations.id});
  if (deleted.length === 0) throw new Error('Search duration not found');
  revalidatePublicData(PUBLIC_CACHE_TAGS.searchDurations);
  await go('/admin/search');
}

function couponData(formData: FormData) {
  const f = (key: string) => str(formData.get(key));
  const scope = f('scope') as CouponScope;
  const discountType = f('discountType') as CouponDiscountType;
  const code = f('code').toUpperCase();
  const discountValue = num(formData.get('discountValue'));
  const minTotalUsd = num(formData.get('minTotalUsd'));
  const maxUses = num(formData.get('maxUses'));
  const validFromValue = f('validFrom');
  const validUntilValue = f('validUntil');
  if (validFromValue && !validDateTimeLocal(validFromValue)) throw new Error('Invalid valid-from date');
  if (validUntilValue && !validDateTimeLocal(validUntilValue)) throw new Error('Invalid valid-until date');
  const validFrom = validFromValue ? new Date(validFromValue) : null;
  const validUntil = validUntilValue ? new Date(validUntilValue) : null;

  if (!/^[A-Z0-9_-]{1,40}$/.test(code)) throw new Error('Invalid coupon code');
  if (!['all', 'package', 'activity'].includes(scope)) throw new Error('Invalid coupon scope');
  if (!['percent', 'fixed'].includes(discountType)) throw new Error('Invalid coupon discount type');
  if (!Number.isInteger(discountValue) || discountValue === null || discountValue < 1) {
    throw new Error('Coupon discount must be a positive whole number');
  }
  if (discountType === 'percent' && discountValue > 100) {
    throw new Error('Percent discounts cannot exceed 100');
  }
  if (discountValue > 10_000_000) throw new Error('Coupon discount is too large');
  if (minTotalUsd !== null && (!Number.isSafeInteger(minTotalUsd) || minTotalUsd < 0 || minTotalUsd > 10_000_000)) {
    throw new Error('Minimum total must be a non-negative whole number');
  }
  if (maxUses !== null && (!Number.isSafeInteger(maxUses) || maxUses < 1 || maxUses > 1_000_000)) {
    throw new Error('Maximum uses must be a positive whole number');
  }
  if (validFrom && validUntil && validUntil <= validFrom) {
    throw new Error('Valid-until must be after valid-from');
  }
  const packageId = scope === 'package' ? num(formData.get('packageId')) : null;
  const activityId = scope === 'activity' ? num(formData.get('activityId')) : null;
  if (packageId !== null && (!Number.isSafeInteger(packageId) || packageId < 1)) throw new Error('Invalid coupon package');
  if (activityId !== null && (!Number.isSafeInteger(activityId) || activityId < 1)) throw new Error('Invalid coupon activity');
  const titleEn = f('title_en');
  const titleAr = f('title_ar');
  const termsEn = f('terms_en');
  const termsAr = f('terms_ar');
  if (!titleEn || !titleAr || titleEn.length > 160 || titleAr.length > 160 || termsEn.length > 5000 || termsAr.length > 5000) {
    throw new Error('Invalid coupon text');
  }

  return {
    code,
    scope,
    packageId,
    activityId,
    discountType,
    discountValue,
    minTotalUsd,
    maxUses,
    validFrom,
    validUntil,
    isPublic: checked(formData, 'isPublic'),
    active: checked(formData, 'active'),
    i18n: {
      en: {title: titleEn, terms: termsEn},
      ar: {title: titleAr, terms: termsAr}
    }
  };
}

async function ensureCouponCodeAvailable(code: string, id?: number) {
  const [existing] = await db.select({id: coupons.id}).from(coupons).where(eq(coupons.code, code)).limit(1);
  if (existing && existing.id !== id) throw new Error('A coupon with this code already exists');
}

export async function createCoupon(formData: FormData) {
  if (!(await getSession())) await go('/admin/login');
  const data = couponData(formData);
  await ensureCouponCodeAvailable(data.code);
  await db.insert(coupons).values(data);
  revalidatePath('/', 'layout');
  await go('/admin/coupons');
}

export async function updateCoupon(formData: FormData) {
  if (!(await getSession())) await go('/admin/login');
  const id = validId(formData.get('id'), 'coupon');
  const data = couponData(formData);
  await ensureCouponCodeAvailable(data.code, id);
  await db.update(coupons).set(data).where(eq(coupons.id, id));
  revalidatePath('/', 'layout');
  await go('/admin/coupons');
}

export async function deleteCoupon(formData: FormData) {
  if (!(await getSession())) await go('/admin/login');
  await db.delete(coupons).where(eq(coupons.id, validId(formData.get('id'), 'coupon')));
  revalidatePath('/', 'layout');
  await go('/admin/coupons');
}

export async function toggleCoupon(formData: FormData) {
  if (!(await getSession())) await go('/admin/login');
  const id = validId(formData.get('id'), 'coupon');
  const active = str(formData.get('active'));
  if (!['true', 'false'].includes(active)) {
    throw new Error('Invalid coupon status');
  }
  await db.update(coupons).set({active: active === 'true'}).where(eq(coupons.id, id));
  revalidatePath('/', 'layout');
}

export type CouponEmailResult = {sent: number; failed: number; skipped: number; error?: boolean};

export async function sendCouponEmails(_previous: CouponEmailResult, formData: FormData): Promise<CouponEmailResult> {
  let sent = 0;
  let failed = 0;
  let skipped = 0;
  try {
    if (!(await getSession())) return {sent, failed, skipped, error: true};
    const couponIdValue = formData.get('couponId');
    if (typeof couponIdValue !== 'string' || !/^[1-9]\d*$/.test(couponIdValue) ||
      !Number.isSafeInteger(Number(couponIdValue))) return {sent, failed, skipped, error: true};
    const couponId = Number(couponIdValue);
    const [coupon] = await db.select().from(coupons).where(eq(coupons.id, couponId)).limit(1);
    if (!coupon) return {sent, failed, skipped, error: true};

    const deliveryMode = str(formData.get('deliveryMode'));
    if (!['all', 'selected'].includes(deliveryMode)) return {sent, failed, skipped, error: true};
    const allCustomers = deliveryMode === 'all';
    const recipientValues = formData.getAll('recipientIds');
    if (allCustomers && recipientValues.length) return {sent, failed, skipped, error: true};
    if (recipientValues.length > 500 || recipientValues.some((value) =>
      typeof value !== 'string' || !/^[1-9]\d*$/.test(value) || !Number.isSafeInteger(Number(value))
    )) return {sent, failed, skipped, error: true};
    const submittedIds = allCustomers
      ? (await db.select({id: users.id}).from(users).orderBy(users.id)).map(({id}) => id)
      : [...new Set(recipientValues.map((value) => Number(value)))];
    if (submittedIds.length === 0) return {sent, failed, skipped};

    const recipientIds = submittedIds.slice(0, 100);
    skipped += submittedIds.length - recipientIds.length;
    const recipientRows = await db.select({
      id: users.id,
      name: users.name,
      email: users.email
    }).from(users).where(inArray(users.id, recipientIds));
    skipped += recipientIds.length - recipientRows.length;

    const [redemptions, bookingUsers] = await Promise.all([
      db.select({userId: couponRedemptions.userId})
        .from(couponRedemptions)
        .where(eq(couponRedemptions.couponId, coupon.id)),
      db.select({userId: bookings.userId})
        .from(bookings)
        .where(and(eq(bookings.couponCode, coupon.code), ne(bookings.status, 'cancelled')))
    ]);
    const usedUserIds = new Set([...redemptions, ...bookingUsers].map(({userId}) => userId));
    const eligible = recipientRows.filter((recipient) => {
      if (usedUserIds.has(recipient.id)) {
        skipped += 1;
        return false;
      }
      return true;
    });

    const latestBookings = eligible.length
      ? await db.select({userId: bookings.userId, lang: bookings.lang})
          .from(bookings)
          .where(inArray(bookings.userId, eligible.map(({id}) => id)))
          .orderBy(desc(bookings.createdAt))
      : [];
    const latestLanguage = new Map<number, string>();
    for (const booking of latestBookings) {
      if (!latestLanguage.has(booking.userId)) latestLanguage.set(booking.userId, booking.lang);
    }

    let target: string | null = null;
    if (coupon.scope === 'package' && coupon.packageId) {
      const [pkg] = await db.select({title: packages.i18n}).from(packages).where(eq(packages.id, coupon.packageId)).limit(1);
      target = pkg?.title.en.title ?? null;
    } else if (coupon.scope === 'activity' && coupon.activityId) {
      const [activity] = await db.select({title: activities.i18n}).from(activities).where(eq(activities.id, coupon.activityId)).limit(1);
      target = activity?.title.en.title ?? null;
    }
    const formatDate = (date: Date | null) => date
      ? new Intl.DateTimeFormat('en-US', {dateStyle: 'medium', timeZone: 'UTC'}).format(date)
      : null;
    const discount = coupon.discountType === 'percent'
      ? `${coupon.discountValue}%`
      : `$${coupon.discountValue} USD`;

    for (const [index, recipient] of eligible.entries()) {
      const locale = latestLanguage.get(recipient.id) === 'en' ? 'en' : 'ar';
      try {
        const result = await sendEmail({
          to: recipient.email,
          ...couponOffer(locale, {
            name: recipient.name,
            code: coupon.code,
            discount,
            scope: coupon.scope,
            target,
            validFrom: formatDate(coupon.validFrom),
            validUntil: formatDate(coupon.validUntil),
            terms: coupon.i18n[locale].terms
          })
        });
        if (result.ok) sent += 1;
        else {
          failed += 1;
          console.error(`Failed to send coupon ${coupon.id} to customer ${recipient.id}`);
        }
      } catch (error) {
        failed += 1;
        console.error(`Failed to send coupon ${coupon.id} to customer ${recipient.id}`, error);
      }
      if (index < eligible.length - 1) await new Promise((resolve) => setTimeout(resolve, 250));
    }
    return {sent, failed, skipped};
  } catch (error) {
    console.error('Coupon email campaign failed', error);
    return {sent, failed, skipped, error: true};
  }
}

const contactTypes: Record<ContactSection, ContactType[]> = {
  social: ['instagram', 'facebook', 'tiktok', 'x', 'snapchat', 'youtube', 'linkedin'],
  direct: ['whatsapp', 'phone', 'email', 'address', 'hours']
};

function contactLinkData(formData: FormData) {
  const section = str(formData.get('section'));
  const type = str(formData.get('type'));
  const value = str(formData.get('value'));
  const sort = num(formData.get('sort')) ?? 0;
  if (!['social', 'direct'].includes(section)) throw new Error('Invalid contact section');
  if (!contactTypes[section as ContactSection].includes(type as ContactType)) throw new Error('Invalid contact type for section');
  if (!value || value.length > 500) throw new Error('Invalid contact value');
  if (section === 'social') {
    let url: URL;
    try {
      url = new URL(value);
    } catch {
      throw new Error('Social contact value must be a valid URL');
    }
    if (!['http:', 'https:'].includes(url.protocol) || !url.hostname || url.username || url.password) {
      throw new Error('Social contact URL must use HTTP or HTTPS');
    }
  } else if (type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
    throw new Error('Invalid contact email');
  } else if ((type === 'phone' || type === 'whatsapp') && !/^\+?[0-9\s().-]{5,40}$/.test(value)) {
    throw new Error('Invalid contact phone number');
  }
  if (!Number.isSafeInteger(sort) || sort < 0) throw new Error('Contact sort order must be a non-negative whole number');
  const labelEn = str(formData.get('label_en'));
  const labelAr = str(formData.get('label_ar'));
  if (labelEn.length > 120 || labelAr.length > 120) throw new Error('Contact labels are too long');
  return {
    section: section as ContactSection,
    type: type as ContactType,
    value,
    i18n: labelEn || labelAr ? {
      ...(labelEn ? {en: {label: labelEn}} : {}),
      ...(labelAr ? {ar: {label: labelAr}} : {})
    } : null,
    sort,
    published: checked(formData, 'published')
  };
}

export async function saveContactLink(formData: FormData) {
  if (!(await getSession())) await go('/admin/login');
  const id = num(formData.get('id'));
  const data = contactLinkData(formData);
  if (id !== null) {
    if (!Number.isInteger(id) || id < 1) throw new Error('Invalid contact link id');
    await db.update(contactLinks).set(data).where(eq(contactLinks.id, id));
  } else {
    await db.insert(contactLinks).values(data);
  }
  revalidatePublicData(PUBLIC_CACHE_TAGS.contactLinks);
  await go('/admin/contact');
}

export async function deleteContactLink(formData: FormData) {
  if (!(await getSession())) await go('/admin/login');
  const id = validId(formData.get('id'), 'contact link');
  await db.delete(contactLinks).where(eq(contactLinks.id, id));
  revalidatePublicData(PUBLIC_CACHE_TAGS.contactLinks);
  await go('/admin/contact');
}

export async function toggleContactLink(formData: FormData) {
  if (!(await getSession())) await go('/admin/login');
  const id = validId(formData.get('id'), 'contact link');
  const published = str(formData.get('published'));
  if (!['true', 'false'].includes(published)) {
    throw new Error('Invalid contact link status');
  }
  await db.update(contactLinks).set({published: published === 'true'}).where(eq(contactLinks.id, id));
  revalidatePublicData(PUBLIC_CACHE_TAGS.contactLinks);
}

export async function setActivityReviewHidden(formData: FormData) {
  if (!(await getSession())) await go('/admin/login');
  const id = validId(formData.get('id'), 'activity review');
  const hidden = str(formData.get('hidden'));
  if (!['true', 'false'].includes(hidden)) {
    throw new Error('Invalid activity review status');
  }
  await db.update(activityReviews).set({hidden: hidden === 'true'}).where(eq(activityReviews.id, id));
  revalidatePath('/', 'layout');
}

export async function deleteActivityReview(formData: FormData) {
  if (!(await getSession())) await go('/admin/login');
  const id = validId(formData.get('id'), 'activity review');
  await db.delete(activityReviews).where(eq(activityReviews.id, id));
  revalidatePath('/', 'layout');
}

const lines = (v: FormDataEntryValue | null) => {
  const values = str(v).split('\n').map((s) => s.trim()).filter(Boolean);
  if (values.length > 100 || values.some((line) => line.length > 1000)) throw new Error('Invalid list input');
  return values;
};

export async function savePackage(formData: FormData) {
  if (!(await getSession())) await go('/admin/login');
  const id = num(formData.get('id'));
  const destinationId = num(formData.get('destinationId'));
  if (id !== null && (!Number.isSafeInteger(id) || id < 1)) throw new Error('Invalid package id');
  if (destinationId !== null && (!Number.isInteger(destinationId) || destinationId < 1)) {
    throw new Error('Invalid package destination');
  }
  const f = (k: string) => str(formData.get(k));
  const l = (k: string) => lines(formData.get(k));
  type FRow = {icon: string; title_en: string; text_en: string; title_ar: string; text_ar: string};
  let rows: FRow[] = [];
  try {
    const parsed: unknown = JSON.parse(f('features') || '[]');
    if (!Array.isArray(parsed) || parsed.length > 50 || parsed.some((row) =>
      typeof row !== 'object' || row === null || Array.isArray(row) ||
      typeof row.icon !== 'string' || typeof row.title_en !== 'string' ||
      typeof row.text_en !== 'string' || typeof row.title_ar !== 'string' ||
      typeof row.text_ar !== 'string'
    )) throw new Error('Invalid package features');
    rows = parsed;
  } catch (error) {
    console.error('Failed to parse package features', error);
    throw error;
  }
  rows = rows.filter((r) => r.title_en?.trim() || r.title_ar?.trim());
  if (rows.some((row) => row.icon.length > 60 || row.title_en.length > 160 || row.title_ar.length > 160 || row.text_en.length > 2000 || row.text_ar.length > 2000)) {
    throw new Error('Package feature text is too long');
  }
  const slug = validSlug(f('slug'), 'package slug');
  const region = requiredText(f('region') || 'asia', 'package region', 40);
  if (!/^[a-z0-9-]+$/.test(region)) throw new Error('Invalid package region');
  const days = wholeNumber(num(formData.get('packageDaysCount')), 'package duration', 1, 365, 1)!;
  const nights = wholeNumber(num(formData.get('nights')), 'package nights', 0, 365, 0)!;
  const priceUsd = wholeNumber(num(formData.get('priceUsd')), 'package price', 0, 10_000_000);
  const childPriceUsd = wholeNumber(num(formData.get('childPriceUsd')), 'child price', 0, 10_000_000);
  const infantPriceUsd = wholeNumber(num(formData.get('infantPriceUsd')), 'infant price', 0, 10_000_000);
  const cover = validImageUrl(f('cover'));
  const gallery = imageLines(formData.get('gallery'));
  const sort = wholeNumber(num(formData.get('sort')), 'sort order', 0, 1_000_000, 0)!;
  const titleEn = requiredText(f('title_en'), 'English package title', 160);
  const titleAr = requiredText(f('title_ar'), 'Arabic package title', 160);
  let newDays: ReturnType<typeof parsePackageDays> = [];
  if (id === null) {
    let parsedDays: unknown;
    try {
      parsedDays = JSON.parse(str(formData.get('days')) || '[]');
    } catch (error) {
      console.error('Failed to parse package itinerary days', error);
      throw error;
    }
    newDays = parsePackageDays(parsedDays);
  }
  const data = {
    slug,
    destinationId,
    region,
    days,
    nights,
    priceUsd,
    childPriceUsd,
    infantPriceUsd,
    cover,
    gallery,
    featured: checked(formData, 'featured'),
    published: checked(formData, 'published'),
    sort,
    i18n: {
      en: {title: titleEn, intro: boundedText(f('intro_en'), 'English package introduction', 5000), stay: l('stay_en'), includes: l('includes_en'), excludes: l('excludes_en'), highlights: l('highlights_en'), policies: l('policies_en'), features: rows.map((r) => ({icon: r.icon, title: r.title_en.trim(), text: r.text_en.trim()}))},
      ar: {title: titleAr, intro: boundedText(f('intro_ar'), 'Arabic package introduction', 5000), stay: l('stay_ar'), includes: l('includes_ar'), excludes: l('excludes_ar'), highlights: l('highlights_ar'), policies: l('policies_ar'), features: rows.map((r) => ({icon: r.icon, title: r.title_ar.trim(), text: r.text_ar.trim()}))}
    }
  };
  if (id) await db.update(packages).set(data).where(eq(packages.id, id));
  else {
    await db.transaction(async (tx) => {
      const [createdPackage] = await tx.insert(packages).values(data).returning({id: packages.id});
      if (!createdPackage) throw new Error('Failed to create package');
      if (newDays.length) {
        await tx.insert(packageDays).values(newDays.map((day) => ({...day, packageId: createdPackage.id})));
      }
    });
  }
  revalidatePublicData(PUBLIC_CACHE_TAGS.packages);
  await go('/admin/packages');
}

export async function saveActivity(formData: FormData) {
  if (!(await getSession())) await go('/admin/login');
  const id = num(formData.get('id'));
  if (id !== null && (!Number.isSafeInteger(id) || id < 1)) throw new Error('Invalid activity id');
  const f = (k: string) => str(formData.get(k));
  const l = (k: string) => lines(formData.get(k));
  const priceUsd = wholeNumber(num(formData.get('priceUsd')), 'activity price', 0, 10_000_000);
  const childPriceUsd = wholeNumber(num(formData.get('childPriceUsd')), 'activity child price', 0, 10_000_000);
  const infantPriceUsd = wholeNumber(num(formData.get('infantPriceUsd')), 'activity infant price', 0, 10_000_000);
  const carPrice1Usd = wholeNumber(num(formData.get('carPrice1Usd')), 'car price', 0, 10_000_000);
  const carPrice2Usd = wholeNumber(num(formData.get('carPrice2Usd')), 'car price', 0, 10_000_000);
  const carPrice3Usd = wholeNumber(num(formData.get('carPrice3Usd')), 'car price', 0, 10_000_000);
  const durationHours = wholeNumber(num(formData.get('durationHours')), 'activity duration', 1, 1000);
  const sort = wholeNumber(num(formData.get('sort')), 'sort order', 0, 1_000_000, 0)!;
  const titleEn = requiredText(f('title_en'), 'English activity title', 160);
  const titleAr = requiredText(f('title_ar'), 'Arabic activity title', 160);
  const city = requiredText(f('city'), 'activity city', 120);
  const slug = validSlug(f('slug'), 'activity slug');
  const data = {
    slug,
    city,
    image: validImageUrl(f('image')),
    gallery: imageLines(formData.get('gallery')),
    priceUsd,
    childPriceUsd,
    infantPriceUsd,
    carPrice1Usd,
    carPrice2Usd,
    carPrice3Usd,
    durationHours,
    featured: checked(formData, 'featured'),
    published: checked(formData, 'published'),
    sort,
    i18n: {
      en: {title: titleEn, description: boundedText(f('description_en'), 'English activity description', 10000), includes: l('includes_en'), highlights: l('highlights_en'), policies: l('policies_en')},
      ar: {title: titleAr, description: boundedText(f('description_ar'), 'Arabic activity description', 10000), includes: l('includes_ar'), highlights: l('highlights_ar'), policies: l('policies_ar')}
    }
  };
  if (id) await db.update(activities).set(data).where(eq(activities.id, id));
  else await db.insert(activities).values(data);
  revalidatePublicData(PUBLIC_CACHE_TAGS.activities);
  await go('/admin/activities');
}

export async function deleteActivity(formData: FormData) {
  if (!(await getSession())) await go('/admin/login');
  await db.delete(activities).where(eq(activities.id, validId(formData.get('id'), 'activity')));
  revalidatePublicData(PUBLIC_CACHE_TAGS.activities);
  await go('/admin/activities');
}

export async function deletePackage(formData: FormData) {
  if (!(await getSession())) await go('/admin/login');
  await db.delete(packages).where(eq(packages.id, validId(formData.get('id'), 'package')));
  revalidatePublicData(PUBLIC_CACHE_TAGS.packages);
  await go('/admin/packages');
}

export async function saveDay(formData: FormData) {
  if (!(await getSession())) await go('/admin/login');
  const id = num(formData.get('id'));
  if (id !== null && (!Number.isSafeInteger(id) || id < 1)) throw new Error('Invalid package day id');
  const packageId = validId(formData.get('packageId'), 'package');
  const f = (k: string) => str(formData.get(k));
  const dayNo = wholeNumber(num(formData.get('dayNo')), 'day number', 1, 365, 1)!;
  const titleEn = requiredText(f('title_en'), 'English day title', 160);
  const titleAr = requiredText(f('title_ar'), 'Arabic day title', 160);
  const stage = f('stage');
  if (stage.length > 120) throw new Error('Invalid day stage');
  const data = {
    packageId,
    dayNo,
    stage: stage || null,
    i18n: {
      en: {title: titleEn, items: lines(formData.get('items_en'))},
      ar: {title: titleAr, items: lines(formData.get('items_ar'))}
    }
  };
  if (id) await db.update(packageDays).set(data).where(eq(packageDays.id, id));
  else await db.insert(packageDays).values(data);
  revalidatePublicData(PUBLIC_CACHE_TAGS.packages);
  await go(`/admin/packages/${packageId}`);
}

export async function deleteDay(formData: FormData) {
  if (!(await getSession())) await go('/admin/login');
  await db.delete(packageDays).where(eq(packageDays.id, validId(formData.get('id'), 'package day')));
  const packageId = validId(formData.get('packageId'), 'package');
  revalidatePublicData(PUBLIC_CACHE_TAGS.packages);
  await go(`/admin/packages/${packageId}`);
}

export async function setBookingStatus(formData: FormData) {
  if (!(await getSession())) await go('/admin/login');
  const statusValue = formData.get('status');
  if (typeof statusValue !== 'string') throw new Error('Invalid booking status');
  const status = statusValue;
  if (!['pending', 'confirmed', 'cancelled'].includes(status)) throw new Error('Invalid booking status');
  const id = validId(formData.get('id'), 'booking');
  const updatedBooking = await db.transaction(async (tx) => {
    const [booking] = await tx.select({
      id: bookings.id,
      userId: bookings.userId,
      status: bookings.status,
      couponCode: bookings.couponCode,
      lang: bookings.lang,
      title: bookings.packageTitle,
      date: bookings.travelDate,
      guests: bookings.pax,
      totalUsd: bookings.totalUsd
    }).from(bookings).where(eq(bookings.id, id)).for('update').limit(1);
    if (!booking || booking.status === status) return null;
    await tx.update(bookings).set({status}).where(eq(bookings.id, booking.id));
    if (status === 'cancelled' && booking.couponCode) {
      await tx.delete(couponRedemptions).where(eq(couponRedemptions.bookingId, booking.id));
      await tx.update(coupons)
        .set({usedCount: sql`greatest(${coupons.usedCount} - 1, 0)`})
        .where(eq(coupons.code, booking.couponCode));
    }
    return booking;
  });
  if (updatedBooking && (status === 'confirmed' || status === 'cancelled')) {
    const [customer] = await db.select({email: users.email, name: users.name}).from(users)
      .where(eq(users.id, updatedBooking.userId)).limit(1);
    if (customer) {
      const locale = updatedBooking.lang === 'ar' ? 'ar' : 'en';
      const data = {
        name: customer.name,
        reference: bookingRef(updatedBooking.id),
        title: updatedBooking.title,
        date: updatedBooking.date,
        guests: updatedBooking.guests,
        totalUsd: updatedBooking.totalUsd
      };
      if (status === 'confirmed') {
        void sendEmail({to: customer.email, ...bookingConfirmed(locale, data)});
      } else {
        void sendEmail({to: customer.email, ...bookingCancelled(locale, data)});
      }
    }
  }
  revalidatePath('/', 'layout');
}

export async function saveOfferFromPackage(formData: FormData) {
  if (!(await getSession())) await go('/admin/login');
  const id = num(formData.get('id'));
  const packageId = num(formData.get('packageId'));
  const percent = num(formData.get('discountPercent'));
  const from = str(formData.get('validFrom'));
  const until = str(formData.get('validUntil'));
  if (id !== null && (!Number.isSafeInteger(id) || id < 1)) throw new Error('Invalid offer id');
  if (packageId === null || !Number.isSafeInteger(packageId) || packageId < 1 ||
    percent === null || !Number.isInteger(percent) || percent < 1 || percent > 90) throw new Error('Invalid offer');
  if ((from && !validDateOnly(from)) || (until && !validDateOnly(until))) throw new Error('Invalid offer date');
  const validFrom = from ? new Date(from) : null;
  const validUntil = until ? new Date(until) : null;
  if (validFrom && validUntil && validUntil <= validFrom) throw new Error('End date must be after start date');
  const [pkg] = await db.select().from(packages).where(eq(packages.id, packageId)).limit(1);
  if (!pkg) throw new Error('Package not found');
  const data = {
    image: pkg.cover,
    packageId,
    discountPercent: percent,
    validFrom,
    validUntil,
    published: checked(formData, 'published'),
    i18n: {
      en: {title: pkg.i18n.en.title, text: pkg.i18n.en.intro, badge: `-${percent}%`},
      ar: {title: pkg.i18n.ar.title, text: pkg.i18n.ar.intro, badge: `-${percent}%`}
    }
  };
  if (id) await db.update(offers).set(data).where(eq(offers.id, id));
  else await db.insert(offers).values(data);
  revalidatePublicData(PUBLIC_CACHE_TAGS.offers);
  await go('/admin/offers');
}