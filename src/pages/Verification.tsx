import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Shield, Upload, X, FileText, Loader2, CheckCircle, Clock, XCircle, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { BADGE_META } from '@/components/VerificationBadges';
import { tr } from '@/i18n';
import { localeTag } from '@/i18n/format';

const DOC_TYPES = [
  { key: 'id', label: tr('verification.idDocument') },
  { key: 'diploma', label: tr('profile.diploma') },
  { key: 'certificate', label: tr('verification.certificate') },
  { key: 'license', label: tr('verification.professionalLicence') },
  { key: 'org_proof', label: tr('verification.proofOfOrganization') },
];

interface DocFile { type: string; name: string; path: string; }

const Verification: React.FC = () => {
  const navigate = useNavigate();
  const [userId, setUserId] = useState<string | null>(null);
  const [badgeType, setBadgeType] = useState<string>('talent');
  const [docs, setDocs] = useState<DocFile[]>([]);
  const [links, setLinks] = useState<string>('');
  const [notes, setNotes] = useState('');
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) { navigate('/auth'); return; }
      setUserId(data.user.id);
      loadHistory(data.user.id);
    });
  }, [navigate]);

  const loadHistory = async (uid: string) => {
    const { data } = await supabase
      .from('verification_requests')
      .select('*')
      .eq('user_id', uid)
      .order('created_at', { ascending: false });
    setHistory(data || []);
  };

  const handleUpload = async (docType: string, file: File) => {
    if (!userId) return;
    if (file.size > 10 * 1024 * 1024) { toast.error(tr('verification.fileTooLargeMax10Mb')); return; }
    setUploading(true);
    const ext = file.name.split('.').pop();
    const path = `${userId}/${docType}-${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from('verification-documents').upload(path, file);
    setUploading(false);
    if (error) { toast.error(error.message); return; }
    setDocs(prev => [...prev, { type: docType, name: file.name, path }]);
    toast.success(tr('verification.documentUploaded'));
  };

  const removeDoc = async (path: string) => {
    await supabase.storage.from('verification-documents').remove([path]);
    setDocs(prev => prev.filter(d => d.path !== path));
  };

  const submit = async () => {
    if (!userId) return;
    if (docs.length === 0 && !links.trim()) {
      toast.error(tr('verification.addAtLeastOneDocumentOr'));
      return;
    }
    setSubmitting(true);
    const linksArr = links.split('\n').map(s => s.trim()).filter(Boolean);
    const { error } = await supabase.from('verification_requests').insert({
      user_id: userId,
      badge_type: badgeType,
      documents: docs as any,
      official_links: linksArr,
      notes,
      status: 'pending',
    });
    setSubmitting(false);
    if (error) { toast.error(error.message); return; }
    toast.success(tr('verification.requestSentOurTeamWillProcess'));
    setDocs([]); setLinks(''); setNotes('');
    loadHistory(userId);
  };

  const statusBadge = (s: string) => {
    const map: Record<string, { label: string; icon: any; cls: string }> = {
      pending: { label: tr('friends.pending'), icon: Clock, cls: 'bg-amber-100 text-amber-700' },
      approved: { label: tr('verification.approved'), icon: CheckCircle, cls: 'bg-emerald-100 text-emerald-700' },
      rejected: { label: tr('verification.rejected'), icon: XCircle, cls: 'bg-red-100 text-red-700' },
      info_requested: { label: tr('verification.infoRequired'), icon: AlertCircle, cls: 'bg-blue-100 text-blue-700' },
    };
    const m = map[s] || map.pending;
    const Icon = m.icon;
    return <Badge className={`${m.cls} gap-1`}><Icon className="h-3 w-3" />{m.label}</Badge>;
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-3xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Shield className="h-7 w-7 text-primary" />
          {tr('verification.requestVerification')}
        </h1>
        <p className="text-muted-foreground mt-1">
          {tr('verification.getAVerifiedBadgeToStrengthen')}
        </p>
      </div>

      <Card className="mb-6">
        <CardHeader><CardTitle>{tr('verification.newRequest')}</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>{tr('verification.badgeTypeRequested')}</Label>
            <Select value={badgeType} onValueChange={setBadgeType}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {Object.entries(BADGE_META).map(([k, m]) => (
                  <SelectItem key={k} value={k}>{m.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>{tr('verification.supportingDocuments')}</Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {DOC_TYPES.map(d => (
                <label key={d.key} className="border-2 border-dashed rounded-lg p-3 cursor-pointer hover:border-primary transition">
                  <input
                    type="file"
                    className="hidden"
                    accept=".pdf,.png,.jpg,.jpeg,.webp"
                    onChange={(e) => e.target.files?.[0] && handleUpload(d.key, e.target.files[0])}
                    disabled={uploading}
                  />
                  <div className="flex items-center gap-2 text-sm">
                    <Upload className="h-4 w-4 text-muted-foreground" />
                    <span>{d.label}</span>
                  </div>
                </label>
              ))}
            </div>
            {docs.length > 0 && (
              <div className="space-y-1 mt-2">
                {docs.map(d => (
                  <div key={d.path} className="flex items-center gap-2 p-2 bg-muted rounded text-sm">
                    <FileText className="h-4 w-4" />
                    <span className="flex-1 truncate">{DOC_TYPES.find(t => t.key === d.type)?.label} — {d.name}</span>
                    <Button size="sm" variant="ghost" onClick={() => removeDoc(d.path)}>
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <Label>{tr('verification.officialLinksOnePerLine')}</Label>
            <Textarea
              value={links}
              onChange={(e) => setLinks(e.target.value)}
              placeholder="https://federation-sportive.org/profil/xxx&#10;https://linkedin.com/in/xxx"
              rows={3}
            />
          </div>

          <div>
            <Label>{tr('verification.additionalNotesOptional')}</Label>
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} />
          </div>

          <Button onClick={submit} disabled={submitting || uploading} className="w-full">
            {submitting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Shield className="h-4 w-4 mr-2" />}
            {tr('verification.sendRequest')}
          </Button>
        </CardContent>
      </Card>

      {history.length > 0 && (
        <Card>
          <CardHeader><CardTitle>{tr('common.myRequests')}</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {history.map(h => (
              <div key={h.id} className="border rounded-lg p-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium">{BADGE_META[h.badge_type]?.label || h.badge_type}</span>
                  {statusBadge(h.status)}
                </div>
                <div className="text-xs text-muted-foreground">
                  {new Date(h.created_at).toLocaleDateString(localeTag())} · {(h.documents as any[])?.length || 0} {tr('verification.documentS')}
                </div>
                {h.admin_notes && (
                  <div className="mt-2 text-sm p-2 bg-muted rounded">
                    <b>{tr('verification.adminNote')}</b> {h.admin_notes}
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Verification;
