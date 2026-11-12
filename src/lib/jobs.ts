import type { JobFormValues } from '@/components/work/JobPostingForm';

/**
 * Turns the job form into a `job_postings` row. Sport criteria and tags have
 * no dedicated column: they go into `requirements` and the description, which
 * the AI candidate matching (match-candidates) reads.
 */
export function buildJobPostingRow(v: JobFormValues, organizationUserId: string) {
  const requirements = v.requirements.split('\n').map(r => r.trim()).filter(Boolean);
  if (v.sport) requirements.push(`Sport : ${v.sport}`);
  if (v.sportRole) requirements.push(`Poste : ${v.sportRole}`);
  if (v.minRank) requirements.push(`Niveau minimum : ${v.minRank}`);
  if (v.leagueLevel) requirements.push(`Niveau de ligue : ${v.leagueLevel}`);

  const tags = v.tags?.trim();
  const description = tags ? `${v.description.trim()}\n\nMots-clés : ${tags}` : v.description.trim();

  return {
    organization_id: organizationUserId,
    title: v.title.trim(),
    description,
    location: v.location.trim(),
    job_type: v.type.trim(),
    salary_range: v.salary?.trim() || null,
    requirements,
    application_deadline: v.applicationDeadline ? new Date(`${v.applicationDeadline}T23:59:59`).toISOString() : null,
    status: 'open',
  };
}
