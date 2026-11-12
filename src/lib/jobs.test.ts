import { describe, expect, it } from 'vitest';
import { buildJobPostingRow } from './jobs';

const base = {
  title: '  Entraîneur U15  ',
  company: 'Académie',
  location: ' Lyon, France ',
  type: 'CDI',
  description: 'Encadrer les entraînements des U15.',
  requirements: 'Diplôme BPJEPS\n\n  Permis B  \n',
  salary: '',
  applicationDeadline: '',
  tags: '',
  sport: '',
  sportRole: '',
  minRank: '',
  leagueLevel: '',
};

describe('buildJobPostingRow', () => {
  it('maps the form to job_postings columns and trims values', () => {
    const row = buildJobPostingRow(base, 'org-1');
    expect(row).toMatchObject({
      organization_id: 'org-1',
      title: 'Entraîneur U15',
      location: 'Lyon, France',
      job_type: 'CDI',
      salary_range: null,
      application_deadline: null,
      status: 'open',
    });
    expect(row.requirements).toEqual(['Diplôme BPJEPS', 'Permis B']);
    expect(row.description).toBe('Encadrer les entraînements des U15.');
  });

  it('adds sport criteria to requirements and tags to the description', () => {
    const row = buildJobPostingRow({ ...base, sport: 'basketball', sportRole: 'meneur', tags: 'basket, jeunes' }, 'org-1');
    expect(row.requirements).toContain('Sport : basketball');
    expect(row.requirements).toContain('Poste : meneur');
    expect(row.description.endsWith('Mots-clés : basket, jeunes')).toBe(true);
  });

  it('keeps the deadline on the chosen day', () => {
    const row = buildJobPostingRow({ ...base, applicationDeadline: '2026-12-31' }, 'org-1');
    expect(row.application_deadline).not.toBeNull();
    expect(new Date(row.application_deadline!).getDate()).toBe(31);
  });
});
