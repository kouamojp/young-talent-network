import { supabase } from '@/integrations/supabase/client';

/**
 * Import of profile information extracted by AI from an external source or a CV
 * (edge functions `scrape-profile` and `parse-cv`, same JSON format).
 *
 * `normalizeExtracted` turns that loosely-typed JSON into a clean proposal;
 * the user then picks what to keep and `applyProfileImport` writes only that.
 * Nothing is overwritten or added without an explicit choice.
 */

export interface ImportExperience { title: string; organization: string | null; start_date: string | null; end_date: string | null; is_current: boolean; city: string | null; description: string | null }
export interface ImportEducation { institution: string; degree: string | null; field_of_study: string | null; start_year: number | null; end_year: number | null }
export interface ImportAchievement { title: string; date: string | null; description: string | null }
export interface ImportSocialLink { platform: string; url: string }

export interface ProfileImport {
  fields: {
    name?: string;
    professional_title?: string;
    bio?: string;
    about_me?: string;
    city?: string;
    country?: string;
    sport_type?: string;
    languages?: string[];
  };
  skills: string[];
  experiences: ImportExperience[];
  education: ImportEducation[];
  achievements: ImportAchievement[];
  socialLinks: ImportSocialLink[];
}

export type ProfileFieldKey = keyof ProfileImport['fields'];

const str = (v: unknown, max = 500): string | undefined => {
  if (typeof v !== 'string' && typeof v !== 'number') return undefined;
  const s = String(v).replace(/\s+/g, ' ').trim();
  return s ? s.slice(0, max) : undefined;
};
const list = (v: unknown): unknown[] => (Array.isArray(v) ? v : []);
const obj = (v: unknown): Record<string, unknown> => (v && typeof v === 'object' && !Array.isArray(v) ? (v as Record<string, unknown>) : {});

const THIS_YEAR = new Date().getFullYear();
const validYear = (y: number) => Number.isInteger(y) && y >= 1950 && y <= THIS_YEAR + 8;

/** First plausible 4-digit year found in a value ("2019", "sept. 2019", 2019…). */
export const parseYear = (v: unknown): number | null => {
  const m = String(v ?? '').match(/\b(19[5-9]\d|20\d{2})\b/);
  const y = m ? Number(m[1]) : NaN;
  return validYear(y) ? y : null;
};

/** ISO date (YYYY-MM-DD) from "2021", "2021-06", "2021-06-15" or a parsable date; null otherwise. */
export const parseDate = (v: unknown): string | null => {
  const s = str(v, 40);
  if (!s) return null;
  const iso = s.match(/^(\d{4})(?:-(\d{1,2}))?(?:-(\d{1,2}))?$/);
  if (iso) {
    const [y, mo, d] = [Number(iso[1]), Number(iso[2] || 1), Number(iso[3] || 1)];
    if (!validYear(y) || mo < 1 || mo > 12 || d < 1 || d > 31) return null;
    return `${y}-${String(mo).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
  }
  const y = parseYear(s);
  return y ? `${y}-01-01` : null;
};

const CURRENT_WORDS = /\b(present|présent|aujourd'hui|actuel|current|now|ongoing|en cours|настоящее|сейчас|по н\.в\.)/i;

const cleanUrl = (v: unknown): string | null => {
  const s = str(v, 400);
  if (!s) return null;
  try {
    const u = new URL(/^https?:\/\//i.test(s) ? s : `https://${s}`);
    return u.protocol === 'http:' || u.protocol === 'https:' ? u.toString() : null;
  } catch { return null; }
};

const uniqueBy = <T,>(items: T[], key: (item: T) => string): T[] => {
  const seen = new Set<string>();
  return items.filter((i) => { const k = key(i).toLowerCase(); if (!k || seen.has(k)) return false; seen.add(k); return true; });
};

/** Cleans the AI output. Accepts the current format and the older one (`year`, `period`). */
export function normalizeExtracted(raw: unknown): ProfileImport {
  const d = obj(raw);
  const fields: ProfileImport['fields'] = {};

  const name = str(d.name, 120); if (name) fields.name = name;
  const title = str(d.professional_title, 120); if (title) fields.professional_title = title;
  const bio = str(d.bio, 600);
  const about = str(d.about, 3000);
  if (bio) fields.bio = bio;
  if (about && about !== bio) fields.about_me = about;
  const specialty = str(d.sport_or_specialty, 80); if (specialty) fields.sport_type = specialty;

  const location = str(d.location, 160);
  if (location) {
    const parts = location.split(',').map((p) => p.trim()).filter(Boolean);
    if (parts.length >= 2) { fields.city = parts[0]; fields.country = parts[parts.length - 1]; }
    else fields.city = parts[0];
  }

  const languages = uniqueBy(list(d.languages).map((l) => str(l, 40)).filter((l): l is string => !!l), (l) => l).slice(0, 12);
  if (languages.length) fields.languages = languages;

  const skills = uniqueBy(list(d.skills).map((s) => str(s, 60)).filter((s): s is string => !!s), (s) => s).slice(0, 40);

  const experiences = uniqueBy(
    list(d.work_experience).map((e) => {
      const x = obj(e);
      const title = str(x.title, 160);
      if (!title) return null;
      const period = str(x.period, 80) || '';
      const [from, to] = period.split(/\s*(?:[-–—]|to|à|au|jusqu'à)\s*/i);
      const start = parseDate(x.start_date) ?? parseDate(from);
      const endRaw = str(x.end_date, 40) ?? to;
      const isCurrent = x.current === true || CURRENT_WORDS.test(endRaw || '') || CURRENT_WORDS.test(period);
      return {
        title,
        organization: str(x.organization, 160) ?? null,
        start_date: start,
        end_date: isCurrent ? null : parseDate(endRaw),
        is_current: isCurrent,
        city: str(x.city, 80) ?? null,
        description: str(x.description, 1500) ?? null,
      } as ImportExperience;
    }).filter((e): e is ImportExperience => !!e),
    (e) => `${e.title}|${e.organization || ''}`,
  ).slice(0, 25);

  const education = uniqueBy(
    list(d.education).map((e) => {
      const x = obj(e);
      const institution = str(x.institution, 160);
      if (!institution) return null;
      const years = String(x.year ?? x.period ?? '').match(/\b(19[5-9]\d|20\d{2})\b/g)?.map(Number).filter(validYear) ?? [];
      const start = parseYear(x.start_year) ?? (years.length > 1 ? years[0] : null);
      const end = parseYear(x.end_year) ?? (years.length ? years[years.length - 1] : null);
      return {
        institution,
        degree: str(x.degree, 160) ?? null,
        field_of_study: str(x.field ?? x.field_of_study, 160) ?? null,
        start_year: start,
        end_year: end,
      } as ImportEducation;
    }).filter((e): e is ImportEducation => !!e),
    (e) => `${e.institution}|${e.degree || ''}`,
  ).slice(0, 15);

  const achievements = uniqueBy(
    list(d.achievements).map((a) => {
      const x = obj(a);
      const title = str(typeof a === 'string' ? a : x.title, 200);
      if (!title) return null;
      return { title, date: parseDate(x.date), description: str(x.description, 1500) ?? null } as ImportAchievement;
    }).filter((a): a is ImportAchievement => !!a),
    (a) => a.title,
  ).slice(0, 30);

  const socialLinks = uniqueBy(
    list(d.social_links).map((l) => {
      const x = obj(l);
      const url = cleanUrl(x.url);
      if (!url) return null;
      const platform = (str(x.platform, 30) || new URL(url).hostname.replace(/^www\./, '').split('.')[0]).toLowerCase();
      return { platform, url } as ImportSocialLink;
    }).filter((l): l is ImportSocialLink => !!l),
    (l) => l.url,
  ).slice(0, 15);

  return { fields, skills, experiences, education, achievements, socialLinks };
}

export const isEmptyImport = (p: ProfileImport): boolean =>
  Object.keys(p.fields).length === 0 && !p.skills.length && !p.experiences.length && !p.education.length && !p.achievements.length && !p.socialLinks.length;

/** Text of a PDF, read in the browser (the file itself is never uploaded). */
export async function extractPdfText(file: File, maxPages = 12): Promise<string> {
  const [pdfjs, worker] = await Promise.all([
    import('pdfjs-dist'),
    import('pdfjs-dist/build/pdf.worker.min.mjs?url'),
  ]);
  pdfjs.GlobalWorkerOptions.workerSrc = worker.default;
  const pdf = await pdfjs.getDocument({ data: await file.arrayBuffer() }).promise;
  const pages: string[] = [];
  for (let n = 1; n <= Math.min(pdf.numPages, maxPages); n++) {
    const page = await pdf.getPage(n);
    const content = await page.getTextContent();
    let text = '';
    for (const item of content.items as { str?: string; hasEOL?: boolean }[]) {
      if (typeof item.str !== 'string') continue;
      text += item.str + (item.hasEOL ? '\n' : ' ');
    }
    pages.push(text);
  }
  return pages.join('\n').replace(/[ \t]+/g, ' ').trim();
}

/** What already exists on the profile, to show differences and avoid duplicates. */
export interface ExistingProfileData {
  fields: Record<ProfileFieldKey, unknown>;
  experienceKeys: Set<string>;
  educationKeys: Set<string>;
  achievementKeys: Set<string>;
  socialUrls: Set<string>;
  /** lower-case skill name → skill id, for the skills of the catalogue */
  skillCatalogue: Map<string, string>;
  ownedSkillIds: Set<string>;
}

const key = (...parts: (string | null | undefined)[]) => parts.map((p) => (p || '').trim().toLowerCase()).join('|');
export const experienceKey = (e: { title: string; organization: string | null }) => key(e.title, e.organization);
export const educationKey = (e: { institution: string; degree: string | null }) => key(e.institution, e.degree);
export const achievementKey = (a: { title: string }) => key(a.title);

export async function loadExistingProfileData(userId: string, proposal: ProfileImport): Promise<ExistingProfileData> {
  const [profile, exp, edu, ach, links, owned, catalogue] = await Promise.all([
    supabase.from('profiles').select('name, professional_title, bio, about_me, city, country, sport_type, languages').eq('id', userId).maybeSingle(),
    supabase.from('talent_experiences').select('title, organization').eq('user_id', userId),
    supabase.from('talent_education').select('institution, degree').eq('user_id', userId),
    supabase.from('talent_achievements').select('title').eq('user_id', userId),
    supabase.from('talent_social_links').select('url').eq('user_id', userId),
    supabase.from('user_skills').select('skill_id').eq('user_id', userId),
    proposal.skills.length ? supabase.from('skills').select('id, name').limit(1000) : Promise.resolve({ data: [] as { id: string; name: string }[] }),
  ]);
  return {
    fields: (profile.data || {}) as Record<ProfileFieldKey, unknown>,
    experienceKeys: new Set((exp.data || []).map(experienceKey)),
    educationKeys: new Set((edu.data || []).map(educationKey)),
    achievementKeys: new Set((ach.data || []).map(achievementKey)),
    socialUrls: new Set((links.data || []).map((l) => l.url.trim().toLowerCase())),
    skillCatalogue: new Map((catalogue.data || []).map((s) => [s.name.trim().toLowerCase(), s.id])),
    ownedSkillIds: new Set((owned.data || []).map((s) => s.skill_id)),
  };
}

export interface ImportSelection {
  fields: Partial<ProfileImport['fields']>;
  skillIds: string[];
  experiences: ImportExperience[];
  education: ImportEducation[];
  achievements: ImportAchievement[];
  socialLinks: ImportSocialLink[];
}

/** Writes the selected items. Returns the number of things written and the errors met. */
export async function applyProfileImport(userId: string, sel: ImportSelection): Promise<{ applied: number; errors: string[] }> {
  const errors: string[] = [];
  let applied = 0;
  const run = async (count: number, query: PromiseLike<{ error: { message: string } | null }>) => {
    if (!count) return;
    const { error } = await query;
    if (error) errors.push(error.message); else applied += count;
  };

  const fields = { ...sel.fields } as Record<string, unknown>;
  if (fields.city || fields.country) fields.location = [fields.city, fields.country].filter(Boolean).join(', ');
  const fieldCount = Object.keys(sel.fields).length;

  await Promise.all([
    run(fieldCount, supabase.from('profiles').update(fields).eq('id', userId)),
    run(sel.skillIds.length, supabase.from('user_skills').insert(sel.skillIds.map((skill_id) => ({ user_id: userId, skill_id })))),
    run(sel.experiences.length, supabase.from('talent_experiences').insert(sel.experiences.map((e) => ({ ...e, user_id: userId })))),
    run(sel.education.length, supabase.from('talent_education').insert(sel.education.map((e) => ({ ...e, user_id: userId, education_type: 'university' })))),
    run(sel.achievements.length, supabase.from('talent_achievements').insert(sel.achievements.map((a) => ({ ...a, user_id: userId })))),
    run(sel.socialLinks.length, supabase.from('talent_social_links').insert(sel.socialLinks.map((l) => ({ ...l, user_id: userId })))),
  ]);
  return { applied, errors };
}
