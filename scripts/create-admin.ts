import 'dotenv/config';
import bcrypt from 'bcryptjs';
import {eq} from 'drizzle-orm';
import {db} from '../lib/db';
import {admins} from '../lib/db/schema';

function readHiddenPassword(): Promise<string> {
  if (!process.stdin.isTTY) throw new Error('A terminal is required to read the password securely');
  process.stdout.write('Password: ');
  process.stdin.setRawMode(true);
  process.stdin.resume();
  process.stdin.setEncoding('utf8');
  return new Promise((resolve, reject) => {
    let password = '';
    const finish = (error?: Error) => {
      process.stdin.removeListener('data', onData);
      process.stdin.setRawMode(false);
      process.stdin.pause();
      process.stdout.write('\n');
      if (error) reject(error);
      else resolve(password);
    };
    const onData = (chunk: string) => {
      for (const character of chunk) {
        if (character === '\u0003') return finish(new Error('Password input cancelled'));
        if (character === '\r' || character === '\n') return finish();
        if (character === '\u007f' || character === '\b') {
          password = Array.from(password).slice(0, -1).join('');
        } else {
          password += character;
        }
      }
    };
    process.stdin.on('data', onData);
  });
}

function validPassword(password: string) {
  return Array.from(password).length >= 8 && Buffer.byteLength(password, 'utf8') <= 72 &&
    /\p{L}/u.test(password) && /\p{N}/u.test(password);
}

async function main() {
  const [emailArgument, ...options] = process.argv.slice(2);
  if (!emailArgument || options.some((option) => !/^--role=(owner|staff)$/.test(option)) || options.length > 1) {
    throw new Error('Usage: npx tsx scripts/create-admin.ts <email> [--role=owner|staff]');
  }
  const normalizedEmail = emailArgument.trim().toLowerCase();
  if (normalizedEmail.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
    throw new Error('Admin email must be valid and at most 254 characters');
  }
  const roleOption = options[0];
  const role = roleOption === '--role=staff' ? 'staff' : 'owner';
  const [existing] = await db.select({id: admins.id}).from(admins).where(eq(admins.email, normalizedEmail)).limit(1);
  if (existing) throw new Error(`Admin already exists: ${normalizedEmail}`);

  const password = await readHiddenPassword();
  if (!validPassword(password)) {
    throw new Error('Admin password must be 8-72 bytes and include at least one letter and one number');
  }
  const inserted = await db.insert(admins).values({
    email: normalizedEmail,
    passwordHash: await bcrypt.hash(password, 12),
    role
  }).onConflictDoNothing({target: admins.email}).returning({id: admins.id});
  if (inserted.length === 0) throw new Error(`Admin already exists: ${normalizedEmail}`);
  console.log('Admin created:', normalizedEmail, `(${role})`);
}

main().then(
  () => process.exit(0),
  (error: unknown) => {
    console.error('FAILED:', error);
    process.exit(1);
  }
);
