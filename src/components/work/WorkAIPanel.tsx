import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Sparkles, Loader2, MapPin, Briefcase, TrendingUp, Users, MessageSquare, Send } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { useLanguage } from '@/i18n/LanguageContext';
import { Link, useNavigate } from 'react-router-dom';

interface JobLite {
  id?: string;
  title: string;
  description?: string;
  location?: string;
  job_type?: string;
  requirements?: string[] | string;
}

export const WorkAIPanel: React.FC = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [userType, setUserType] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [matches, setMatches] = useState<any[]>([]);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [myJobs, setMyJobs] = useState<JobLite[]>([]);
  const [selectedJobId, setSelectedJobId] = useState<string>('');
  const [actingId, setActingId] = useState<string | null>(null);

  const contactCandidate = async (e: React.MouseEvent, talentId: string) => {
    e.preventDefault(); e.stopPropagation();
    if (!talentId) return;
    setActingId(talentId);
    try {
      const { data, error } = await supabase.rpc('create_conversation_with_participant', { _other_user_id: talentId });
      if (error) throw error;
      navigate('/messages', { state: { conversationId: data } });
    } catch (err: any) {
      toast({ title: err.message || 'Failed', variant: 'destructive' });
    } finally { setActingId(null); }
  };

  const applyToJob = async (jobId: string) => {
    if (!jobId) return;
    setActingId(jobId);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { navigate('/auth'); return; }
      const { error } = await supabase.from('job_applications').insert({
        job_id: jobId, applicant_id: user.id, cover_letter: 'Candidature envoyée via les recommandations IA YAT Work.'
      });
      if (error) throw error;
      toast({ title: t('work.applicationSent') || 'Candidature envoyée ✓' });
    } catch (err: any) {
      toast({ title: err.message || 'Failed', variant: 'destructive' });
    } finally { setActingId(null); }
  };

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: profile } = await supabase.from('profiles').select('user_type').eq('id', user.id).single();
      setUserType(profile?.user_type || null);

      if (profile?.user_type === 'organization' || profile?.user_type === 'org') {
        const { data: jobs } = await supabase
          .from('job_postings')
          .select('id, title, description, location, job_type, requirements')
          .eq('organization_id', user.id)
          .eq('status', 'open')
          .order('created_at', { ascending: false })
          .limit(20);
        setMyJobs(jobs || []);
        if (jobs?.[0]?.id) setSelectedJobId(jobs[0].id);
      } else {
        // Talent / Agent: auto-suggest
        runSuggest();
      }
    })();
  }, []);

  const runMatch = async (jobId: string) => {
    if (!jobId) return;
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('match-candidates', { body: { jobId } });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setMatches(data?.matches || []);
    } catch (e: any) {
      toast({ title: e.message || 'Match failed', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const runSuggest = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('suggest-jobs', { body: {} });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setSuggestions(data?.suggestions || []);
    } catch (e: any) {
      toast({ title: e.message || 'Suggestion failed', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  if (userType === 'organization' || userType === 'org') {
    return (
      <Card className="p-5">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-bold">{t('work.aiTopCandidates') || 'Top 20 candidates (AI)'}</h3>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={selectedJobId}
              onChange={(e) => setSelectedJobId(e.target.value)}
              className="text-sm border rounded px-2 py-1 bg-background max-w-[220px]"
            >
              <option value="">{t('work.selectJob') || 'Select a job'}</option>
              {myJobs.map(j => <option key={j.id} value={j.id}>{j.title}</option>)}
            </select>
            <Button size="sm" onClick={() => runMatch(selectedJobId)} disabled={!selectedJobId || loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              <span className="ml-1">{t('work.findCandidates') || 'Find'}</span>
            </Button>
          </div>
        </div>

        {!myJobs.length && (
          <p className="text-sm text-muted-foreground">{t('work.noJobsYet') || 'Post a job first to get AI-matched candidates.'}</p>
        )}

        {matches.length > 0 && (
          <div className="space-y-2 max-h-[600px] overflow-y-auto">
            {matches.map((m, idx) => (
              <Link to={`/talent/${m.profile?.id}`} key={m.id} className="flex items-center gap-3 p-3 hover:bg-muted/50 rounded-lg border transition-colors">
                <div className="font-bold text-muted-foreground w-6">#{idx + 1}</div>
                <Avatar className="h-12 w-12">
                  <AvatarImage src={m.profile?.avatar_url} />
                  <AvatarFallback>{m.profile?.name?.[0] || '?'}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold truncate">{m.profile?.name}</div>
                  <div className="text-xs text-muted-foreground flex items-center gap-2 flex-wrap">
                    {m.profile?.sport_type && <Badge variant="secondary" className="text-xs">{m.profile.sport_type}</Badge>}
                    {(m.profile?.city || m.profile?.country) && (
                      <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{[m.profile.city, m.profile.country].filter(Boolean).join(', ')}</span>
                    )}
                  </div>
                  <div className="text-xs mt-1 line-clamp-2">{m.reason}</div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-primary">{m.score}</div>
                  <div className="text-xs text-muted-foreground">/100</div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </Card>
    );
  }

  // Talent / Agent view
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-bold">{t('work.aiSuggestedJobs') || 'Jobs matched to your profile'}</h3>
        </div>
        <Button size="sm" variant="outline" onClick={runSuggest} disabled={loading}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
          <span className="ml-1">{t('common.refresh') || 'Refresh'}</span>
        </Button>
      </div>

      {!suggestions.length && !loading && (
        <p className="text-sm text-muted-foreground">{t('work.noSuggestions') || 'No suggestions yet. Complete your profile to get better matches.'}</p>
      )}

      <div className="space-y-2 max-h-[600px] overflow-y-auto">
        {suggestions.map((s, idx) => (
          <div key={s.id} className="flex items-start gap-3 p-3 border rounded-lg hover:bg-muted/30">
            <div className="font-bold text-muted-foreground w-6">#{idx + 1}</div>
            <Briefcase className="h-5 w-5 text-primary mt-0.5" />
            <div className="flex-1 min-w-0">
              <div className="font-semibold">{s.job?.title}</div>
              <div className="text-xs text-muted-foreground flex items-center gap-2 flex-wrap mt-0.5">
                {s.job?.location && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{s.job.location}</span>}
                {s.job?.job_type && <Badge variant="outline" className="text-xs">{s.job.job_type}</Badge>}
              </div>
              <div className="text-sm mt-1 text-muted-foreground line-clamp-2">{s.reason}</div>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold text-primary">{s.score}</div>
              <div className="text-xs text-muted-foreground">/100</div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default WorkAIPanel;
