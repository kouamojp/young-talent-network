import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { FileText, Briefcase, GraduationCap, Calendar, Trophy, MapPin, Plus, X, RefreshCw, Download, Star, Share2, Link2, Globe } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface AutoResumeCardProps {
  userId: string;
  profile: any;
  achievements: any[];
  talentPresence: any[];
}

interface EducationEntry {
  institution: string;
  degree: string;
  field_of_study: string;
  start_year: number | null;
  end_year: number | null;
  is_current: boolean;
  education_type: string;
}

interface ResumeData {
  personalInfo: { name: string; email: string; city: string; country: string; phone: string; bio: string; rating: number };
  activeSections: string[];
  achievements: { title: string; level: string; date: string }[];
  events: { title: string; status: string }[];
  courses: { title: string; progress: number; completed: boolean }[];
  skills: { name: string; level: string }[];
  education: EducationEntry[];
  customEntries: string[];
}

const AutoResumeCard: React.FC<AutoResumeCardProps> = ({ userId, profile, achievements, talentPresence }) => {
  const [resumeData, setResumeData] = useState<ResumeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [customEntries, setCustomEntries] = useState<string[]>([]);
  const [newEntry, setNewEntry] = useState('');
  const [saving, setSaving] = useState(false);
  const [editBio, setEditBio] = useState('');
  const [resumeId, setResumeId] = useState<string | null>(null);
  const [slug, setSlug] = useState<string | null>(null);
  const [isPublic, setIsPublic] = useState(false);

  const buildResume = async () => {
    setLoading(true);
    try {
      const [eventsRes, coursesRes, skillsRes, educationRes] = await Promise.all([
        supabase.from('event_attendees').select('*, events(title, start_date, location)').eq('user_id', userId),
        supabase.from('course_enrollments').select('*, courses(title, category, level)').eq('student_id', userId),
        supabase.from('user_skills').select('*, skills(name, category)').eq('user_id', userId),
        (supabase.from('talent_education') as any).select('*').eq('user_id', userId).order('start_year', { ascending: false }),
      ]);

      const { data: existingResume } = await (supabase
        .from('talent_resumes') as any).select('*').eq('user_id', userId).eq('is_primary', true).maybeSingle();
      if (existingResume) {
        setResumeId(existingResume.id);
        setSlug(existingResume.slug || null);
        setIsPublic(!!existingResume.is_public);
      }

      const activeSections = talentPresence.filter(p => p.is_active).map(p => p.section);

      const data: ResumeData = {
        personalInfo: {
          name: profile?.name || '',
          email: profile?.email || '',
          city: profile?.city || '',
          country: profile?.country || '',
          phone: profile?.phone || '',
          bio: profile?.bio || '',
          rating: Number(profile?.platform_rating) || 0,
        },
        activeSections,
        achievements: achievements.map(a => ({ title: a.title, level: a.level || '', date: a.date || '' })),
        events: (eventsRes.data || []).map((e: any) => ({ title: e.events?.title || 'Événement', status: e.status || 'attending' })),
        courses: (coursesRes.data || []).map((c: any) => ({ title: c.courses?.title || 'Formation', progress: c.progress || 0, completed: c.completed || false })),
        skills: (skillsRes.data || []).map((s: any) => ({ name: s.skills?.name || '', level: s.level || 'débutant' })),
        education: (educationRes.data || []).map((ed: any) => ({
          institution: ed.institution, degree: ed.degree || '', field_of_study: ed.field_of_study || '',
          start_year: ed.start_year, end_year: ed.end_year, is_current: ed.is_current, education_type: ed.education_type,
        })),
        customEntries: existingResume?.achievements || [],
      };

      setResumeData(data);
      setCustomEntries(existingResume?.achievements || []);
      setEditBio(data.personalInfo.bio);
    } catch (err) {
      console.error('Error building resume:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { buildResume(); }, [userId]);

  const addCustomEntry = () => {
    if (!newEntry.trim()) return;
    setCustomEntries(prev => [...prev, newEntry.trim()]);
    setNewEntry('');
  };

  const removeCustomEntry = (index: number) => {
    setCustomEntries(prev => prev.filter((_, i) => i !== index));
  };

  const saveResume = async () => {
    setSaving(true);
    try {
      const { data: existing } = await supabase
        .from('talent_resumes').select('id').eq('user_id', userId).eq('is_primary', true).single();

      const resumePayload = {
        user_id: userId,
        title: `CV de ${resumeData?.personalInfo.name || 'Talent'}`,
        description: editBio,
        is_primary: true,
        achievements: customEntries,
        experience: JSON.stringify({
          events: resumeData?.events.length || 0,
          courses: resumeData?.courses.length || 0,
          activeSections: resumeData?.activeSections || [],
          education: resumeData?.education || [],
        }),
      };

      if (existing) {
        const { error } = await supabase.from('talent_resumes').update(resumePayload).eq('id', existing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('talent_resumes').insert(resumePayload);
        if (error) throw error;
      }
      toast.success('CV sauvegardé');
    } catch (err) {
      toast.error('Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  const exportPDF = () => {
    if (!resumeData) return;
    const r = resumeData;
    
    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>CV - ${r.personalInfo.name}</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Segoe UI', Arial, sans-serif; color: #1a1a1a; padding: 40px; max-width: 800px; margin: 0 auto; }
  h1 { font-size: 28px; color: #1e40af; margin-bottom: 4px; }
  h2 { font-size: 16px; color: #1e40af; border-bottom: 2px solid #1e40af; padding-bottom: 4px; margin: 20px 0 10px; text-transform: uppercase; letter-spacing: 1px; }
  .contact { color: #555; font-size: 13px; margin-bottom: 12px; }
  .rating { color: #d97706; font-weight: bold; }
  .bio { color: #333; font-size: 14px; margin-bottom: 16px; line-height: 1.5; }
  .item { margin-bottom: 8px; font-size: 13px; }
  .item-title { font-weight: 600; }
  .badge { display: inline-block; background: #e0e7ff; color: #1e40af; padding: 2px 8px; border-radius: 12px; font-size: 11px; margin: 2px; }
  .edu-item { margin-bottom: 12px; }
  .edu-type { font-size: 11px; color: #6b7280; text-transform: uppercase; }
  ul { padding-left: 20px; }
  li { font-size: 13px; margin-bottom: 4px; }
</style></head><body>
<h1>${r.personalInfo.name}</h1>
<div class="contact">
  ${[r.personalInfo.email, r.personalInfo.phone, [r.personalInfo.city, r.personalInfo.country].filter(Boolean).join(', ')].filter(Boolean).join(' • ')}
  ${r.personalInfo.rating > 0 ? ` • <span class="rating">★ ${r.personalInfo.rating.toFixed(1)} / 5</span>` : ''}
</div>
${editBio ? `<div class="bio">${editBio}</div>` : ''}

${r.education.length > 0 ? `<h2>Formation & Diplômes</h2>${r.education.map(e => `
<div class="edu-item">
  <div class="edu-type">${eduTypeLabel(e.education_type)}</div>
  <div class="item-title">${[e.degree, e.field_of_study].filter(Boolean).join(' - ') || e.institution}</div>
  <div class="item">${e.institution} ${e.start_year ? `(${e.start_year}${e.is_current ? ' - présent' : e.end_year ? ` - ${e.end_year}` : ''})` : ''}</div>
</div>`).join('')}` : ''}

${r.achievements.length > 0 ? `<h2>Réalisations & Prix</h2><ul>${r.achievements.map(a => `<li>${a.title}${a.level ? ` — ${a.level}` : ''}${a.date ? ` (${new Date(a.date).getFullYear()})` : ''}</li>`).join('')}</ul>` : ''}

${r.skills.length > 0 ? `<h2>Compétences</h2><div>${r.skills.map(s => `<span class="badge">${s.name}</span>`).join(' ')}</div>` : ''}

${r.events.length > 0 ? `<h2>Événements</h2><ul>${r.events.map(e => `<li>${e.title}</li>`).join('')}</ul>` : ''}

${r.courses.length > 0 ? `<h2>Formations</h2><ul>${r.courses.map(c => `<li>${c.title} ${c.completed ? '✓' : `(${c.progress}%)`}</li>`).join('')}</ul>` : ''}

${r.activeSections.length > 0 ? `<h2>Sections actives YAT</h2><div>${r.activeSections.map(s => `<span class="badge">${sectionLabels[s] || s}</span>`).join(' ')}</div>` : ''}

${customEntries.length > 0 ? `<h2>Informations supplémentaires</h2><ul>${customEntries.map(e => `<li>${e}</li>`).join('')}</ul>` : ''}

</body></html>`;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(html);
      printWindow.document.close();
      setTimeout(() => { printWindow.print(); }, 500);
    }
  };

  if (loading) {
    return <Card><CardContent className="p-6 flex items-center justify-center"><div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full" /></CardContent></Card>;
  }

  if (!resumeData) return null;

  const sectionLabels: Record<string, string> = {
    work: 'YAT Work', learning: 'YAT Learning', live: 'YAT Live',
    tv: 'YAT TV', events: 'YAT Events', karta: 'YAT Karta', 'yat-coin': 'YAT Coin',
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <FileText className="h-4 w-4" /> CV Auto-Généré
          </CardTitle>
          <div className="flex gap-2">
            <Button size="sm" variant="ghost" onClick={buildResume} className="gap-1"><RefreshCw className="h-3.5 w-3.5" /> Actualiser</Button>
            <Button size="sm" variant="outline" onClick={exportPDF} className="gap-1"><Download className="h-3.5 w-3.5" /> PDF</Button>
            <Button size="sm" onClick={saveResume} disabled={saving}>{saving ? 'Sauvegarde...' : 'Sauvegarder'}</Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Personal Info */}
        <div className="p-4 rounded-lg bg-muted/50 space-y-1">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-lg">{resumeData.personalInfo.name}</h3>
            {resumeData.personalInfo.rating > 0 && (
              <span className="flex items-center gap-1 text-sm font-medium text-amber-600">
                <Star className="h-4 w-4 fill-current" /> {resumeData.personalInfo.rating.toFixed(1)}
              </span>
            )}
          </div>
          <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
            {resumeData.personalInfo.email && <span>{resumeData.personalInfo.email}</span>}
            {(resumeData.personalInfo.city || resumeData.personalInfo.country) && (
              <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{[resumeData.personalInfo.city, resumeData.personalInfo.country].filter(Boolean).join(', ')}</span>
            )}
            {resumeData.personalInfo.phone && <span>{resumeData.personalInfo.phone}</span>}
          </div>
        </div>

        {/* Bio */}
        <div>
          <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Résumé professionnel</Label>
          <Textarea value={editBio} onChange={e => setEditBio(e.target.value)} placeholder="Décrivez votre parcours..." rows={3} className="mt-1" />
        </div>

        {/* Education */}
        {resumeData.education.length > 0 && (
          <div>
            <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground flex items-center gap-1">
              <GraduationCap className="h-3 w-3" /> Formation & Diplômes ({resumeData.education.length})
            </Label>
            <div className="mt-2 space-y-2">
              {resumeData.education.map((e, i) => (
                <div key={i} className="p-2.5 rounded-lg bg-muted/30 border border-border/50">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-[10px]">{eduTypeLabel(e.education_type)}</Badge>
                    <span className="font-medium text-sm">{[e.degree, e.field_of_study].filter(Boolean).join(' - ') || e.institution}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {e.institution} {e.start_year ? `• ${e.start_year}${e.is_current ? ' - présent' : e.end_year ? ` - ${e.end_year}` : ''}` : ''}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Active Sections */}
        {resumeData.activeSections.length > 0 && (
          <div>
            <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground flex items-center gap-1"><Briefcase className="h-3 w-3" /> Sections actives</Label>
            <div className="flex flex-wrap gap-1.5 mt-2">{resumeData.activeSections.map(s => <Badge key={s} variant="secondary">{sectionLabels[s] || s}</Badge>)}</div>
          </div>
        )}

        {/* Achievements */}
        {resumeData.achievements.length > 0 && (
          <div>
            <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground flex items-center gap-1"><Trophy className="h-3 w-3" /> Réalisations ({resumeData.achievements.length})</Label>
            <ul className="mt-2 space-y-1.5">{resumeData.achievements.map((a, i) => (
              <li key={i} className="text-sm flex items-start gap-2"><span className="text-primary mt-1">•</span><span>{a.title}{a.level ? ` — ${a.level}` : ''}{a.date ? ` (${new Date(a.date).getFullYear()})` : ''}</span></li>
            ))}</ul>
          </div>
        )}

        {/* Events */}
        {resumeData.events.length > 0 && (
          <div>
            <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground flex items-center gap-1"><Calendar className="h-3 w-3" /> Événements ({resumeData.events.length})</Label>
            <ul className="mt-2 space-y-1">{resumeData.events.map((e, i) => <li key={i} className="text-sm flex items-start gap-2"><span className="text-primary mt-1">•</span><span>{e.title}</span></li>)}</ul>
          </div>
        )}

        {/* Courses */}
        {resumeData.courses.length > 0 && (
          <div>
            <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground flex items-center gap-1"><GraduationCap className="h-3 w-3" /> Formations ({resumeData.courses.length})</Label>
            <ul className="mt-2 space-y-1">{resumeData.courses.map((c, i) => <li key={i} className="text-sm flex items-start gap-2"><span className="text-primary mt-1">•</span><span>{c.title} {c.completed ? '✓' : `(${c.progress}%)`}</span></li>)}</ul>
          </div>
        )}

        {/* Skills */}
        {resumeData.skills.length > 0 && (
          <div>
            <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Compétences</Label>
            <div className="flex flex-wrap gap-1.5 mt-2">{resumeData.skills.map((s, i) => <Badge key={i} variant="outline">{s.name}</Badge>)}</div>
          </div>
        )}

        {/* Custom Entries */}
        <div>
          <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Informations supplémentaires</Label>
          <div className="mt-2 space-y-2">
            {customEntries.map((entry, i) => (
              <div key={i} className="flex items-center gap-2 p-2 rounded bg-muted/50">
                <span className="flex-1 text-sm">{entry}</span>
                <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => removeCustomEntry(i)}><X className="h-3 w-3" /></Button>
              </div>
            ))}
            <div className="flex gap-2">
              <Input value={newEntry} onChange={e => setNewEntry(e.target.value)} placeholder="Ajouter une info (diplôme, langue, etc.)" onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addCustomEntry())} />
              <Button size="sm" variant="outline" onClick={addCustomEntry} disabled={!newEntry.trim()}><Plus className="h-3.5 w-3.5" /></Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

function eduTypeLabel(type: string): string {
  const map: Record<string, string> = {
    school: 'École', university: 'Université', training: 'Formation pro',
    certification: 'Certification', diploma: 'Diplôme', other: 'Autre',
  };
  return map[type] || type;
}

export default AutoResumeCard;
