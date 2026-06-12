import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import {
  Youtube, Instagram, Facebook, Linkedin, Globe, Plus, Trash2, ExternalLink,
  RefreshCw, Loader2, Rss, Send,
} from 'lucide-react';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface MyNetworksManagerProps {
  userId: string;
}

interface NetworkSource {
  id: string;
  url: string;
  platform: string | null;
  label: string | null;
  auto_import_posts: boolean;
  last_import_at: string | null;
  status: string;
  error_message: string | null;
}

const PLATFORMS = [
  { value: 'youtube',   label: 'YouTube',   icon: <Youtube className="h-4 w-4 text-red-600" /> },
  { value: 'tiktok',    label: 'TikTok',    icon: <Globe className="h-4 w-4" /> },
  { value: 'instagram', label: 'Instagram', icon: <Instagram className="h-4 w-4 text-pink-500" /> },
  { value: 'x',         label: 'X (Twitter)', icon: <Globe className="h-4 w-4" /> },
  { value: 'facebook',  label: 'Facebook',  icon: <Facebook className="h-4 w-4 text-blue-600" /> },
  { value: 'linkedin',  label: 'LinkedIn',  icon: <Linkedin className="h-4 w-4 text-blue-700" /> },
  { value: 'telegram',  label: 'Telegram',  icon: <Send className="h-4 w-4 text-sky-500" /> },
  { value: 'vk',        label: 'VK',        icon: <Globe className="h-4 w-4 text-blue-500" /> },
  { value: 'rss',       label: 'RSS / Atom', icon: <Rss className="h-4 w-4 text-orange-500" /> },
  { value: 'web',       label: 'Autre site web', icon: <Globe className="h-4 w-4" /> },
];

function detectPlatform(url: string): string {
  const u = url.toLowerCase();
  if (u.includes('youtube.com') || u.includes('youtu.be')) return 'youtube';
  if (u.includes('tiktok.com')) return 'tiktok';
  if (u.includes('instagram.com')) return 'instagram';
  if (u.includes('twitter.com') || u.includes('x.com')) return 'x';
  if (u.includes('facebook.com')) return 'facebook';
  if (u.includes('linkedin.com')) return 'linkedin';
  if (u.endsWith('.xml') || u.includes('/rss') || u.includes('/feed')) return 'rss';
  return 'web';
}

const platformMeta = (p: string | null) =>
  PLATFORMS.find(x => x.value === (p || 'web')) || PLATFORMS[PLATFORMS.length - 1];

export const MyNetworksManager: React.FC<MyNetworksManagerProps> = ({ userId }) => {
  const { toast } = useToast();
  const [sources, setSources] = useState<NetworkSource[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [newUrl, setNewUrl] = useState('');
  const [newPlatform, setNewPlatform] = useState('youtube');
  const [newLabel, setNewLabel] = useState('');
  const [adding, setAdding] = useState(false);
  const [importingIds, setImportingIds] = useState<Set<string>>(new Set());

  useEffect(() => { load(); }, [userId]);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('profile_sources')
      .select('id, url, platform, label, auto_import_posts, last_import_at, status, error_message')
      .eq('user_id', userId)
      .eq('source_type', 'social')
      .order('created_at', { ascending: false });
    setSources((data as any) || []);
    setLoading(false);
  };

  const handleAdd = async () => {
    if (!newUrl.trim()) return;
    try { new URL(newUrl); } catch {
      toast({ title: 'URL invalide', variant: 'destructive' }); return;
    }
    setAdding(true);
    const platform = newPlatform || detectPlatform(newUrl);
    const { error } = await supabase.from('profile_sources').insert({
      user_id: userId,
      url: newUrl.trim(),
      source_type: 'social',
      platform,
      label: newLabel.trim() || null,
      auto_import_posts: true,
    });
    setAdding(false);
    if (error) {
      toast({ title: 'Erreur', description: error.message, variant: 'destructive' });
    } else {
      setNewUrl(''); setNewLabel(''); setShowAdd(false);
      toast({ title: 'Chaîne ajoutée' });
      await load();
    }
  };

  const handleDelete = async (id: string) => {
    await supabase.from('profile_sources').delete().eq('id', id);
    setSources(prev => prev.filter(s => s.id !== id));
    toast({ title: 'Chaîne supprimée' });
  };

  const handleToggleAuto = async (id: string, value: boolean) => {
    setSources(prev => prev.map(s => s.id === id ? { ...s, auto_import_posts: value } : s));
    await supabase.from('profile_sources').update({ auto_import_posts: value }).eq('id', id);
  };

  const handleImportNow = async (id: string) => {
    setImportingIds(prev => new Set(prev).add(id));
    try {
      const { data, error } = await supabase.functions.invoke('import-social-feed', {
        body: { source_id: id },
      });
      if (error) throw error;
      const result = data?.results?.[0];
      toast({
        title: result?.imported ? `${result.imported} publication(s) importée(s)` : 'Aucune nouvelle publication',
        description: result ? `${result.found} élément(s) détecté(s)` : undefined,
      });
      await load();
    } catch (e: any) {
      toast({ title: 'Erreur d\'import', description: e?.message || 'Inconnue', variant: 'destructive' });
    } finally {
      setImportingIds(prev => { const n = new Set(prev); n.delete(id); return n; });
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div>
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Rss className="h-4 w-4" /> Mes réseaux
            </CardTitle>
            <CardDescription className="text-xs mt-1">
              Connectez vos chaînes externes. Les nouvelles publications seront automatiquement republiées dans votre fil.
            </CardDescription>
          </div>
          <Button size="sm" onClick={() => setShowAdd(!showAdd)}>
            <Plus className="h-3 w-3 mr-1" /> Ajouter une chaîne
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {showAdd && (
          <div className="p-3 rounded-lg border bg-muted/30 space-y-2">
            <div className="flex gap-2">
              <Select value={newPlatform} onValueChange={setNewPlatform}>
                <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {PLATFORMS.map(p => (
                    <SelectItem key={p.value} value={p.value}>
                      <span className="flex items-center gap-2">{p.icon}{p.label}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                placeholder="https://youtube.com/@machaine"
                value={newUrl}
                onChange={e => {
                  setNewUrl(e.target.value);
                  if (e.target.value) setNewPlatform(detectPlatform(e.target.value));
                }}
                className="flex-1"
              />
            </div>
            <Input
              placeholder="Libellé (optionnel)"
              value={newLabel}
              onChange={e => setNewLabel(e.target.value)}
            />
            <Button onClick={handleAdd} disabled={adding || !newUrl.trim()} className="w-full">
              {adding ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
              Ajouter
            </Button>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-4">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : sources.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            Aucune chaîne connectée. Ajoutez YouTube, TikTok, Instagram, X…
          </p>
        ) : (
          <div className="space-y-2">
            {sources.map(s => {
              const meta = platformMeta(s.platform);
              const isImporting = importingIds.has(s.id);
              return (
                <div key={s.id} className="rounded-lg border p-3 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <span className="shrink-0">{meta.icon}</span>
                      <span className="text-sm font-medium truncate">
                        {s.label || meta.label}
                      </span>
                      <Badge variant="secondary" className="text-[10px] shrink-0 capitalize">
                        {s.platform || 'web'}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <Button variant="ghost" size="icon" className="h-7 w-7" asChild>
                        <a href={s.url} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        title="Importer maintenant"
                        onClick={() => handleImportNow(s.id)}
                        disabled={isImporting}
                      >
                        {isImporting
                          ? <Loader2 className="h-3 w-3 animate-spin" />
                          : <RefreshCw className="h-3 w-3" />}
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive">
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Supprimer cette chaîne ?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Les publications déjà importées resteront dans votre fil.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Annuler</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(s.id)}
                              className="bg-destructive text-destructive-foreground"
                            >
                              Supprimer
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                  <div className="flex items-center justify-between gap-3 text-[10px] text-muted-foreground">
                    <span className="truncate">{s.url}</span>
                    <div className="flex items-center gap-3 shrink-0">
                      {s.last_import_at && (
                        <span>Dernier import : {new Date(s.last_import_at).toLocaleDateString('fr-FR')}</span>
                      )}
                      <div className="flex items-center gap-1">
                        <span>Auto</span>
                        <Switch
                          checked={s.auto_import_posts}
                          onCheckedChange={v => handleToggleAuto(s.id, v)}
                          className="scale-75"
                        />
                      </div>
                    </div>
                  </div>
                  {s.error_message && (
                    <p className="text-[10px] text-destructive">{s.error_message}</p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MyNetworksManager;
