import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { user } from '@/components/profile/ProfileData';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Camera, MapPin, Briefcase, Globe, LayoutDashboard, Radio, Tv, Calendar, GraduationCap, Map, Coins, Play, FileText, Users } from 'lucide-react';
import { ProfileSkills } from '@/components/profile/ProfileSkills';
import { ProfileInterests } from '@/components/profile/ProfileInterests';
import { ProfileSettings } from '@/components/profile/ProfileSettings';
import ProfileSidebar from '@/components/profile/ProfileSidebar';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';

interface TalentPresence {
  id: string;
  section: string;
  is_active: boolean;
  visibility: string;
}

// Mock data for talent activity
const mockTalentActivity = {
  work: [
    { id: 1, title: "Candidature envoyée", description: "Développeur React chez TechCorp", date: "Il y a 2 jours" },
    { id: 2, title: "Profil consulté", description: "3 recruteurs ont vu votre profil", date: "Il y a 3 jours" },
  ],
  learning: [
    { id: 1, title: "Cours complété", description: "Introduction à TypeScript", date: "Il y a 1 jour" },
    { id: 2, title: "Certification obtenue", description: "React Advanced Patterns", date: "Il y a 1 semaine" },
  ],
  live: [
    { id: 1, title: "Live programmé", description: "Coding session - Dimanche 15h", date: "Dans 3 jours" },
    { id: 2, title: "Dernier live", description: "150 spectateurs", date: "Il y a 5 jours" },
  ],
  tv: [
    { id: 1, title: "Nouvelle vidéo", description: "Comment débuter en freelance", date: "Il y a 2 jours" },
    { id: 2, title: "Vidéo populaire", description: "1.2k vues cette semaine", date: "Tendance" },
  ],
  events: [
    { id: 1, title: "Inscription confirmée", description: "Tech Meetup Paris 2026", date: "Le 15 Mars" },
    { id: 2, title: "Événement passé", description: "Hackathon Spring 2026", date: "Il y a 2 semaines" },
  ],
  karta: [
    { id: 1, title: "Position mise à jour", description: "Paris, France", date: "Aujourd'hui" },
    { id: 2, title: "Nouveau contact", description: "5 talents à proximité", date: "Cette semaine" },
  ],
  coin: [
    { id: 1, title: "Tokens gagnés", description: "+50 YAT Coins", date: "Il y a 1 jour" },
    { id: 2, title: "Transaction", description: "Achat de formation", date: "Il y a 3 jours" },
  ],
};

const ActivityCard = ({ title, description, date }: { title: string; description: string; date: string }) => (
  <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
    <div className="flex-1">
      <p className="font-medium text-sm">{title}</p>
      <p className="text-xs text-muted-foreground">{description}</p>
    </div>
    <Badge variant="secondary" className="text-[10px]">{date}</Badge>
  </div>
);

const SectionContent = ({ section, icon: Icon, color }: { section: string; icon: any; color: string }) => {
  const activities = mockTalentActivity[section as keyof typeof mockTalentActivity] || [];
  
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-4">
        <div className={`p-2 rounded-lg ${color}`}>
          <Icon className="h-5 w-5" />
        </div>
        <h3 className="font-semibold">Mes actualités</h3>
      </div>
      {activities.length > 0 ? (
        <div className="space-y-2">
          {activities.map((activity) => (
            <ActivityCard key={activity.id} {...activity} />
          ))}
        </div>
      ) : (
        <p className="text-muted-foreground text-sm">Aucune activité récente</p>
      )}
    </div>
  );
};

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [talentPresence, setTalentPresence] = useState<TalentPresence[]>([]);
  const [activeSection, setActiveSection] = useState('work');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (authUser) {
        setUserId(authUser.id);
        
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', authUser.id)
          .single();
        setProfile(profileData);

        const { data: presenceData } = await supabase
          .from('talent_presence')
          .select('*')
          .eq('user_id', authUser.id);
        
        if (presenceData) {
          setTalentPresence(presenceData);
        }
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const displayProfile = profile || user;

  const sectionTabs = [
    { key: 'work', label: 'YAT Work', icon: Briefcase, color: 'bg-blue-500/20 text-blue-500' },
    { key: 'learning', label: 'YAT Learning', icon: GraduationCap, color: 'bg-green-500/20 text-green-500' },
    { key: 'live', label: 'YAT Live', icon: Radio, color: 'bg-red-500/20 text-red-500' },
    { key: 'tv', label: 'YAT TV', icon: Tv, color: 'bg-purple-500/20 text-purple-500' },
    { key: 'events', label: 'YAT Events', icon: Calendar, color: 'bg-orange-500/20 text-orange-500' },
    { key: 'karta', label: 'YAT Karta', icon: Map, color: 'bg-teal-500/20 text-teal-500' },
    { key: 'coin', label: 'YAT Coin', icon: Coins, color: 'bg-yellow-500/20 text-yellow-500' },
  ];

  return (
    <div className="w-full max-w-5xl mx-auto py-6 px-4">
      {/* Profile Header Card */}
      <Card className="overflow-hidden mb-6">
        {/* Cover Photo */}
        <div className="h-40 bg-gradient-to-r from-primary/80 to-primary relative">
          <Button
            size="icon"
            variant="secondary"
            className="absolute bottom-3 right-3 h-8 w-8"
          >
            <Camera className="h-4 w-4" />
          </Button>
        </div>
        
        {/* Profile Info */}
        <CardContent className="pt-0 pb-6">
          <div className="flex flex-col md:flex-row gap-6 -mt-16">
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              <Avatar className="h-32 w-32 border-4 border-card shadow-lg">
                <AvatarImage src={displayProfile.avatar || displayProfile.avatar_url} alt={displayProfile.name} />
                <AvatarFallback className="text-3xl">{displayProfile.name?.charAt(0) || 'U'}</AvatarFallback>
              </Avatar>
              <Button
                size="icon"
                variant="secondary"
                className="absolute bottom-0 right-0 h-8 w-8 rounded-full shadow"
              >
                <Camera className="h-4 w-4" />
              </Button>
            </div>
            
            {/* Name and Actions */}
            <div className="flex-1 pt-16 md:pt-4">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div>
                  <h1 className="text-2xl font-bold">{displayProfile.name}</h1>
                  <p className="text-muted-foreground">{displayProfile.email}</p>
                </div>
                <Button onClick={() => navigate('/talent-dashboard')} className="w-fit">
                  <LayoutDashboard className="h-4 w-4 mr-2" />
                  Talent Dashboard
                </Button>
              </div>
              
              {/* Quick Info */}
              <div className="flex flex-wrap gap-4 mt-4 text-sm text-muted-foreground">
                {displayProfile.location && (
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    <span>{displayProfile.location}</span>
                  </div>
                )}
                {displayProfile.work && (
                  <div className="flex items-center gap-1">
                    <Briefcase className="h-4 w-4" />
                    <span>{displayProfile.work}</span>
                  </div>
                )}
                {displayProfile.website && (
                  <div className="flex items-center gap-1">
                    <Globe className="h-4 w-4" />
                    <a href={displayProfile.website} className="text-primary hover:underline">{displayProfile.website}</a>
                  </div>
                )}
              </div>
              
              {displayProfile.bio && (
                <p className="mt-4 text-sm leading-relaxed">{displayProfile.bio}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Sidebar - YAT Sections */}
        <div className="lg:col-span-1">
          <ProfileSidebar 
            talentPresence={talentPresence}
            userName={displayProfile.name}
            userAvatar={displayProfile.avatar || displayProfile.avatar_url}
          />
        </div>

        {/* Main Content - Tabs */}
        <div className="lg:col-span-3">
          <Card>
            <CardContent className="p-4">
              <Tabs value={activeSection} onValueChange={setActiveSection} className="w-full">
                <TabsList className="w-full flex-wrap h-auto gap-1 bg-muted/50 p-2 rounded-lg">
                  {sectionTabs.map((tab) => (
                    <TabsTrigger 
                      key={tab.key} 
                      value={tab.key}
                      className="flex items-center gap-1.5 px-3 py-2 text-xs data-[state=active]:bg-background"
                    >
                      <tab.icon className="h-3.5 w-3.5" />
                      <span className="hidden sm:inline">{tab.label}</span>
                    </TabsTrigger>
                  ))}
                </TabsList>
                
                {sectionTabs.map((tab) => (
                  <TabsContent key={tab.key} value={tab.key} className="mt-4">
                    <SectionContent section={tab.key} icon={tab.icon} color={tab.color} />
                  </TabsContent>
                ))}
              </Tabs>
            </CardContent>
          </Card>

          {/* Skills & Interests Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Compétences
                </CardTitle>
              </CardHeader>
              <CardContent>
                {userId && <ProfileSkills userId={userId} />}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Intérêts
                </CardTitle>
              </CardHeader>
              <CardContent>
                {userId && <ProfileInterests userId={userId} />}
              </CardContent>
            </Card>
          </div>

          {/* Settings */}
          <Card className="mt-6">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Paramètres du profil</CardTitle>
            </CardHeader>
            <CardContent>
              <ProfileSettings 
                profile={displayProfile} 
                onUpdate={(updates) => setProfile((prev: any) => ({ ...prev, ...updates }))} 
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Profile;
