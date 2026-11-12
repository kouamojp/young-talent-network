import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Briefcase, DollarSign, MapPin } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { geocodePlaces } from '@/lib/mapbox';
import KartaMap, { type KartaPoint } from './KartaMap';

interface Job { id: string; title: string; company: string; organizationId: string; location: string; salary: string | null; type: string | null }

/** Offres d'emploi ouvertes, placées sur la carte à partir de leur lieu (texte géocodé). */
const WorkMap = () => {
  const navigate = useNavigate();
  const [points, setPoints] = useState<KartaPoint<Job>[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from('job_postings')
        .select('id, title, location, salary_range, job_type, organization_id, status, organization:profiles!job_postings_organization_id_fkey(name)')
        .not('location', 'is', null)
        .order('created_at', { ascending: false })
        .limit(100);
      const jobs: Job[] = ((data || []) as any[])
        .filter(j => j.location && (!j.status || j.status === 'open' || j.status === 'active'))
        .map(j => ({
          id: j.id, title: j.title, company: j.organization?.name || 'Organisation', organizationId: j.organization_id,
          location: j.location, salary: j.salary_range, type: j.job_type,
        }));
      const coords = await geocodePlaces(jobs.map(j => j.location));
      setPoints(jobs.flatMap(j => {
        const c = coords[j.location.trim()];
        return c ? [{ id: j.id, lngLat: c, data: j }] : [];
      }));
      setLoading(false);
    })();
  }, []);

  return (
    <KartaMap
      points={points}
      loading={loading}
      emptyLabel="Aucune offre localisée pour le moment"
      renderSelected={({ data: job }) => (
        <div className="flex items-start gap-4 pr-4">
          <div className="p-3 bg-primary/10 rounded-lg"><Briefcase className="h-6 w-6 text-primary" /></div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-lg break-words">{job.title}</h3>
            <p className="text-sm text-muted-foreground">{job.company}</p>
            <div className="flex flex-wrap items-center gap-3 mt-2 text-sm">
              <span className="flex items-center gap-1"><MapPin className="h-4 w-4" />{job.location}</span>
              {job.salary && <span className="flex items-center gap-1"><DollarSign className="h-4 w-4" />{job.salary}</span>}
              {job.type && <span className="px-2 py-0.5 bg-primary/10 rounded-full">{job.type}</span>}
            </div>
            <div className="flex gap-2 mt-3">
              <Button size="sm" className="flex-1" onClick={() => navigate('/work')}>Voir les offres</Button>
              <Button size="sm" variant="outline" onClick={() => navigate(`/organization/${job.organizationId}`)}>Organisation</Button>
            </div>
          </div>
        </div>
      )}
    />
  );
};

export default WorkMap;
