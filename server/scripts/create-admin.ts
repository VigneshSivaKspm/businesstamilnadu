/**
 * Creates an admin account, or resets the password of an existing one.
 *
 *   npm run admin:create -- --email you@example.com --name "Your Name"
 *
 * You'll be prompted for the password (input is hidden). For automation you
 * can pass --password, but avoid it on shared machines (shell history).
 */
import { randomUUID } from 'node:crypto';
import { parseArgs } from 'node:util';
import { loadConfig } from '../src/config.ts';
import { connect } from '../src/db.ts';
import { PASSWORD_RULES, hashPassword, isStrongEnough } from '../src/lib/auth.ts';
import { isValidEmail } from '../../src/utils/validation.ts';

function promptHidden(question: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const { stdin, stdout } = process;
    if (!stdin.isTTY) {
      reject(new Error('No interactive terminal — pass --password instead.'));
      return;
    }
    stdout.write(question);
    stdin.setRawMode(true);
    stdin.resume();
    stdin.setEncoding('utf8');
    let value = '';
    const onData = (char: string) => {
      if (char === '\r' || char === '\n') {
        stdin.setRawMode(false);
        stdin.pause();
        stdin.off('data', onData);
        stdout.write('\n');
        resolve(value);
      } else if (char === '\u0003') {
        process.exit(130);
      } else if (char === '\u007f' || char === '\b') {
        value = value.slice(0, -1);
      } else {
        value += char;
      }
    };
    stdin.on('data', onData);
  });
}

const { values } = parseArgs({
  options: {
    email: { type: 'string' },
    name: { type: 'string' },
    password: { type: 'string' },
  },
});

const email = values.email?.trim().toLowerCase();
if (!email || !isValidEmail(email)) {
  console.error('Usage: npm run admin:create -- --email you@example.com --name "Your Name"');
  process.exit(1);
}

let password = values.password;
if (!password) {
  password = await promptHidden('Password: ');
  const confirm = await promptHidden('Confirm password: ');
  if (password !== confirm) {
    console.error('Passwords do not match.');
    process.exit(1);
  }
}
if (!isStrongEnough(password)) {
  console.error(`Password too short. ${PASSWORD_RULES}`);
  process.exit(1);
}

const config = loadConfig();
const { client, collections } = await connect(config.mongoUri, config.mongoDb);
const passwordHash = await hashPassword(password);
const existing = await collections.admins.findOne({ email });

if (existing) {
  await collections.admins.updateOne({ _id: existing._id }, { $set: { passwordHash, ...(values.name ? { name: values.name } : {}), disabled: false } });
  await collections.sessions.deleteMany({ adminId: existing._id });
  console.log(`Updated password for ${email} and signed out their sessions.`);
} else {
  await collections.admins.insertOne({
    _id: randomUUID(),
    email,
    name: values.name?.trim() || email.split('@')[0],
    passwordHash,
    role: 'admin',
    createdAt: new Date().toISOString(),
  });
  console.log(`Created admin ${email}. Sign in at /admin/login.`);
}
await client.close();
