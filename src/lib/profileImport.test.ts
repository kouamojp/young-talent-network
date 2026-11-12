import { describe, expect, it, vi } from 'vitest';

vi.mock('@/integrations/supabase/client', () => ({ supabase: {} }));

import { isEmptyImport, normalizeExtracted, parseDate, parseYear } from './profileImport';

describe('parseYear / parseDate', () => {
  it('reads a year from free text and rejects implausible ones', () => {
    expect(parseYear('sept. 2019')).toBe(2019);
    expect(parseYear(2021)).toBe(2021);
    expect(parseYear('1890')).toBeNull();
    expect(parseYear('no date')).toBeNull();
  });

  it('builds ISO dates from partial dates', () => {
    expect(parseDate('2021')).toBe('2021-01-01');
    expect(parseDate('2021-06')).toBe('2021-06-01');
    expect(parseDate('2021-06-15')).toBe('2021-06-15');
    expect(parseDate('2021-13')).toBeNull();
    expect(parseDate('juin 2020')).toBe('2020-01-01');
    expect(parseDate('')).toBeNull();
  });
});

describe('normalizeExtracted', () => {
  it('returns an empty proposal for junk input', () => {
    for (const junk of [null, undefined, 'text', 42, [], { raw_text: 'only raw text' }]) {
      expect(isEmptyImport(normalizeExtracted(junk))).toBe(true);
    }
  });

  it('maps profile fields and splits the location', () => {
    const p = normalizeExtracted({
      name: '  Awa   Diop ', professional_title: 'Meneuse de jeu', bio: 'Basketteuse.', about: 'Longue histoire…',
      location: 'Dakar, Sénégal', sport_or_specialty: 'Basketball', languages: ['Français', 'français', 'Wolof', 7],
    });
    expect(p.fields).toEqual({
      name: 'Awa Diop', professional_title: 'Meneuse de jeu', bio: 'Basketteuse.', about_me: 'Longue histoire…',
      city: 'Dakar', country: 'Sénégal', sport_type: 'Basketball', languages: ['Français', 'Wolof', '7'],
    });
  });

  it('never keeps private data it was not asked for', () => {
    const p = normalizeExtracted({ name: 'A B', email: 'a@b.c', phone: '+33 6', birthday: '2010-01-01' });
    expect(Object.keys(p.fields)).toEqual(['name']);
  });

  it('parses experiences in the current and the older format', () => {
    const p = normalizeExtracted({
      work_experience: [
        { title: 'Coach', organization: 'Club A', start_date: '2020-09', end_date: '2022-06', city: 'Lyon' },
        { title: 'Entraîneur', organization: 'Club B', start_date: '2022-07', current: true },
        { title: 'Stagiaire', organization: 'Club C', period: '2018 - présent' },
        { title: 'Coach', organization: 'club a' }, // duplicate of the first one
        { organization: 'No title' },
      ],
    });
    expect(p.experiences).toHaveLength(3);
    expect(p.experiences[0]).toMatchObject({ start_date: '2020-09-01', end_date: '2022-06-01', is_current: false, city: 'Lyon' });
    expect(p.experiences[1]).toMatchObject({ is_current: true, end_date: null });
    expect(p.experiences[2]).toMatchObject({ start_date: '2018-01-01', is_current: true, end_date: null });
  });

  it('parses education years from explicit fields or a period', () => {
    const p = normalizeExtracted({
      education: [
        { institution: 'INSEP', degree: 'BPJEPS', field: 'Sport', start_year: 2019, end_year: 2021 },
        { institution: 'Lycée X', degree: 'Bac', year: '2016-2019' },
        { institution: 'Université Y', year: '2023' },
      ],
    });
    expect(p.education[0]).toMatchObject({ field_of_study: 'Sport', start_year: 2019, end_year: 2021 });
    expect(p.education[1]).toMatchObject({ start_year: 2016, end_year: 2019 });
    expect(p.education[2]).toMatchObject({ start_year: null, end_year: 2023 });
  });

  it('keeps only valid http(s) social links', () => {
    const p = normalizeExtracted({
      social_links: [
        { platform: 'Instagram', url: 'instagram.com/awa' },
        { url: 'https://www.youtube.com/@awa' },
        { platform: 'x', url: 'javascript:alert(1)' },
        { platform: 'none' },
      ],
    });
    expect(p.socialLinks).toEqual([
      { platform: 'instagram', url: 'https://instagram.com/awa' },
      { platform: 'youtube', url: 'https://www.youtube.com/@awa' },
    ]);
  });

  it('accepts achievements given as strings or objects', () => {
    const p = normalizeExtracted({ achievements: ['Championne 2022', { title: 'MVP', date: '2023-05', description: 'Tournoi' }, {}] });
    expect(p.achievements).toEqual([
      { title: 'Championne 2022', date: null, description: null },
      { title: 'MVP', date: '2023-05-01', description: 'Tournoi' },
    ]);
  });
});
