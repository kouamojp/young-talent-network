import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Briefcase, Calendar, Loader2, MapPin } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { OrganizationCrest } from '@/components/organizations/OrganizationRow';

interface JobPosting {
  id: string;
  title: string;
  description: string | null;
  job_type: string | null;
  location: string | null;
  salary_range: string | null;
  created_at: string;
  organization_id: string | null;
  // organization_id pointe vers le profil du compte organisation
  organization: { name: string | null; avatar_url: string | null } | null;
}

/** Offres ouvertes publiées par les organisations (table job_postings). */
const TalentView: React.FC<{ searchTerm?: string }> = ({ searchTerm = '' }) => {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from('job_postings')
      .select('id, title, description, job_type, location, salary_range, created_at, organization_id, organization:profiles!job_postings_organization_id_fkey(name, avatar_url)')
      .eq('status', 'open')
      .order('created_at', { ascending: false })
      .limit(50)
      .then(({ data }) => {
        setJobs((data as JobPosting[] | null) ?? []);
        setLoading(false);
      });
  }, []);

  const query = searchTerm.toLowerCase();
  const visible = jobs.filter(j => [j.title, j.description, j.location, j.organization?.name].some(v => v?.toLowerCase().includes(query)));

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;

  if (visible.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border p-10 text-center">
        <Briefcase className="mx-auto h-8 w-8 text-muted-foreground/50" />
        <p className="mt-3 text-sm text-muted-foreground">
          {jobs.length === 0 ? 'Aucune offre ouverte pour le moment.' : 'Aucune offre ne correspond à cette recherche.'}
        </p>
      </div>
    );
  }

  return (
    <ul className="rounded-xl border border-border bg-card divide-y divide-border">
      {visible.map(job => (
        <li key={job.id}>
          <button
            type="button"
            onClick={() => job.organization_id && navigate(`/organization/${job.organization_id}`)}
            className="flex w-full gap-4 p-4 text-left hover:bg-muted/60 transition-colors"
          >
            <OrganizationCrest name={job.organization?.name || '?'} logo={job.organization?.avatar_url || undefined} className="h-12 w-12 text-lg" />
            <span className="min-w-0 flex-1">
              <span className="flex flex-wrap items-center gap-2">
                <span className="font-semibold break-words">{job.title}</span>
                {job.job_type && <Badge variant="secondary">{job.job_type}</Badge>}
              </span>
              {job.organization?.name && <span className="block text-sm text-muted-foreground truncate">{job.organization.name}</span>}
              {job.description && <span className="mt-1 block text-sm line-clamp-2 break-words">{job.description}</span>}
              <span className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                {job.location && <span className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{job.location}</span>}
                {job.salary_range && <span>{job.salary_range}</span>}
                <span className="inline-flex items-center gap-1"><Calendar className="h-3.5 w-3.5" />{new Date(job.created_at).toLocaleDateString()}</span>
              </span>
            </span>
          </button>
        </li>
      ))}
    </ul>
  );
};

export default TalentView;
