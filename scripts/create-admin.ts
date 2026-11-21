import 'dotenv/config';
import bcrypt from 'bcryptjs';
import {db} from '../lib/db';
import {admins} from '../lib/db/schema';

async function main() {
  const [email, password] = process.argv.slice(2);
  if (!email || !password) {
    console.error('Usage: npx tsx scripts/create-admin.ts <email> <password>');
    process.exit(1);
  }
  const normalizedEmail = email.trim().toLowerCase();
  if (normalizedEmail.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
    throw new Error('Admin email must be valid and at most 254 characters');
  }
  if (
    Array.from(password).length < 8 ||
    Buffer.byteLength(password, 'utf8') > 72 ||
    !/\p{L}/u.test(password) ||
    !/\p{N}/u.test(password)
  ) {
    throw new Error('Admin password must be 8-72 bytes and include at least one letter and one number');
  }
  const passwordHash = await bcrypt.hash(password, 12);
  await db
    .insert(admins)
    .values({email: normalizedEmail, passwordHash})
    .onConflictDoUpdate({target: admins.email, set: {passwordHash}});
  console.log('Admin ready:', email);
  process.exit(0);
}

main().catch((e) => {
  console.error('FAILED:', e);
  process.exit(1);
});