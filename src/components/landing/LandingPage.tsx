import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Briefcase, GraduationCap, Radio, Tv, Calendar, Map, Users, Building, 
  Coins, User, LayoutDashboard, MessageSquare, Newspaper, ArrowRight, 
  Sparkles, Globe, Star, Trophy, Palette, FlaskConical, Shirt, HeartPulse, Music, Music2, Search
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/i18n/LanguageContext';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userName, setUserName] = useState<string | null>(null);
  const [stats, setStats] = useState({ talents: 0, orgs: 0, events: 0 });

  const platformServices = [
    { title: 'YAT Work', description: t('landing.yatWork'), icon: Briefcase, path: '/work', color: 'from-orange-500 to-red-500' },
    { title: 'YAT Learning', description: t('landing.yatLearning'), icon: GraduationCap, path: '/learning', color: 'from-indigo-500 to-purple-500' },
    { title: 'YAT Live', description: t('landing.yatLive'), icon: Radio, path: '/live', color: 'from-red-500 to-pink-500', badge: 'Live' },
    { title: 'YAT TV', description: t('landing.yatTV'), icon: Tv, path: '/tv', color: 'from-purple-500 to-indigo-500' },
    { title: 'YAT Events', description: t('landing.yatEvents'), icon: Calendar, path: '/events', color: 'from-teal-500 to-green-500' },
    { title: 'YAT Karta', description: t('landing.yatKarta'), icon: Map, path: '/karta', color: 'from-cyan-500 to-blue-500' },
    { title: 'YAT Coin', description: t('landing.yatCoin'), icon: Coins, path: '/yat-coin', color: 'from-yellow-400 to-amber-500', badge: 'Crypto' },
    { title: 'YAT Search', description: t('landing.yatSearch'), icon: Search, path: '/search', color: 'from-slate-500 to-gray-600' },
    { title: 'YAT Test', description: t('landing.yatTest'), icon: Star, path: '/test', color: 'from-pink-500 to-rose-500' },
  ];

  const categories = [
    { name: t('landing.sport'), icon: Trophy, color: 'from-green-500 to-emerald-600' },
    { name: t('landing.art'), icon: Palette, color: 'from-purple-500 to-violet-600' },
    { name: t('landing.science'), icon: FlaskConical, color: 'from-blue-500 to-cyan-600' },
    { name: t('landing.fashion'), icon: Shirt, color: 'from-pink-500 to-rose-600' },
    { name: t('landing.medicine'), icon: HeartPulse, color: 'from-red-500 to-orange-600' },
    { name: t('landing.dance'), icon: Music, color: 'from-amber-500 to-yellow-600' },
    { name: t('landing.music'), icon: Music2, color: 'from-indigo-500 to-blue-600' },
    { name: t('landing.hobby'), icon: Star, color: 'from-teal-500 to-green-600' },
  ];

  const participants = [
    { title: t('landing.talents'), description: t('landing.talentsDesc'), icon: Users, path: '/talents-around-me' },
    { title: t('landing.agents'), description: t('landing.agentsDesc'), icon: User, path: '/participants' },
    { title: t('landing.organizations'), description: t('landing.orgsDesc'), icon: Building, path: '/organizations' },
  ];

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setIsAuthenticated(true);
        const { data: profile } = await supabase.from('profiles').select('name').eq('id', user.id).single();
        if (profile) setUserName(profile.name);
      }
    };
    checkAuth();

    const fetchStats = async () => {
      const [talentsRes, orgsRes, eventsRes] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('user_type', 'talent'),
        supabase.from('organization_profiles').select('id', { count: 'exact', head: true }),
        supabase.from('events').select('id', { count: 'exact', head: true }),
      ]);
      setStats({
        talents: talentsRes.count || 0,
        orgs: orgsRes.count || 0,
        events: eventsRes.count || 0,
      });
    };
    fetchStats();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setIsAuthenticated(!!session);
    });
    return () => subscription.unsubscribe();
  }, []);

  return (
    <div className="w-full min-h-screen">
      {/* Hero */}
      <section className="relative py-20 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5" />
        <div className="relative max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
            <Sparkles className="h-4 w-4" />
            {t('landing.badge')}
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent">
            {t('landing.hero')}
          </h1>
          <p className="text-lg text-muted-foreground mb-4 max-w-3xl mx-auto">
            {t('landing.heroDesc')}
          </p>
          <p className="text-base text-muted-foreground/80 mb-8 max-w-2xl mx-auto">
            {t('landing.heroRu')}
          </p>
          
          {isAuthenticated ? (
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" onClick={() => navigate('/profile')}>
                <User className="mr-2 h-5 w-5" />
                {t('landing.myProfile')}
              </Button>
              <Button size="lg" variant="outline" onClick={() => navigate('/talent-dashboard')}>
                <LayoutDashboard className="mr-2 h-5 w-5" />
                {t('landing.talentDashboard')}
              </Button>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" onClick={() => navigate('/auth')}>
                {t('landing.freeSignup')} <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button size="lg" variant="outline" onClick={() => navigate('/auth')}>
                {t('landing.signIn')}
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Stats */}
      <section className="py-8 px-4 border-y border-border/50 bg-muted/30">
        <div className="max-w-4xl mx-auto grid grid-cols-3 gap-6 text-center">
          <div>
            <div className="text-3xl font-bold text-primary">{stats.talents || '—'}</div>
            <div className="text-sm text-muted-foreground">{t('landing.registeredTalents')}</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-primary">{stats.orgs || '—'}</div>
            <div className="text-sm text-muted-foreground">{t('landing.organizations')}</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-primary">{stats.events || '—'}</div>
            <div className="text-sm text-muted-foreground">{t('landing.events')}</div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-bold mb-2">{t('landing.categories')}</h2>
          <p className="text-muted-foreground mb-6">{t('landing.categoriesDesc')}</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {categories.map((cat) => (
              <Link key={cat.name} to={`/categories?cat=${cat.name.toLowerCase()}`}>
                <Card className="group hover:shadow-lg hover:-translate-y-1 transition-all cursor-pointer">
                  <CardContent className="flex flex-col items-center py-6 gap-3">
                    <div className={`p-3 rounded-xl bg-gradient-to-br ${cat.color} text-white shadow-lg group-hover:scale-110 transition-transform`}>
                      <cat.icon className="h-6 w-6" />
                    </div>
                    <span className="font-medium text-sm">{cat.name}</span>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Participants */}
      <section className="py-12 px-4 bg-muted/20">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-bold mb-2">{t('landing.participants')}</h2>
          <p className="text-muted-foreground mb-6">{t('landing.participantsDesc')}</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {participants.map((p) => (
              <Link key={p.title} to={p.path}>
                <Card className="group h-full hover:shadow-lg hover:-translate-y-1 transition-all">
                  <CardHeader>
                    <div className="p-3 rounded-xl bg-primary/10 text-primary w-fit">
                      <p.icon className="h-6 w-6" />
                    </div>
                    <CardTitle className="text-lg mt-3 group-hover:text-primary transition-colors">{p.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>{p.description}</CardDescription>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-2 mb-2">
            <Globe className="h-5 w-5 text-primary" />
            <h2 className="text-2xl font-bold">{t('landing.sectionsYat')}</h2>
          </div>
          <p className="text-muted-foreground mb-6">{t('landing.sectionsDesc')}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {platformServices.map((section) => (
              <Link key={section.path} to={section.path}>
                <Card className="group h-full transition-all duration-300 hover:shadow-lg hover:-translate-y-1 border-border/50 hover:border-primary/30">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className={`p-3 rounded-xl bg-gradient-to-br ${section.color} text-white shadow-lg`}>
                        <section.icon className="h-6 w-6" />
                      </div>
                      {section.badge && (
                        <Badge variant="secondary" className="text-xs">{section.badge}</Badge>
                      )}
                    </div>
                    <CardTitle className="text-lg mt-3 group-hover:text-primary transition-colors">{section.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-sm">{section.description}</CardDescription>
                    <div className="flex items-center mt-3 text-primary text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                      {t('common.explore')} <ArrowRight className="h-4 w-4 ml-1" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Community */}
      <section className="py-12 px-4 bg-muted/20">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-bold mb-2">{t('landing.community')}</h2>
          <p className="text-muted-foreground mb-6">{t('landing.communityDesc')}</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <Link to="/messages">
              <Card className="hover:shadow-lg hover:-translate-y-1 transition-all h-full">
                <CardHeader><div className="p-3 rounded-xl bg-blue-500/10 text-blue-500 w-fit"><MessageSquare className="h-6 w-6" /></div><CardTitle className="text-lg mt-3">YAT Messenger</CardTitle></CardHeader>
                <CardContent><CardDescription>{t('landing.messengerDesc')}</CardDescription></CardContent>
              </Card>
            </Link>
            <Link to="/news">
              <Card className="hover:shadow-lg hover:-translate-y-1 transition-all h-full">
                <CardHeader><div className="p-3 rounded-xl bg-amber-500/10 text-amber-500 w-fit"><Newspaper className="h-6 w-6" /></div><CardTitle className="text-lg mt-3">YAT News</CardTitle></CardHeader>
                <CardContent><CardDescription>{t('landing.newsDesc')}</CardDescription></CardContent>
              </Card>
            </Link>
            <Link to="/communities">
              <Card className="hover:shadow-lg hover:-translate-y-1 transition-all h-full">
                <CardHeader><div className="p-3 rounded-xl bg-green-500/10 text-green-500 w-fit"><Users className="h-6 w-6" /></div><CardTitle className="text-lg mt-3">{t('sidebar.communities')}</CardTitle></CardHeader>
                <CardContent><CardDescription>{t('landing.communitiesDesc')}</CardDescription></CardContent>
              </Card>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      {!isAuthenticated && (
        <section className="py-16 px-4 bg-gradient-to-r from-primary/10 via-purple-500/10 to-pink-500/10">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">{t('landing.ctaTitle')}</h2>
            <p className="text-muted-foreground mb-4">{t('landing.ctaDesc')}</p>
            <p className="text-sm text-muted-foreground mb-8">{t('landing.ctaDetails')}</p>
            <Button size="lg" onClick={() => navigate('/auth')}>
              {t('landing.ctaButton')} <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </section>
      )}
    </div>
  );
};

export default LandingPage;
