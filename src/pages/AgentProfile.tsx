
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ArrowLeft, Briefcase, Users, Star, MapPin, Globe, Phone, Mail, Building, TrendingUp, Award, Handshake, Eye } from 'lucide-react';
import Footer from '@/components/Footer';
import ContractCreationDialog from '@/components/agent/ContractCreationDialog';
import PendingContractsManager from '@/components/agent/PendingContractsManager';

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
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [agent, setAgent] = useState<AgentData | null>(null);
  const [contracts, setContracts] = useState<TalentContract[]>([]);
  const [memberships, setMemberships] = useState<OrgMembership[]>([]);
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
      const { data: agentData } = await supabase
        .from('agent_profiles')
        .select('*')
        .eq('user_id', id!)
        .single();

      if (agentData) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('name, avatar_url, country, city')
          .eq('id', id!)
          .single();

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
      }
    } catch (err) {
      console.error('Error fetching agent data:', err);
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

  if (!agent) {
    return (
      <div className="min-h-screen bg-background p-6">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" /> Retour
        </Button>
        <Card>
          <CardContent className="p-12 text-center">
            <Users className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-bold mb-2">Agent non trouvé</h2>
            <p className="text-muted-foreground">Ce profil d'agent n'existe pas ou n'a pas encore été créé.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const stats = [
    { label: 'Talents', value: contracts.length, icon: Users },
    { label: 'Organisations', value: memberships.length, icon: Building },
    { label: 'Deals', value: agent.deals_completed || 0, icon: TrendingUp },
    { label: 'Commission', value: `${agent.commission_rate || 0}%`, icon: Award },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto p-4 space-y-6">
        <Button variant="ghost" onClick={() => navigate(-1)} className="gap-2">
          <ArrowLeft className="h-4 w-4" /> Retour
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
                  {agent.verified && <Badge className="bg-green-500 text-white">Vérifié</Badge>}
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
                <Button variant="outline" className="gap-2">
                  <Handshake className="h-4 w-4" /> Contacter
                </Button>
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
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
            <TabsTrigger value="talents">Talents</TabsTrigger>
            <TabsTrigger value="organizations">Organisations</TabsTrigger>
            <TabsTrigger value="services">Services</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            {agent.bio && (
              <Card>
                <CardHeader><CardTitle className="text-lg">À propos</CardTitle></CardHeader>
                <CardContent><p className="text-muted-foreground">{agent.bio}</p></CardContent>
              </Card>
            )}
            {agent.specialization && agent.specialization.length > 0 && (
              <Card>
                <CardHeader><CardTitle className="text-lg">Spécialisations</CardTitle></CardHeader>
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
                  <span className="text-sm text-muted-foreground">Licence: {agent.license_number}</span>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="talents" className="space-y-4">
            {contracts.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <Users className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                  <h3 className="font-semibold text-lg">Aucun talent</h3>
                  <p className="text-muted-foreground">Cet agent n'a pas encore de talents sous contrat.</p>
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
                        {contract.talent_profile?.name || 'Talent'}
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
                        {contract.status === 'active' ? 'Actif' : contract.status}
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
                  <h3 className="font-semibold text-lg">Aucune organisation</h3>
                  <p className="text-muted-foreground">Cet agent n'est membre d'aucune organisation.</p>
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
                      <Badge variant="outline">{membership.role || 'Membre'}</Badge>
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
                  <h3 className="font-semibold text-lg">Aucun service</h3>
                  <p className="text-muted-foreground">Cet agent n'a pas encore listé ses services.</p>
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
      <Footer />
    </div>
  );
};

export default AgentProfile;
