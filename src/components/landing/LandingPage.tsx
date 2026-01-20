import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Briefcase, 
  GraduationCap, 
  Radio, 
  Tv, 
  Calendar, 
  Map, 
  Users, 
  Building, 
  Coins, 
  User, 
  LayoutDashboard,
  MessageSquare,
  Bell,
  Newspaper,
  ArrowRight,
  Sparkles,
  Globe,
  Star
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface PlatformSection {
  title: string;
  description: string;
  icon: React.ElementType;
  path: string;
  color: string;
  badge?: string;
}

const talentSections: PlatformSection[] = [
  {
    title: 'Talent Dashboard',
    description: 'Gérez votre présence professionnelle et vos opportunités',
    icon: LayoutDashboard,
    path: '/talent-dashboard',
    color: 'from-purple-500 to-pink-500',
    badge: 'Votre Hub'
  },
  {
    title: 'Mon Profil',
    description: 'Personnalisez votre profil, compétences et intérêts',
    icon: User,
    path: '/profile',
    color: 'from-blue-500 to-cyan-500'
  },
  {
    title: 'Talents Autour de Moi',
    description: 'Découvrez les talents près de chez vous',
    icon: Users,
    path: '/talents-around-me',
    color: 'from-green-500 to-teal-500'
  }
];

const platformServices: PlatformSection[] = [
  {
    title: 'YAT Work',
    description: 'Trouvez des opportunités de travail et stages',
    icon: Briefcase,
    path: '/work',
    color: 'from-orange-500 to-red-500'
  },
  {
    title: 'YAT Learning',
    description: 'Formations, séminaires et masterclasses',
    icon: GraduationCap,
    path: '/learning',
    color: 'from-indigo-500 to-purple-500'
  },
  {
    title: 'YAT Live',
    description: 'Diffusions en direct et streaming',
    icon: Radio,
    path: '/live',
    color: 'from-red-500 to-pink-500',
    badge: 'Live'
  },
  {
    title: 'YAT TV',
    description: 'Contenu vidéo et émissions',
    icon: Tv,
    path: '/tv',
    color: 'from-purple-500 to-indigo-500'
  },
  {
    title: 'YAT Events',
    description: 'Événements sportifs et compétitions',
    icon: Calendar,
    path: '/events',
    color: 'from-teal-500 to-green-500'
  },
  {
    title: 'YAT Karta',
    description: 'Explorez talents, organisations et événements sur la carte',
    icon: Map,
    path: '/karta',
    color: 'from-cyan-500 to-blue-500'
  }
];

const communityFeatures: PlatformSection[] = [
  {
    title: 'Organisations',
    description: 'Découvrez les entreprises et agences',
    icon: Building,
    path: '/organizations',
    color: 'from-slate-500 to-gray-600'
  },
  {
    title: 'Messages',
    description: 'Communiquez avec votre réseau',
    icon: MessageSquare,
    path: '/messages',
    color: 'from-blue-400 to-indigo-500'
  },
  {
    title: 'Actualités',
    description: 'Restez informé des dernières nouvelles',
    icon: Newspaper,
    path: '/news',
    color: 'from-amber-500 to-orange-500'
  },
  {
    title: 'YAT Coin',
    description: 'Tokenisez votre talent et investissez',
    icon: Coins,
    path: '/yat-coin',
    color: 'from-yellow-400 to-amber-500',
    badge: 'Crypto'
  }
];

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userName, setUserName] = useState<string | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setIsAuthenticated(true);
        const { data: profile } = await supabase
          .from('profiles')
          .select('name')
          .eq('id', user.id)
          .single();
        if (profile) {
          setUserName(profile.name);
        }
      }
    };
    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setIsAuthenticated(!!session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const SectionCard: React.FC<{ section: PlatformSection }> = ({ section }) => (
    <Link to={section.path}>
      <Card className="group h-full transition-all duration-300 hover:shadow-lg hover:-translate-y-1 border-border/50 hover:border-primary/30">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className={`p-3 rounded-xl bg-gradient-to-br ${section.color} text-white shadow-lg`}>
              <section.icon className="h-6 w-6" />
            </div>
            {section.badge && (
              <span className="text-xs font-semibold px-2 py-1 rounded-full bg-primary/10 text-primary">
                {section.badge}
              </span>
            )}
          </div>
          <CardTitle className="text-lg mt-3 group-hover:text-primary transition-colors">
            {section.title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <CardDescription className="text-sm">
            {section.description}
          </CardDescription>
          <div className="flex items-center mt-3 text-primary text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
            Explorer <ArrowRight className="h-4 w-4 ml-1" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );

  return (
    <div className="w-full min-h-screen">
      {/* Hero Section */}
      <section className="relative py-16 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5" />
        <div className="relative max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
            <Sparkles className="h-4 w-4" />
            Plateforme pour Jeunes Talents
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent">
            Young & Talented Network
          </h1>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Connectez-vous avec des talents, trouvez des opportunités, apprenez de nouvelles compétences 
            et développez votre carrière dans un écosystème complet.
          </p>
          
          {isAuthenticated ? (
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" onClick={() => navigate('/talent-dashboard')}>
                <LayoutDashboard className="mr-2 h-5 w-5" />
                Accéder au Dashboard
              </Button>
              <Button size="lg" variant="outline" onClick={() => navigate('/profile')}>
                <User className="mr-2 h-5 w-5" />
                Mon Profil
              </Button>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" onClick={() => navigate('/auth')}>
                Commencer Gratuitement
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button size="lg" variant="outline" onClick={() => navigate('/auth')}>
                Se Connecter
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-8 px-4 border-y border-border/50 bg-muted/30">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div>
            <div className="text-3xl font-bold text-primary">10K+</div>
            <div className="text-sm text-muted-foreground">Talents Actifs</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-primary">500+</div>
            <div className="text-sm text-muted-foreground">Organisations</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-primary">1K+</div>
            <div className="text-sm text-muted-foreground">Opportunités</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-primary">50+</div>
            <div className="text-sm text-muted-foreground">Pays</div>
          </div>
        </div>
      </section>

      {/* Talent Profile Section */}
      {isAuthenticated && (
        <section className="py-12 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center gap-2 mb-6">
              <Star className="h-5 w-5 text-primary" />
              <h2 className="text-2xl font-bold">Votre Espace Talent</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {talentSections.map((section) => (
                <SectionCard key={section.path} section={section} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Platform Services */}
      <section className="py-12 px-4 bg-muted/20">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-2 mb-6">
            <Globe className="h-5 w-5 text-primary" />
            <h2 className="text-2xl font-bold">Services de la Plateforme</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {platformServices.map((section) => (
              <SectionCard key={section.path} section={section} />
            ))}
          </div>
        </div>
      </section>

      {/* Community Features */}
      <section className="py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-2 mb-6">
            <Users className="h-5 w-5 text-primary" />
            <h2 className="text-2xl font-bold">Communauté & Plus</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {communityFeatures.map((section) => (
              <SectionCard key={section.path} section={section} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      {!isAuthenticated && (
        <section className="py-16 px-4 bg-gradient-to-r from-primary/10 via-purple-500/10 to-pink-500/10">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">
              Prêt à Rejoindre la Communauté ?
            </h2>
            <p className="text-muted-foreground mb-8">
              Inscrivez-vous gratuitement et commencez à explorer les opportunités qui vous attendent.
            </p>
            <Button size="lg" onClick={() => navigate('/auth')}>
              Créer Mon Compte
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </section>
      )}
    </div>
  );
};

export default LandingPage;
