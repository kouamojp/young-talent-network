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
}

const sourceTypeLabels: Record<string, Record<string, string>> = {
  social: { en: 'Social Network', fr: 'Réseau social', ru: 'Соцсеть' },
  portfolio: { en: 'Portfolio', fr: 'Portfolio', ru: 'Портфолио' },
  sports_db: { en: 'Sports Platform', fr: 'Plateforme sportive', ru: 'Спортивная платформа' },
  other: { en: 'Other', fr: 'Autre', ru: 'Другое' },
};

const statusConfig: Record<string, { icon: React.ReactNode; color: string }> = {
  pending: { icon: <Clock className="h-3 w-3" />, color: 'bg-yellow-500/20 text-yellow-600' },
  syncing: { icon: <Loader2 className="h-3 w-3 animate-spin" />, color: 'bg-blue-500/20 text-blue-600' },
  synced: { icon: <CheckCircle className="h-3 w-3" />, color: 'bg-green-500/20 text-green-600' },
  error: { icon: <AlertCircle className="h-3 w-3" />, color: 'bg-red-500/20 text-red-600' },
};

export const ProfileSources: React.FC<ProfileSourcesProps> = ({ userId, onDataExtracted }) => {
  const { t, language } = useLanguage();
  const { toast } = useToast();
  const [sources, setSources] = useState<ProfileSource[]>([]);
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
      toast({ title: lang === 'ru' ? 'Ошибка' : 'Error', description: lang === 'ru' ? 'Введите корректный URL' : 'Enter a valid URL', variant: 'destructive' });
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
      toast({ title: lang === 'ru' ? 'Ошибка' : 'Error', description: error.message, variant: 'destructive' });
    } else if (data) {
      setSources(prev => [data as unknown as ProfileSource, ...prev]);
      setNewUrl('');
      setNewLabel('');
      setNewType('other');
      setShowAddForm(false);
      toast({ title: lang === 'ru' ? 'Источник добавлен' : lang === 'fr' ? 'Source ajoutée' : 'Source added' });
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
        toast({ title: lang === 'ru' ? 'Данные обновлены' : lang === 'fr' ? 'Données mises à jour' : 'Data updated' });
        onDataExtracted?.(sourceId, data.data);
      } else {
        toast({ title: lang === 'ru' ? 'Ошибка' : 'Error', description: data?.error, variant: 'destructive' });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      toast({ title: lang === 'ru' ? 'Ошибка синхронизации' : 'Sync error', description: msg, variant: 'destructive' });
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
      toast({ title: lang === 'ru' ? 'Источник удалён' : lang === 'fr' ? 'Source supprimée' : 'Source deleted' });
    }
  };

  const handleToggleAutoSync = async (sourceId: string, value: boolean) => {
    await supabase.from('profile_sources').update({ auto_sync: value }).eq('id', sourceId);
    setSources(prev => prev.map(s => s.id === sourceId ? { ...s, auto_sync: value } : s));
  };

  const labels = {
    title: { en: 'External Sources', fr: 'Sources externes', ru: 'Внешние источники' },
    desc: { en: 'Add links to auto-fill your profile from external platforms', fr: 'Ajoutez des liens pour remplir automatiquement votre profil', ru: 'Добавьте ссылки для автозаполнения профиля с внешних платформ' },
    addSource: { en: 'Add Source', fr: 'Ajouter une source', ru: 'Добавить источник' },
    syncAll: { en: 'Sync All', fr: 'Tout synchroniser', ru: 'Обновить всё' },
    urlPlaceholder: { en: 'https://example.com/profile', fr: 'https://exemple.com/profil', ru: 'https://example.com/profile' },
    labelPlaceholder: { en: 'Label (optional)', fr: 'Libellé (optionnel)', ru: 'Название (необязательно)' },
    autoSync: { en: 'Auto-sync', fr: 'Sync auto', ru: 'Авто-обновление' },
    lastSynced: { en: 'Last synced', fr: 'Dernière sync', ru: 'Посл. обновление' },
    noSources: { en: 'No sources added yet', fr: 'Aucune source ajoutée', ru: 'Источники не добавлены' },
    extractedData: { en: 'Extracted Data', fr: 'Données extraites', ru: 'Извлечённые данные' },
    delete: { en: 'Delete', fr: 'Supprimer', ru: 'Удалить' },
    confirmDelete: { en: 'Are you sure?', fr: 'Êtes-vous sûr ?', ru: 'Вы уверены?' },
    confirmDeleteDesc: { en: 'This source and its data will be removed.', fr: 'Cette source et ses données seront supprimées.', ru: 'Этот источник и его данные будут удалены.' },
    cancel: { en: 'Cancel', fr: 'Annuler', ru: 'Отмена' },
  };

  const l = (key: keyof typeof labels) => labels[key][lang] || labels[key].en;

  if (loading) {
    return <Card><CardContent className="p-6 flex justify-center"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></CardContent></Card>;
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Globe className="h-4 w-4" /> {l('title')}
            </CardTitle>
            <CardDescription className="text-xs mt-1">{l('desc')}</CardDescription>
          </div>
          <div className="flex items-center gap-2">
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
