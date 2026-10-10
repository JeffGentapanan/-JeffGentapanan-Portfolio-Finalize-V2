import { readdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, extname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const languages = {
  '.js': 'JavaScript',
  '.jsx': 'JavaScript',
  '.mjs': 'JavaScript',
  '.css': 'CSS',
  '.html': 'HTML',
};
const totals = {};
async function count(path) {
  const language = languages[extname(path)];
  if (language) totals[language] = (totals[language] || 0) + (await readFile(path)).length;
}
async function walk(path) {
  for (const entry of await readdir(path, { withFileTypes: true })) {
    const child = join(path, entry.name);
    if (entry.isDirectory()) await walk(child);
    else await count(child);
  }
}
await walk(join(root, 'src'));
await walk(join(root, 'server'));
await count(join(root, 'index.html'));
await count(join(root, 'vite.config.js'));
const sum = Object.values(totals).reduce((a, b) => a + b, 0);
const rows = Object.entries(totals).map(([name, bytes]) => ({
  name,
  percentage: Math.floor((bytes / sum) * 100),
  remainder: ((bytes / sum) * 100) % 1,
}));
// Keep tiny but present file types visible in the summary instead of showing 0%.
for (const row of rows) {
  if (row.percentage === 0) row.percentage = 1;
}
// Largest-remainder rounding keeps the displayed percentages at exactly 100%.
let remaining = 100 - rows.reduce((n, row) => n + row.percentage, 0);
if (remaining > 0) {
  for (const row of [...rows].sort((a, b) => b.remainder - a.remainder)) {
    if (remaining <= 0) break;
    row.percentage++;
    remaining--;
  }
} else if (remaining < 0) {
  for (const row of [...rows].sort((a, b) => b.remainder - a.remainder)) {
    if (remaining >= 0) break;
    if (row.percentage <= 1) continue;
    row.percentage--;
    remaining++;
  }
}
const data = rows
  .sort((a, b) => b.percentage - a.percentage)
  .map(({ name, percentage }) => ({ name, percentage }));
await writeFile(join(root, 'src/data/stack.json'), JSON.stringify(data, null, 2) + '\n');
