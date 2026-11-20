import 'dotenv/config';

import {sendEmail} from '../lib/email';
import {
  bookingCancelled,
  bookingConfirmed,
  bookingReceived,
  welcome,
  type BookingEmailData,
  type EmailLocale
} from '../lib/email-templates';
import {bookingRef} from '../lib/bookingRef';

const to = process.argv[2]?.trim();
if (!to) throw new Error('Usage: npm run test:email -- <email-address>');

const bookingData: BookingEmailData = {
  name: 'Test customer',
  reference: bookingRef(123),
  title: 'Bali Adventure',
  date: '2026-12-15',
  guests: 2,
  totalUsd: 450
};

const templates = [
  {name: 'welcome', build: (locale: EmailLocale) => welcome(locale, {name: bookingData.name})},
  {name: 'bookingReceived', build: (locale: EmailLocale) => bookingReceived(locale, bookingData)},
  {name: 'bookingConfirmed', build: (locale: EmailLocale) => bookingConfirmed(locale, bookingData)},
  {name: 'bookingCancelled', build: (locale: EmailLocale) => bookingCancelled(locale, bookingData)}
];

async function main() {
  let failures = 0;
  for (const locale of ['en', 'ar'] as const) {
    for (const template of templates) {
      const {subject, html} = template.build(locale);
      const result = await sendEmail({to, subject: `[TEST ${locale}] ${subject}`, html});
      console.log(`${result.ok ? 'Sent' : 'Failed'} ${template.name} (${locale}) to ${to}`);
      if (!result.ok) failures += 1;
    }
  }
  if (failures) process.exitCode = 1;
}

main().catch((error: unknown) => {
  console.error('Email template test failed:', error);
  process.exitCode = 1;
});
