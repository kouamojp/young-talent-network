import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { MapPin, Globe, Star, Trophy, GraduationCap, Image, ArrowLeft, Briefcase } from 'lucide-react';
import Footer from '@/components/Footer';
import { toast } from '@/hooks/use-toast';

const StarRating = ({ value, onChange, readonly = false }: { value: number; onChange?: (v: number) => void; readonly?: boolean }) => (
  <div className="flex gap-0.5">
    {[1, 2, 3, 4, 5].map(i => (
      <Star
        key={i}
        className={`h-5 w-5 ${i <= value ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground/30'} ${!readonly ? 'cursor-pointer hover:text-yellow-400' : ''}`}
        onClick={() => !readonly && onChange?.(i)}
      />
    ))}
  </div>
);

const TalentPublicProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [education, setEducation] = useState<any[]>([]);
  const [achievements, setAchievements] = useState<any[]>([]);
  const [media, setMedia] = useState<any[]>([]);
  const [socialLinks, setSocialLinks] = useState<any[]>([]);
  const [skills, setSkills] = useState<string[]>([]);
  const [ratings, setRatings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [myRating, setMyRating] = useState(0);
  const [myComment, setMyComment] = useState('');
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (id) loadProfile();
  }, [id]);

  const loadProfile = async () => {
    if (!id) return;
    try {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUserId(user?.id || null);

      const [profileRes, eduRes, achRes, mediaRes, linksRes, skillsRes, ratingsRes] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', id).single(),
        supabase.from('talent_education').select('*').eq('user_id', id).order('start_year', { ascending: false }),
        supabase.from('talent_achievements').select('*').eq('user_id', id).order('date', { ascending: false }),
        supabase.from('talent_media').select('*').eq('user_id', id).order('created_at', { ascending: false }),
        supabase.from('talent_social_links').select('*').eq('user_id', id),
        supabase.from('user_skills').select('skill_id, skills(name)').eq('user_id', id),
        supabase.from('talent_ratings').select('*, profiles!talent_ratings_rater_id_fkey(name, avatar_url)').eq('talent_id', id).order('created_at', { ascending: false }),
      ]);

      if (profileRes.data) setProfile(profileRes.data);
      if (eduRes.data) setEducation(eduRes.data);
      if (achRes.data) setAchievements(achRes.data);
      if (mediaRes.data) setMedia(mediaRes.data);
      if (linksRes.data) setSocialLinks(linksRes.data);
      if (skillsRes.data) setSkills(skillsRes.data.map((s: any) => s.skills?.name).filter(Boolean));
      if (ratingsRes.data) {
        setRatings(ratingsRes.data);
        if (user) {
          const mine = ratingsRes.data.find((r: any) => r.rater_id === user.id);
          if (mine) { setMyRating(mine.rating); setMyComment(mine.comment || ''); }
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const submitRating = async () => {
    if (!currentUserId || !id || myRating === 0) return;
    setSubmitting(true);
    try {
      const { error } = await supabase.from('talent_ratings').upsert({
        talent_id: id,
        rater_id: currentUserId,
        rating: myRating,
        comment: myComment || null,
      }, { onConflict: 'talent_id,rater_id' });
      if (error) throw error;
      toast({ title: 'Évaluation enregistrée' });
      loadProfile();
    } catch (e: any) {
      toast({ title: 'Erreur', description: e.message, variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="flex items-center justify-center min-h-[50vh]"><div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" /></div>;
  if (!profile) return <div className="text-center py-20"><p className="text-muted-foreground">Profil introuvable</p></div>;

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-purple-50">
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4 gap-2"><ArrowLeft className="h-4 w-4" /> Retour</Button>

        {/* Header */}
        <Card className="overflow-hidden mb-6">
          <div className="h-32 bg-gradient-to-r from-primary/80 to-primary relative">
            {profile.cover_photo_url && <img src={profile.cover_photo_url} alt="" className="w-full h-full object-cover" />}
          </div>
          <CardContent className="pt-0 pb-6">
            <div className="flex flex-col md:flex-row gap-6 -mt-12">
              <Avatar className="h-24 w-24 border-4 border-card shadow-lg">
                <AvatarImage src={profile.avatar_url || ''} />
                <AvatarFallback className="text-2xl">{profile.name?.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="flex-1 pt-12 md:pt-2">
                <h1 className="text-2xl font-bold">{profile.name}</h1>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <Badge variant="outline">{profile.user_type === 'organization' ? 'Organisation' : profile.user_type === 'agent' ? 'Agent' : 'Talent'}</Badge>
                  {profile.sport_type && <Badge variant="secondary">{profile.sport_type}</Badge>}
                  {Number(profile.platform_rating) > 0 && (
                    <span className="flex items-center gap-1 text-sm text-yellow-600">
                      <Star className="h-4 w-4 fill-current" /> {Number(profile.platform_rating).toFixed(1)}
                      <span className="text-muted-foreground">({profile.rating_count || 0} avis)</span>
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap gap-3 mt-3 text-sm text-muted-foreground">
                  {(profile.city || profile.country) && <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{[profile.city, profile.country].filter(Boolean).join(', ')}</span>}
                  {profile.website && <a href={profile.website} className="flex items-center gap-1 text-primary hover:underline"><Globe className="h-3.5 w-3.5" />{profile.website}</a>}
                </div>
                {profile.bio && <p className="mt-3 text-sm">{profile.bio}</p>}
                {socialLinks.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {socialLinks.map(l => <a key={l.id} href={l.url} target="_blank" rel="noopener noreferrer"><Badge variant="secondary" className="cursor-pointer">{l.platform}</Badge></a>)}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Skills */}
        {skills.length > 0 && (
          <Card className="mb-6">
            <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Briefcase className="h-4 w-4" /> Compétences</CardTitle></CardHeader>
            <CardContent><div className="flex flex-wrap gap-1.5">{skills.map((s, i) => <Badge key={i} variant="outline">{s}</Badge>)}</div></CardContent>
          </Card>
        )}

        {/* Education */}
        {education.length > 0 && (
          <Card className="mb-6">
            <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><GraduationCap className="h-4 w-4" /> Formation & Diplômes</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {education.map((e: any) => (
                <div key={e.id} className="p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-[10px]">{e.education_type === 'school' ? 'École' : e.education_type === 'university' ? 'Université' : e.education_type === 'training' ? 'Formation' : e.education_type === 'certification' ? 'Certification' : e.education_type}</Badge>
                    <p className="font-medium text-sm">{[e.degree, e.field_of_study].filter(Boolean).join(' - ') || e.institution}</p>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{e.institution} {e.start_year ? `• ${e.start_year}${e.is_current ? ' - présent' : e.end_year ? ` - ${e.end_year}` : ''}` : ''}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Achievements */}
        {achievements.length > 0 && (
          <Card className="mb-6">
            <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Trophy className="h-4 w-4" /> Réalisations & Prix</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {achievements.map(a => (
                <div key={a.id} className="p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-sm">{a.title}</p>
                    {a.level && <Badge variant="outline" className="text-[10px]">{a.level}</Badge>}
                  </div>
                  {a.description && <p className="text-xs text-muted-foreground mt-1">{a.description}</p>}
                  {a.date && <p className="text-[10px] text-muted-foreground mt-1">{new Date(a.date).toLocaleDateString('fr-FR')}</p>}
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Media */}
        {media.length > 0 && (
          <Card className="mb-6">
            <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Image className="h-4 w-4" /> Médias</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {media.map(m => (
                  <div key={m.id} className="p-3 rounded-lg bg-muted/50">
                    {m.media_type === 'image' && m.url && <img src={m.url} alt={m.title || ''} className="w-full h-24 object-cover rounded mb-2" />}
                    <p className="font-medium text-xs truncate">{m.title || m.media_type}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Rating Section */}
        <Card className="mb-6">
          <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Star className="h-4 w-4" /> Évaluations ({ratings.length})</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {/* Submit rating */}
            {currentUserId && currentUserId !== id && (
              <div className="p-4 rounded-lg border bg-card space-y-3">
                <p className="text-sm font-medium">Évaluer ce talent</p>
                <StarRating value={myRating} onChange={setMyRating} />
                <Textarea placeholder="Commentaire (optionnel)..." value={myComment} onChange={e => setMyComment(e.target.value)} className="text-sm" rows={2} />
                <Button size="sm" onClick={submitRating} disabled={submitting || myRating === 0}>
                  {submitting ? 'Envoi...' : 'Envoyer'}
                </Button>
              </div>
            )}
            {!currentUserId && <p className="text-sm text-muted-foreground">Connectez-vous pour évaluer ce talent.</p>}

            {/* Existing ratings */}
            {ratings.length > 0 ? (
              <div className="space-y-3">
                {ratings.map(r => (
                  <div key={r.id} className="p-3 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={r.profiles?.avatar_url || ''} />
                        <AvatarFallback className="text-[10px]">{r.profiles?.name?.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-medium">{r.profiles?.name || 'Utilisateur'}</span>
                      <StarRating value={r.rating} readonly />
                      <span className="text-[10px] text-muted-foreground ml-auto">{new Date(r.created_at).toLocaleDateString('fr-FR')}</span>
                    </div>
                    {r.comment && <p className="text-xs text-muted-foreground mt-2">{r.comment}</p>}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Aucune évaluation pour le moment.</p>
            )}
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
};

export default TalentPublicProfile;
