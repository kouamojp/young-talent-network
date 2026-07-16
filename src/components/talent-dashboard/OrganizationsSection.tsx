import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Building, Briefcase, Users, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface Affiliation {
  id: string;
  name: string;
  role: string;
  type: 'Propriétaire' | 'Membre';
  status: string;
  industry: string | null;
  logo: string | null;
}

const typeColor = (type: string) => (type === 'Propriétaire' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800');

const statusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'active':
    case 'accepted':
      return 'bg-green-100 text-green-800';
    case 'pending':
      return 'bg-yellow-100 text-yellow-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const OrganizationsSection: React.FC = () => {
  const navigate = useNavigate();
  const [affiliations, setAffiliations] = useState<Affiliation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }

      const [ownedRes, membershipsRes] = await Promise.all([
        supabase.from('organization_profiles').select('id, company_name, industry, logo_url').eq('user_id', user.id),
        supabase.from('agent_organization_memberships')
          .select('id, role, status, organization:organization_profiles!agent_organization_memberships_organization_id_fkey(company_name, industry, logo_url)')
          .eq('agent_id', user.id),
      ]);

      const owned: Affiliation[] = ((ownedRes.data || []) as {
        id: string; company_name: string; industry: string | null; logo_url: string | null;
      }[]).map((o) => ({
        id: `owned-${o.id}`,
        name: o.company_name,
        role: 'Propriétaire',
        type: 'Propriétaire',
        status: 'Active',
        industry: o.industry,
        logo: o.logo_url,
      }));

      const memberships: Affiliation[] = ((membershipsRes.data || []) as unknown as {
        id: string; role: string | null; status: string;
        organization?: { company_name?: string | null; industry?: string | null; logo_url?: string | null } | null;
      }[]).map((m) => ({
        id: `member-${m.id}`,
        name: m.organization?.company_name || 'Organisation',
        role: m.role || 'Membre',
        type: 'Membre',
        status: m.status,
        industry: m.organization?.industry || null,
        logo: m.organization?.logo_url || null,
      }));

      setAffiliations([...owned, ...memberships]);
      setLoading(false);
    })();
  }, []);

  const ownedCount = affiliations.filter(a => a.type === 'Propriétaire').length;
  const memberCount = affiliations.filter(a => a.type === 'Membre').length;

  if (loading) {
    return <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">🏢 Mes organisations</h3>
        <Button onClick={() => navigate('/organizations')}>
          <Plus className="h-4 w-4 mr-2" />
          Ajouter
        </Button>
      </div>

      {affiliations.length === 0 ? (
        <Card className="border-dashed border-2">
          <CardContent className="p-6 text-center">
            <Building className="h-8 w-8 text-gray-400 mx-auto mb-3" />
            <h4 className="font-semibold mb-2">Aucune affiliation</h4>
            <p className="text-gray-600 mb-4">Rejoignez ou créez une organisation pour la voir apparaître ici</p>
            <Button variant="outline" onClick={() => navigate('/organizations')}>
              <Building className="h-4 w-4 mr-2" />
              Explorer les organisations
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="space-y-4">
            {affiliations.map((org) => (
              <Card key={org.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
                      {org.logo ? <img src={org.logo} alt="" className="w-full h-full object-cover" /> : <Building className="h-6 w-6 text-gray-500" />}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-semibold text-lg">{org.name}</h4>
                          <p className="text-gray-600">{org.role}</p>
                        </div>
                        <div className="flex gap-2">
                          <Badge className={typeColor(org.type)}>{org.type}</Badge>
                          <Badge className={statusColor(org.status)}>{org.status}</Badge>
                        </div>
                      </div>
                      {org.industry && <p className="text-sm text-gray-600">{org.industry}</p>}
                    </div>

                    <Button variant="ghost" size="sm" onClick={() => navigate('/organizations')}>Voir</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-4 text-center">
                <Briefcase className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-blue-700">{ownedCount}</p>
                <p className="text-sm text-blue-600">Propriétaire</p>
              </CardContent>
            </Card>
            <Card className="bg-green-50 border-green-200">
              <CardContent className="p-4 text-center">
                <Users className="h-6 w-6 text-green-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-green-700">{memberCount}</p>
                <p className="text-sm text-green-600">Membre</p>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
};

export default OrganizationsSection;
