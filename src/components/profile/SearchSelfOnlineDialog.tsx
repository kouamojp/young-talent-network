import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/i18n/LanguageContext';
import { Search, Loader2, ExternalLink, Plus, Send } from 'lucide-react';
import { tr } from '@/i18n';

interface Suggestion {
  platform: string;
  url: string;
  label?: string;
  confidence?: string;
  reason?: string;
}

interface Props {
  userId: string;
  defaultName?: string;
  defaultCity?: string;
  defaultSport?: string;
  onAdded?: () => void;
}

export const SearchSelfOnlineDialog: React.FC<Props> = ({ userId, defaultName = '', defaultCity = '', defaultSport = '', onAdded }) => {
  const { language } = useLanguage();
  const { toast } = useToast();
  const lang = language as 'en' | 'fr' | 'ru';
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(defaultName);
  const [city, setCity] = useState(defaultCity);
  const [sport, setSport] = useState(defaultSport);
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [addingAsSource, setAddingAsSource] = useState(false);
  const [publishingFeed, setPublishingFeed] = useState(false);

  const L = {
    title: { en: tr('searchSelfOnlineDialog.findMeOnline'), fr: tr('searchSelfOnlineDialog.findMeOnline2'), ru: tr('searchSelfOnlineDialog.findMeOnline3') },
    desc: { en: 'AI will suggest where you may have public profiles. Choose which to add as a source or publish to your feed.', fr: tr('searchSelfOnlineDialog.aiSuggestsWhereYouHavePublic'), ru: tr('searchSelfOnlineDialog.aiSuggestsWhereYouHavePublic2') },
    search: { en: 'Search', fr: 'Rechercher', ru: tr('orgs.search') },
    nameLabel: { en: 'Full name', fr: 'Nom complet', ru: tr('auth.fullName') },
    cityLabel: { en: 'City (optional)', fr: 'Ville (optionnel)', ru: tr('searchSelfOnlineDialog.cityOptional') },
    sportLabel: { en: 'Specialty (optional)', fr: tr('searchSelfOnlineDialog.specialtyOptional'), ru: tr('searchSelfOnlineDialog.specialtyOptional2') },
    addSources: { en: tr('searchSelfOnlineDialog.addAsProfileSources'), fr: tr('searchSelfOnlineDialog.addAsProfileSources2'), ru: tr('searchSelfOnlineDialog.addAsProfileSources3') },
    publishFeed: { en: tr('searchSelfOnlineDialog.publishToFeed'), fr: tr('sportProfileEditor.postToFeed'), ru: tr('searchSelfOnlineDialog.publishToFeed2') },
    noResults: { en: tr('searchSelfOnlineDialog.noSuggestionsYetClickSearch'), fr: 'Aucune suggestion — cliquez Rechercher', ru: tr('searchSelfOnlineDialog.noSuggestionsYetClickSearch2') },
    selectAtLeast: { en: tr('searchSelfOnlineDialog.selectAtLeastOne'), fr: tr('searchSelfOnlineDialog.selectAtLeastOne2'), ru: tr('searchSelfOnlineDialog.selectAtLeastOne3') },
    added: { en: 'Added', fr: tr('searchSelfOnlineDialog.added'), ru: tr('searchSelfOnlineDialog.added2') },
    published: { en: 'Published', fr: tr('common.published'), ru: tr('common.published') },
  };
  const t = (k: keyof typeof L) => L[k][lang] || L[k].en;

  const handleSearch = async () => {
    if (!name.trim()) { toast({ title: t('nameLabel'), variant: 'destructive' }); return; }
    setLoading(true);
    setSuggestions([]);
    setSelected(new Set());
    try {
      const { data, error } = await supabase.functions.invoke('search-self-online', {
        body: { name, city, sport },
      });
      if (error) throw error;
      setSuggestions(data?.suggestions || []);
    } catch (e: any) {
      toast({ title: tr('settings.error'), description: e.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const toggle = (i: number) => {
    setSelected(prev => {
      const n = new Set(prev);
      n.has(i) ? n.delete(i) : n.add(i);
      return n;
    });
  };

  const getSelected = () => Array.from(selected).map(i => suggestions[i]).filter(Boolean);

  const handleAddAsSources = async () => {
    const items = getSelected();
    if (!items.length) { toast({ title: t('selectAtLeast') }); return; }
    setAddingAsSource(true);
    try {
      const rows = items.map(s => ({
        user_id: userId,
        url: s.url,
        source_type: /linkedin|facebook|instagram|twitter|tiktok|youtube/i.test(s.platform) ? 'social' : 'other',
        label: s.label || s.platform,
      }));
      const { error } = await supabase.from('profile_sources').insert(rows);
      if (error) throw error;
      toast({ title: t('added') });
      onAdded?.();
      setOpen(false);
    } catch (e: any) {
      toast({ title: tr('settings.error'), description: e.message, variant: 'destructive' });
    } finally {
      setAddingAsSource(false);
    }
  };

  const handlePublishToFeed = async () => {
    const items = getSelected();
    if (!items.length) { toast({ title: t('selectAtLeast') }); return; }
    setPublishingFeed(true);
    try {
      const content = `🌐 ${name}\n\n` + items.map(s => `• ${s.platform}: ${s.url}`).join('\n');
      const { error } = await supabase.from('posts').insert({
        user_id: userId,
        content,
        visibility: 'public',
        is_published: true,
        status: 'published',
      });
      if (error) throw error;
      toast({ title: t('published') });
      setOpen(false);
    } catch (e: any) {
      toast({ title: tr('settings.error'), description: e.message, variant: 'destructive' });
    } finally {
      setPublishingFeed(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <Search className="h-3 w-3 mr-1" /> {t('title')}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t('title')}</DialogTitle>
        </DialogHeader>
        <p className="text-xs text-muted-foreground">{t('desc')}</p>

        <div className="space-y-2">
          <Input placeholder={t('nameLabel')} value={name} onChange={e => setName(e.target.value)} />
          <div className="grid grid-cols-2 gap-2">
            <Input placeholder={t('cityLabel')} value={city} onChange={e => setCity(e.target.value)} />
            <Input placeholder={t('sportLabel')} value={sport} onChange={e => setSport(e.target.value)} />
          </div>
          <Button onClick={handleSearch} disabled={loading} className="w-full">
            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Search className="h-4 w-4 mr-2" />}
            {t('search')}
          </Button>
        </div>

        {suggestions.length === 0 && !loading && (
          <p className="text-center text-xs text-muted-foreground py-4">{t('noResults')}</p>
        )}

        {suggestions.length > 0 && (
          <div className="space-y-2 max-h-72 overflow-y-auto">
            {suggestions.map((s, i) => (
              <div key={i} className="flex items-start gap-2 p-2 border rounded-lg">
                <Checkbox checked={selected.has(i)} onCheckedChange={() => toggle(i)} className="mt-1" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium">{s.platform}</span>
                    {s.confidence && (
                      <Badge variant="outline" className="text-[10px]">{s.confidence}</Badge>
                    )}
                  </div>
                  <a href={s.url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline break-all flex items-center gap-1">
                    {s.url} <ExternalLink className="h-3 w-3 shrink-0" />
                  </a>
                  {s.reason && <p className="text-[10px] text-muted-foreground mt-0.5">{s.reason}</p>}
                </div>
              </div>
            ))}
          </div>
        )}

        {suggestions.length > 0 && (
          <div className="flex gap-2 pt-2 border-t">
            <Button variant="outline" className="flex-1" onClick={handleAddAsSources} disabled={addingAsSource || !selected.size}>
              {addingAsSource ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
              {t('addSources')}
            </Button>
            <Button className="flex-1" onClick={handlePublishToFeed} disabled={publishingFeed || !selected.size}>
              {publishingFeed ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Send className="h-4 w-4 mr-2" />}
              {t('publishFeed')}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
