import 'dotenv/config';
import {asc} from 'drizzle-orm';
import {db} from '../lib/db';
import {activities, coupons} from '../lib/db/schema';

async function main() {
  const [activity] = await db.select({id: activities.id}).from(activities).orderBy(asc(activities.id)).limit(1);
  if (!activity) throw new Error('Cannot seed FUN20: no activities exist.');

  const welcome = await db.insert(coupons).values({
    code: 'WELCOME10',
    scope: 'package',
    packageId: null,
    discountType: 'percent',
    discountValue: 10,
    minTotalUsd: null,
    maxUses: null,
    validFrom: null,
    validUntil: null,
    active: true,
    isPublic: true,
    i18n: {
      en: {title: 'Welcome 10%', terms: 'Valid on all packages.'},
      ar: {title: 'خصم ترحيبي 10%', terms: 'صالح على جميع الباقات.'}
    }
  }).onConflictDoNothing({target: coupons.code}).returning({code: coupons.code});
  console.log(welcome.length ? `Inserted ${welcome[0].code}` : 'Skipped WELCOME10 (code already exists).');

  const fun = await db.insert(coupons).values({
    code: 'FUN20',
    scope: 'activity',
    activityId: activity.id,
    discountType: 'fixed',
    discountValue: 20,
    minTotalUsd: 50,
    maxUses: 100,
    validUntil: new Date('2027-12-31T23:59:59.999Z'),
    active: true,
    isPublic: false,
    i18n: {
      en: {title: '$20 off an activity', terms: 'Minimum order $50.'},
      ar: {title: 'خصم 20$ على نشاط', terms: 'الحد الأدنى للطلب 50$.'}
    }
  }).onConflictDoNothing({target: coupons.code}).returning({code: coupons.code});
  console.log(fun.length ? `Inserted ${fun[0].code}` : 'Skipped FUN20 (code already exists).');
  process.exit(0);
}

main().catch((e) => {
  console.error('FAILED:', e);
  process.exit(1);
});
