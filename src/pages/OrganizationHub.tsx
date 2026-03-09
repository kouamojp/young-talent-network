
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ArrowLeft, Building, Users, Briefcase, BarChart3, MapPin, Globe, Mail, Award, UserCheck, Calendar, TrendingUp, Eye } from 'lucide-react';
import Footer from '@/components/Footer';

interface OrgData {
  id: string;
  user_id: string;
  company_name: string;
  industry: string | null;
  company_size: string | null;
  description: string | null;
  headquarters: string | null;
  website_url: string | null;
  linkedin_url: string | null;
  logo_url: string | null;
  founded_year: number | null;
  verified: boolean | null;
}

interface AgentMember {
  id: string;
  agent_id: string;
  role: string | null;
  agent_profile?: {
    name: string;
    avatar_url: string | null;
    city: string | null;
  };
  agent_detail?: {
    agency_name: string;
    category: string | null;
    clients_represented: number | null;
  };
}

interface OrgTalent {
  talent_id: string;
  agent_name: string;
  talent_profile?: {
    name: string;
    avatar_url: string | null;
    sport_type: string | null;
    location: string | null;
  };
}

const OrganizationHub: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [org, setOrg] = useState<OrgData | null>(null);
  const [agents, setAgents] = useState<AgentMember[]>([]);
  const [talents, setTalents] = useState<OrgTalent[]>([]);
  const [jobPostings, setJobPostings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    if (id) fetchOrgData();
  }, [id]);

  const fetchOrgData = async () => {
    setLoading(true);
    try {
      // Fetch organization profile
      const { data: orgData } = await supabase
        .from('organization_profiles')
        .select('*')
        .eq('id', id!)
        .single();

      if (orgData) {
        setOrg(orgData as OrgData);

        // Fetch agent memberships
        const { data: membershipsData } = await supabase
          .from('agent_organization_memberships')
          .select('id, agent_id, role')
          .eq('organization_id', id!)
          .eq('status', 'active');

        if (membershipsData && membershipsData.length > 0) {
          const agentIds = membershipsData.map(m => m.agent_id);
          
          const [{ data: profiles }, { data: agentDetails }] = await Promise.all([
            supabase.from('profiles').select('id, name, avatar_url, city').in('id', agentIds),
            supabase.from('agent_profiles').select('user_id, agency_name, category, clients_represented').in('user_id', agentIds)
          ]);

          const enrichedAgents = membershipsData.map(m => ({
            ...m,
            agent_profile: profiles?.find(p => p.id === m.agent_id),
            agent_detail: agentDetails?.find(a => a.user_id === m.agent_id)
          }));
          setAgents(enrichedAgents as AgentMember[]);

          // Fetch talents through agents
          const { data: contractsData } = await supabase
            .from('agent_talent_contracts')
            .select('talent_id, agent_id')
            .in('agent_id', agentIds)
            .eq('status', 'active');

          if (contractsData && contractsData.length > 0) {
            const talentIds = contractsData.map(c => c.talent_id);
            const { data: talentProfiles } = await supabase
              .from('profiles')
              .select('id, name, avatar_url, sport_type, location')
              .in('id', talentIds);

            const enrichedTalents = contractsData.map(c => ({
              talent_id: c.talent_id,
              agent_name: profiles?.find(p => p.id === c.agent_id)?.name || 'Agent',
              talent_profile: talentProfiles?.find(p => p.id === c.talent_id)
            }));
            setTalents(enrichedTalents as OrgTalent[]);
          }
        }

        // Fetch job postings
        const { data: jobs } = await supabase
          .from('job_postings')
          .select('*')
          .eq('organization_id', orgData.user_id)
          .order('created_at', { ascending: false })
          .limit(10);

        if (jobs) setJobPostings(jobs);
      }
    } catch (err) {
      console.error('Error fetching org data:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!org) {
    return (
      <div className="min-h-screen bg-background p-6">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" /> Retour
        </Button>
        <Card>
          <CardContent className="p-12 text-center">
            <Building className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-bold mb-2">Organisation non trouvée</h2>
          </CardContent>
        </Card>
      </div>
    );
  }

  const dashboardStats = [
    { label: 'Agents', value: agents.length, icon: UserCheck, color: 'text-blue-500' },
    { label: 'Talents', value: talents.length, icon: Users, color: 'text-green-500' },
    { label: 'Offres', value: jobPostings.length, icon: Briefcase, color: 'text-purple-500' },
    { label: 'Fondée', value: org.founded_year || '-', icon: Calendar, color: 'text-orange-500' },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto p-4 space-y-6">
        <Button variant="ghost" onClick={() => navigate(-1)} className="gap-2">
          <ArrowLeft className="h-4 w-4" /> Retour
        </Button>

        {/* Org Header */}
        <Card className="overflow-hidden">
          <div className="h-36 bg-gradient-to-r from-primary/30 via-secondary/20 to-accent/30" />
          <CardContent className="relative -mt-12 pb-6">
            <div className="flex flex-col md:flex-row gap-4 items-start">
              <Avatar className="h-24 w-24 border-4 border-background shadow-lg">
                <AvatarImage src={org.logo_url || ''} />
                <AvatarFallback className="text-2xl bg-primary text-primary-foreground">
                  {org.company_name?.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 mt-2">
                <div className="flex items-center gap-3 flex-wrap">
                  <h1 className="text-2xl font-bold text-foreground">{org.company_name}</h1>
                  {org.verified && <Badge className="bg-green-500 text-white">Vérifiée</Badge>}
                </div>
                {org.industry && <Badge variant="secondary" className="mt-1">{org.industry}</Badge>}
                <div className="flex flex-wrap gap-4 mt-3 text-sm text-muted-foreground">
                  {org.headquarters && (
                    <span className="flex items-center gap-1"><MapPin className="h-4 w-4" />{org.headquarters}</span>
                  )}
                  {org.company_size && (
                    <span className="flex items-center gap-1"><Users className="h-4 w-4" />{org.company_size}</span>
                  )}
                  {org.website_url && (
                    <span className="flex items-center gap-1"><Globe className="h-4 w-4" />{org.website_url}</span>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 md:grid-cols-6">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="agents">Agents</TabsTrigger>
            <TabsTrigger value="talents">Talents</TabsTrigger>
            <TabsTrigger value="services">Services</TabsTrigger>
            <TabsTrigger value="recruitment">Recrutement</TabsTrigger>
            <TabsTrigger value="stats">Statistiques</TabsTrigger>
          </TabsList>

          {/* Dashboard */}
          <TabsContent value="dashboard" className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {dashboardStats.map((stat) => (
                <Card key={stat.label}>
                  <CardContent className="p-4 text-center">
                    <stat.icon className={`h-6 w-6 mx-auto mb-2 ${stat.color}`} />
                    <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
            {org.description && (
              <Card>
                <CardHeader><CardTitle className="text-lg">À propos</CardTitle></CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{org.description}</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Agents & Agences */}
          <TabsContent value="agents" className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">Agents & Agences ({agents.length})</h3>
            {agents.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <UserCheck className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                  <h3 className="font-semibold">Aucun agent</h3>
                  <p className="text-muted-foreground">Aucun agent inscrit dans cette organisation.</p>
                </CardContent>
              </Card>
            ) : (
              agents.map((agent) => (
                <Card key={agent.id} className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => navigate(`/agent/${agent.agent_id}`)}>
                  <CardContent className="p-4 flex items-center gap-4">
                    <Avatar>
                      <AvatarImage src={agent.agent_profile?.avatar_url || ''} />
                      <AvatarFallback>{agent.agent_profile?.name?.charAt(0) || 'A'}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h4
                        className="font-semibold text-foreground cursor-pointer hover:text-primary transition-colors"
                        onClick={(e) => { e.stopPropagation(); navigate(`/agent/${agent.agent_id}`); }}
                      >
                        {agent.agent_detail?.agency_name || agent.agent_profile?.name}
                      </h4>
                      <p className="text-sm text-muted-foreground">{agent.agent_detail?.category}</p>
                      <p className="text-xs text-muted-foreground">
                        {agent.agent_detail?.clients_represented || 0} talents représentés
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{agent.role || 'Membre'}</Badge>
                      <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); navigate(`/agent/${agent.agent_id}`); }}>
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          {/* Talents */}
          <TabsContent value="talents" className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">Talents ({talents.length})</h3>
            {talents.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <Users className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                  <h3 className="font-semibold">Aucun talent</h3>
                  <p className="text-muted-foreground">Aucun talent inscrit via les agents de cette organisation.</p>
                </CardContent>
              </Card>
            ) : (
              talents.map((talent, i) => (
                <Card key={i} className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => navigate(`/talent/${talent.talent_id}`)}>
                  <CardContent className="p-4 flex items-center gap-4">
                    <Avatar>
                      <AvatarImage src={talent.talent_profile?.avatar_url || ''} />
                      <AvatarFallback>{talent.talent_profile?.name?.charAt(0) || 'T'}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h4
                        className="font-semibold text-foreground cursor-pointer hover:text-primary transition-colors"
                        onClick={(e) => { e.stopPropagation(); navigate(`/talent/${talent.talent_id}`); }}
                      >
                        {talent.talent_profile?.name}
                      </h4>
                      <p className="text-sm text-muted-foreground">{talent.talent_profile?.sport_type}</p>
                      {talent.talent_profile?.location && (
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <MapPin className="h-3 w-3" /> {talent.talent_profile.location}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">Agent: {talent.agent_name}</Badge>
                      <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); navigate(`/talent/${talent.talent_id}`); }}>
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          {/* Services */}
          <TabsContent value="services" className="space-y-4">
            <Card>
              <CardContent className="p-12 text-center">
                <Briefcase className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                <h3 className="font-semibold text-lg">Services</h3>
                <p className="text-muted-foreground">Les services de l'organisation seront bientôt disponibles.</p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Recruitment */}
          <TabsContent value="recruitment" className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">Offres d'emploi ({jobPostings.length})</h3>
            {jobPostings.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <Briefcase className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                  <h3 className="font-semibold">Aucune offre</h3>
                  <p className="text-muted-foreground">Cette organisation n'a pas d'offres actives.</p>
                </CardContent>
              </Card>
            ) : (
              jobPostings.map((job) => (
                <Card key={job.id}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-semibold text-foreground">{job.title}</h4>
                        <p className="text-sm text-muted-foreground line-clamp-2">{job.description}</p>
                        <div className="flex gap-2 mt-2">
                          {job.job_type && <Badge variant="outline">{job.job_type}</Badge>}
                          {job.location && (
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <MapPin className="h-3 w-3" /> {job.location}
                            </span>
                          )}
                        </div>
                      </div>
                      <Badge>{job.status || 'open'}</Badge>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          {/* Stats */}
          <TabsContent value="stats" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader><CardTitle className="text-lg flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" /> Résumé
                </CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total agents</span>
                    <span className="font-semibold text-foreground">{agents.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total talents</span>
                    <span className="font-semibold text-foreground">{talents.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Offres actives</span>
                    <span className="font-semibold text-foreground">
                      {jobPostings.filter(j => j.status === 'open').length}
                    </span>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle className="text-lg flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-primary" /> Infos
                </CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Secteur</span>
                    <span className="font-semibold text-foreground">{org.industry || '-'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Taille</span>
                    <span className="font-semibold text-foreground">{org.company_size || '-'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Statut</span>
                    <Badge variant={org.verified ? 'default' : 'secondary'}>
                      {org.verified ? 'Vérifiée' : 'Non vérifiée'}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
      <Footer />
    </div>
  );
};

export default OrganizationHub;
