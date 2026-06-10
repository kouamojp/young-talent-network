import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Mail, Phone, Globe, Star, Download, Share2, GraduationCap, Trophy, Briefcase, Award } from 'lucide-react';
import { toast } from 'sonner';

const PublicCV: React.FC = () => {
  const { slug } = useParams();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [extras, setExtras] = useState<any>({ profile: null, education: [], achievements: [], skills: [], media: [], experiences: [], languages: [] });

  useEffect(() => { load(); }, [slug]);

  const load = async () => {
    setLoading(true);
    const { data: resume } = await supabase.from('talent_resumes').select('*').eq('slug', slug).eq('is_public', true).maybeSingle();
    if (!resume) { setLoading(false); return; }
    setData(resume);

    const uid = resume.user_id;
    const [p, ed, ac, sk, md, ex] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', uid).single(),
      (supabase.from('talent_education') as any).select('*').eq('user_id', uid).order('start_year', { ascending: false }),
      supabase.from('talent_achievements').select('*').eq('user_id', uid).order('date', { ascending: false }),
      supabase.from('user_skills').select('*, skills(name, category)').eq('user_id', uid),
      supabase.from('talent_media').select('*').eq('user_id', uid).order('created_at', { ascending: false }).limit(8),
      (supabase.from('talent_experiences') as any).select('*').eq('user_id', uid).order('start_date', { ascending: false }),
    ]);
    setExtras({
      profile: p.data, education: ed.data || [], achievements: ac.data || [],
      skills: sk.data || [], media: md.data || [], experiences: ex.data || [], languages: [],
    });
    setLoading(false);
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) { try { await navigator.share({ url, title: 'CV YAT' }); } catch {} }
    else { await navigator.clipboard.writeText(url); toast.success('Lien copié !'); }
  };

  const handlePrint = () => window.print();

  if (loading) return <div className="flex items-center justify-center min-h-[50vh]"><div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" /></div>;
  if (!data) return <div className="container mx-auto py-12 text-center"><h2 className="text-2xl font-bold">CV introuvable ou privé</h2></div>;

  const p = extras.profile;

  return (
    <div className="container mx-auto max-w-4xl py-8 px-4 print:py-0 print:px-0">
      <div className="flex justify-end gap-2 mb-4 print:hidden">
        <Button variant="outline" size="sm" onClick={handleShare}><Share2 className="h-4 w-4 mr-1" /> Partager</Button>
        <Button size="sm" onClick={handlePrint}><Download className="h-4 w-4 mr-1" /> Télécharger / Imprimer</Button>
      </div>

      <Card className="overflow-hidden shadow-lg print:shadow-none">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary to-primary/70 p-8 text-primary-foreground">
          <div className="flex items-center gap-6 flex-wrap">
            <Avatar className="h-28 w-28 border-4 border-background shadow">
              <AvatarImage src={p?.avatar_url} />
              <AvatarFallback className="text-3xl">{p?.name?.[0] || 'U'}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-[200px]">
              <h1 className="text-3xl font-bold">{p?.name || 'Talent'}</h1>
              {p?.bio && <p className="opacity-90 mt-1 text-sm">{p.bio}</p>}
              <div className="flex flex-wrap gap-3 mt-3 text-sm opacity-90">
                {p?.email && <span className="flex items-center gap-1"><Mail className="h-3.5 w-3.5" />{p.email}</span>}
                {p?.phone && <span className="flex items-center gap-1"><Phone className="h-3.5 w-3.5" />{p.phone}</span>}
                {(p?.city || p?.country) && <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{[p?.city, p?.country].filter(Boolean).join(', ')}</span>}
                {p?.website && <span className="flex items-center gap-1"><Globe className="h-3.5 w-3.5" />{p.website}</span>}
                {p?.platform_rating > 0 && <span className="flex items-center gap-1"><Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />{Number(p.platform_rating).toFixed(1)}</span>}
              </div>
            </div>
          </div>
        </div>

        <CardContent className="p-8 space-y-7">
          {data.description && (
            <section>
              <h2 className="text-lg font-bold text-primary border-b-2 border-primary pb-1 mb-2 uppercase tracking-wide">Profil</h2>
              <p className="text-sm leading-relaxed whitespace-pre-line">{data.description}</p>
            </section>
          )}

          {extras.experiences.length > 0 && (
            <section>
              <h2 className="text-lg font-bold text-primary border-b-2 border-primary pb-1 mb-3 uppercase tracking-wide flex items-center gap-2"><Briefcase className="h-4 w-4" /> Expériences</h2>
              <div className="space-y-3">
                {extras.experiences.map((e: any) => (
                  <div key={e.id}>
                    <div className="flex items-baseline justify-between gap-2">
                      <h3 className="font-semibold">{e.position} <span className="font-normal text-muted-foreground">— {e.company}</span></h3>
                      <span className="text-xs text-muted-foreground">{e.start_date ? new Date(e.start_date).getFullYear() : ''}{e.is_current ? ' - présent' : e.end_date ? ` - ${new Date(e.end_date).getFullYear()}` : ''}</span>
                    </div>
                    {e.description && <p className="text-sm text-muted-foreground mt-1">{e.description}</p>}
                  </div>
                ))}
              </div>
            </section>
          )}

          {extras.education.length > 0 && (
            <section>
              <h2 className="text-lg font-bold text-primary border-b-2 border-primary pb-1 mb-3 uppercase tracking-wide flex items-center gap-2"><GraduationCap className="h-4 w-4" /> Formation</h2>
              <div className="space-y-3">
                {extras.education.map((e: any) => (
                  <div key={e.id}>
                    <h3 className="font-semibold text-sm">{[e.degree, e.field_of_study].filter(Boolean).join(' — ') || e.institution}</h3>
                    <p className="text-xs text-muted-foreground">{e.institution} {e.start_year ? `• ${e.start_year}${e.is_current ? ' - présent' : e.end_year ? ` - ${e.end_year}` : ''}` : ''}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {extras.skills.length > 0 && (
            <section>
              <h2 className="text-lg font-bold text-primary border-b-2 border-primary pb-1 mb-3 uppercase tracking-wide">Compétences</h2>
              <div className="flex flex-wrap gap-1.5">
                {extras.skills.map((s: any) => <Badge key={s.id} variant="secondary">{s.skills?.name}</Badge>)}
              </div>
            </section>
          )}

          {extras.achievements.length > 0 && (
            <section>
              <h2 className="text-lg font-bold text-primary border-b-2 border-primary pb-1 mb-3 uppercase tracking-wide flex items-center gap-2"><Trophy className="h-4 w-4" /> Réalisations</h2>
              <ul className="space-y-1.5">
                {extras.achievements.map((a: any) => (
                  <li key={a.id} className="text-sm flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>{a.title}{a.level ? ` — ${a.level}` : ''}{a.date ? ` (${new Date(a.date).getFullYear()})` : ''}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {data.achievements && Array.isArray(data.achievements) && data.achievements.length > 0 && (
            <section>
              <h2 className="text-lg font-bold text-primary border-b-2 border-primary pb-1 mb-3 uppercase tracking-wide flex items-center gap-2"><Award className="h-4 w-4" /> Certifications & Langues</h2>
              <ul className="space-y-1.5">
                {data.achievements.map((a: string, i: number) => (
                  <li key={i} className="text-sm flex items-start gap-2"><span className="text-primary mt-1">•</span><span>{a}</span></li>
                ))}
              </ul>
            </section>
          )}

          {extras.media.length > 0 && (
            <section className="print:hidden">
              <h2 className="text-lg font-bold text-primary border-b-2 border-primary pb-1 mb-3 uppercase tracking-wide">Portfolio</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {extras.media.slice(0, 8).map((m: any) => (
                  <a key={m.id} href={m.url} target="_blank" rel="noopener noreferrer" className="block aspect-square rounded overflow-hidden bg-muted hover:opacity-80 transition">
                    {(m.media_type === 'image' || m.media_type === 'photo') ? (
                      <img src={m.url} alt={m.title || ''} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs text-center p-2">{m.title || m.media_type}</div>
                    )}
                  </a>
                ))}
              </div>
            </section>
          )}
        </CardContent>
      </Card>

      <p className="text-center text-xs text-muted-foreground mt-4 print:hidden">CV généré par YAT — Young & Talent Network</p>
    </div>
  );
};

export default PublicCV;
