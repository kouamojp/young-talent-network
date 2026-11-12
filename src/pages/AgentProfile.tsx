
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ArrowLeft, Briefcase, Users, Star, MapPin, Globe, Phone, Mail, Building, TrendingUp, Award, Handshake, Eye, Newspaper, Layers, Heart, MessageCircle, Calendar, Tv, Radio, GraduationCap, Coins, Map as MapIcon, Activity, Trash2 } from 'lucide-react';
import ContractCreationDialog from '@/components/agent/ContractCreationDialog';
import PendingContractsManager from '@/components/agent/PendingContractsManager';
import { useLanguage } from '@/i18n/LanguageContext';
import ProfileActivityFeed from '@/components/profile/ProfileActivityFeed';
import AggregatedPostsFeed from '@/components/profile/AggregatedPostsFeed';
import BlockUserButton from '@/components/safety/BlockUserButton';
import { fetchPublicContact } from '@/lib/profiles';
import { toast } from '@/hooks/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { tr } from '@/i18n';
import { localeTag } from '@/i18n/format';

interface AgentData {
  id: string;
  user_id: string;
  agency_name: string;
  specialization: string[] | null;
  license_number: string | null;
  clients_represented: number | null;
  commission_rate: number | null;
  verified: boolean | null;
  services: string[] | null;
  category: string | null;
  bio: string | null;
  avatar_url: string | null;
  location: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  deals_completed: number | null;
  profile?: {
    name: string;
    avatar_url: string | null;
    country: string | null;
    city: string | null;
  };
}

interface TalentContract {
  id: string;
  talent_id: string;
  status: string;
  commission_rate: number | null;
  start_date: string | null;
  talent_profile?: {
    name: string;
    avatar_url: string | null;
    sport_type: string | null;
    location: string | null;
  };
}

interface OrgMembership {
  id: string;
  organization_id: string;
  role: string | null;
  status: string;
  organization?: {
    id: string;
    company_name: string;
    logo_url: string | null;
    industry: string | null;
  };
}

const AgentProfile: React.FC = () => {
  const { t } = useLanguage();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [agent, setAgent] = useState<AgentData | null>(null);
  const [contracts, setContracts] = useState<TalentContract[]>([]);
  const [memberships, setMemberships] = useState<OrgMembership[]>([]);
  const [posts, setPosts] = useState<any[]>([]);
  const [presence, setPresence] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isOwner, setIsOwner] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setCurrentUserId(data.user?.id || null);
    });
  }, []);

  useEffect(() => {
    if (id) fetchAgentData();
  }, [id]);

  useEffect(() => {
    if (currentUserId && id) {
      setIsOwner(currentUserId === id);
    }
  }, [currentUserId, id]);

  const fetchAgentData = async () => {
    setLoading(true);
    try {
      let { data: agentData } = await supabase
        .from('agent_profiles')
        .select('*')
        .eq('user_id', id!)
        .maybeSingle();

      // Fallback: build from profiles if no agent_profiles row
      if (!agentData) {
        const { data: pf } = await supabase
          .from('profiles')
          .select('id, name, avatar_url, bio, city, country, location, cover_photo_url, website, user_type, sport_type')
          .eq('id', id!)
          .maybeSingle();
        if (pf) {
          const contact = await fetchPublicContact(pf.id);
          agentData = {
            id: pf.id,
            user_id: pf.id,
            agency_name: pf.name || 'Agent',
            specialization: pf.sport_type ? [pf.sport_type] : null,
            license_number: null,
            clients_represented: 0,
            commission_rate: null,
            verified: false,
            services: [],
            category: null,
            bio: pf.bio,
            avatar_url: pf.avatar_url,
            location: pf.location || [pf.city, pf.country].filter(Boolean).join(', '),
            phone: contact.phone,
            email: contact.email,
            website: pf.website,
            deals_completed: 0,
          } as any;
        }
      }

      if (agentData) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('name, avatar_url, country, city')
          .eq('id', id!)
          .maybeSingle();

        setAgent({ ...agentData, profile: profileData || undefined } as AgentData);

        // Fetch talent contracts
        const { data: contractsData } = await supabase
          .from('agent_talent_contracts')
          .select('id, talent_id, status, commission_rate, start_date')
          .eq('agent_id', id!)
          .eq('status', 'active');

        if (contractsData && contractsData.length > 0) {
          const talentIds = contractsData.map(c => c.talent_id);
          const { data: talentProfiles } = await supabase
            .from('profiles')
            .select('id, name, avatar_url, sport_type, location')
            .in('id', talentIds);

          const enriched = contractsData.map(c => ({
            ...c,
            talent_profile: talentProfiles?.find(p => p.id === c.talent_id)
          }));
          setContracts(enriched as TalentContract[]);
        }

        // Fetch organization memberships
        const { data: membershipsData } = await supabase
          .from('agent_organization_memberships')
          .select('id, organization_id, role, status')
          .eq('agent_id', id!)
          .eq('status', 'active');

        if (membershipsData && membershipsData.length > 0) {
          const orgIds = membershipsData.map(m => m.organization_id);
          const { data: orgProfiles } = await supabase
            .from('organization_profiles')
            .select('id, company_name, logo_url, industry')
            .in('id', orgIds);

          const enrichedMemberships = membershipsData.map(m => ({
            ...m,
            organization: orgProfiles?.find(o => o.id === m.organization_id)
          }));
          setMemberships(enrichedMemberships as OrgMembership[]);
        }

        // Fetch posts
        const { data: postsData } = await supabase
          .from('posts')
          .select('id, content, media_urls, created_at, likes_count, comments_count, visibility')
          .eq('user_id', id!)
          .eq('is_published', true)
          .eq('visibility', 'public')
          .order('created_at', { ascending: false })
          .limit(10);
        setPosts(postsData || []);

        // Fetch active sections
        const { data: presenceData } = await supabase
          .from('talent_presence')
          .select('section, is_active, visibility, featured')
          .eq('user_id', id!)
          .eq('is_active', true)
          .eq('visibility', 'public');
        setPresence(presenceData || []);
      }
    } catch (err) {
      console.error('Error fetching agent data:', err);
    } finally {
      setLoading(false);
    }
  };

  const SECTION_LABELS: Record<string, { label: string; icon: any; path: string }> = {
    events: { label: tr('landing.events'), icon: Calendar, path: '/events' },
    tv: { label: tr('talent.tv'), icon: Tv, path: '/tv' },
    live: { label: tr('common.live'), icon: Radio, path: '/live' },
    work: { label: tr('talent.work'), icon: Briefcase, path: '/work' },
    learning: { label: tr('profile.training'), icon: GraduationCap, path: '/learning' },
    'yat-coin': { label: 'YAT Coin', icon: Coins, path: '/yat-coin' },
    karta: { label: 'Karta', icon: MapIcon, path: '/karta' },
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!agent) {
    return (
      <div className="min-h-screen bg-background p-6">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" /> {tr('common.back')}
        </Button>
        <Card>
          <CardContent className="p-12 text-center">
            <Users className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-bold mb-2">{tr('agentProfile.agentNotFound')}</h2>
            <p className="text-muted-foreground">{tr('agentProfile.thisAgentProfileDoesNotExist')}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const stats = [
    { label: tr('org.talents'), value: contracts.length, icon: Users },
    { label: tr('sidebar.organizations'), value: memberships.length, icon: Building },
    { label: tr('agentProfile.deals'), value: agent.deals_completed || 0, icon: TrendingUp },
    { label: tr('agentProfile.commission'), value: `${agent.commission_rate || 0}%`, icon: Award },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto p-4 space-y-6">
        <Button variant="ghost" onClick={() => navigate(-1)} className="gap-2">
          <ArrowLeft className="h-4 w-4" /> {tr('common.back')}
        </Button>

        {/* Agent Header */}
        <Card className="overflow-hidden">
          <div className="h-32 bg-gradient-to-r from-primary/20 via-accent/20 to-secondary/20" />
          <CardContent className="relative -mt-12 pb-6">
            <div className="flex flex-col md:flex-row gap-4 items-start">
              <Avatar className="h-24 w-24 border-4 border-background shadow-lg">
                <AvatarImage src={agent.avatar_url || agent.profile?.avatar_url || ''} />
                <AvatarFallback className="text-2xl bg-primary text-primary-foreground">
                  {agent.agency_name?.charAt(0) || 'A'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 mt-2">
                <div className="flex items-center gap-3 flex-wrap">
                  <h1 className="text-2xl font-bold text-foreground">{agent.agency_name}</h1>
                  {agent.verified && <Badge className="bg-green-500 text-white">{tr('orgDisc.verified')}</Badge>}
                </div>
                <p className="text-muted-foreground">{agent.profile?.name}</p>
                {agent.category && <Badge variant="secondary" className="mt-1">{agent.category}</Badge>}
                <div className="flex flex-wrap gap-4 mt-3 text-sm text-muted-foreground">
                  {(agent.location || agent.profile?.city) && (
                    <span className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {agent.location || `${agent.profile?.city}, ${agent.profile?.country}`}
                    </span>
                  )}
                  {agent.email && (
                    <span className="flex items-center gap-1"><Mail className="h-4 w-4" />{agent.email}</span>
                  )}
                  {agent.phone && (
                    <span className="flex items-center gap-1"><Phone className="h-4 w-4" />{agent.phone}</span>
                  )}
                  {agent.website && (
                    <span className="flex items-center gap-1"><Globe className="h-4 w-4" />{agent.website}</span>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                {isOwner && (
                  <ContractCreationDialog agentId={id!} onContractCreated={fetchAgentData} />
                )}
                <Button variant="outline" className="gap-2" onClick={() => navigate(`/messages?to=${id}`)}>
                  <Handshake className="h-4 w-4" /> {tr('marketplace.contact')}
                </Button>
                {(agent?.user_id || id) && <BlockUserButton userId={agent?.user_id || id!} name={agent?.agency_name} size="default" />}
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
              {stats.map((stat) => (
                <div key={stat.label} className="text-center p-3 rounded-lg bg-muted/50">
                  <stat.icon className="h-5 w-5 mx-auto mb-1 text-primary" />
                  <p className="text-xl font-bold text-foreground">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Pending Contracts (visible to owner) */}
        {isOwner && (
          <PendingContractsManager userId={id!} userType="agent" onUpdate={fetchAgentData} />
        )}

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4 md:grid-cols-8 text-center text-sm">
            <TabsTrigger value="posts">{tr('sidebar.posts')}</TabsTrigger>
            <TabsTrigger value="talent-posts">{tr('agentProfile.talentPosts')}</TabsTrigger>
            <TabsTrigger value="activity">{tr('common.activity')}</TabsTrigger>
            <TabsTrigger value="overview">{t('agent.overview')}</TabsTrigger>
            <TabsTrigger value="sections">{tr('agentProfile.sections')}</TabsTrigger>
            <TabsTrigger value="talents">{t('agent.talents')}</TabsTrigger>
            <TabsTrigger value="organizations">{t('agent.organizations')}</TabsTrigger>
            <TabsTrigger value="services">{t('agent.services')}</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            {agent.bio && (
              <Card>
                <CardHeader><CardTitle className="text-lg">{tr('footer.about')}</CardTitle></CardHeader>
                <CardContent><p className="text-muted-foreground">{agent.bio}</p></CardContent>
              </Card>
            )}
            {agent.specialization && agent.specialization.length > 0 && (
              <Card>
                <CardHeader><CardTitle className="text-lg">{tr('agentProfile.specializations')}</CardTitle></CardHeader>
                <CardContent className="flex flex-wrap gap-2">
                  {agent.specialization.map((s, i) => (
                    <Badge key={i} variant="outline">{s}</Badge>
                  ))}
                </CardContent>
              </Card>
            )}
            {agent.license_number && (
              <Card>
                <CardContent className="p-4 flex items-center gap-3">
                  <Award className="h-5 w-5 text-primary" />
                  <span className="text-sm text-muted-foreground">{tr('agentProfile.licence')} {agent.license_number}</span>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="posts" className="space-y-4">
            {posts.length === 0 ? (
              <Card><CardContent className="p-12 text-center">
                <Newspaper className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                <h3 className="font-semibold text-lg">{tr('agentProfile.noPosts')}</h3>
                <p className="text-muted-foreground">{tr('agentProfile.thisAgentHasNotPostedYet')}</p>
              </CardContent></Card>
            ) : (
              posts.map((p) => (
                <Card key={p.id}>
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9">
                        <AvatarImage src={agent.avatar_url || agent.profile?.avatar_url || ''} />
                        <AvatarFallback>{agent.agency_name?.charAt(0) || 'A'}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium text-foreground text-sm">{agent.agency_name}</div>
                        <div className="text-xs text-muted-foreground">{new Date(p.created_at).toLocaleDateString(localeTag())}</div>
                      </div>
                    </div>
                    {p.content && <p className="text-sm text-foreground whitespace-pre-wrap">{p.content.slice(0, 500)}</p>}
                    {p.media_urls && p.media_urls.length > 0 && (
                      <div className={`grid gap-2 ${p.media_urls.length > 1 ? 'grid-cols-2' : 'grid-cols-1'}`}>
                        {p.media_urls.slice(0, 4).map((url: string, i: number) => (
                          <img key={i} src={url} alt="" className="w-full h-48 object-cover rounded-md" />
                        ))}
                      </div>
                    )}
                    <div className="flex items-center gap-4 text-sm text-muted-foreground pt-2 border-t">
                      <span className="flex items-center gap-1"><Heart className="h-4 w-4" /> {p.likes_count || 0}</span>
                      <span className="flex items-center gap-1"><MessageCircle className="h-4 w-4" /> {p.comments_count || 0}</span>
                      {(currentUserId === p.user_id || currentUserId === id) && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <button className="ml-auto flex items-center gap-1 text-destructive hover:underline text-xs">
                              <Trash2 className="h-3.5 w-3.5" /> {tr('common.delete')}
                            </button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>{tr('common.deleteThisPost')}</AlertDialogTitle>
                              <AlertDialogDescription>{tr('common.thisActionIsPermanent')}</AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>{tr('common.cancel')}</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={async () => {
                                  const { error } = await supabase.from('posts').delete().eq('id', p.id);
                                  if (error) {
                                    toast({ title: tr('settings.error'), description: error.message, variant: 'destructive' });
                                  } else {
                                    toast({ title: tr('admin.postDeleted') });
                                    setPosts(prev => prev.filter((x: any) => x.id !== p.id));
                                  }
                                }}
                              >
                                {tr('common.delete')}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="talent-posts" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Newspaper className="h-5 w-5 text-primary" />
                  {tr('agentProfile.talentsPosts')}{contracts.length} {tr('agentProfile.talents')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <AggregatedPostsFeed
                  userIds={contracts.map(c => c.talent_id)}
                  labels={Object.fromEntries(contracts.map(c => [c.talent_id, 'Talent']))}
                  emptyMessage={tr('agentProfile.noPostsFromTalentsUnderContract')}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="activity" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Activity className="h-5 w-5 text-primary" />
                  {tr('agentProfile.agentSActivity')}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <ProfileActivityFeed userIds={id ? [id] : []} />
              </CardContent>
            </Card>
            {contracts.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Activity className="h-5 w-5 text-primary" />
                    {tr('common.talentsActivity')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <ProfileActivityFeed userIds={contracts.map(c => c.talent_id)} />
                </CardContent>
              </Card>
            )}
          </TabsContent>


          <TabsContent value="sections" className="space-y-4">
            {presence.length === 0 ? (
              <Card><CardContent className="p-12 text-center">
                <Layers className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                <h3 className="font-semibold text-lg">{tr('agentProfile.noActiveSection')}</h3>
                <p className="text-muted-foreground">{tr('agentProfile.thisAgentIsNotActiveIn')}</p>
              </CardContent></Card>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {presence.map((s) => {
                  const meta = SECTION_LABELS[s.section];
                  if (!meta) return null;
                  const Icon = meta.icon;
                  return (
                    <Button
                      key={s.section}
                      variant={s.featured ? 'default' : 'outline'}
                      className="h-auto py-4 flex flex-col gap-2"
                      onClick={() => navigate(meta.path)}
                    >
                      <Icon className="h-5 w-5" />
                      <span>{meta.label}</span>
                      {s.featured && <Badge variant="secondary" className="text-xs">{tr('agentProfile.featured')}</Badge>}
                    </Button>
                  );
                })}
              </div>
            )}
          </TabsContent>

          <TabsContent value="talents" className="space-y-4">
            {contracts.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <Users className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                  <h3 className="font-semibold text-lg">{tr('common.noTalents')}</h3>
                  <p className="text-muted-foreground">{tr('agentProfile.thisAgentHasNoTalentsUnder')}</p>
                </CardContent>
              </Card>
            ) : (
              contracts.map((contract) => (
                <Card key={contract.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4 flex items-center gap-4">
                    <Avatar className="cursor-pointer" onClick={() => navigate(`/talent/${contract.talent_id}`)}>
                      <AvatarImage src={contract.talent_profile?.avatar_url || ''} />
                      <AvatarFallback>{contract.talent_profile?.name?.charAt(0) || 'T'}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h4
                        className="font-semibold text-foreground cursor-pointer hover:text-primary transition-colors"
                        onClick={() => navigate(`/talent/${contract.talent_id}`)}
                      >
                        {contract.talent_profile?.name || tr('auth.talent')}
                      </h4>
                      <p className="text-sm text-muted-foreground">{contract.talent_profile?.sport_type}</p>
                      {contract.talent_profile?.location && (
                        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                          <MapPin className="h-3 w-3" /> {contract.talent_profile.location}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">
                        {contract.status === 'active' ? tr('profile.active') : contract.status}
                      </Badge>
                      <Button variant="ghost" size="sm" onClick={() => navigate(`/talent/${contract.talent_id}`)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="organizations" className="space-y-4">
            {memberships.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <Building className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                  <h3 className="font-semibold text-lg">{tr('agentProfile.noOrganizations')}</h3>
                  <p className="text-muted-foreground">{tr('agentProfile.thisAgentIsNotAMember')}</p>
                </CardContent>
              </Card>
            ) : (
              memberships.map((membership) => (
                <Card key={membership.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4 flex items-center gap-4">
                    <Avatar className="cursor-pointer" onClick={() => navigate(`/organization/${membership.organization?.id || membership.organization_id}`)}>
                      <AvatarImage src={membership.organization?.logo_url || ''} />
                      <AvatarFallback>{membership.organization?.company_name?.charAt(0) || 'O'}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h4
                        className="font-semibold text-foreground cursor-pointer hover:text-primary transition-colors"
                        onClick={() => navigate(`/organization/${membership.organization?.id || membership.organization_id}`)}
                      >
                        {membership.organization?.company_name}
                      </h4>
                      <p className="text-sm text-muted-foreground">{membership.organization?.industry}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{membership.role || tr('common.member')}</Badge>
                      <Button variant="ghost" size="sm" onClick={() => navigate(`/organization/${membership.organization?.id || membership.organization_id}`)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="services" className="space-y-4">
            {(!agent.services || agent.services.length === 0) ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <Briefcase className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                  <h3 className="font-semibold text-lg">{tr('common.noServices')}</h3>
                  <p className="text-muted-foreground">{tr('agentProfile.thisAgentHasNotListedTheir')}</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {agent.services.map((service, i) => (
                  <Card key={i}>
                    <CardContent className="p-4 flex items-center gap-3">
                      <Star className="h-5 w-5 text-primary" />
                      <span className="font-medium text-foreground">{service}</span>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AgentProfile;
