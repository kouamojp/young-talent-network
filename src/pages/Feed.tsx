import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PostCreationDialog } from '@/components/PostCreationDialog';
import PostCard from '@/components/PostCard';
import RecentOrganizations from '@/components/RecentOrganizations';
import { 
  Loader2, Users, Building2, Briefcase, TrendingUp, Star, 
  UserPlus, Bell, Sparkles, ArrowRight 
} from 'lucide-react';
import { useLanguage } from '@/i18n/LanguageContext';

interface Post {
  id: string; content: string; created_at: string; likes_count: number; comments_count: number; user_id: string;
  profiles: { name: string; avatar_url: string | null; };
}

interface SuggestedProfile {
  id: string; name: string; avatar_url: string | null; user_type: string; sport_type: string | null; country: string | null;
}

const FeedPage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [suggestedTalents, setSuggestedTalents] = useState<SuggestedProfile[]>([]);
  const [suggestedOrgs, setSuggestedOrgs] = useState<any[]>([]);

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { navigate('/auth'); return; }
      const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      setCurrentUser(profile);

      const [postsRes, talentsRes, orgsRes] = await Promise.all([
        supabase.from('posts').select('*, profiles (name, avatar_url)').order('created_at', { ascending: false }).limit(20),
        supabase.from('profiles').select('id, name, avatar_url, user_type, sport_type, country').neq('id', user.id).limit(6),
        supabase.from('organization_profiles').select('id, company_name, logo_url, industry, headquarters').limit(4),
      ]);

      setPosts(postsRes.data || []);
      setSuggestedTalents(talentsRes.data || []);
      setSuggestedOrgs(orgsRes.data || []);
      setLoading(false);
    };
    init();
  }, [navigate]);

  const fetchPosts = async () => {
    const { data } = await supabase.from('posts').select('*, profiles (name, avatar_url)').order('created_at', { ascending: false }).limit(20);
    setPosts(data || []);
  };

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  const getUserTypeLabel = (type: string) => {
    switch (type) {
      case 'talent': return t('profile.talent');
      case 'agent': return t('profile.agent');
      case 'organization': return t('profile.organization');
      default: return type;
    }
  };

  const userType = currentUser?.user_type || 'talent';

  const getHeaderGradient = () => {
    switch (userType) {
      case 'agent': return 'from-violet-600 via-purple-600 to-indigo-600';
      case 'organization': return 'from-teal-600 via-emerald-600 to-green-600';
      default: return 'from-blue-600 via-sky-600 to-cyan-600';
    }
  };

  const getSubtitle = () => {
    switch (userType) {
      case 'agent': return t('feed.agentSubtitle');
      case 'organization': return t('feed.orgSubtitle');
      default: return t('feed.talentSubtitle');
    }
  };

  const getStats = () => {
    switch (userType) {
      case 'agent':
        return [
          { icon: Users, label: t('landing.talents'), value: suggestedTalents.length },
          { icon: Briefcase, label: t('feed.contracts'), value: 0 },
          { icon: Building2, label: t('landing.organizations'), value: suggestedOrgs.length },
          { icon: Star, label: t('feed.reputation'), value: currentUser?.platform_rating || 0 },
        ];
      case 'organization':
        return [
          { icon: Users, label: t('feed.members'), value: suggestedTalents.length },
          { icon: Briefcase, label: t('feed.offers'), value: 0 },
          { icon: TrendingUp, label: t('feed.applications'), value: 0 },
          { icon: Star, label: t('feed.score'), value: currentUser?.platform_rating || 0 },
        ];
      default:
        return [
          { icon: TrendingUp, label: t('feed.posts'), value: posts.length },
          { icon: Users, label: t('feed.connections'), value: suggestedTalents.length },
          { icon: Building2, label: t('landing.organizations'), value: suggestedOrgs.length },
          { icon: Star, label: t('feed.yatScore'), value: currentUser?.platform_rating || 0 },
        ];
    }
  };

  return (
    <div className="w-full min-h-screen">
      <div className={`bg-gradient-to-r ${getHeaderGradient()} text-white`}>
        <div className="max-w-5xl mx-auto px-4 py-8">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16 border-2 border-white/30"><AvatarImage src={currentUser?.avatar_url} /><AvatarFallback className="bg-white/20 text-white text-xl">{currentUser?.name?.[0] || 'U'}</AvatarFallback></Avatar>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold">{t('feed.welcome', { name: currentUser?.name || 'User' })}</h1>
                <Badge className="bg-white/20 text-white border-0 text-xs">{getUserTypeLabel(userType)}</Badge>
              </div>
              <p className="text-white/80 text-sm">{getSubtitle()}</p>
            </div>
          </div>
          <div className="grid grid-cols-4 gap-3 mt-6">
            {getStats().map((stat) => (
              <div key={stat.label} className="bg-white/10 backdrop-blur-sm rounded-xl p-3 text-center">
                <stat.icon className="h-5 w-5 mx-auto mb-1 text-white/80" />
                <div className="text-lg font-bold">{stat.value}</div>
                <div className="text-xs text-white/70">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6">
        <Tabs defaultValue="feed" className="w-full">
          <TabsList className="w-full justify-start mb-6 bg-muted/50">
            <TabsTrigger value="feed">{t('feed.myFeed')}</TabsTrigger>
            <TabsTrigger value="discover">{t('feed.discover')}</TabsTrigger>
            <TabsTrigger value="organizations">{t('feed.organizations')}</TabsTrigger>
          </TabsList>

          <TabsContent value="feed">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-4">
                <Card className="border-border/50">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10"><AvatarImage src={currentUser?.avatar_url} /><AvatarFallback>{currentUser?.name?.[0] || 'U'}</AvatarFallback></Avatar>
                      <PostCreationDialog
                        trigger={<Button variant="outline" className="w-full justify-start text-muted-foreground font-normal rounded-full h-10 hover:bg-muted">{t('feed.whatsNew', { name: currentUser?.name?.split(' ')[0] || '' })}</Button>}
                        onPostCreated={fetchPosts} userAvatar={currentUser?.avatar_url} userName={currentUser?.name}
                      />
                    </div>
                  </CardContent>
                </Card>
                <RecentOrganizations />
                {posts.length === 0 ? (
                  <Card className="border-dashed border-2">
                    <CardContent className="py-12 text-center">
                      <Sparkles className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
                      <h3 className="font-semibold text-lg mb-2">{t('feed.noPosts')}</h3>
                      <p className="text-muted-foreground text-sm mb-4">{t('feed.beFirst')}</p>
                    </CardContent>
                  </Card>
                ) : (
                  posts.map(post => (
                    <PostCard key={post.id} post={{ id: post.id, author: { name: post.profiles.name, avatar: post.profiles.avatar_url || '/placeholder.svg' }, content: post.content, timestamp: post.created_at, likes: post.likes_count, comments: post.comments_count, shares: 0 }} onUpdate={fetchPosts} />
                  ))
                )}
              </div>

              <div className="space-y-4">
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-sm flex items-center gap-2"><Users className="h-4 w-4 text-primary" />{t('feed.suggestedTalents')}</h3>
                      <Button variant="ghost" size="sm" className="text-xs" onClick={() => navigate('/talents-around-me')}>{t('common.seeAll')}</Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {suggestedTalents.slice(0, 4).map((talent) => (
                      <div key={talent.id} className="flex items-center gap-3">
                        <Avatar className="h-9 w-9"><AvatarImage src={talent.avatar_url || ''} /><AvatarFallback className="text-xs">{talent.name[0]}</AvatarFallback></Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{talent.name}</p>
                          <div className="flex items-center gap-1">
                            <Badge variant="secondary" className="text-[10px] px-1.5 py-0">{getUserTypeLabel(talent.user_type)}</Badge>
                            {talent.country && <span className="text-[10px] text-muted-foreground">{talent.country}</span>}
                          </div>
                        </div>
                        <Button variant="ghost" size="icon" className="h-7 w-7"><UserPlus className="h-3.5 w-3.5" /></Button>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-sm flex items-center gap-2"><Building2 className="h-4 w-4 text-teal-500" />{t('feed.organizations')}</h3>
                      <Button variant="ghost" size="sm" className="text-xs" onClick={() => navigate('/organizations')}>{t('common.seeAll')}</Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {suggestedOrgs.map((org) => (
                      <div key={org.id} className="flex items-center gap-3 cursor-pointer hover:bg-muted/50 rounded-lg p-1.5 -mx-1.5 transition-colors" onClick={() => navigate(`/organization/${org.id}`)}>
                        <Avatar className="h-9 w-9"><AvatarImage src={org.logo_url || ''} /><AvatarFallback className="text-xs bg-teal-100 text-teal-700">{org.company_name[0]}</AvatarFallback></Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{org.company_name}</p>
                          <p className="text-[11px] text-muted-foreground truncate">{org.industry || org.headquarters || t('profile.organization')}</p>
                        </div>
                        <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
                  <CardContent className="p-4 space-y-2">
                    <h3 className="font-semibold text-sm flex items-center gap-2"><Sparkles className="h-4 w-4 text-primary" />{t('feed.quickActions')}</h3>
                    <Button variant="outline" size="sm" className="w-full justify-start text-xs" onClick={() => navigate('/work')}><Briefcase className="h-3.5 w-3.5 mr-2" /> {t('feed.searchOpportunities')}</Button>
                    <Button variant="outline" size="sm" className="w-full justify-start text-xs" onClick={() => navigate('/events')}><Bell className="h-3.5 w-3.5 mr-2" /> {t('feed.upcomingEvents')}</Button>
                    <Button variant="outline" size="sm" className="w-full justify-start text-xs" onClick={() => navigate('/test')}><Star className="h-3.5 w-3.5 mr-2" /> {t('feed.testAptitudes')}</Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="discover">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {suggestedTalents.map((talent) => (
                <Card key={talent.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate(`/talent/${talent.id}`)}>
                  <CardContent className="p-4 text-center">
                    <Avatar className="h-16 w-16 mx-auto mb-3"><AvatarImage src={talent.avatar_url || ''} /><AvatarFallback>{talent.name[0]}</AvatarFallback></Avatar>
                    <h4 className="font-semibold text-sm">{talent.name}</h4>
                    <Badge variant="secondary" className="mt-1 text-[10px]">{getUserTypeLabel(talent.user_type)}</Badge>
                    {talent.sport_type && <p className="text-xs text-muted-foreground mt-1">{talent.sport_type}</p>}
                    {talent.country && <p className="text-xs text-muted-foreground">{talent.country}</p>}
                    <Button size="sm" variant="outline" className="mt-3 w-full text-xs"><UserPlus className="h-3 w-3 mr-1" /> {t('common.connect')}</Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="organizations">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {suggestedOrgs.map((org) => (
                <Card key={org.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate(`/organization/${org.id}`)}>
                  <CardContent className="p-4 flex items-center gap-4">
                    <Avatar className="h-14 w-14"><AvatarImage src={org.logo_url || ''} /><AvatarFallback className="bg-teal-100 text-teal-700">{org.company_name[0]}</AvatarFallback></Avatar>
                    <div className="flex-1">
                      <h4 className="font-semibold">{org.company_name}</h4>
                      <p className="text-sm text-muted-foreground">{org.industry || t('profile.organization')}</p>
                      {org.headquarters && <p className="text-xs text-muted-foreground">{org.headquarters}</p>}
                    </div>
                    <Button size="sm" variant="outline">{t('common.view')} <ArrowRight className="h-3 w-3 ml-1" /></Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default FeedPage;
