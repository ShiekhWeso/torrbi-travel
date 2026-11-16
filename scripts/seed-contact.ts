import 'dotenv/config';
import {db} from '../lib/db';
import {contactLinks} from '../lib/db/schema';

const entries = [
  {section: 'social' as const, type: 'instagram' as const, value: 'https://instagram.com/torrbi.travel'},
  {section: 'social' as const, type: 'facebook' as const, value: 'https://facebook.com/torrbi.travel'},
  {section: 'social' as const, type: 'tiktok' as const, value: 'https://tiktok.com/@torrbi.travel'},
  {section: 'social' as const, type: 'x' as const, value: 'https://x.com/torrbi_travel'},
  {section: 'social' as const, type: 'youtube' as const, value: 'https://youtube.com/@torrbi.travel'},
  {section: 'social' as const, type: 'snapchat' as const, value: 'https://snapchat.com/add/torrbi.travel'},
  {section: 'direct' as const, type: 'whatsapp' as const, value: '+20 100 000 0000'},
  {section: 'direct' as const, type: 'phone' as const, value: '+20 100 000 0000'},
  {section: 'direct' as const, type: 'email' as const, value: 'info@torrbi.example'},
  {
    section: 'direct' as const,
    type: 'hours' as const,
    value: 'Sunday – Thursday, 9:00 – 18:00',
    i18n: {
      en: {label: 'Sunday – Thursday, 9:00 – 18:00'},
      ar: {label: 'من الأحد إلى الخميس، 9:00 – 18:00'}
    }
  }
];

async function main() {
  const existing = await db.select({id: contactLinks.id}).from(contactLinks).limit(1);
  if (existing.length > 0) {
    console.log('Contact links already exist; skipping seed.');
    process.exit(0);
  }

  await db.insert(contactLinks).values(entries);
  console.log('Contact links seeded.');
  process.exit(0);
}

main().catch((e) => {
  console.error('FAILED:', e);
  process.exit(1);
});
