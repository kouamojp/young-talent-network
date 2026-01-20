import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { user } from '@/components/profile/ProfileData';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Settings, Camera, MapPin, Briefcase, Globe, LayoutDashboard, ArrowRight, Radio, GraduationCap, Calendar, Tv, Coins } from 'lucide-react';
import { ProfileSkills } from '@/components/profile/ProfileSkills';
import { ProfileInterests } from '@/components/profile/ProfileInterests';
import { ProfileSettings } from '@/components/profile/ProfileSettings';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';

interface TalentPresence {
  id: string;
  section: string;
  is_active: boolean;
  visibility: string;
}

const sectionIcons: Record<string, React.ElementType> = {
  work: Briefcase,
  learning: GraduationCap,
  live: Radio,
  tv: Tv,
  events: Calendar,
  'yat-coin': Coins
};

const sectionPaths: Record<string, string> = {
  work: '/work',
  learning: '/learning',
  live: '/live',
  tv: '/tv',
  events: '/events',
  'yat-coin': '/yat-coin'
};

const sectionLabels: Record<string, string> = {
  work: 'Travail',
  learning: 'Formation',
  live: 'Live',
  tv: 'TV',
  events: 'Événements',
  'yat-coin': 'YAT Coin'
};

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [talentPresence, setTalentPresence] = useState<TalentPresence[]>([]);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (authUser) {
        setUserId(authUser.id);
        
        // Fetch profile
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', authUser.id)
          .single();
        setProfile(profileData);

        // Fetch talent presence
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

  return (
    <div className="w-full py-4 space-y-4">
      {/* Profile Header Card */}
      <Card className="overflow-hidden">
        {/* Cover Photo */}
        <div className="h-32 bg-gradient-to-r from-primary/80 to-primary relative">
          <Button
            size="icon"
            variant="secondary"
            className="absolute bottom-2 right-2 h-8 w-8"
          >
            <Camera className="h-4 w-4" />
          </Button>
        </div>
        
        {/* Profile Info */}
        <CardContent className="pt-0 pb-4">
          <div className="flex flex-col sm:flex-row gap-4 -mt-12">
            {/* Avatar */}
            <div className="relative">
              <Avatar className="h-24 w-24 border-4 border-card">
                <AvatarImage src={displayProfile.avatar || displayProfile.avatar_url} alt={displayProfile.name} />
                <AvatarFallback className="text-2xl">{displayProfile.name?.charAt(0) || 'U'}</AvatarFallback>
              </Avatar>
              <Button
                size="icon"
                variant="secondary"
                className="absolute bottom-0 right-0 h-6 w-6 rounded-full"
              >
                <Camera className="h-3 w-3" />
              </Button>
            </div>
            
            {/* Name and Actions */}
            <div className="flex-1 pt-12 sm:pt-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                  <h1 className="text-xl font-bold">{displayProfile.name}</h1>
                  <p className="text-sm text-muted-foreground">{displayProfile.email}</p>
                </div>
                <div className="flex gap-2">
                  <Button onClick={() => navigate('/talent-dashboard')}>
                    <LayoutDashboard className="h-4 w-4 mr-2" />
                    Talent Dashboard
                  </Button>
                </div>
              </div>
              
              {/* Quick Info */}
              <div className="flex flex-wrap gap-4 mt-3 text-sm text-muted-foreground">
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
                <p className="mt-3 text-sm">{displayProfile.bio}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Talent Presence Card */}
      {talentPresence.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Globe className="h-5 w-5 text-primary" />
              Votre Présence sur la Plateforme
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {talentPresence.map((presence) => {
                const Icon = sectionIcons[presence.section] || Globe;
                return (
                  <Link 
                    key={presence.id} 
                    to={sectionPaths[presence.section] || '/'}
                    className="group"
                  >
                    <div className="flex flex-col items-center p-3 rounded-lg border border-border hover:border-primary/50 hover:bg-primary/5 transition-all">
                      <Icon className="h-6 w-6 text-primary mb-2" />
                      <span className="text-sm font-medium text-center">
                        {sectionLabels[presence.section] || presence.section}
                      </span>
                      <Badge 
                        variant={presence.is_active ? "default" : "secondary"} 
                        className="mt-2 text-xs"
                      >
                        {presence.is_active ? 'Actif' : 'Inactif'}
                      </Badge>
                    </div>
                  </Link>
                );
              })}
            </div>
            <div className="mt-4 pt-4 border-t border-border">
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => navigate('/talent-dashboard')}
              >
                Gérer ma présence sur le Dashboard
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Profile Tabs */}
      <Tabs defaultValue="skills" className="w-full">
        <TabsList className="w-full justify-start bg-card border border-border rounded-lg p-1">
          <TabsTrigger value="skills">Compétences</TabsTrigger>
          <TabsTrigger value="interests">Intérêts</TabsTrigger>
          <TabsTrigger value="settings">Paramètres</TabsTrigger>
        </TabsList>
        
        <TabsContent value="skills" className="mt-4">
          {userId && <ProfileSkills userId={userId} />}
        </TabsContent>
        
        <TabsContent value="interests" className="mt-4">
          {userId && <ProfileInterests userId={userId} />}
        </TabsContent>
        
        <TabsContent value="settings" className="mt-4">
          <ProfileSettings 
            profile={displayProfile} 
            onUpdate={(updates) => setProfile((prev: any) => ({ ...prev, ...updates }))} 
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Profile;
