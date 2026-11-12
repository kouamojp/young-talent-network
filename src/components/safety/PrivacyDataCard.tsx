import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Ban, Download, FileText, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/components/ui/use-toast';
import { useBlocks } from '@/hooks/useBlocks';
import { LEGAL_LINKS } from '@/pages/Legal';

interface BlockedProfile { id: string; name: string; avatar_url: string | null }

/** Paramètres → Confidentialité : export RGPD, membres bloqués, documents légaux. */
const PrivacyDataCard: React.FC = () => {
  const { blockedIds, unblock, loading } = useBlocks();
  const [blockedProfiles, setBlockedProfiles] = useState<BlockedProfile[]>([]);
  const [exporting, setExporting] = useState(false);

  const blockedKey = [...blockedIds].sort().join(',');
  useEffect(() => {
    const ids = blockedKey ? blockedKey.split(',') : [];
    if (ids.length === 0) { setBlockedProfiles([]); return; }
    supabase.from('profiles').select('id, name, avatar_url').in('id', ids).then(({ data }) => setBlockedProfiles((data as BlockedProfile[]) || []));
  }, [blockedKey]);

  const exportData = async () => {
    setExporting(true);
    const { data, error } = await (supabase.rpc as any)('export_my_data');
    setExporting(false);
    if (error) { toast({ title: 'Export impossible', description: error.message, variant: 'destructive' }); return; }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `yat-mes-donnees-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    toast({ title: 'Export téléchargé', description: 'Le fichier JSON contient votre profil et tout ce que vous avez publié.' });
  };

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle className="text-lg">Mes données et ma sécurité</CardTitle>
        <CardDescription>Vos droits sur vos données personnelles et les membres que vous avez bloqués.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium">Télécharger mes données</p>
            <p className="text-xs text-muted-foreground">Une copie de votre profil, vos publications, messages envoyés, médias et activité, au format JSON.</p>
          </div>
          <Button variant="outline" size="sm" className="gap-2 shrink-0" onClick={exportData} disabled={exporting}>
            {exporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
            Télécharger
          </Button>
        </div>

        <Separator />

        <div className="space-y-3">
          <p className="text-sm font-medium flex items-center gap-2"><Ban className="h-4 w-4" /> Membres bloqués</p>
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          ) : blockedProfiles.length === 0 ? (
            <p className="text-xs text-muted-foreground">Vous n'avez bloqué personne. Pour bloquer un membre, ouvrez son profil ou votre conversation avec lui.</p>
          ) : (
            <ul className="divide-y divide-border rounded-lg border border-border">
              {blockedProfiles.map(p => (
                <li key={p.id} className="flex items-center gap-3 p-2.5">
                  <Avatar className="h-8 w-8"><AvatarImage src={p.avatar_url || ''} /><AvatarFallback>{p.name?.charAt(0)}</AvatarFallback></Avatar>
                  <span className="flex-1 truncate text-sm">{p.name}</span>
                  <Button variant="ghost" size="sm" onClick={() => unblock(p.id, p.name)}>Débloquer</Button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <Separator />

        <div className="space-y-2">
          <p className="text-sm font-medium flex items-center gap-2"><FileText className="h-4 w-4" /> Documents légaux</p>
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
            {LEGAL_LINKS.map(l => <Link key={l.slug} to={`/legal/${l.slug}`} className="text-primary hover:underline">{l.label}</Link>)}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PrivacyDataCard;
