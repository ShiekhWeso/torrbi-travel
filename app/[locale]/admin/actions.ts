'use server';

import {redirect} from 'next/navigation';
import {revalidatePath} from 'next/cache';
import bcrypt from 'bcryptjs';
import {eq} from 'drizzle-orm';
import {db} from '@/lib/db';
import {admins, destinations, offers, packages, packageDays} from '@/lib/db/schema';
import {createSession, destroySession, getSession} from '@/lib/auth';

export async function login(_prev: string | null, formData: FormData) {
  const email = String(formData.get('email') ?? '').trim().toLowerCase();
  const password = String(formData.get('password') ?? '');
  const [admin] = await db.select().from(admins).where(eq(admins.email, email)).limit(1);
  const ok = admin ? await bcrypt.compare(password, admin.passwordHash) : false;
  if (!ok) return 'Wrong email or password';
  await createSession(email);
  redirect('/en/admin');
}

export async function logout() {
  await destroySession();
  redirect('/en/admin/login');
}

const str = (v: FormDataEntryValue | null) => String(v ?? '').trim();
const num = (v: FormDataEntryValue | null) => {
  const s = str(v);
  return s === '' ? null : Number(s);
};

export async function saveDestination(formData: FormData) {
  if (!(await getSession())) redirect('/en/admin/login');
  const id = num(formData.get('id'));
  const f = (k: string) => str(formData.get(k));
  const data = {
    slug: f('slug'),
    region: f('region') || 'asia',
    image: f('image') || null,
    rating: num(formData.get('rating')),
    flightHours: num(formData.get('flightHours')),
    temp: f('temp') || null,
    bestFrom: num(formData.get('bestFrom')),
    bestTo: num(formData.get('bestTo')),
    published: formData.get('published') === 'on',
    sort: num(formData.get('sort')) ?? 0,
    i18n: {
      en: {name: f('name_en'), country: f('country_en'), about: f('about_en')},
      ar: {name: f('name_ar'), country: f('country_ar'), about: f('about_ar')}
    }
  };
  if (id) await db.update(destinations).set(data).where(eq(destinations.id, id));
  else await db.insert(destinations).values(data);
  revalidatePath('/', 'layout');
  redirect('/en/admin/destinations');
}

export async function deleteDestination(formData: FormData) {
  if (!(await getSession())) redirect('/en/admin/login');
  await db.delete(destinations).where(eq(destinations.id, Number(formData.get('id'))));
  revalidatePath('/', 'layout');
  redirect('/en/admin/destinations');
}

export async function saveOffer(formData: FormData) {
  if (!(await getSession())) redirect('/en/admin/login');
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
  redirect('/en/admin/offers');
}

export async function deleteOffer(formData: FormData) {
  if (!(await getSession())) redirect('/en/admin/login');
  await db.delete(offers).where(eq(offers.id, Number(formData.get('id'))));
  revalidatePath('/', 'layout');
  redirect('/en/admin/offers');
}

const lines = (v: FormDataEntryValue | null) =>
  str(v).split('\n').map((s) => s.trim()).filter(Boolean);

export async function savePackage(formData: FormData) {
  if (!(await getSession())) redirect('/en/admin/login');
  const id = num(formData.get('id'));
  const f = (k: string) => str(formData.get(k));
  const l = (k: string) => lines(formData.get(k));
  const data = {
    slug: f('slug'),
    region: f('region') || 'asia',
    days: num(formData.get('days')) ?? 1,
    nights: num(formData.get('nights')) ?? 0,
    priceUsd: num(formData.get('priceUsd')),
    cover: f('cover') || null,
    gallery: l('gallery'),
    featured: formData.get('featured') === 'on',
    published: formData.get('published') === 'on',
    sort: num(formData.get('sort')) ?? 0,
    i18n: {
      en: {title: f('title_en'), intro: f('intro_en'), stay: l('stay_en'), includes: l('includes_en'), excludes: l('excludes_en'), highlights: l('highlights_en')},
      ar: {title: f('title_ar'), intro: f('intro_ar'), stay: l('stay_ar'), includes: l('includes_ar'), excludes: l('excludes_ar'), highlights: l('highlights_ar')}
    }
  };
  let pid = id;
  if (id) await db.update(packages).set(data).where(eq(packages.id, id));
  else [{id: pid}] = await db.insert(packages).values(data).returning({id: packages.id});
  revalidatePath('/', 'layout');
  redirect(`/en/admin/packages/${pid}`);
}

export async function deletePackage(formData: FormData) {
  if (!(await getSession())) redirect('/en/admin/login');
  await db.delete(packages).where(eq(packages.id, Number(formData.get('id'))));
  revalidatePath('/', 'layout');
  redirect('/en/admin/packages');
}

export async function saveDay(formData: FormData) {
  if (!(await getSession())) redirect('/en/admin/login');
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
  redirect(`/en/admin/packages/${packageId}`);
}

export async function deleteDay(formData: FormData) {
  if (!(await getSession())) redirect('/en/admin/login');
  await db.delete(packageDays).where(eq(packageDays.id, Number(formData.get('id'))));
  revalidatePath('/', 'layout');
  redirect(`/en/admin/packages/${formData.get('packageId')}`);
}