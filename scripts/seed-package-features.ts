import 'dotenv/config';
import {asc, eq} from 'drizzle-orm';
import {db} from '../lib/db';
import {packages} from '../lib/db/schema';
import en from '../messages/en.json';
import ar from '../messages/ar.json';

function durationInEnglish(days: number) {
  return `${days} ${days === 1 ? 'day' : 'days'}`;
}

function defaultFeatures(days: number) {
  return {
    en: [
      {icon: 'schedule', title: en.packageDetail.duration, text: durationInEnglish(days)},
      {icon: 'event_available', title: en.packageDetail.freeCancel, text: en.packageDetail.freeCancelText},
      {icon: 'account_balance_wallet', title: en.packageDetail.payLater, text: en.packageDetail.payLaterText},
      {icon: 'flag', title: en.packageDetail.guide, text: en.packageDetail.guideText},
      {icon: 'airport_shuttle', title: en.packageDetail.pickup, text: en.packageDetail.pickupText}
    ],
    ar: [
      {icon: 'schedule', title: ar.packageDetail.duration, text: `${days} يوماً`},
      {icon: 'event_available', title: ar.packageDetail.freeCancel, text: ar.packageDetail.freeCancelText},
      {icon: 'account_balance_wallet', title: ar.packageDetail.payLater, text: ar.packageDetail.payLaterText},
      {icon: 'flag', title: ar.packageDetail.guide, text: ar.packageDetail.guideText},
      {icon: 'airport_shuttle', title: ar.packageDetail.pickup, text: ar.packageDetail.pickupText}
    ]
  };
}

async function main() {
  const rows = await db.select().from(packages).orderBy(asc(packages.id));
  let updated = 0;

  for (const pkg of rows) {
    if (pkg.i18n.en.features?.length && pkg.i18n.ar.features?.length) continue;

    const features = defaultFeatures(pkg.days);
    await db.update(packages).set({
      i18n: {
        ...pkg.i18n,
        en: {...pkg.i18n.en, features: features.en},
        ar: {...pkg.i18n.ar, features: features.ar}
      }
    }).where(eq(packages.id, pkg.id));
    updated += 1;
  }

  console.log(`Updated ${updated} packages`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
