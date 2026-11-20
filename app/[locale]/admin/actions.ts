'use server';

import {redirect} from 'next/navigation';
import {revalidatePath} from 'next/cache';
import bcrypt from 'bcryptjs';
import {and, eq} from 'drizzle-orm';
import {db} from '@/lib/db';
import {admins, destinations, activities, offers, packages, packageDays, faqs, bookings, activityReviews, settings, coupons, contactLinks, users, searchRegions, searchDurations, type ContactSection, type ContactType, type CouponScope, type CouponDiscountType} from '@/lib/db/schema';
import {createSession, destroySession, getSession} from '@/lib/auth';
import {getLocale} from 'next-intl/server';
import {bookingRef} from '@/lib/bookingRef';
import {bookingCancelled, bookingConfirmed} from '@/lib/email-templates';
import {sendEmail} from '@/lib/email';

async function go(path: string): Promise<never> {
  redirect(`/${await getLocale()}${path}`);
}

export async function login(_prev: string | null | undefined, formData: FormData) {
  const email = String(formData.get('email') ?? '').trim().toLowerCase();
  const password = String(formData.get('password') ?? '');
  const [admin] = await db.select().from(admins).where(eq(admins.email, email)).limit(1);
  const ok = admin ? await bcrypt.compare(password, admin.passwordHash) : false;
  if (!ok) return 'Wrong email or password';
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
  if (!myr || myr <= 0) return;
  await db.insert(settings).values({key: 'rates', value: {MYR: myr}})
    .onConflictDoUpdate({target: settings.key, set: {value: {MYR: myr}}});
  revalidatePath('/', 'layout');
  await go('/admin/currency');
}

const str = (v: FormDataEntryValue | null) => String(v ?? '').trim();
const num = (v: FormDataEntryValue | null) => {
  const s = str(v);
  return s === '' ? null : Number(s);
};

export async function saveDestination(formData: FormData) {
  if (!(await getSession())) await go('/admin/login');
  const id = num(formData.get('id'));
  const f = (k: string) => str(formData.get(k));
  const l = (k: string) => lines(formData.get(k));
  type FRow = {icon: string; title_en: string; text_en: string; title_ar: string; text_ar: string};
  let rows: FRow[] = [];
  try {
    rows = JSON.parse(f('features') || '[]');
  } catch (error) {
    console.error('Failed to parse destination features', error);
    throw error;
  }
  rows = rows.filter((r) => r.title_en?.trim() || r.title_ar?.trim());
  const data = {
    slug: f('slug'),
    region: f('region') || 'asia',
    image: f('image') || null,
    gallery: l('gallery'),
    currency: f('currency') || null,
    timezone: f('timezone') || null,
    rating: num(formData.get('rating')),
    flightHours: num(formData.get('flightHours')),
    temp: f('temp') || null,
    bestFrom: num(formData.get('bestFrom')),
    bestTo: num(formData.get('bestTo')),
    published: formData.get('published') === 'on',
    sort: num(formData.get('sort')) ?? 0,
    i18n: {
      en: {name: f('name_en'), country: f('country_en'), about: f('about_en'), language: f('language_en'), visa: f('visa_en'), tips: l('tips_en'), features: rows.map((r) => ({icon: r.icon, title: r.title_en.trim(), text: r.text_en.trim()}))},
      ar: {name: f('name_ar'), country: f('country_ar'), about: f('about_ar'), language: f('language_ar'), visa: f('visa_ar'), tips: l('tips_ar'), features: rows.map((r) => ({icon: r.icon, title: r.title_ar.trim(), text: r.text_ar.trim()}))}
    }
  };
  if (id) await db.update(destinations).set(data).where(eq(destinations.id, id));
  else await db.insert(destinations).values(data);
  revalidatePath('/', 'layout');
  await go('/admin/destinations');
}

export async function deleteDestination(formData: FormData) {
  if (!(await getSession())) await go('/admin/login');
  await db.delete(destinations).where(eq(destinations.id, Number(formData.get('id'))));
  revalidatePath('/', 'layout');
  await go('/admin/destinations');
}

export async function saveOffer(formData: FormData) {
  if (!(await getSession())) await go('/admin/login');
  const id = num(formData.get('id'));
  const f = (k: string) => str(formData.get(k));
  const until = f('validUntil');
  const data = {
    image: f('image') || null,
    packageId: num(formData.get('packageId')),
    validUntil: until ? new Date(until) : null,
    published: formData.get('published') === 'on',
    sort: num(formData.get('sort')) ?? 0,
    i18n: {
      en: {title: f('title_en'), text: f('text_en'), badge: f('badge_en')},
      ar: {title: f('title_ar'), text: f('text_ar'), badge: f('badge_ar')}
    }
  };
  if (id) await db.update(offers).set(data).where(eq(offers.id, id));
  else await db.insert(offers).values(data);
  revalidatePath('/', 'layout');
  await go('/admin/offers');
}

export async function deleteOffer(formData: FormData) {
  if (!(await getSession())) await go('/admin/login');
  await db.delete(offers).where(eq(offers.id, Number(formData.get('id'))));
  revalidatePath('/', 'layout');
  await go('/admin/offers');
}

export async function saveFaq(formData: FormData) {
  if (!(await getSession())) await go('/admin/login');
  const id = num(formData.get('id'));
  const f = (k: string) => str(formData.get(k));
  const data = {
    sort: num(formData.get('sort')) ?? 0,
    published: formData.get('published') === 'on',
    i18n: {
      en: {question: f('question_en'), answer: f('answer_en')},
      ar: {question: f('question_ar'), answer: f('answer_ar')}
    }
  };
  if (id) await db.update(faqs).set(data).where(eq(faqs.id, id));
  else await db.insert(faqs).values(data);
  revalidatePath('/', 'layout');
  await go('/admin/faqs');
}

export async function deleteFaq(formData: FormData) {
  if (!(await getSession())) await go('/admin/login');
  await db.delete(faqs).where(eq(faqs.id, Number(formData.get('id'))));
  revalidatePath('/', 'layout');
  await go('/admin/faqs');
}

function validId(value: FormDataEntryValue | null, label: string) {
  const id = num(value);
  if (id === null || !Number.isSafeInteger(id) || id < 1) throw new Error(`Invalid ${label} id`);
  return id;
}

function validSort(value: FormDataEntryValue | null) {
  const sort = num(value);
  if (sort === null || !Number.isSafeInteger(sort) || sort < 0) throw new Error('Invalid search option sort order');
  return sort;
}

function optionalDayBound(value: FormDataEntryValue | null, label: string) {
  const days = num(value);
  if (days !== null && (!Number.isSafeInteger(days) || days < 1)) throw new Error(`Invalid ${label}`);
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
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) throw new Error('Invalid search region slug');
  if (!nameEn || !nameAr) throw new Error('Search region names are required in English and Arabic');
  const data = {
    slug,
    sort: validSort(formData.get('sort')),
    published: formData.get('published') === 'on',
    i18n: {en: {name: nameEn}, ar: {name: nameAr}}
  };
  if (rawId !== null) {
    const updated = await db.update(searchRegions).set(data)
      .where(eq(searchRegions.id, rawId)).returning({id: searchRegions.id});
    if (updated.length === 0) throw new Error('Search region not found');
  } else {
    await db.insert(searchRegions).values(data);
  }
  revalidatePath('/', 'layout');
  await go('/admin/search');
}

export async function deleteSearchRegion(formData: FormData) {
  if (!(await getSession())) await go('/admin/login');
  const id = validId(formData.get('id'), 'search region');
  const deleted = await db.delete(searchRegions).where(eq(searchRegions.id, id)).returning({id: searchRegions.id});
  if (deleted.length === 0) throw new Error('Search region not found');
  revalidatePath('/', 'layout');
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
  if (!labelEn || !labelAr) throw new Error('Search duration labels are required in English and Arabic');
  if (minDays !== null && maxDays !== null && minDays > maxDays) {
    throw new Error('Minimum days cannot exceed maximum days');
  }
  const data = {
    sort: validSort(formData.get('sort')),
    published: formData.get('published') === 'on',
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
  revalidatePath('/', 'layout');
  await go('/admin/search');
}

export async function deleteSearchDuration(formData: FormData) {
  if (!(await getSession())) await go('/admin/login');
  const id = validId(formData.get('id'), 'search duration');
  const deleted = await db.delete(searchDurations).where(eq(searchDurations.id, id)).returning({id: searchDurations.id});
  if (deleted.length === 0) throw new Error('Search duration not found');
  revalidatePath('/', 'layout');
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
  const validFrom = validFromValue ? new Date(validFromValue) : null;
  const validUntil = validUntilValue ? new Date(validUntilValue) : null;

  if (!code) throw new Error('Coupon code is required');
  if (!['all', 'package', 'activity'].includes(scope)) throw new Error('Invalid coupon scope');
  if (!['percent', 'fixed'].includes(discountType)) throw new Error('Invalid coupon discount type');
  if (!Number.isInteger(discountValue) || discountValue === null || discountValue < 1) {
    throw new Error('Coupon discount must be a positive whole number');
  }
  if (discountType === 'percent' && discountValue > 100) {
    throw new Error('Percent discounts cannot exceed 100');
  }
  if (minTotalUsd !== null && (!Number.isInteger(minTotalUsd) || minTotalUsd < 0)) {
    throw new Error('Minimum total must be a non-negative whole number');
  }
  if (maxUses !== null && (!Number.isInteger(maxUses) || maxUses < 1)) {
    throw new Error('Maximum uses must be a positive whole number');
  }
  if (validFrom && Number.isNaN(validFrom.getTime())) throw new Error('Invalid valid-from date');
  if (validUntil && Number.isNaN(validUntil.getTime())) throw new Error('Invalid valid-until date');
  if (validFrom && validUntil && validUntil <= validFrom) {
    throw new Error('Valid-until must be after valid-from');
  }

  return {
    code,
    scope,
    packageId: scope === 'package' ? num(formData.get('packageId')) : null,
    activityId: scope === 'activity' ? num(formData.get('activityId')) : null,
    discountType,
    discountValue,
    minTotalUsd,
    maxUses,
    validFrom,
    validUntil,
    isPublic: formData.get('isPublic') === 'on',
    active: formData.get('active') === 'on',
    i18n: {
      en: {title: f('title_en'), terms: f('terms_en')},
      ar: {title: f('title_ar'), terms: f('terms_ar')}
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
  const id = Number(formData.get('id'));
  if (!Number.isInteger(id) || id < 1) throw new Error('Invalid coupon id');
  const data = couponData(formData);
  await ensureCouponCodeAvailable(data.code, id);
  await db.update(coupons).set(data).where(eq(coupons.id, id));
  revalidatePath('/', 'layout');
  await go('/admin/coupons');
}

export async function deleteCoupon(formData: FormData) {
  if (!(await getSession())) await go('/admin/login');
  await db.delete(coupons).where(eq(coupons.id, Number(formData.get('id'))));
  revalidatePath('/', 'layout');
  await go('/admin/coupons');
}

export async function toggleCoupon(formData: FormData) {
  if (!(await getSession())) await go('/admin/login');
  const id = Number(formData.get('id'));
  const active = str(formData.get('active'));
  if (!Number.isInteger(id) || id < 1 || !['true', 'false'].includes(active)) {
    throw new Error('Invalid coupon status');
  }
  await db.update(coupons).set({active: active === 'true'}).where(eq(coupons.id, id));
  revalidatePath('/', 'layout');
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
  if (!value) throw new Error('Contact value is required');
  if (section === 'social') {
    let url: URL;
    try {
      url = new URL(value);
    } catch {
      throw new Error('Social contact value must be a valid URL');
    }
    if (!['http:', 'https:'].includes(url.protocol)) throw new Error('Social contact URL must use HTTP or HTTPS');
  }
  if (!Number.isInteger(sort)) throw new Error('Contact sort order must be a whole number');
  const labelEn = str(formData.get('label_en'));
  const labelAr = str(formData.get('label_ar'));
  return {
    section: section as ContactSection,
    type: type as ContactType,
    value,
    i18n: labelEn || labelAr ? {
      ...(labelEn ? {en: {label: labelEn}} : {}),
      ...(labelAr ? {ar: {label: labelAr}} : {})
    } : null,
    sort,
    published: formData.get('published') === 'on'
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
  revalidatePath('/', 'layout');
  await go('/admin/contact');
}

export async function deleteContactLink(formData: FormData) {
  if (!(await getSession())) await go('/admin/login');
  const id = Number(formData.get('id'));
  if (!Number.isInteger(id) || id < 1) throw new Error('Invalid contact link id');
  await db.delete(contactLinks).where(eq(contactLinks.id, id));
  revalidatePath('/', 'layout');
  await go('/admin/contact');
}

export async function toggleContactLink(formData: FormData) {
  if (!(await getSession())) await go('/admin/login');
  const id = Number(formData.get('id'));
  const published = str(formData.get('published'));
  if (!Number.isInteger(id) || id < 1 || !['true', 'false'].includes(published)) {
    throw new Error('Invalid contact link status');
  }
  await db.update(contactLinks).set({published: published === 'true'}).where(eq(contactLinks.id, id));
  revalidatePath('/', 'layout');
}

export async function setActivityReviewHidden(formData: FormData) {
  if (!(await getSession())) await go('/admin/login');
  const id = Number(formData.get('id'));
  const hidden = str(formData.get('hidden'));
  if (!Number.isInteger(id) || id < 1 || !['true', 'false'].includes(hidden)) {
    throw new Error('Invalid activity review status');
  }
  await db.update(activityReviews).set({hidden: hidden === 'true'}).where(eq(activityReviews.id, id));
  revalidatePath('/', 'layout');
}

export async function deleteActivityReview(formData: FormData) {
  if (!(await getSession())) await go('/admin/login');
  const id = Number(formData.get('id'));
  if (!Number.isInteger(id) || id < 1) throw new Error('Invalid activity review id');
  await db.delete(activityReviews).where(eq(activityReviews.id, id));
  revalidatePath('/', 'layout');
}

const lines = (v: FormDataEntryValue | null) =>
  str(v).split('\n').map((s) => s.trim()).filter(Boolean);

export async function savePackage(formData: FormData) {
  if (!(await getSession())) await go('/admin/login');
  const id = num(formData.get('id'));
  const destinationId = num(formData.get('destinationId'));
  if (destinationId !== null && (!Number.isInteger(destinationId) || destinationId < 1)) {
    throw new Error('Invalid package destination');
  }
  const f = (k: string) => str(formData.get(k));
  const l = (k: string) => lines(formData.get(k));
  type FRow = {icon: string; title_en: string; text_en: string; title_ar: string; text_ar: string};
  let rows: FRow[] = [];
  try {
    rows = JSON.parse(f('features') || '[]');
  } catch (error) {
    console.error('Failed to parse package features', error);
    throw error;
  }
  rows = rows.filter((r) => r.title_en?.trim() || r.title_ar?.trim());
  const data = {
    slug: f('slug'),
    destinationId,
    region: f('region') || 'asia',
    days: num(formData.get('packageDaysCount')) ?? 1,
    nights: num(formData.get('nights')) ?? 0,
    priceUsd: num(formData.get('priceUsd')),
    childPriceUsd: num(formData.get('childPriceUsd')),
    infantPriceUsd: num(formData.get('infantPriceUsd')),
    cover: f('cover') || null,
    gallery: l('gallery'),
    featured: formData.get('featured') === 'on',
    published: formData.get('published') === 'on',
    sort: num(formData.get('sort')) ?? 0,
    i18n: {
      en: {title: f('title_en'), intro: f('intro_en'), stay: l('stay_en'), includes: l('includes_en'), excludes: l('excludes_en'), highlights: l('highlights_en'), policies: l('policies_en'), features: rows.map((r) => ({icon: r.icon, title: r.title_en.trim(), text: r.text_en.trim()}))},
      ar: {title: f('title_ar'), intro: f('intro_ar'), stay: l('stay_ar'), includes: l('includes_ar'), excludes: l('excludes_ar'), highlights: l('highlights_ar'), policies: l('policies_ar'), features: rows.map((r) => ({icon: r.icon, title: r.title_ar.trim(), text: r.text_ar.trim()}))}
    }
  };
  if (id) await db.update(packages).set(data).where(eq(packages.id, id));
  else {
    const [createdPackage] = await db.insert(packages).values(data).returning({id: packages.id});
    if (!createdPackage) throw new Error('Failed to create package');

    let parsedDays: unknown;
    try {
      parsedDays = JSON.parse(str(formData.get('days')) || '[]');
    } catch (error) {
      console.error('Failed to parse package itinerary days', error);
      throw error;
    }
    if (!Array.isArray(parsedDays)) throw new Error('Package itinerary days must be an array');

    const daysToInsert = parsedDays.flatMap((value) => {
      if (typeof value !== 'object' || value === null || Array.isArray(value)) {
        throw new Error('Invalid package itinerary day');
      }
      const day = value as Record<string, unknown>;
      if (typeof day.title_en !== 'string' || typeof day.title_ar !== 'string') {
        throw new Error('Package day titles must be strings');
      }
      const titleEn = day.title_en.trim();
      const titleAr = day.title_ar.trim();
      if (!titleEn && !titleAr) return [];

      const dayNoValue = day.dayNo;
      if ((typeof dayNoValue !== 'number' && typeof dayNoValue !== 'string') ||
        (typeof dayNoValue === 'string' && !dayNoValue.trim())) {
        throw new Error('Package day number must be an integer');
      }
      const dayNo = Number(dayNoValue);
      if (!Number.isInteger(dayNo)) throw new Error('Package day number must be an integer');
      if (day.stage !== null && typeof day.stage !== 'string') {
        throw new Error('Package day stage must be a string or null');
      }
      if (typeof day.items_en !== 'string' || typeof day.items_ar !== 'string') {
        throw new Error('Package day items must be strings');
      }

      return [{
        packageId: createdPackage.id,
        dayNo,
        stage: typeof day.stage === 'string' ? day.stage.trim() || null : null,
        i18n: {
          en: {title: titleEn, items: lines(day.items_en)},
          ar: {title: titleAr, items: lines(day.items_ar)}
        }
      }];
    });
    if (daysToInsert.length) await db.insert(packageDays).values(daysToInsert);
  }
  revalidatePath('/', 'layout');
  await go('/admin/packages');
}

export async function saveActivity(formData: FormData) {
  if (!(await getSession())) await go('/admin/login');
  const id = num(formData.get('id'));
  const f = (k: string) => str(formData.get(k));
  const l = (k: string) => lines(formData.get(k));
  const data = {
    slug: f('slug'),
    city: f('city'),
    image: f('image') || null,
    gallery: l('gallery'),
    priceUsd: num(formData.get('priceUsd')),
    childPriceUsd: num(formData.get('childPriceUsd')),
    infantPriceUsd: num(formData.get('infantPriceUsd')),
    carPrice1Usd: num(formData.get('carPrice1Usd')),
    carPrice2Usd: num(formData.get('carPrice2Usd')),
    carPrice3Usd: num(formData.get('carPrice3Usd')),
    durationHours: num(formData.get('durationHours')),
    featured: formData.get('featured') === 'on',
    published: formData.get('published') === 'on',
    sort: num(formData.get('sort')) ?? 0,
    i18n: {
      en: {title: f('title_en'), description: f('description_en'), includes: l('includes_en'), highlights: l('highlights_en'), policies: l('policies_en')},
      ar: {title: f('title_ar'), description: f('description_ar'), includes: l('includes_ar'), highlights: l('highlights_ar'), policies: l('policies_ar')}
    }
  };
  if (id) await db.update(activities).set(data).where(eq(activities.id, id));
  else await db.insert(activities).values(data);
  revalidatePath('/', 'layout');
  await go('/admin/activities');
}

export async function deleteActivity(formData: FormData) {
  if (!(await getSession())) await go('/admin/login');
  await db.delete(activities).where(eq(activities.id, Number(formData.get('id'))));
  revalidatePath('/', 'layout');
  await go('/admin/activities');
}

export async function deletePackage(formData: FormData) {
  if (!(await getSession())) await go('/admin/login');
  await db.delete(packages).where(eq(packages.id, Number(formData.get('id'))));
  revalidatePath('/', 'layout');
  await go('/admin/packages');
}

export async function saveDay(formData: FormData) {
  if (!(await getSession())) await go('/admin/login');
  const id = num(formData.get('id'));
  const packageId = Number(formData.get('packageId'));
  const f = (k: string) => str(formData.get(k));
  const data = {
    packageId,
    dayNo: num(formData.get('dayNo')) ?? 1,
    stage: f('stage') || null,
    i18n: {
      en: {title: f('title_en'), items: lines(formData.get('items_en'))},
      ar: {title: f('title_ar'), items: lines(formData.get('items_ar'))}
    }
  };
  if (id) await db.update(packageDays).set(data).where(eq(packageDays.id, id));
  else await db.insert(packageDays).values(data);
  revalidatePath('/', 'layout');
  await go(`/admin/packages/${packageId}`);
}

export async function deleteDay(formData: FormData) {
  if (!(await getSession())) await go('/admin/login');
  await db.delete(packageDays).where(eq(packageDays.id, Number(formData.get('id'))));
  revalidatePath('/', 'layout');
  await go(`/admin/packages/${formData.get('packageId')}`);
}

export async function setBookingStatus(formData: FormData) {
  if (!(await getSession())) await go('/admin/login');
  const status = String(formData.get('status'));
  if (!['pending', 'confirmed', 'cancelled'].includes(status)) return;
  const id = Number(formData.get('id'));
  const [booking] = await db.select({
    id: bookings.id,
    status: bookings.status,
    lang: bookings.lang,
    title: bookings.packageTitle,
    date: bookings.travelDate,
    guests: bookings.pax,
    totalUsd: bookings.totalUsd,
    email: users.email,
    name: users.name
  }).from(bookings).innerJoin(users, eq(bookings.userId, users.id)).where(eq(bookings.id, id)).limit(1);
  if (booking && booking.status !== status) {
    const [updated] = await db.update(bookings).set({status}).where(and(
      eq(bookings.id, id),
      eq(bookings.status, booking.status)
    )).returning({id: bookings.id});
    if (updated && (status === 'confirmed' || status === 'cancelled')) {
      const locale = booking.lang === 'ar' ? 'ar' : 'en';
      const data = {
        name: booking.name,
        reference: bookingRef(booking.id),
        title: booking.title,
        date: booking.date,
        guests: booking.guests,
        totalUsd: booking.totalUsd
      };
      if (status === 'confirmed') {
        void sendEmail({to: booking.email, ...bookingConfirmed(locale, data)});
      } else {
        void sendEmail({to: booking.email, ...bookingCancelled(locale, data)});
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
  if (!packageId || !percent || !Number.isInteger(percent) || percent < 1 || percent > 90) throw new Error('Invalid offer');
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
    published: formData.get('published') === 'on',
    i18n: {
      en: {title: pkg.i18n.en.title, text: pkg.i18n.en.intro, badge: `-${percent}%`},
      ar: {title: pkg.i18n.ar.title, text: pkg.i18n.ar.intro, badge: `-${percent}%`}
    }
  };
  if (id) await db.update(offers).set(data).where(eq(offers.id, id));
  else await db.insert(offers).values(data);
  revalidatePath('/', 'layout');
  await go('/admin/offers');
}