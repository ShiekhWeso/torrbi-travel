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
  const passwordHash = await bcrypt.hash(password, 12);
  await db
    .insert(admins)
    .values({email: email.trim().toLowerCase(), passwordHash})
    .onConflictDoUpdate({target: admins.email, set: {passwordHash}});
  console.log('Admin ready:', email);
  process.exit(0);
}

main().catch((e) => {
  console.error('FAILED:', e);
  process.exit(1);
});