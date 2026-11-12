// Contrôle des traductions, lancé en CI (`npm run i18n:check`) :
//   1. les trois fichiers de langue ont exactement les mêmes clés ;
//   2. aucune valeur vide, et les variables {nom} sont les mêmes dans les 3 langues ;
//   3. chaque clé utilisée dans le code existe ;
//   4. il ne reste aucun texte d'interface en dur (scripts/i18n-scan.mjs).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { listFiles, scanFile, relPath } from './i18n-scan.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const LANGS = ['en', 'fr', 'ru'];
const locales = Object.fromEntries(LANGS.map((l) => [l, JSON.parse(fs.readFileSync(path.join(ROOT, 'src/i18n/locales', `${l}.json`), 'utf8'))]));
const errors = [];

const reference = new Set(Object.keys(locales.en));
for (const l of LANGS) {
  const keys = new Set(Object.keys(locales[l]));
  for (const k of reference) if (!keys.has(k)) errors.push(`[${l}] clé manquante : ${k}`);
  for (const k of keys) if (!reference.has(k)) errors.push(`[${l}] clé en trop (absente de en.json) : ${k}`);
}

const vars = (s) => (String(s).match(/\{[A-Za-z0-9_]+\}/g) || []).sort().join(',');
for (const k of reference) {
  for (const l of LANGS) {
    const v = locales[l][k];
    if (v === undefined) continue;
    if (typeof v !== 'string' || !v.trim()) errors.push(`[${l}] valeur vide : ${k}`);
    else if (vars(v) !== vars(locales.en[k])) errors.push(`[${l}] variables différentes de en.json : ${k} (${vars(v) || '-'} / ${vars(locales.en[k]) || '-'})`);
  }
}

const files = listFiles();
const used = new Set();
for (const f of files) {
  const src = fs.readFileSync(f, 'utf8');
  for (const m of src.matchAll(/\b(?:tr|t)\(\s*['"]([A-Za-z0-9_.-]+)['"]/g)) {
    used.add(m[1]);
    // Real keys are namespaced ("section.name"); a bare word is a component's own local helper.
    if (m[1].includes('.') && !reference.has(m[1])) errors.push(`${relPath(f)} : clé inconnue « ${m[1]} »`);
  }
}

let hardcoded = 0;
for (const f of files) {
  for (const r of scanFile(f)) {
    hardcoded++;
    errors.push(`${relPath(f)}:${r.line} texte en dur : ${r.text.slice(0, 70)}`);
  }
}

const unused = [...reference].filter((k) => !used.has(k)).length;
console.log(`${reference.size} clés × ${LANGS.length} langues, ${files.length} fichiers analysés, ${hardcoded} texte(s) en dur, ${unused} clé(s) sans usage direct.`);
if (errors.length) {
  console.error(`\n${errors.length} problème(s) :\n` + errors.slice(0, 80).join('\n') + (errors.length > 80 ? `\n… et ${errors.length - 80} autres` : ''));
  process.exit(1);
}
console.log('Traductions OK.');
