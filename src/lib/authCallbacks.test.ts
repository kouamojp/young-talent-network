import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

/**
 * Guard against a deadlock that froze the whole app: supabase-js awaits the
 * `onAuthStateChange` callback while holding the auth lock, so a callback that
 * is async, or that returns the promise of a Supabase call, blocks every
 * request (in all tabs) until the browser storage is cleared.
 * The callback must be synchronous and defer any query (setTimeout).
 */
const walk = (dir: string, out: string[] = []): string[] => {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) walk(full, out);
    else if (/\.tsx?$/.test(e.name) && !e.name.endsWith('.test.ts')) out.push(full);
  }
  return out;
};

describe('onAuthStateChange callbacks', () => {
  it('are synchronous and never return a promise', () => {
    const offenders: string[] = [];
    for (const file of walk(path.resolve(__dirname, '..'))) {
      const src = fs.readFileSync(file, 'utf8');
      for (const m of src.matchAll(/onAuthStateChange\(\s*(async\b)?\s*\(([^)]*)\)\s*=>\s*([^\n]*)/g)) {
        const isAsync = !!m[1];
        const body = m[3].trim();
        // Expression-bodied arrow: only plain state setters (setX(...)) are allowed.
        const returnsCall = !body.startsWith('{') && !/^set[A-Z]\w*\(/.test(body);
        if (isAsync || returnsCall) offenders.push(`${path.relative(process.cwd(), file)}: ${m[0].slice(0, 90)}`);
      }
    }
    expect(offenders).toEqual([]);
  });
});
