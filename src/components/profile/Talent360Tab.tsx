import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { User, Languages, Sparkles, Briefcase, Trophy, Coins, Star, ExternalLink, X, Pencil, Trash2, MapPin, Calendar } from 'lucide-react';
import FileUploadButton from './FileUploadButton';
import { ProfileSkills } from './ProfileSkills';
import AddAchievementDialog from './AddAchievementDialog';
import AddExperienceDialog from './AddExperienceDialog';
import { useUserLevel } from '@/hooks/useUserLevel';
import TranslatableText from '@/components/TranslatableText';
import { tr } from '@/i18n';
import { localeTag } from '@/i18n/format';

interface Props {
  userId: string;
  profile: any;
  onProfileUpdate: (updates: any) => void;
}

const LEVEL_OPTIONS = [
  { v: 'beginner', l: tr('common.beginner') },
  { v: 'intermediate', l: tr('common.intermediate') },
  { v: 'advanced', l: tr('common.advanced') },
  { v: 'professional', l: 'Professionnel' },
];
const AVAILABILITY_OPTIONS = [
  { v: 'available', l: 'Disponible', color: 'bg-green-500/15 text-green-600' },
  { v: 'open', l: tr('statusToggle.openToWork'), color: 'bg-blue-500/15 text-blue-600' },
  { v: 'unavailable', l: 'Non disponible', color: 'bg-muted text-muted-foreground' },
];

const Talent360Tab: React.FC<Props> = ({ userId, profile, onProfileUpdate }) => {
  const { levelData } = useUserLevel(userId);
  const [editingMain, setEditingMain] = useState(false);
  const [editingAbout, setEditingAbout] = useState(false);
  const [saving, setSaving] = useState(false);
  const [experiences, setExperiences] = useState<any[]>([]);
  const [achievements, setAchievements] = useState<any[]>([]);
  const [newLang, setNewLang] = useState('');

  const [main, setMain] = useState({
    name: profile?.name || '',
    professional_title: profile?.professional_title || '',
    country: profile?.country || '',
    city: profile?.city || '',
    birthday: profile?.birthday || '',
    talent_level: profile?.talent_level || '',
    availability: profile?.availability || '',
    languages: (profile?.languages || []) as string[],
  });
  const [aboutMe, setAboutMe] = useState(profile?.about_me || '');

  useEffect(() => {
    setMain({
      name: profile?.name || '',
      professional_title: profile?.professional_title || '',
      country: profile?.country || '',
      city: profile?.city || '',
      birthday: profile?.birthday || '',
      talent_level: profile?.talent_level || '',
      availability: profile?.availability || '',
      languages: (profile?.languages || []) as string[],
    });
    setAboutMe(profile?.about_me || '');
  }, [profile]);

  const loadLists = async () => {
    const [expRes, achRes] = await Promise.all([
      (supabase.from('talent_experiences') as any).select('*').eq('user_id', userId).order('start_date', { ascending: false }),
      supabase.from('talent_achievements').select('*').eq('user_id', userId).order('date', { ascending: false }),
    ]);
    if (expRes.data) setExperiences(expRes.data);
    if (achRes.data) setAchievements(achRes.data);
  };

  useEffect(() => { loadLists(); }, [userId]);

  const saveMain = async () => {
    setSaving(true);
    const updates: any = {
      name: main.name.trim() || profile.name,
      professional_title: main.professional_title.trim() || null,
      country: main.country.trim() || null,
      city: main.city.trim() || null,
      birthday: main.birthday || null,
      talent_level: main.talent_level || null,
      availability: main.availability || null,
      languages: main.languages,
    };
    const { error } = await supabase.from('profiles').update(updates).eq('id', userId);
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    onProfileUpdate(updates);
    setEditingMain(false);
    toast.success(tr('talent360Tab.profileUpdated'));
  };

  const saveAbout = async () => {
    setSaving(true);
    const { error } = await supabase.from('profiles').update({ about_me: aboutMe } as any).eq('id', userId);
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    onProfileUpdate({ about_me: aboutMe });
    setEditingAbout(false);
    toast.success(tr('talent360Tab.biographySaved'));
  };

  const addLanguage = () => {
    const v = newLang.trim();
    if (!v || main.languages.includes(v)) return;
    setMain(m => ({ ...m, languages: [...m.languages, v] }));
    setNewLang('');
  };

  const removeLanguage = (lang: string) => {
    setMain(m => ({ ...m, languages: m.languages.filter(l => l !== lang) }));
  };

  const deleteExperience = async (id: string) => {
    await (supabase.from('talent_experiences') as any).delete().eq('id', id);
    setExperiences(exp => exp.filter(e => e.id !== id));
    toast.success(tr('common.deleted'));
  };

  const deleteAchievement = async (id: string) => {
    await supabase.from('talent_achievements').delete().eq('id', id);
    setAchievements(a => a.filter(x => x.id !== id));
    toast.success(tr('common.deleted'));
  };

  const availabilityBadge = AVAILABILITY_OPTIONS.find(o => o.v === profile?.availability);
  const levelLabel = LEVEL_OPTIONS.find(o => o.v === profile?.talent_level)?.l;

  return (
    <div className="space-y-6">


      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="text-base flex items-center gap-2"><User className="h-4 w-4" /> {tr('talent360Tab.mainInformation')}</CardTitle>
          <Button size="sm" variant="outline" onClick={() => setEditingMain(e => !e)}>
            <Pencil className="h-3.5 w-3.5 mr-1" /> {editingMain ? tr('common.cancel') : tr('common.edit')}
          </Button>
        </CardHeader>
        <CardContent>
          {editingMain ? (
            <div className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div><Label>{tr('auth.fullName')}</Label><Input value={main.name} onChange={e => setMain(m => ({ ...m, name: e.target.value }))} /></div>
                <div><Label>{tr('talent360Tab.professionalTitleMainTalent')}</Label><Input value={main.professional_title} onChange={e => setMain(m => ({ ...m, professional_title: e.target.value }))} placeholder={tr('talent360Tab.eGConcertPianist')} /></div>
                <div><Label>{tr('settings.country')}</Label><Input value={main.country} onChange={e => setMain(m => ({ ...m, country: e.target.value }))} /></div>
                <div><Label>{tr('settings.city')}</Label><Input value={main.city} onChange={e => setMain(m => ({ ...m, city: e.target.value }))} /></div>
                <div><Label>{tr('auth.birthday')}</Label><Input type="date" value={main.birthday} onChange={e => setMain(m => ({ ...m, birthday: e.target.value }))} /></div>
                <div>
                  <Label>{tr('talent360Tab.talentLevel')}</Label>
                  <Select value={main.talent_level} onValueChange={v => setMain(m => ({ ...m, talent_level: v }))}>
                    <SelectTrigger><SelectValue placeholder={tr('marketplace.select')} /></SelectTrigger>
                    <SelectContent>{LEVEL_OPTIONS.map(o => <SelectItem key={o.v} value={o.v}>{o.l}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="md:col-span-2">
                  <Label>{tr('common.availability')}</Label>
                  <Select value={main.availability} onValueChange={v => setMain(m => ({ ...m, availability: v }))}>
                    <SelectTrigger><SelectValue placeholder={tr('marketplace.select')} /></SelectTrigger>
                    <SelectContent>{AVAILABILITY_OPTIONS.map(o => <SelectItem key={o.v} value={o.v}>{o.l}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label className="flex items-center gap-1"><Languages className="h-3.5 w-3.5" /> {tr('talent360Tab.languagesSpoken')}</Label>
                <div className="flex gap-2 mt-1">
                  <Input value={newLang} onChange={e => setNewLang(e.target.value)} placeholder={tr('talent360Tab.eGFrench')} onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addLanguage(); } }} />
                  <Button type="button" onClick={addLanguage} variant="outline">{tr('tv.addLink')}</Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {main.languages.map(l => (
                    <Badge key={l} variant="secondary" className="gap-1">
                      {l}
                      <button onClick={() => removeLanguage(l)} className="hover:text-destructive"><X className="h-3 w-3" /></button>
                    </Badge>
                  ))}
                </div>
              </div>

              <Button onClick={saveMain} disabled={saving} className="w-full">{saving ? 'Enregistrement...' : tr('post.update')}</Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <Info label={tr('admin.name')} value={profile?.name} />
              <Info label={tr('marketplace.title_field')} value={profile?.professional_title} />
              <Info label={tr('settings.country')} value={profile?.country} icon={<MapPin className="h-3.5 w-3.5" />} />
              <Info label={tr('settings.city')} value={profile?.city} icon={<MapPin className="h-3.5 w-3.5" />} />
              <Info label={tr('auth.birthday')} value={profile?.birthday} icon={<Calendar className="h-3.5 w-3.5" />} />
              <Info label={tr('common.level')} value={levelLabel} />
              <Info label={tr('common.availability')} value={availabilityBadge?.l} />
              <div>
                <p className="text-xs text-muted-foreground">{tr('talent360Tab.languages')}</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {(profile?.languages || []).length > 0
                    ? profile.languages.map((l: string) => <Badge key={l} variant="secondary">{l}</Badge>)
                    : <span className="text-muted-foreground italic text-xs">—</span>}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="text-base flex items-center gap-2"><Sparkles className="h-4 w-4" /> {tr('talent360Tab.aboutMe')}</CardTitle>
          <Button size="sm" variant="outline" onClick={() => setEditingAbout(e => !e)}>
            <Pencil className="h-3.5 w-3.5 mr-1" /> {editingAbout ? tr('common.cancel') : tr('common.edit')}
          </Button>
        </CardHeader>
        <CardContent>
          {editingAbout ? (
            <div className="space-y-3">
              <Textarea rows={6} value={aboutMe} onChange={e => setAboutMe(e.target.value)} placeholder={tr('talent360Tab.tellYourStoryYourGoalsYour')} />
              <Button onClick={saveAbout} disabled={saving} className="w-full">{saving ? 'Enregistrement...' : tr('post.update')}</Button>
            </div>
          ) : (
            profile?.about_me
              ? <TranslatableText text={profile.about_me} className="text-sm whitespace-pre-wrap leading-relaxed" />
              : <p className="text-sm text-muted-foreground italic">{tr('talent360Tab.addABiographyToPresentYour')}</p>
          )}
        </CardContent>
      </Card>

      <ProfileSkills userId={userId} />

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="text-base flex items-center gap-2"><Briefcase className="h-4 w-4" /> {tr('common.experience')}</CardTitle>
          <AddExperienceDialog userId={userId} onAdded={loadLists} />
        </CardHeader>
        <CardContent>
          {experiences.length === 0 ? (
            <p className="text-sm text-muted-foreground italic">{tr('talent360Tab.noExperienceAdded')}</p>
          ) : (
            <div className="space-y-3">
              {experiences.map(exp => (
                <div key={exp.id} className="p-3 rounded-lg border border-border bg-muted/30 relative group">
                  <button onClick={() => deleteExperience(exp.id)} className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-opacity">
                    <Trash2 className="h-4 w-4" />
                  </button>
                  <p className="font-semibold text-sm">{exp.title}</p>
                  {exp.organization && <p className="text-xs text-primary">{exp.organization}</p>}
                  <p className="text-xs text-muted-foreground mt-1">
                    {[exp.city, exp.country].filter(Boolean).join(', ')}
                    {(exp.start_date || exp.end_date || exp.is_current) && (
                      <span> • {exp.start_date ? new Date(exp.start_date).toLocaleDateString(localeTag()) : '?'} — {exp.is_current ? tr('profile.present') : (exp.end_date ? new Date(exp.end_date).toLocaleDateString(localeTag()) : '?')}</span>
                    )}
                  </p>
                  {exp.description && <p className="text-xs mt-2 whitespace-pre-wrap">{exp.description}</p>}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="text-base flex items-center gap-2"><Trophy className="h-4 w-4" /> {tr('common.achievements')}</CardTitle>
          <AddAchievementDialog userId={userId} onAdded={loadLists} />
        </CardHeader>
        <CardContent>
          {achievements.length === 0 ? (
            <p className="text-sm text-muted-foreground italic">{tr('talent360Tab.noAchievementsAdded')}</p>
          ) : (
            <div className="space-y-3">
              {achievements.map(a => (
                <div key={a.id} className="p-3 rounded-lg border border-border bg-muted/30 relative group">
                  <button onClick={() => deleteAchievement(a.id)} className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-opacity">
                    <Trash2 className="h-4 w-4" />
                  </button>
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-sm">{a.title}</p>
                    {a.achievement_type && <Badge variant="outline" className="text-[10px]">{a.achievement_type}</Badge>}
                    {a.level && <Badge variant="secondary" className="text-[10px]">{a.level}</Badge>}
                  </div>
                  {a.date && <p className="text-[11px] text-muted-foreground mt-0.5">{new Date(a.date).toLocaleDateString(localeTag())}</p>}
                  {a.description && <p className="text-xs mt-1">{a.description}</p>}
                  {a.external_link && (
                    <a href={a.external_link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-primary hover:underline mt-1">
                      <ExternalLink className="h-3 w-3" /> {tr('talent360Tab.viewLink')}
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border-yellow-500/30">
          <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Coins className="h-4 w-4 text-yellow-500" /> {tr('talent360Tab.myValueOnYatCoin')}</CardTitle></CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-yellow-600">{levelData ? levelData.yat_coins.toFixed(4) : '0.0000'}</p>
            <p className="text-xs text-muted-foreground mt-1">{tr('talent360Tab.yatCoinsEarned')}</p>
            {levelData && (
              <p className="text-xs text-muted-foreground mt-2">{tr('common.level')} {levelData.level} • {levelData.xp_total} XP</p>
            )}
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-pink-500/10 to-purple-500/10 border-pink-500/30">
          <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Star className="h-4 w-4 text-pink-500" /> {tr('talent360Tab.myRating')}</CardTitle></CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <p className="text-3xl font-bold text-pink-600">{Number(profile?.platform_rating || 0).toFixed(1)}</p>
              <p className="text-sm text-muted-foreground">/ 5</p>
            </div>
            <div className="flex items-center gap-1 mt-1">
              {[1, 2, 3, 4, 5].map(i => (
                <Star key={i} className={`h-4 w-4 ${i <= Math.round(Number(profile?.platform_rating || 0)) ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground/30'}`} />
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-2">{profile?.rating_count || 0} {tr('talent360Tab.ratingS')}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

const Info: React.FC<{ label: string; value?: string | null; icon?: React.ReactNode }> = ({ label, value, icon }) => (
  <div>
    <p className="text-xs text-muted-foreground">{label}</p>
    <p className="font-medium text-sm flex items-center gap-1">
      {icon}{value || <span className="text-muted-foreground italic">—</span>}
    </p>
  </div>
);

export default Talent360Tab;
