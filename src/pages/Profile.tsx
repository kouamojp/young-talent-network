import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { user } from '@/components/profile/ProfileData';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Camera, MapPin, Briefcase, Globe, LayoutDashboard, Radio, Tv, Calendar, GraduationCap, Map, Coins, FileText, Users, Trophy, Plus, Image, ShoppingBag } from 'lucide-react';
import { ProfileSkills } from '@/components/profile/ProfileSkills';
import { ProfileInterests } from '@/components/profile/ProfileInterests';
import { ProfileSettings } from '@/components/profile/ProfileSettings';
import { useUserLevel } from '@/hooks/useUserLevel';
import { UserLevelBadge } from '@/components/profile/UserLevelBadge';
import ProfileSources from '@/components/profile/ProfileSources';
import ProfileSidebar from '@/components/profile/ProfileSidebar';
import AddAchievementDialog from '@/components/profile/AddAchievementDialog';
import AddMediaDialog from '@/components/profile/AddMediaDialog';
import AddEducationDialog from '@/components/profile/AddEducationDialog';
import AutoResumeCard from '@/components/profile/AutoResumeCard';
import FileUploadButton from '@/components/profile/FileUploadButton';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/i18n/LanguageContext';

interface TalentPresence {
  id: string; section: string; is_active: boolean; visibility: string;
}

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [profile, setProfile] = useState<any>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [talentPresence, setTalentPresence] = useState<TalentPresence[]>([]);
  const [activeSection, setActiveSection] = useState('work');
  const [resumes, setResumes] = useState<any[]>([]);
  const [achievements, setAchievements] = useState<any[]>([]);
  const [media, setMedia] = useState<any[]>([]);
  const [socialLinks, setSocialLinks] = useState<any[]>([]);
  const [education, setEducation] = useState<any[]>([]);
  const { levelData } = useUserLevel(userId);

  useEffect(() => { fetchProfile(); }, []);

  const fetchProfile = async () => {
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) { navigate('/auth'); return; }
      setUserId(authUser.id);
      const [profileRes, presenceRes, resumesRes, achievementsRes, mediaRes, linksRes, eduRes] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', authUser.id).single(),
        supabase.from('talent_presence').select('*').eq('user_id', authUser.id),
        supabase.from('talent_resumes').select('*, categories(name, name_fr)').eq('user_id', authUser.id),
        supabase.from('talent_achievements').select('*').eq('user_id', authUser.id).order('date', { ascending: false }),
        supabase.from('talent_media').select('*').eq('user_id', authUser.id).order('created_at', { ascending: false }),
        supabase.from('talent_social_links').select('*').eq('user_id', authUser.id),
        (supabase.from('talent_education') as any).select('*').eq('user_id', authUser.id).order('start_year', { ascending: false }),
      ]);
      if (profileRes.data) setProfile(profileRes.data);
      if (presenceRes.data) setTalentPresence(presenceRes.data);
      if (resumesRes.data) setResumes(resumesRes.data);
      if (achievementsRes.data) setAchievements(achievementsRes.data);
      if (mediaRes.data) setMedia(mediaRes.data);
      if (linksRes.data) setSocialLinks(linksRes.data);
      if (eduRes.data) setEducation(eduRes.data);
    } catch (error) { console.error('Error fetching profile:', error); }
    finally { setLoading(false); }
  };

  const displayProfile = profile || user;
  const [isTransitioning, setIsTransitioning] = useState(false);
  const prevSectionRef = useRef(activeSection);

  const handleSectionChange = (section: string) => {
    if (section === activeSection) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setActiveSection(section);
      prevSectionRef.current = section;
      setTimeout(() => setIsTransitioning(false), 50);
    }, 150);
  };

  const sectionTabs = [
    { key: 'work', label: 'YAT Work', icon: Briefcase, color: 'bg-blue-500/20 text-blue-500' },
    { key: 'learning', label: 'YAT Learning', icon: GraduationCap, color: 'bg-green-500/20 text-green-500' },
    { key: 'live', label: 'YAT Live', icon: Radio, color: 'bg-red-500/20 text-red-500' },
    { key: 'tv', label: 'YAT TV', icon: Tv, color: 'bg-purple-500/20 text-purple-500' },
    { key: 'events', label: 'YAT Events', icon: Calendar, color: 'bg-orange-500/20 text-orange-500' },
    { key: 'karta', label: 'YAT Karta', icon: Map, color: 'bg-teal-500/20 text-teal-500' },
    { key: 'yat-coin', label: 'YAT Coin', icon: Coins, color: 'bg-yellow-500/20 text-yellow-500' },
    { key: 'marketplace', label: 'YAT Marketplace', icon: ShoppingBag, color: 'bg-orange-600/20 text-orange-600' },
    { key: 'social', label: 'YAT Social', icon: Globe, color: 'bg-indigo-500/20 text-indigo-500' },
  ];

  const educationTypeLabel = (type: string) => {
    const map: Record<string, string> = {
      school: t('profile.school'), university: t('profile.university'),
      training: t('profile.training'), certification: t('profile.certification'),
      diploma: t('profile.diploma'),
    };
    return map[type] || t('profile.other');
  };

  const userTypeLabel = (type: string) => {
    if (type === 'agent') return t('profile.agent');
    if (type === 'organization') return t('profile.organization');
    return t('profile.talent');
  };

  const SectionContent = ({ section, icon: Icon, color }: { section: string; icon: any; color: string }) => {
    const presence = talentPresence.find(p => p.section === section);
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`p-2 rounded-lg ${color}`}><Icon className="h-5 w-5" /></div>
            <h3 className="font-semibold">{t('profile.myProfile')} {sectionTabs.find(t => t.key === section)?.label}</h3>
          </div>
          {presence && (
            <Badge variant={presence.is_active ? "default" : "secondary"}>
              {presence.is_active ? t('profile.active') : t('profile.inactive')}
            </Badge>
          )}
        </div>
        {presence ? (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              {presence.is_active ? t('profile.profileActive') : t('profile.profileInactive')}{' '}
              {t('profile.visibility')}: {presence.visibility === 'public' ? t('profile.public') : t('profile.private')}.
            </p>
            <Button variant="outline" size="sm" onClick={() => navigate(`/${section === 'yat-coin' ? 'yat-coin' : section === 'karta' ? 'karta' : section}`)}>
              {t('profile.goTo')} {sectionTabs.find(t => t.key === section)?.label}
            </Button>
          </div>
        ) : (
          <p className="text-muted-foreground text-sm">{t('profile.notCreated')}</p>
        )}
      </div>
    );
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-[50vh]"><div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" /></div>;
  }

  return (
    <div className="w-full max-w-5xl mx-auto py-6 px-4">
      <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="mb-4 gap-2">
        <ArrowLeft className="h-4 w-4" /> {t('profile.back')}
      </Button>

      <Card className="overflow-hidden mb-6">
        <div className="h-40 bg-gradient-to-r from-primary/80 to-primary relative">
          {displayProfile.cover_photo_url && <img src={displayProfile.cover_photo_url} alt="Cover" className="w-full h-full object-cover" />}
          {userId && (
            <FileUploadButton userId={userId} folder="cover" accept="image/*" label="" size="icon" variant="secondary"
              onUploaded={async (url) => { await supabase.from('profiles').update({ cover_photo_url: url }).eq('id', userId); setProfile((p: any) => ({ ...p, cover_photo_url: url })); }} />
          )}
        </div>
        <CardContent className="pt-0 pb-6">
          <div className="flex flex-col md:flex-row gap-6 -mt-16">
            <div className="relative flex-shrink-0">
              <Avatar className="h-32 w-32 border-4 border-card shadow-lg">
                <AvatarImage src={displayProfile.avatar_url || displayProfile.avatar} alt={displayProfile.name} />
                <AvatarFallback className="text-3xl">{displayProfile.name?.charAt(0) || 'U'}</AvatarFallback>
              </Avatar>
              {userId && (
                <div className="absolute bottom-0 right-0">
                  <FileUploadButton userId={userId} folder="avatar" accept="image/*" label="" size="icon" variant="secondary"
                    onUploaded={async (url) => { await supabase.from('profiles').update({ avatar_url: url }).eq('id', userId); setProfile((p: any) => ({ ...p, avatar_url: url })); }} />
                </div>
              )}
            </div>
            <div className="flex-1 pt-16 md:pt-4">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-2xl font-bold">{displayProfile.name}</h1>
                    {levelData && <UserLevelBadge levelData={levelData} compact />}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline">{userTypeLabel(displayProfile.user_type)}</Badge>
                    <span className="text-muted-foreground text-sm">{displayProfile.email}</span>
                  </div>
                </div>
                <Button onClick={() => navigate('/talent-dashboard')} className="w-fit">
                  <LayoutDashboard className="h-4 w-4 mr-2" /> {t('profile.talentDashboard')}
                </Button>
              </div>
              <div className="flex flex-wrap gap-4 mt-4 text-sm text-muted-foreground">
                {(displayProfile.location || displayProfile.city) && (
                  <div className="flex items-center gap-1"><MapPin className="h-4 w-4" /><span>{displayProfile.city}{displayProfile.country ? `, ${displayProfile.country}` : displayProfile.location ? `, ${displayProfile.location}` : ''}</span></div>
                )}
                {displayProfile.work && (<div className="flex items-center gap-1"><Briefcase className="h-4 w-4" /><span>{displayProfile.work}</span></div>)}
                {displayProfile.website && (<div className="flex items-center gap-1"><Globe className="h-4 w-4" /><a href={displayProfile.website} className="text-primary hover:underline">{displayProfile.website}</a></div>)}
              </div>
              {displayProfile.bio && <p className="mt-4 text-sm leading-relaxed">{displayProfile.bio}</p>}
              {socialLinks.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {socialLinks.map(link => (
                    <a key={link.id} href={link.url} target="_blank" rel="noopener noreferrer">
                      <Badge variant="secondary" className="cursor-pointer hover:bg-primary/10">{link.platform}</Badge>
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <ProfileSidebar talentPresence={talentPresence} userName={displayProfile.name} userAvatar={displayProfile.avatar_url || displayProfile.avatar} activeSection={activeSection} onSectionChange={handleSectionChange} />
        </div>
        <div className="lg:col-span-3 space-y-6">
          <Card className="overflow-hidden">
            <CardContent className="p-4">
              <div className={cn("transition-all duration-200 ease-out", isTransitioning ? "opacity-0 translate-y-2 scale-[0.98]" : "opacity-100 translate-y-0 scale-100")}>
                {(() => { const tab = sectionTabs.find(t => t.key === activeSection) || sectionTabs[0]; return <SectionContent section={tab.key} icon={tab.icon} color={tab.color} />; })()}
              </div>
            </CardContent>
          </Card>

          {levelData && <UserLevelBadge levelData={levelData} />}

          {userId && <AutoResumeCard userId={userId} profile={displayProfile} achievements={achievements} talentPresence={talentPresence} />}

          {userId && <ProfileSources userId={userId} />}

          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium flex items-center gap-2"><Trophy className="h-4 w-4" />{t('profile.achievements')}</CardTitle>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{achievements.length}</Badge>
                  {userId && <AddAchievementDialog userId={userId} onAdded={fetchProfile} />}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {achievements.length > 0 ? (
                <div className="space-y-3">
                  {achievements.map(a => (
                    <div key={a.id} className="p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-sm">{a.title}</p>
                        {a.level && <Badge variant="outline" className="text-[10px]">{a.level}</Badge>}
                      </div>
                      {a.description && <p className="text-xs text-muted-foreground mt-1">{a.description}</p>}
                      {a.date && <p className="text-[10px] text-muted-foreground mt-1">{new Date(a.date).toLocaleDateString('fr-FR')}</p>}
                    </div>
                  ))}
                </div>
              ) : (<p className="text-sm text-muted-foreground">{t('profile.addAchievements')}</p>)}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium flex items-center gap-2"><Image className="h-4 w-4" />{t('profile.media')}</CardTitle>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{media.length}</Badge>
                  {userId && <AddMediaDialog userId={userId} onAdded={fetchProfile} />}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {media.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {media.map(m => (
                    <div key={m.id} className="p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                      {m.media_type === 'image' && m.url && <img src={m.url} alt={m.title || ''} className="w-full h-24 object-cover rounded mb-2" />}
                      <p className="font-medium text-xs truncate">{m.title || m.media_type}</p>
                      {m.description && <p className="text-[10px] text-muted-foreground truncate">{m.description}</p>}
                    </div>
                  ))}
                </div>
              ) : (<p className="text-sm text-muted-foreground">{t('profile.addMedia')}</p>)}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium flex items-center gap-2"><GraduationCap className="h-4 w-4" />{t('profile.education')}</CardTitle>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{education.length}</Badge>
                  {userId && <AddEducationDialog userId={userId} onAdded={fetchProfile} />}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {education.length > 0 ? (
                <div className="space-y-3">
                  {education.map((e: any) => (
                    <div key={e.id} className="p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-[10px]">{educationTypeLabel(e.education_type)}</Badge>
                        <p className="font-medium text-sm">{[e.degree, e.field_of_study].filter(Boolean).join(' - ') || e.institution}</p>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {e.institution} {e.start_year ? `• ${e.start_year}${e.is_current ? ` - ${t('profile.present')}` : e.end_year ? ` - ${e.end_year}` : ''}` : ''}
                      </p>
                      {e.description && <p className="text-[10px] text-muted-foreground mt-1">{e.description}</p>}
                    </div>
                  ))}
                </div>
              ) : (<p className="text-sm text-muted-foreground">{t('profile.addEducation')}</p>)}
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-sm font-medium flex items-center gap-2"><FileText className="h-4 w-4" />{t('profile.skills')}</CardTitle></CardHeader>
              <CardContent>{userId && <ProfileSkills userId={userId} />}</CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-sm font-medium flex items-center gap-2"><Users className="h-4 w-4" />{t('profile.interests')}</CardTitle></CardHeader>
              <CardContent>{userId && <ProfileInterests userId={userId} />}</CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-sm font-medium">{t('settings.profile')}</CardTitle></CardHeader>
            <CardContent>
              <ProfileSettings profile={displayProfile} onUpdate={(updates) => setProfile((prev: any) => ({ ...prev, ...updates }))} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Profile;
