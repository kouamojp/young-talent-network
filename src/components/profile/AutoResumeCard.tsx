import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { FileText, Briefcase, GraduationCap, Calendar, Trophy, MapPin, Plus, X, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface AutoResumeCardProps {
  userId: string;
  profile: any;
  achievements: any[];
  talentPresence: any[];
}

interface ResumeData {
  personalInfo: { name: string; email: string; city: string; country: string; phone: string; bio: string };
  activeSections: string[];
  achievements: { title: string; level: string; date: string }[];
  events: { title: string; status: string }[];
  courses: { title: string; progress: number; completed: boolean }[];
  skills: { name: string; level: string }[];
  customEntries: string[];
}

const AutoResumeCard: React.FC<AutoResumeCardProps> = ({ userId, profile, achievements, talentPresence }) => {
  const [resumeData, setResumeData] = useState<ResumeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [customEntries, setCustomEntries] = useState<string[]>([]);
  const [newEntry, setNewEntry] = useState('');
  const [saving, setSaving] = useState(false);
  const [editBio, setEditBio] = useState('');

  const buildResume = async () => {
    setLoading(true);
    try {
      const [eventsRes, coursesRes, skillsRes] = await Promise.all([
        supabase
          .from('event_attendees')
          .select('*, events(title, start_date, location)')
          .eq('user_id', userId),
        supabase
          .from('course_enrollments')
          .select('*, courses(title, category, level)')
          .eq('student_id', userId),
        supabase
          .from('user_skills')
          .select('*, skills(name, category)')
          .eq('user_id', userId),
      ]);

      // Load existing resume custom entries
      const { data: existingResume } = await supabase
        .from('talent_resumes')
        .select('*')
        .eq('user_id', userId)
        .eq('is_primary', true)
        .single();

      const activeSections = talentPresence
        .filter(p => p.is_active)
        .map(p => p.section);

      const data: ResumeData = {
        personalInfo: {
          name: profile?.name || '',
          email: profile?.email || '',
          city: profile?.city || '',
          country: profile?.country || '',
          phone: profile?.phone || '',
          bio: profile?.bio || '',
        },
        activeSections,
        achievements: achievements.map(a => ({
          title: a.title,
          level: a.level || '',
          date: a.date || '',
        })),
        events: (eventsRes.data || []).map((e: any) => ({
          title: e.events?.title || 'Événement',
          status: e.status || 'attending',
        })),
        courses: (coursesRes.data || []).map((c: any) => ({
          title: c.courses?.title || 'Formation',
          progress: c.progress || 0,
          completed: c.completed || false,
        })),
        skills: (skillsRes.data || []).map((s: any) => ({
          name: s.skills?.name || '',
          level: s.level || 'débutant',
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
        .from('talent_resumes')
        .select('id')
        .eq('user_id', userId)
        .eq('is_primary', true)
        .single();

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

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6 flex items-center justify-center">
          <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full" />
        </CardContent>
      </Card>
    );
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
            <Button size="sm" variant="ghost" onClick={buildResume} className="gap-1">
              <RefreshCw className="h-3.5 w-3.5" /> Actualiser
            </Button>
            <Button size="sm" onClick={saveResume} disabled={saving}>
              {saving ? 'Sauvegarde...' : 'Sauvegarder'}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Personal Info */}
        <div className="p-4 rounded-lg bg-muted/50 space-y-1">
          <h3 className="font-bold text-lg">{resumeData.personalInfo.name}</h3>
          <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
            {resumeData.personalInfo.email && <span>{resumeData.personalInfo.email}</span>}
            {(resumeData.personalInfo.city || resumeData.personalInfo.country) && (
              <span className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {[resumeData.personalInfo.city, resumeData.personalInfo.country].filter(Boolean).join(', ')}
              </span>
            )}
            {resumeData.personalInfo.phone && <span>{resumeData.personalInfo.phone}</span>}
          </div>
        </div>

        {/* Bio */}
        <div>
          <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Résumé professionnel</Label>
          <Textarea
            value={editBio}
            onChange={e => setEditBio(e.target.value)}
            placeholder="Décrivez votre parcours..."
            rows={3}
            className="mt-1"
          />
        </div>

        {/* Active Sections */}
        {resumeData.activeSections.length > 0 && (
          <div>
            <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground flex items-center gap-1">
              <Briefcase className="h-3 w-3" /> Sections actives
            </Label>
            <div className="flex flex-wrap gap-1.5 mt-2">
              {resumeData.activeSections.map(s => (
                <Badge key={s} variant="secondary">{sectionLabels[s] || s}</Badge>
              ))}
            </div>
          </div>
        )}

        {/* Achievements */}
        {resumeData.achievements.length > 0 && (
          <div>
            <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground flex items-center gap-1">
              <Trophy className="h-3 w-3" /> Réalisations ({resumeData.achievements.length})
            </Label>
            <ul className="mt-2 space-y-1.5">
              {resumeData.achievements.map((a, i) => (
                <li key={i} className="text-sm flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>{a.title}{a.level ? ` — ${a.level}` : ''}{a.date ? ` (${new Date(a.date).getFullYear()})` : ''}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Events */}
        {resumeData.events.length > 0 && (
          <div>
            <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground flex items-center gap-1">
              <Calendar className="h-3 w-3" /> Événements ({resumeData.events.length})
            </Label>
            <ul className="mt-2 space-y-1">
              {resumeData.events.map((e, i) => (
                <li key={i} className="text-sm flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>{e.title}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Courses */}
        {resumeData.courses.length > 0 && (
          <div>
            <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground flex items-center gap-1">
              <GraduationCap className="h-3 w-3" /> Formations ({resumeData.courses.length})
            </Label>
            <ul className="mt-2 space-y-1">
              {resumeData.courses.map((c, i) => (
                <li key={i} className="text-sm flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>{c.title} {c.completed ? '✓' : `(${c.progress}%)`}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Skills */}
        {resumeData.skills.length > 0 && (
          <div>
            <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Compétences</Label>
            <div className="flex flex-wrap gap-1.5 mt-2">
              {resumeData.skills.map((s, i) => (
                <Badge key={i} variant="outline">{s.name}</Badge>
              ))}
            </div>
          </div>
        )}

        {/* Custom Entries */}
        <div>
          <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Informations supplémentaires</Label>
          <div className="mt-2 space-y-2">
            {customEntries.map((entry, i) => (
              <div key={i} className="flex items-center gap-2 p-2 rounded bg-muted/50">
                <span className="flex-1 text-sm">{entry}</span>
                <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => removeCustomEntry(i)}>
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}
            <div className="flex gap-2">
              <Input
                value={newEntry}
                onChange={e => setNewEntry(e.target.value)}
                placeholder="Ajouter une info (diplôme, langue, etc.)"
                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addCustomEntry())}
              />
              <Button size="sm" variant="outline" onClick={addCustomEntry} disabled={!newEntry.trim()}>
                <Plus className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AutoResumeCard;
