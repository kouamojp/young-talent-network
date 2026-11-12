import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Globe, MapPin } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { geocodePlaces } from '@/lib/mapbox';
import KartaMap, { type KartaPoint } from './KartaMap';
import { tr } from '@/i18n';

interface Org { id: string; name: string; industry: string | null; headquarters: string; logo: string | null; website: string | null }

/** Organisations placées à partir de leur siège (texte géocodé). */
const OrganisationsMap = () => {
  const navigate = useNavigate();
  const [points, setPoints] = useState<KartaPoint<Org>[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from('organization_profiles')
        .select('id, company_name, industry, headquarters, logo_url, website_url')
        .not('headquarters', 'is', null)
        .limit(200);
      const orgs: Org[] = ((data || []) as any[]).filter(o => o.headquarters).map(o => ({
        id: o.id, name: o.company_name, industry: o.industry, headquarters: o.headquarters, logo: o.logo_url, website: o.website_url,
      }));
      const coords = await geocodePlaces(orgs.map(o => o.headquarters));
      setPoints(orgs.flatMap(o => {
        const c = coords[o.headquarters.trim()];
        return c ? [{ id: o.id, lngLat: c, data: o }] : [];
      }));
      setLoading(false);
    })();
  }, []);

  return (
    <KartaMap
      points={points}
      loading={loading}
      emptyLabel={tr('organisationsMap.noOrganizationsLocatedYet')}
      renderSelected={({ data: org }) => (
        <div className="flex items-start gap-4 pr-4">
          <Avatar className="h-14 w-14 border-2 border-primary">
            <AvatarImage src={org.logo || ''} />
            <AvatarFallback>{org.name?.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-lg break-words">{org.name}</h3>
            {org.industry && <p className="text-sm text-primary font-medium">{org.industry}</p>}
            <div className="space-y-1 mt-2 text-sm text-muted-foreground">
              <p className="flex items-center gap-2"><MapPin className="h-4 w-4" />{org.headquarters}</p>
              {org.website && (
                <a href={org.website.startsWith('http') ? org.website : `https://${org.website}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-primary">
                  <Globe className="h-4 w-4" />{org.website}
                </a>
              )}
            </div>
            <Button size="sm" className="mt-3 w-full" onClick={() => navigate(`/organization/${org.id}`)}>{tr('marketplace.viewProfile')}</Button>
          </div>
        </div>
      )}
    />
  );
};

export default OrganisationsMap;
