// Verify every locale has exactly the same set of keys as the English source.
// Usage: node scripts/check-translations.mjs   (exits 1 if any drift)
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const dir = resolve(dirname(fileURLToPath(import.meta.url)), '../src/i18n/locales');
const load = (l) => JSON.parse(readFileSync(resolve(dir, `${l}.json`), 'utf8'));

const en = load('en');
const enKeys = new Set(Object.keys(en));
let failed = false;

for (const lang of ['fr', 'ru']) {
  const keys = new Set(Object.keys(load(lang)));
  const missing = [...enKeys].filter((k) => !keys.has(k));
  const extra = [...keys].filter((k) => !enKeys.has(k));
  if (missing.length || extra.length) {
    failed = true;
    if (missing.length) console.error(`[${lang}] missing ${missing.length} keys:`, missing.slice(0, 30));
    if (extra.length) console.error(`[${lang}] extra ${extra.length} keys:`, extra.slice(0, 30));
  } else {
    console.log(`[${lang}] OK — ${keys.size} keys in sync with en`);
  }
}

process.exit(failed ? 1 : 0);
