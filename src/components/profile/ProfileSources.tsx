import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/i18n/LanguageContext';
import { Globe, Plus, RefreshCw, Trash2, ExternalLink, CheckCircle, AlertCircle, Clock, Loader2, ChevronDown, ChevronUp, Send } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { SearchSelfOnlineDialog } from './SearchSelfOnlineDialog';
import ProfileImportDialog from './ProfileImportDialog';
import CvImportButton from './CvImportButton';
import { normalizeExtracted, type ProfileImport } from '@/lib/profileImport';
import { UserCheck } from 'lucide-react';
import { tr } from '@/i18n';

interface ProfileSource {
  id: string;
  url: string;
  source_type: string;
  label: string | null;
  last_synced_at: string | null;
  extracted_data: Record<string, unknown>;
  status: string;
  error_message: string | null;
  auto_sync: boolean;
  created_at: string;
}

interface ProfileSourcesProps {
  userId: string;
  onDataExtracted?: (sourceId: string, data: Record<string, unknown>) => void;
  /** Called after extracted data was copied into the profile */
  onApplied?: () => void;
}

const sourceTypeLabels: Record<string, Record<string, string>> = {
  social: { en: 'Social Network', fr: tr('profileSources.socialNetwork'), ru: tr('profileSources.socialNetwork2') },
  portfolio: { en: 'Portfolio', fr: 'Portfolio', ru: tr('common.portfolio') },
  sports_db: { en: 'Sports Platform', fr: 'Plateforme sportive', ru: tr('profileSources.sportsPlatform') },
  other: { en: 'Other', fr: 'Autre', ru: tr('profile.other') },
};

const statusConfig: Record<string, { icon: React.ReactNode; color: string }> = {
  pending: { icon: <Clock className="h-3 w-3" />, color: 'bg-yellow-500/20 text-yellow-600' },
  syncing: { icon: <Loader2 className="h-3 w-3 animate-spin" />, color: 'bg-blue-500/20 text-blue-600' },
  synced: { icon: <CheckCircle className="h-3 w-3" />, color: 'bg-green-500/20 text-green-600' },
  error: { icon: <AlertCircle className="h-3 w-3" />, color: 'bg-red-500/20 text-red-600' },
};

export const ProfileSources: React.FC<ProfileSourcesProps> = ({ userId, onDataExtracted, onApplied }) => {
  const { t, language } = useLanguage();
  const { toast } = useToast();
  const [sources, setSources] = useState<ProfileSource[]>([]);
  // Extracted data being reviewed before it is copied into the profile
  const [importing, setImporting] = useState<{ proposal: ProfileImport; label: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [newUrl, setNewUrl] = useState('');
  const [newType, setNewType] = useState('other');
  const [newLabel, setNewLabel] = useState('');
  const [adding, setAdding] = useState(false);
  const [syncingIds, setSyncingIds] = useState<Set<string>>(new Set());
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  const lang = language as 'en' | 'fr' | 'ru';

  useEffect(() => {
    fetchSources();
  }, [userId]);

  const fetchSources = async () => {
    const { data, error } = await supabase
      .from('profile_sources')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setSources(data as unknown as ProfileSource[]);
    }
    setLoading(false);
  };

  const handleAddSource = async () => {
    if (!newUrl.trim()) return;

    try {
      new URL(newUrl);
    } catch {
      toast({ title: lang === 'ru' ? tr('settings.error') : tr('settings.error'), description: lang === 'ru' ? tr('tv.invalidLink') : tr('profileSources.enterAValidUrl'), variant: 'destructive' });
      return;
    }

    setAdding(true);
    const { data, error } = await supabase
      .from('profile_sources')
      .insert({
        user_id: userId,
        url: newUrl.trim(),
        source_type: newType,
        label: newLabel.trim() || null,
      })
      .select()
      .single();

    if (error) {
      toast({ title: lang === 'ru' ? tr('settings.error') : tr('settings.error'), description: error.message, variant: 'destructive' });
    } else if (data) {
      setSources(prev => [data as unknown as ProfileSource, ...prev]);
      setNewUrl('');
      setNewLabel('');
      setNewType('other');
      setShowAddForm(false);
      toast({ title: lang === 'ru' ? tr('profileSources.sourceAdded') : lang === 'fr' ? tr('profileSources.sourceAdded2') : tr('profileSources.sourceAdded3') });
      // Auto-sync new source
      handleSync(data.id);
    }
    setAdding(false);
  };

  const handleSync = async (sourceId: string) => {
    setSyncingIds(prev => new Set(prev).add(sourceId));
    setSources(prev => prev.map(s => s.id === sourceId ? { ...s, status: 'syncing' } : s));

    try {
      const { data, error } = await supabase.functions.invoke('scrape-profile', {
        body: { source_id: sourceId },
      });

      if (error) throw error;

      if (data?.success) {
        toast({ title: lang === 'ru' ? tr('profileSources.dataUpdated') : lang === 'fr' ? tr('profileSources.dataUpdated2') : tr('profileSources.dataUpdated3') });
        onDataExtracted?.(sourceId, data.data);
      } else {
        toast({ title: lang === 'ru' ? tr('settings.error') : tr('settings.error'), description: data?.error, variant: 'destructive' });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      toast({ title: lang === 'ru' ? tr('common.syncError') : tr('profileSources.syncError'), description: msg, variant: 'destructive' });
    } finally {
      setSyncingIds(prev => { const n = new Set(prev); n.delete(sourceId); return n; });
      fetchSources();
    }
  };

  const handleSyncAll = async () => {
    for (const source of sources) {
      await handleSync(source.id);
    }
  };

  const handleDelete = async (sourceId: string) => {
    const { error } = await supabase
      .from('profile_sources')
      .delete()
      .eq('id', sourceId);

    if (!error) {
      setSources(prev => prev.filter(s => s.id !== sourceId));
      toast({ title: lang === 'ru' ? tr('profileSources.sourceDeleted') : lang === 'fr' ? tr('profileSources.sourceDeleted2') : tr('profileSources.sourceDeleted3') });
    }
  };

  const handleToggleAutoSync = async (sourceId: string, value: boolean) => {
    await supabase.from('profile_sources').update({ auto_sync: value }).eq('id', sourceId);
    setSources(prev => prev.map(s => s.id === sourceId ? { ...s, auto_sync: value } : s));
  };

  const [publishingId, setPublishingId] = useState<string | null>(null);

  const handleCreatePost = async (source: ProfileSource) => {
    const data = source.extracted_data || {};
    const parts: string[] = [];
    if (data.name) parts.push(String(data.name));
    if (data.bio) parts.push(String(data.bio));
    if (!parts.length && (data as any).raw_text) parts.push(String((data as any).raw_text).slice(0, 500));
    const achievements = Array.isArray((data as any).achievements) ? (data as any).achievements : [];
    if (achievements.length) {
      parts.push('\n🏆 ' + achievements.slice(0, 3).map((a: any) => a.title || a).filter(Boolean).join(' • '));
    }
    parts.push(`\n🔗 ${source.url}`);
    const content = parts.join('\n').trim();

    if (!content) {
      toast({ title: lang === 'ru' ? tr('common.noData') : lang === 'fr' ? tr('profileSources.noData') : tr('profileSources.noData2'), variant: 'destructive' });
      return;
    }

    const photos = Array.isArray((data as any).photos) ? (data as any).photos.filter((p: any) => typeof p === 'string').slice(0, 6) : [];

    setPublishingId(source.id);
    const { error } = await supabase.from('posts').insert({
      user_id: userId,
      content,
      media_urls: photos.length ? photos : null,
      visibility: 'public',
      is_published: true,
      status: 'published',
    });
    setPublishingId(null);

    if (error) {
      toast({ title: lang === 'ru' ? tr('settings.error') : tr('settings.error'), description: error.message, variant: 'destructive' });
    } else {
      toast({ title: lang === 'ru' ? tr('profileSources.postCreated') : lang === 'fr' ? tr('profileSources.postCreated2') : tr('profileSources.postCreated3') });
    }
  };

  const labels = {
    title: { en: 'External Sources', fr: 'Sources externes', ru: tr('profile.externalSources') },
    desc: { en: tr('profileSources.addLinksToAutoFillYour'), fr: tr('profileSources.addLinksToAutoFillYour2'), ru: tr('profileSources.addLinksToAutoFillYour3') },
    addSource: { en: 'Add Source', fr: tr('profileSources.addASource'), ru: tr('profileSources.addASource2') },
    syncAll: { en: 'Sync All', fr: 'Tout synchroniser', ru: tr('profileSources.refreshAll') },
    urlPlaceholder: { en: 'https://example.com/profile', fr: 'https://exemple.com/profil', ru: 'https://example.com/profile' },
    labelPlaceholder: { en: 'Label (optional)', fr: tr('myNetworksManager.labelOptional'), ru: tr('myNetworksManager.labelOptional') },
    autoSync: { en: 'Auto-sync', fr: 'Sync auto', ru: tr('profileSources.autoRefresh') },
    lastSynced: { en: 'Last synced', fr: tr('profileSources.lastSync'), ru: tr('profileSources.lastSync2') },
    noSources: { en: tr('profileSources.noSourcesAddedYet'), fr: tr('profileSources.noSourcesAddedYet2'), ru: tr('profileSources.noSourcesAddedYet3') },
    extractedData: { en: 'Extracted Data', fr: tr('profileSources.extractedData'), ru: tr('profileSources.extractedData2') },
    delete: { en: 'Delete', fr: 'Supprimer', ru: tr('common.delete') },
    confirmDelete: { en: tr('profileSettings.areYouSure'), fr: tr('profileSettings.areYouSure'), ru: tr('profileSettings.areYouSure') },
    confirmDeleteDesc: { en: tr('profileSources.thisSourceAndItsDataWill'), fr: tr('profileSources.thisSourceAndItsDataWill2'), ru: tr('profileSources.thisSourceAndItsDataWill3') },
    cancel: { en: 'Cancel', fr: 'Annuler', ru: tr('common.cancel') },
  };

  const l = (key: keyof typeof labels) => labels[key][lang] || labels[key].en;

  if (loading) {
    return <Card><CardContent className="p-6 flex justify-center"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></CardContent></Card>;
  }

  return (
    <>
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Globe className="h-4 w-4" /> {l('title')}
            </CardTitle>
            <CardDescription className="text-xs mt-1">{l('desc')}</CardDescription>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <SearchSelfOnlineDialog userId={userId} onAdded={fetchSources} />
            <CvImportButton userId={userId} onApplied={onApplied} />
            {sources.length > 0 && (
              <Button variant="outline" size="sm" onClick={handleSyncAll} disabled={syncingIds.size > 0}>
                <RefreshCw className={`h-3 w-3 mr-1 ${syncingIds.size > 0 ? 'animate-spin' : ''}`} />
                {l('syncAll')}
              </Button>
            )}
            <Button size="sm" onClick={() => setShowAddForm(!showAddForm)}>
              <Plus className="h-3 w-3 mr-1" /> {l('addSource')}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Add form */}
        {showAddForm && (
          <div className="p-3 rounded-lg border bg-muted/30 space-y-3">
            <Input
              placeholder={l('urlPlaceholder')}
              value={newUrl}
              onChange={e => setNewUrl(e.target.value)}
            />
            <div className="flex gap-2">
              <Select value={newType} onValueChange={setNewType}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(sourceTypeLabels).map(([key, labels]) => (
                    <SelectItem key={key} value={key}>{labels[lang] || labels.en}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                placeholder={l('labelPlaceholder')}
                value={newLabel}
                onChange={e => setNewLabel(e.target.value)}
                className="flex-1"
              />
            </div>
            <Button onClick={handleAddSource} disabled={adding || !newUrl.trim()} className="w-full">
              {adding ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
              {l('addSource')}
            </Button>
          </div>
        )}

        {/* Sources list */}
        {sources.length === 0 && !showAddForm ? (
          <p className="text-sm text-muted-foreground text-center py-4">{l('noSources')}</p>
        ) : (
          <div className="space-y-2">
            {sources.map(source => {
              const st = statusConfig[source.status] || statusConfig.pending;
              const isSyncing = syncingIds.has(source.id);
              const isExpanded = expandedId === source.id;
              const hasData = source.extracted_data && Object.keys(source.extracted_data).length > 0;

              return (
                <div key={source.id} className="rounded-lg border p-3 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <Badge variant="outline" className={`text-[10px] shrink-0 ${st.color}`}>
                        {st.icon} <span className="ml-1">{source.status}</span>
                      </Badge>
                      <span className="text-sm font-medium truncate">
                        {source.label || new URL(source.url).hostname}
                      </span>
                      <Badge variant="secondary" className="text-[10px] shrink-0">
                        {(sourceTypeLabels[source.source_type] || sourceTypeLabels.other)[lang] || source.source_type}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <Button variant="ghost" size="icon" className="h-7 w-7" asChild>
                        <a href={source.url} target="_blank" rel="noopener noreferrer"><ExternalLink className="h-3 w-3" /></a>
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleSync(source.id)} disabled={isSyncing}>
                        <RefreshCw className={`h-3 w-3 ${isSyncing ? 'animate-spin' : ''}`} />
                      </Button>
                      {hasData && (
                        <Button variant="ghost" size="icon" className="h-7 w-7" title={lang === 'ru' ? tr('profileSources.createPost') : lang === 'fr' ? tr('post.create') : tr('profileSources.createPost2')} onClick={() => handleCreatePost(source)} disabled={publishingId === source.id}>
                          {publishingId === source.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Send className="h-3 w-3" />}
                        </Button>
                      )}
                      {hasData && (
                        <Button
                          variant="ghost" size="icon" className="h-7 w-7 text-primary"
                          title={tr('profileImport.applyToProfile')} aria-label={tr('profileImport.applyToProfile')}
                          onClick={() => setImporting({ proposal: normalizeExtracted(source.extracted_data), label: source.label || new URL(source.url).hostname })}
                        >
                          <UserCheck className="h-3 w-3" />
                        </Button>
                      )}
                      {hasData && (
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setExpandedId(isExpanded ? null : source.id)}>
                          {isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                        </Button>
                      )}
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive"><Trash2 className="h-3 w-3" /></Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>{l('confirmDelete')}</AlertDialogTitle>
                            <AlertDialogDescription>{l('confirmDeleteDesc')}</AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>{l('cancel')}</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(source.id)} className="bg-destructive text-destructive-foreground">{l('delete')}</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                    <span className="truncate">{source.url}</span>
                    <div className="flex items-center gap-3 shrink-0">
                      {source.last_synced_at && (
                        <span>{l('lastSynced')}: {new Date(source.last_synced_at).toLocaleDateString(lang === 'ru' ? 'ru-RU' : lang === 'fr' ? 'fr-FR' : 'en-US')}</span>
                      )}
                      <div className="flex items-center gap-1">
                        <span>{l('autoSync')}</span>
                        <Switch
                          checked={source.auto_sync}
                          onCheckedChange={v => handleToggleAutoSync(source.id, v)}
                          className="scale-75"
                        />
                      </div>
                    </div>
                  </div>

                  {source.error_message && (
                    <p className="text-[10px] text-destructive">{source.error_message}</p>
                  )}

                  {isExpanded && hasData && (
                    <div className="mt-2 p-2 rounded bg-muted/50 text-xs space-y-2">
                      <p className="font-medium text-muted-foreground">{l('extractedData')}:</p>
                      {renderExtractedData(source.extracted_data)}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
    <ProfileImportDialog
      userId={userId}
      proposal={importing?.proposal ?? null}
      sourceLabel={importing?.label}
      onClose={() => setImporting(null)}
      onApplied={onApplied}
    />
    </>
  );
};

function renderExtractedData(data: Record<string, unknown>) {
  const entries = Object.entries(data).filter(([_, v]) => v !== null && v !== undefined && v !== '');

  return (
    <div className="space-y-1.5">
      {entries.map(([key, value]) => (
        <div key={key}>
          <span className="font-medium capitalize">{key.replace(/_/g, ' ')}: </span>
          {typeof value === 'string' ? (
            <span>{value}</span>
          ) : Array.isArray(value) ? (
            <div className="ml-2">
              {value.map((item, i) => (
                <div key={i} className="text-muted-foreground">
                  • {typeof item === 'object' ? JSON.stringify(item) : String(item)}
                </div>
              ))}
            </div>
          ) : typeof value === 'object' ? (
            <div className="ml-2">
              {Object.entries(value as Record<string, unknown>).map(([k, v]) => (
                <div key={k} className="text-muted-foreground">{k}: {String(v)}</div>
              ))}
            </div>
          ) : (
            <span>{String(value)}</span>
          )}
        </div>
      ))}
    </div>
  );
}

export default ProfileSources;
