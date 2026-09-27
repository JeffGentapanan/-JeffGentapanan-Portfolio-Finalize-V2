import { createInterface } from 'node:readline/promises';
import { Writable } from 'node:stream';
import { mkdir, writeFile, access } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { makeCredential } from './api.mjs';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
let silent = false;
const output = new Writable({
  write(chunk, encoding, done) {
    if (!silent) process.stdout.write(chunk);
    done();
  },
});
const input = createInterface({ input: process.stdin, output, terminal: true });
try {
  console.log('Set the private password for your portfolio owner login.');
  console.log('Use at least 12 characters. Input is hidden.');
  try {
    await access(path.join(root, '.private/owner.json'));
    console.log(
      'This replaces the current owner password. Restart the portfolio server afterward.'
    );
  } catch {}
  process.stdout.write('New password: ');
  silent = true;
  const password = await input.question('');
  silent = false;
  process.stdout.write('\n');
  process.stdout.write('Confirm password: ');
  silent = true;
  const confirmation = await input.question('');
  silent = false;
  process.stdout.write('\n');
  if (password.length < 12 || password.length > 256 || password !== confirmation)
    throw new Error('Passwords must match and contain 12–256 characters.');
  const credentials = await makeCredential(password);
  await mkdir(path.join(root, '.private'), { recursive: true });
  await writeFile(path.join(root, '.private/owner.json'), JSON.stringify(credentials), {
    mode: 0o600,
  });
  console.log(
    'Owner password saved as a salted hash. Open Projects or Skills and choose Owner sign in.'
  );
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
} finally {
  input.close();
}
