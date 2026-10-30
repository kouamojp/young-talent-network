
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ArrowLeft, Building, Users, Briefcase, BarChart3, MapPin, Globe, Mail, Award, UserCheck, TrendingUp, Eye, Newspaper, Activity, BadgeCheck } from 'lucide-react';
import { OrganizationCrest } from '@/components/organizations/OrganizationRow';
import { useLanguage } from '@/i18n/LanguageContext';
import ProfileActivityFeed from '@/components/profile/ProfileActivityFeed';
import AggregatedPostsFeed from '@/components/profile/AggregatedPostsFeed';

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
  const { t } = useLanguage();
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
      // Try organization_profiles first (by id, then by user_id)
      let { data: orgData } = await supabase
        .from('organization_profiles')
        .select('*')
        .eq('id', id!)
        .maybeSingle();

      if (!orgData) {
        const { data: byUser } = await supabase
          .from('organization_profiles')
          .select('*')
          .eq('user_id', id!)
          .maybeSingle();
        orgData = byUser;
      }

      // Fallback: build from profiles table (user_type='organization')
      if (!orgData) {
        const { data: prof } = await supabase
          .from('profiles')
          .select('id, name, bio, city, country, location, avatar_url, cover_photo_url, website, phone, email, user_type')
          .eq('id', id!)
          .maybeSingle();
        if (prof && prof.user_type === 'organization') {
          orgData = {
            id: prof.id,
            user_id: prof.id,
            company_name: prof.name,
            industry: null,
            company_size: null,
            description: prof.bio,
            headquarters: prof.location || [prof.city, prof.country].filter(Boolean).join(', ') || null,
            website_url: prof.website,
            linkedin_url: null,
            logo_url: prof.avatar_url,
            founded_year: null,
            verified: false,
          } as any;
        }
      }

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
    { label: 'Agents', value: agents.length },
    { label: 'Talents', value: talents.length },
    { label: 'Offres', value: jobPostings.length },
    { label: 'Fondée', value: org.founded_year || '-' },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto p-4 space-y-6">
        <Button variant="ghost" onClick={() => navigate(-1)} className="gap-2">
          <ArrowLeft className="h-4 w-4" /> Retour
        </Button>

        {/* Org Header */}
        <section className="relative overflow-hidden rounded-xl bg-stage text-stage-foreground">
          <div
            aria-hidden
            className="pointer-events-none absolute -top-40 -left-24 h-[420px] w-[620px] rounded-full opacity-60"
            style={{ background: 'radial-gradient(closest-side, hsl(var(--primary) / 0.55), transparent)' }}
          />
          <div className="relative px-5 pt-6 md:px-8 md:pt-8">
            <div className="flex flex-col sm:flex-row gap-5 sm:items-center">
              <OrganizationCrest
                name={org.company_name || '?'}
                logo={org.logo_url || undefined}
                className="h-20 w-20 md:h-24 md:w-24 text-3xl bg-white/10 ring-white/20"
              />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                  <h1 className="min-w-0 break-words text-2xl md:text-[34px] font-semibold text-white">{org.company_name}</h1>
                  {org.verified && (
                    <span className="inline-flex items-center gap-1 rounded-full border border-white/25 px-2.5 py-0.5 text-xs font-medium text-white/85">
                      <BadgeCheck className="h-3.5 w-3.5" /> Vérifiée
                    </span>
                  )}
                </div>
                <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-white/65">
                  {org.industry && <span>{org.industry}</span>}
                  {org.headquarters && (
                    <span className="inline-flex min-w-0 items-center gap-1"><MapPin className="h-4 w-4 shrink-0" /><span className="truncate">{org.headquarters}</span></span>
                  )}
                  {org.company_size && (
                    <span className="inline-flex items-center gap-1"><Users className="h-4 w-4 shrink-0" />{org.company_size}</span>
                  )}
                  {org.website_url && (
                    <a
                      href={org.website_url.startsWith('http') ? org.website_url : `https://${org.website_url}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex min-w-0 max-w-full items-center gap-1 hover:text-white"
                    >
                      <Globe className="h-4 w-4 shrink-0" /><span className="truncate">{org.website_url.replace(/^https?:\/\//, '')}</span>
                    </a>
                  )}
                </div>
              </div>
            </div>
            <dl className="mt-7 grid grid-cols-2 sm:grid-cols-4 border-t border-white/10">
              {dashboardStats.map((stat, i) => (
                <div key={stat.label} className={`py-4 ${i % 2 === 1 ? 'pl-4 border-l border-white/10' : ''} ${i >= 1 ? 'sm:pl-5 sm:border-l sm:border-white/10' : ''} ${i >= 2 ? 'border-t border-white/10 sm:border-t-0' : ''}`}>
                  <dt className="text-xs text-white/60">{stat.label}</dt>
                  <dd className="mt-1 font-display text-3xl font-semibold tabular-nums leading-none text-white">{stat.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-2">
            <TabsTrigger value="dashboard">{t('org.dashboard')}</TabsTrigger>
            <TabsTrigger value="posts">Publications</TabsTrigger>
            <TabsTrigger value="activity">Activités</TabsTrigger>
            <TabsTrigger value="agents">{t('org.agents')}</TabsTrigger>
            <TabsTrigger value="talents">{t('org.talents')}</TabsTrigger>
            <TabsTrigger value="services">{t('org.services')}</TabsTrigger>
            <TabsTrigger value="recruitment">{t('org.recruitment')}</TabsTrigger>
            <TabsTrigger value="stats">{t('org.stats')}</TabsTrigger>
          </TabsList>

          {/* Dashboard */}
          <TabsContent value="dashboard" className="space-y-6">
            {org.description && (
              <Card>
                <CardHeader><CardTitle className="text-lg">À propos</CardTitle></CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed max-w-prose break-words">{org.description}</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Publications - org + agents + talents */}
          <TabsContent value="posts" className="space-y-4">
            {(() => {
              const orgUserId = org.user_id;
              const agentIds = agents.map(a => a.agent_id);
              const talentIds = talents.map(t => t.talent_id);
              const allIds = Array.from(new Set([orgUserId, ...agentIds, ...talentIds].filter(Boolean)));
              const labels: Record<string, string> = {};
              labels[orgUserId] = 'Organisation';
              agentIds.forEach(aid => { labels[aid] = 'Agent'; });
              talentIds.forEach(tid => { labels[tid] = 'Talent'; });
              return (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Newspaper className="h-5 w-5 text-primary" />
                      Publications (organisation, agents et talents)
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <AggregatedPostsFeed
                      userIds={allIds}
                      labels={labels}
                      limit={30}
                      emptyMessage="Aucune publication de l'organisation, de ses agents ou de ses talents."
                    />
                  </CardContent>
                </Card>
              );
            })()}
          </TabsContent>

          {/* Activités - org + agents + talents */}
          <TabsContent value="activity" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Activity className="h-5 w-5 text-primary" /> Activités de l'organisation
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <ProfileActivityFeed userIds={[org.user_id]} />
              </CardContent>
            </Card>
            {agents.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Activity className="h-5 w-5 text-primary" /> Activités des agents
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <ProfileActivityFeed userIds={agents.map(a => a.agent_id)} />
                </CardContent>
              </Card>
            )}
            {talents.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Activity className="h-5 w-5 text-primary" /> Activités des talents
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <ProfileActivityFeed userIds={talents.map(t => t.talent_id)} />
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
                <Card key={agent.id} className="cursor-pointer hover:border-primary/40 transition-colors"
                  onClick={() => navigate(`/agent/${agent.agent_id}`)}>
                  <CardContent className="p-4 flex items-center gap-3 sm:gap-4">
                    <Avatar className="shrink-0">
                      <AvatarImage src={agent.agent_profile?.avatar_url || ''} />
                      <AvatarFallback>{agent.agent_profile?.name?.charAt(0) || 'A'}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <h4
                        className="truncate font-semibold text-foreground cursor-pointer hover:text-primary transition-colors"
                        onClick={(e) => { e.stopPropagation(); navigate(`/agent/${agent.agent_id}`); }}
                      >
                        {agent.agent_detail?.agency_name || agent.agent_profile?.name}
                      </h4>
                      <p className="truncate text-sm text-muted-foreground">{agent.agent_detail?.category}</p>
                      <p className="text-xs text-muted-foreground">
                        {agent.agent_detail?.clients_represented || 0} talents représentés
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <Badge variant="outline" className="hidden sm:inline-flex">{agent.role || 'Membre'}</Badge>
                      <Button variant="ghost" size="icon" aria-label="Voir le profil" onClick={(e) => { e.stopPropagation(); navigate(`/agent/${agent.agent_id}`); }}>
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
                <Card key={i} className="cursor-pointer hover:border-primary/40 transition-colors"
                  onClick={() => navigate(`/talent/${talent.talent_id}`)}>
                  <CardContent className="p-4 flex items-center gap-3 sm:gap-4">
                    <Avatar className="shrink-0">
                      <AvatarImage src={talent.talent_profile?.avatar_url || ''} />
                      <AvatarFallback>{talent.talent_profile?.name?.charAt(0) || 'T'}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <h4
                        className="truncate font-semibold text-foreground cursor-pointer hover:text-primary transition-colors"
                        onClick={(e) => { e.stopPropagation(); navigate(`/talent/${talent.talent_id}`); }}
                      >
                        {talent.talent_profile?.name}
                      </h4>
                      <p className="truncate text-sm text-muted-foreground">{talent.talent_profile?.sport_type}</p>
                      {talent.talent_profile?.location && (
                        <p className="text-xs text-muted-foreground flex min-w-0 items-center gap-1">
                          <MapPin className="h-3 w-3 shrink-0" /> <span className="truncate">{talent.talent_profile.location}</span>
                        </p>
                      )}
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <Badge variant="secondary" className="hidden sm:inline-flex max-w-[12rem] truncate">Agent : {talent.agent_name}</Badge>
                      <Button variant="ghost" size="icon" aria-label="Voir le profil" onClick={(e) => { e.stopPropagation(); navigate(`/talent/${talent.talent_id}`); }}>
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
                    <div className="flex justify-between items-start gap-3">
                      <div className="min-w-0">
                        <h4 className="font-semibold text-foreground break-words">{job.title}</h4>
                        <p className="text-sm text-muted-foreground line-clamp-2 break-words">{job.description}</p>
                        <div className="flex flex-wrap items-center gap-2 mt-2">
                          {job.job_type && <Badge variant="outline">{job.job_type}</Badge>}
                          {job.location && (
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <MapPin className="h-3 w-3" /> {job.location}
                            </span>
                          )}
                        </div>
                      </div>
                      <Badge className="shrink-0">{job.status || 'open'}</Badge>
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
                  <div className="flex justify-between gap-4">
                    <span className="text-muted-foreground">Total agents</span>
                    <span className="font-semibold text-foreground">{agents.length}</span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span className="text-muted-foreground">Total talents</span>
                    <span className="font-semibold text-foreground">{talents.length}</span>
                  </div>
                  <div className="flex justify-between gap-4">
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
                  <div className="flex justify-between gap-4">
                    <span className="text-muted-foreground">Secteur</span>
                    <span className="font-semibold text-foreground text-right break-words min-w-0">{org.industry || '-'}</span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span className="text-muted-foreground">Taille</span>
                    <span className="font-semibold text-foreground">{org.company_size || '-'}</span>
                  </div>
                  <div className="flex justify-between gap-4">
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
    </div>
  );
};

export default OrganizationHub;
