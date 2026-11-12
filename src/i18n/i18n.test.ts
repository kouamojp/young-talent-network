import { beforeAll, describe, expect, it } from 'vitest';
import en from './locales/en.json';
import fr from './locales/fr.json';
import ru from './locales/ru.json';
import i18n, { detectLanguage, initI18n, tr } from './index';

const locales: Record<string, Record<string, string>> = { en, fr, ru };
const placeholders = (s: string) => (s.match(/\{[A-Za-z0-9_]+\}/g) || []).sort().join(',');

describe('locale files', () => {
  it('have exactly the same keys in the three languages', () => {
    const keys = Object.keys(en).sort();
    expect(Object.keys(fr).sort()).toEqual(keys);
    expect(Object.keys(ru).sort()).toEqual(keys);
  });

  it('have no empty value and keep the same {placeholders}', () => {
    const problems: string[] = [];
    for (const key of Object.keys(en)) {
      for (const lang of ['fr', 'ru']) {
        const value = locales[lang][key];
        if (!value?.trim()) problems.push(`${lang}:${key} empty`);
        else if (placeholders(value) !== placeholders((en as Record<string, string>)[key])) problems.push(`${lang}:${key} placeholders`);
      }
    }
    expect(problems).toEqual([]);
  });

  it('translate Russian for real (Cyrillic) on a sample of keys', () => {
    expect(ru['common.cancel']).toMatch(/[А-Яа-я]/);
    expect(ru['settings.deleteAccount']).toMatch(/[А-Яа-я]/);
  });
});

describe('tr()', () => {
  beforeAll(async () => { await initI18n('fr'); });

  it('returns the text of the active language', () => {
    expect(i18n.language).toBe('fr');
    expect(tr('common.cancel')).toBe(fr['common.cancel']);
  });

  it('replaces every occurrence of a {placeholder}', () => {
    expect(tr('footer.copyright', { year: 2026 })).toContain('2026');
    expect(tr('footer.copyright', { year: 2026 })).not.toContain('{year}');
  });

  it('renders null and undefined params as empty text', () => {
    expect(tr('footer.copyright', { year: undefined })).not.toContain('undefined');
  });
});

describe('detectLanguage()', () => {
  it('falls back to a supported language', () => {
    expect(['en', 'fr', 'ru']).toContain(detectLanguage());
  });
});
