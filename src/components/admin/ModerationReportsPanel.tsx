import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { AlertTriangle, ShieldAlert, Shield, CheckCircle2, XCircle, Trash2, Eye, Loader2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface Report {
  id: string;
  reported_user_id: string | null;
  content_type: string;
  content_id: string | null;
  content_excerpt: string | null;
  risk_score: number;
  risk_level: string;
  categories: string[];
  reason: string | null;
  source: string;
  reporter_user_id: string | null;
  status: string;
  created_at: string;
}

const LEVEL_STYLES: Record<string, { color: string; icon: any }> = {
  low: { color: 'bg-muted text-foreground', icon: Shield },
  medium: { color: 'bg-yellow-500/15 text-yellow-700 dark:text-yellow-400', icon: AlertTriangle },
  high: { color: 'bg-orange-500/15 text-orange-700 dark:text-orange-400', icon: ShieldAlert },
  critical: { color: 'bg-destructive/15 text-destructive', icon: ShieldAlert },
};

const ModerationReportsPanel: React.FC = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [filter, setFilter] = useState<'pending' | 'all'>('pending');
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState<string | null>(null);
  const { toast } = useToast();

  const load = async () => {
    setLoading(true);
    let q = supabase.from('moderation_reports').select('*').order('created_at', { ascending: false }).limit(100);
    if (filter === 'pending') q = q.eq('status', 'pending');
    const { data, error } = await q;
    if (error) {
      toast({ title: error.message, variant: 'destructive' });
    } else {
      setReports((data as Report[]) || []);
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, [filter]);

  const updateStatus = async (id: string, status: string) => {
    setActing(id);
    const { error } = await supabase.from('moderation_reports').update({
      status, reviewed_at: new Date().toISOString(),
    }).eq('id', id);
    setActing(null);
    if (error) { toast({ title: error.message, variant: 'destructive' }); return; }
    toast({ title: `Report ${status}` });
    load();
  };

  const removeContent = async (r: Report) => {
    if (!r.content_id) return;
    if (!confirm('Supprimer définitivement ce contenu ?')) return;
    setActing(r.id);
    try {
      if (r.content_type === 'post') await supabase.from('posts').delete().eq('id', r.content_id);
      else if (r.content_type === 'comment') await supabase.from('comments').delete().eq('id', r.content_id);
      else if (r.content_type === 'message') await supabase.from('messages').delete().eq('id', r.content_id);
      await supabase.from('moderation_reports').update({ status: 'actioned', reviewed_at: new Date().toISOString() }).eq('id', r.id);
      toast({ title: 'Contenu supprimé' });
      load();
    } catch (e: any) {
      toast({ title: e.message, variant: 'destructive' });
    } finally { setActing(null); }
  };

  const pendingCount = reports.filter(r => r.status === 'pending').length;
  const criticalCount = reports.filter(r => r.risk_level === 'critical' && r.status === 'pending').length;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <CardTitle className="flex items-center gap-2"><ShieldAlert className="h-5 w-5 text-primary" /> Anti-spam & Anti-fraude</CardTitle>
            <p className="text-xs text-muted-foreground mt-1">Détections IA et signalements utilisateurs</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline">{pendingCount} en attente</Badge>
            {criticalCount > 0 && <Badge className="bg-destructive">{criticalCount} critiques</Badge>}
            <Button size="sm" variant={filter === 'pending' ? 'default' : 'outline'} onClick={() => setFilter('pending')}>En attente</Button>
            <Button size="sm" variant={filter === 'all' ? 'default' : 'outline'} onClick={() => setFilter('all')}>Toutes</Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin" /></div>
        ) : reports.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground text-sm">Aucun signalement {filter === 'pending' ? 'en attente' : ''}.</div>
        ) : (
          <ScrollArea className="max-h-[600px]">
            <div className="space-y-3">
              {reports.map(r => {
                const style = LEVEL_STYLES[r.risk_level] || LEVEL_STYLES.low;
                const Icon = style.icon;
                return (
                  <div key={r.id} className="border rounded-lg p-3 space-y-2">
                    <div className="flex items-start justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge className={style.color}><Icon className="h-3 w-3 mr-1" />{r.risk_level} ({r.risk_score})</Badge>
                        <Badge variant="outline">{r.content_type}</Badge>
                        <Badge variant="secondary">{r.source}</Badge>
                        {r.categories?.slice(0, 4).map(c => <Badge key={c} variant="outline" className="text-[10px]">{c}</Badge>)}
                        <span className="text-xs text-muted-foreground">{formatDistanceToNow(new Date(r.created_at), { addSuffix: true })}</span>
                      </div>
                      <Badge variant={r.status === 'pending' ? 'default' : 'outline'}>{r.status}</Badge>
                    </div>
                    {r.reason && <p className="text-xs italic text-muted-foreground">"{r.reason}"</p>}
                    {r.content_excerpt && (
                      <div className="bg-muted/50 rounded p-2 text-sm whitespace-pre-wrap break-words max-h-32 overflow-y-auto">
                        {r.content_excerpt}
                      </div>
                    )}
                    {r.status === 'pending' && (
                      <div className="flex gap-2 flex-wrap">
                        <Button size="sm" variant="outline" disabled={acting === r.id} onClick={() => updateStatus(r.id, 'dismissed')}>
                          <CheckCircle2 className="h-3 w-3 mr-1" />Ignorer (faux positif)
                        </Button>
                        <Button size="sm" variant="outline" disabled={acting === r.id} onClick={() => updateStatus(r.id, 'reviewed')}>
                          <Eye className="h-3 w-3 mr-1" />Marquer vérifié
                        </Button>
                        {r.content_id && (
                          <Button size="sm" variant="destructive" disabled={acting === r.id} onClick={() => removeContent(r)}>
                            <Trash2 className="h-3 w-3 mr-1" />Supprimer le contenu
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
};

export default ModerationReportsPanel;
