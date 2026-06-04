import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Shield, ExternalLink, CheckCircle, XCircle, AlertCircle, FileText, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { BADGE_META } from '@/components/VerificationBadges';

const VerificationRequestsPanel: React.FC = () => {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<any>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [acting, setActing] = useState(false);
  const [docUrls, setDocUrls] = useState<Record<string, string>>({});

  const load = async () => {
    setLoading(true);
    const { data: reqs } = await supabase
      .from('verification_requests')
      .select('*')
      .order('created_at', { ascending: false });

    const userIds = [...new Set((reqs || []).map((r: any) => r.user_id))];
    const { data: profs } = await supabase
      .from('profiles')
      .select('id, name, avatar_url, email, user_type')
      .in('id', userIds);

    const enriched = (reqs || []).map((r: any) => ({
      ...r,
      profile: profs?.find((p: any) => p.id === r.user_id),
    }));
    setRequests(enriched);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const openRequest = async (r: any) => {
    setSelected(r);
    setAdminNotes(r.admin_notes || '');
    // Generate signed URLs for docs
    const urls: Record<string, string> = {};
    for (const doc of (r.documents as any[]) || []) {
      const { data } = await supabase.storage
        .from('verification-documents')
        .createSignedUrl(doc.path, 3600);
      if (data?.signedUrl) urls[doc.path] = data.signedUrl;
    }
    setDocUrls(urls);
  };

  const act = async (status: 'approved' | 'rejected' | 'info_requested') => {
    if (!selected) return;
    setActing(true);
    const { data: { user } } = await supabase.auth.getUser();
    const { error } = await supabase
      .from('verification_requests')
      .update({
        status,
        admin_notes: adminNotes,
        reviewed_by: user?.id,
        reviewed_at: new Date().toISOString(),
      })
      .eq('id', selected.id);
    setActing(false);
    if (error) { toast.error(error.message); return; }
    toast.success(`Demande ${status === 'approved' ? 'approuvée' : status === 'rejected' ? 'refusée' : 'mise en attente d\'info'}`);
    setSelected(null);
    load();
  };

  const statusBadge = (s: string) => {
    const map: Record<string, string> = {
      pending: 'bg-amber-100 text-amber-700',
      approved: 'bg-emerald-100 text-emerald-700',
      rejected: 'bg-red-100 text-red-700',
      info_requested: 'bg-blue-100 text-blue-700',
    };
    return <Badge className={map[s] || map.pending}>{s}</Badge>;
  };

  if (loading) return <div className="text-center py-8"><Loader2 className="h-6 w-6 animate-spin mx-auto" /></div>;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-3">
        <Shield className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold">Demandes de vérification ({requests.length})</h3>
      </div>

      {requests.length === 0 ? (
        <Card><CardContent className="text-center py-8 text-muted-foreground">Aucune demande</CardContent></Card>
      ) : requests.map(r => (
        <Card key={r.id}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarImage src={r.profile?.avatar_url} />
                <AvatarFallback>{r.profile?.name?.[0] || '?'}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="font-semibold">{r.profile?.name || 'Utilisateur'}</div>
                <div className="text-xs text-muted-foreground">{r.profile?.email}</div>
              </div>
              <Badge variant="outline">{BADGE_META[r.badge_type]?.label}</Badge>
              {statusBadge(r.status)}
              <Button size="sm" onClick={() => openRequest(r)}>Examiner</Button>
            </div>
          </CardContent>
        </Card>
      ))}

      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Demande de vérification — {selected && BADGE_META[selected.badge_type]?.label}
            </DialogTitle>
          </DialogHeader>

          {selected && (
            <div className="space-y-4">
              <div>
                <div className="text-sm font-medium mb-1">Utilisateur</div>
                <div className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={selected.profile?.avatar_url} />
                    <AvatarFallback>{selected.profile?.name?.[0]}</AvatarFallback>
                  </Avatar>
                  <span>{selected.profile?.name} ({selected.profile?.email})</span>
                </div>
              </div>

              {selected.notes && (
                <div>
                  <div className="text-sm font-medium mb-1">Notes du candidat</div>
                  <div className="text-sm p-2 bg-muted rounded">{selected.notes}</div>
                </div>
              )}

              <div>
                <div className="text-sm font-medium mb-1">Documents</div>
                {(selected.documents as any[]).length === 0 ? (
                  <div className="text-sm text-muted-foreground">Aucun document</div>
                ) : (
                  <div className="space-y-1">
                    {(selected.documents as any[]).map((d: any) => (
                      <a key={d.path} href={docUrls[d.path]} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-2 p-2 bg-muted rounded text-sm hover:bg-muted/70">
                        <FileText className="h-4 w-4" />
                        <span className="flex-1">{d.type} — {d.name}</span>
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    ))}
                  </div>
                )}
              </div>

              {selected.official_links?.length > 0 && (
                <div>
                  <div className="text-sm font-medium mb-1">Liens officiels</div>
                  <div className="space-y-1">
                    {selected.official_links.map((l: string) => (
                      <a key={l} href={l} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-2 text-sm text-primary hover:underline">
                        <ExternalLink className="h-3 w-3" /> {l}
                      </a>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <div className="text-sm font-medium mb-1">Notes admin (visible par le candidat)</div>
                <Textarea value={adminNotes} onChange={(e) => setAdminNotes(e.target.value)} rows={3} />
              </div>
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => act('info_requested')} disabled={acting}>
              <AlertCircle className="h-4 w-4 mr-1" /> Demander plus d'info
            </Button>
            <Button variant="destructive" onClick={() => act('rejected')} disabled={acting}>
              <XCircle className="h-4 w-4 mr-1" /> Refuser
            </Button>
            <Button onClick={() => act('approved')} disabled={acting}>
              <CheckCircle className="h-4 w-4 mr-1" /> Approuver
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default VerificationRequestsPanel;
