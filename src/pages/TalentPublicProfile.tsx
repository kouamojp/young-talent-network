import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { MapPin, Globe, Star, Trophy, GraduationCap, Image, ArrowLeft, Briefcase, Calendar, Phone, Mail, User, FileText, Tag, Layers, Newspaper, Heart, MessageCircle, Activity, Trash2 } from 'lucide-react';
import { useLanguage } from '@/i18n/LanguageContext';
import { toast } from '@/hooks/use-toast';
import ProfileActivityFeed from '@/components/profile/ProfileActivityFeed';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

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

const InfoRow = ({ label, value }: { label: string; value: string | null | undefined }) => {
  if (!value) return null;
  return (
    <div className="flex justify-between py-1.5 border-b border-border/50 last:border-0">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <span className="text-xs font-semibold text-foreground text-right max-w-[60%]">{value}</span>
    </div>
  );
};

const SectionHeader = ({ icon: Icon, title }: { icon: React.ElementType; title: string }) => (
  <div className="flex items-center gap-2 py-2 px-3 bg-primary/10 rounded-t-lg border border-primary/20">
    <Icon className="h-4 w-4 text-primary" />
    <h3 className="text-sm font-bold text-primary">{title}</h3>
  </div>
);

const SECTION_LABELS: Record<string, { label: string; icon: string }> = {
  events: { label: 'Events', icon: '📅' },
  tv: { label: 'TV', icon: '📺' },
  live: { label: 'LIVE', icon: '🔴' },
  work: { label: 'Work', icon: '💼' },
  learning: { label: 'Learning', icon: '🎓' },
  'yat-coin': { label: 'YAT Coin', icon: '🪙' },
  karta: { label: 'Karta', icon: '🗺️' },
};

const TalentPublicProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { language } = useLanguage();
  const [profile, setProfile] = useState<any>(null);
  const [education, setEducation] = useState<any[]>([]);
  const [achievements, setAchievements] = useState<any[]>([]);
  const [media, setMedia] = useState<any[]>([]);
  const [socialLinks, setSocialLinks] = useState<any[]>([]);
  const [skills, setSkills] = useState<string[]>([]);
  const [ratings, setRatings] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [presence, setPresence] = useState<any[]>([]);
  const [posts, setPosts] = useState<any[]>([]);
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

      const [profileRes, eduRes, achRes, mediaRes, linksRes, skillsRes, ratingsRes, catsRes, presenceRes, postsRes] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', id).single(),
        supabase.from('talent_education').select('*').eq('user_id', id).order('start_year', { ascending: false }),
        supabase.from('talent_achievements').select('*').eq('user_id', id).order('date', { ascending: false }),
        supabase.from('talent_media').select('*').eq('user_id', id).order('created_at', { ascending: false }),
        supabase.from('talent_social_links').select('*').eq('user_id', id),
        supabase.from('user_skills').select('skill_id, skills(name)').eq('user_id', id),
        supabase.from('talent_ratings').select('*, profiles!talent_ratings_rater_id_fkey(name, avatar_url)').eq('talent_id', id).order('created_at', { ascending: false }),
        supabase.from('user_yat_categories').select('id, yat_categories(id, slug, name_en, name_fr, name_ru, icon, color), yat_subcategories(id, name_en, name_fr, name_ru)').eq('user_id', id),
        supabase.from('talent_presence').select('section, is_active, featured, bio, skills').eq('user_id', id).eq('is_active', true).eq('visibility', 'public'),
        supabase.from('posts').select('id, content, media_urls, created_at, likes_count, comments_count, visibility').eq('user_id', id).eq('is_published', true).eq('visibility', 'public').order('created_at', { ascending: false }).limit(10),
      ]);

      if (profileRes.data) setProfile(profileRes.data);
      if (eduRes.data) setEducation(eduRes.data);
      if (achRes.data) setAchievements(achRes.data);
      if (mediaRes.data) setMedia(mediaRes.data);
      if (linksRes.data) setSocialLinks(linksRes.data);
      if (skillsRes.data) setSkills(skillsRes.data.map((s: any) => s.skills?.name).filter(Boolean));
      if (catsRes.data) setCategories(catsRes.data);
      if (presenceRes.data) setPresence(presenceRes.data);
      if (postsRes.data) setPosts(postsRes.data);
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

  const catName = (c: any) => {
    if (!c) return '';
    return language === 'fr' ? c.name_fr : language === 'ru' ? c.name_ru : c.name_en;
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

  const formatDate = (date: string | null) => {
    if (!date) return null;
    return new Date(date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  const calculateAge = (birthday: string | null) => {
    if (!birthday) return null;
    const birth = new Date(birthday);
    const now = new Date();
    let age = now.getFullYear() - birth.getFullYear();
    if (now.getMonth() < birth.getMonth() || (now.getMonth() === birth.getMonth() && now.getDate() < birth.getDate())) age--;
    return `${age} ans`;
  };

  if (loading) return <div className="flex items-center justify-center min-h-[50vh]"><div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" /></div>;
  if (!profile) return <div className="text-center py-20"><p className="text-muted-foreground">Profil introuvable</p></div>;

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-6 max-w-5xl">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="mb-4 gap-2">
          <ArrowLeft className="h-4 w-4" /> Retour
        </Button>

        {/* CV Header - inspired by sports profile template */}
        <div className="bg-card border border-border rounded-xl overflow-hidden mb-6 print:shadow-none">
          {/* Cover & Name */}
          <div className="relative h-28 md:h-36 bg-gradient-to-r from-primary to-primary/70">
            {profile.cover_photo_url && <img src={profile.cover_photo_url} alt="" className="w-full h-full object-cover" />}
          </div>

          <div className="px-4 md:px-6 pb-6">
            <div className="flex flex-col md:flex-row gap-4 -mt-12">
              {/* Photo */}
              <Avatar className="h-24 w-24 border-4 border-card shadow-lg shrink-0">
                <AvatarImage src={profile.avatar_url || ''} />
                <AvatarFallback className="text-2xl bg-muted">{profile.name?.charAt(0)}</AvatarFallback>
              </Avatar>

              {/* Title Info */}
              <div className="flex-1 pt-12 md:pt-1">
                <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
                  <h1 className="text-2xl font-bold text-foreground">{profile.name}</h1>
                  {Number(profile.platform_rating) > 0 && (
                    <div className="flex items-center gap-1.5">
                      <StarRating value={Math.round(Number(profile.platform_rating))} readonly />
                      <span className="text-sm font-medium text-yellow-600">{Number(profile.platform_rating).toFixed(1)}</span>
                      <span className="text-xs text-muted-foreground">({profile.rating_count || 0})</span>
                    </div>
                  )}
                </div>
                {profile.bio && <p className="text-sm text-muted-foreground mt-2 max-w-2xl">{profile.bio}</p>}
                <div className="flex flex-wrap gap-1.5 mt-2">
                  <Badge variant="outline">{profile.user_type === 'organization' ? 'Organisation' : profile.user_type === 'agent' ? 'Agent' : 'Talent'}</Badge>
                  {profile.sport_type && <Badge variant="secondary">{profile.sport_type}</Badge>}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Two-column CV layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {/* Left Column - Personal Info */}
          <div className="space-y-4">
            {/* About */}
            <div className="bg-card border border-border rounded-xl overflow-hidden">
              <SectionHeader icon={User} title="Informations Personnelles" />
              <div className="p-3 space-y-0">
                <InfoRow label="Nom" value={profile.name} />
                <InfoRow label="Date de naissance" value={formatDate(profile.birthday)} />
                <InfoRow label="Âge" value={calculateAge(profile.birthday)} />
                <InfoRow label="Spécialité" value={profile.sport_type} />
                <InfoRow label="Ville" value={profile.city} />
                <InfoRow label="Pays" value={profile.country} />
                {profile.phone && <InfoRow label="Téléphone" value={profile.phone} />}
                {profile.email && <InfoRow label="Email" value={profile.email} />}
                {profile.website && <InfoRow label="Site web" value={profile.website} />}
              </div>
            </div>

            {/* Skills */}
            {skills.length > 0 && (
              <div className="bg-card border border-border rounded-xl overflow-hidden">
                <SectionHeader icon={Briefcase} title="Compétences" />
                <div className="p-3">
                  <div className="flex flex-wrap gap-1.5">
                    {skills.map((s, i) => <Badge key={i} variant="outline" className="text-xs">{s}</Badge>)}
                  </div>
                </div>
              </div>
            )}

            {/* Social Links */}
            {socialLinks.length > 0 && (
              <div className="bg-card border border-border rounded-xl overflow-hidden">
                <SectionHeader icon={Globe} title="Réseaux Sociaux" />
                <div className="p-3 space-y-0">
                  {socialLinks.map(l => (
                    <div key={l.id} className="flex justify-between py-1.5 border-b border-border/50 last:border-0">
                      <span className="text-xs font-medium text-muted-foreground">{l.platform}</span>
                      <a href={l.url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline truncate max-w-[60%]">{l.url}</a>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Career */}
          <div className="space-y-4">
            {/* Education */}
            {education.length > 0 && (
              <div className="bg-card border border-border rounded-xl overflow-hidden">
                <SectionHeader icon={GraduationCap} title="Formation & Diplômes" />
                <div className="p-3 space-y-2">
                  {education.map((e: any) => (
                    <div key={e.id} className="p-2.5 rounded-lg bg-muted/40 border border-border/30">
                      <div className="flex items-start gap-2">
                        <Badge variant="outline" className="text-[10px] shrink-0 mt-0.5">
                          {e.education_type === 'school' ? 'École' : e.education_type === 'university' ? 'Université' : e.education_type === 'training' ? 'Formation' : e.education_type === 'certification' ? 'Certif.' : e.education_type}
                        </Badge>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-xs text-foreground">{e.institution}</p>
                          {(e.degree || e.field_of_study) && (
                            <p className="text-[11px] text-muted-foreground">{[e.degree, e.field_of_study].filter(Boolean).join(' — ')}</p>
                          )}
                          {e.start_year && (
                            <p className="text-[10px] text-muted-foreground mt-0.5">
                              {e.start_year}{e.is_current ? ' — présent' : e.end_year ? ` — ${e.end_year}` : ''}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Achievements */}
            {achievements.length > 0 && (
              <div className="bg-card border border-border rounded-xl overflow-hidden">
                <SectionHeader icon={Trophy} title="Réalisations & Prix" />
                <div className="p-3">
                  <table className="w-full text-xs">
                    <tbody>
                      {achievements.map(a => (
                        <tr key={a.id} className="border-b border-border/30 last:border-0">
                          <td className="py-1.5 pr-2 text-muted-foreground whitespace-nowrap align-top">
                            {a.date ? new Date(a.date).getFullYear() : '—'}
                          </td>
                          <td className="py-1.5">
                            <span className="font-medium text-foreground">{a.title}</span>
                            {a.level && <Badge variant="secondary" className="ml-1.5 text-[9px]">{a.level}</Badge>}
                            {a.description && <p className="text-[10px] text-muted-foreground mt-0.5">{a.description}</p>}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Categories */}
        {categories.length > 0 && (
          <div className="bg-card border border-border rounded-xl overflow-hidden mb-6">
            <SectionHeader icon={Tag} title="Catégories" />
            <div className="p-3 flex flex-wrap gap-1.5">
              {categories.map((uc: any) => (
                <Badge
                  key={uc.id}
                  variant="secondary"
                  className="text-xs"
                  style={uc.yat_categories?.color ? { backgroundColor: `${uc.yat_categories.color}22`, color: uc.yat_categories.color, borderColor: `${uc.yat_categories.color}55` } : undefined}
                >
                  {uc.yat_categories?.icon && <span className="mr-1">{uc.yat_categories.icon}</span>}
                  {catName(uc.yat_categories)}
                  {uc.yat_subcategories && <span className="opacity-70"> · {catName(uc.yat_subcategories)}</span>}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Active sections */}
        {presence.length > 0 && (
          <div className="bg-card border border-border rounded-xl overflow-hidden mb-6">
            <SectionHeader icon={Layers} title="Présent dans les sections" />
            <div className="p-3 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {presence.map((p: any) => {
                const meta = SECTION_LABELS[p.section] || { label: p.section, icon: '•' };
                return (
                  <button
                    key={p.section}
                    onClick={() => navigate(`/${p.section === 'yat-coin' ? 'yat-coin' : p.section}`)}
                    className={`flex items-center gap-2 p-2.5 rounded-lg border text-left transition-colors hover:bg-primary/5 ${p.featured ? 'border-primary/40 bg-primary/5' : 'border-border/50 bg-muted/40'}`}
                  >
                    <span className="text-lg">{meta.icon}</span>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-foreground truncate">{meta.label}</p>
                      {p.featured && <span className="text-[10px] text-primary">★ En vedette</span>}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Posts feed */}
        <div className="bg-card border border-border rounded-xl overflow-hidden mb-6">
          <SectionHeader icon={Newspaper} title={`Publications (${posts.length})`} />
          <div className="p-3 space-y-3">
            {posts.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">Aucune publication publique pour le moment.</p>
            ) : (
              posts.map((post: any) => (
                <div key={post.id} className="p-3 rounded-lg border border-border/50 bg-muted/30">
                  <div className="flex items-center gap-2 mb-2">
                    <Avatar className="h-7 w-7">
                      <AvatarImage src={profile.avatar_url || ''} />
                      <AvatarFallback className="text-[10px]">{profile.name?.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-foreground truncate">{profile.name}</p>
                      <p className="text-[10px] text-muted-foreground">{new Date(post.created_at).toLocaleString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                  </div>
                  {post.content && <p className="text-sm text-foreground whitespace-pre-wrap mb-2">{post.content}</p>}
                  {post.media_urls && post.media_urls.length > 0 && (
                    <div className={`grid gap-1.5 mb-2 ${post.media_urls.length > 1 ? 'grid-cols-2' : 'grid-cols-1'}`}>
                      {post.media_urls.slice(0, 4).map((url: string, i: number) => (
                        <img key={i} src={url} alt="" className="w-full h-32 object-cover rounded-md" />
                      ))}
                    </div>
                  )}
                  <div className="flex items-center gap-4 text-[11px] text-muted-foreground pt-1 border-t border-border/30">
                    <span className="flex items-center gap-1"><Heart className="h-3 w-3" /> {post.likes_count || 0}</span>
                    <span className="flex items-center gap-1"><MessageCircle className="h-3 w-3" /> {post.comments_count || 0}</span>
                    {currentUserId === post.user_id || currentUserId === id ? (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <button className="ml-auto flex items-center gap-1 text-destructive hover:underline">
                            <Trash2 className="h-3 w-3" /> Supprimer
                          </button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Supprimer cette publication ?</AlertDialogTitle>
                            <AlertDialogDescription>Cette action est définitive.</AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Annuler</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={async () => {
                                const { error } = await supabase.from('posts').delete().eq('id', post.id);
                                if (error) {
                                  toast({ title: 'Erreur', description: error.message, variant: 'destructive' });
                                } else {
                                  toast({ title: 'Publication supprimée' });
                                  setPosts(prev => prev.filter(p => p.id !== post.id));
                                }
                              }}
                            >
                              Supprimer
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    ) : null}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Activités dans les autres sections */}
        <div className="bg-card border border-border rounded-xl overflow-hidden mb-6">
          <SectionHeader icon={Activity} title="Activités dans les autres sections" />
          <ProfileActivityFeed userIds={id ? [id] : []} />
        </div>


        {/* Media Gallery */}
        {media.length > 0 && (
          <div className="bg-card border border-border rounded-xl overflow-hidden mb-6">
            <SectionHeader icon={Image} title="Médias & Portfolio" />
            <div className="p-3">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {media.map(m => (
                  <div key={m.id} className="rounded-lg overflow-hidden bg-muted/40 border border-border/30">
                    {m.media_type === 'image' && m.url && <img src={m.url} alt={m.title || ''} className="w-full h-28 object-cover" />}
                    {m.media_type === 'video' && m.url && (
                      <div className="w-full h-28 bg-muted flex items-center justify-center">
                        <FileText className="h-6 w-6 text-muted-foreground" />
                      </div>
                    )}
                    <p className="text-[11px] font-medium px-2 py-1.5 truncate">{m.title || m.media_type}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Ratings */}
        <div className="bg-card border border-border rounded-xl overflow-hidden mb-6">
          <SectionHeader icon={Star} title={`Évaluations (${ratings.length})`} />
          <div className="p-4 space-y-4">
            {currentUserId && currentUserId !== id && (
              <div className="p-3 rounded-lg border border-primary/20 bg-primary/5 space-y-3">
                <p className="text-sm font-medium">Évaluer ce talent</p>
                <StarRating value={myRating} onChange={setMyRating} />
                <Textarea placeholder="Commentaire (optionnel)..." value={myComment} onChange={e => setMyComment(e.target.value)} className="text-sm" rows={2} />
                <Button size="sm" onClick={submitRating} disabled={submitting || myRating === 0}>
                  {submitting ? 'Envoi...' : 'Envoyer'}
                </Button>
              </div>
            )}
            {!currentUserId && <p className="text-sm text-muted-foreground">Connectez-vous pour évaluer ce talent.</p>}

            {ratings.length > 0 ? (
              <div className="space-y-2">
                {ratings.map(r => (
                  <div key={r.id} className="p-3 rounded-lg bg-muted/40 border border-border/30">
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
          </div>
        </div>

        {/* Print button */}
        <div className="flex justify-center mb-8 print:hidden">
          <Button variant="outline" onClick={() => window.print()} className="gap-2">
            <FileText className="h-4 w-4" /> Imprimer le CV
          </Button>
        </div>
      </main>
    </div>
  );
};

export default TalentPublicProfile;
