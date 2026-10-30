import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Radio, Video, Link, Plus, Users, Trash2, Tv } from 'lucide-react';
import { useLanguage } from '@/i18n/LanguageContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Textarea } from '@/components/ui/textarea';
import ShareToFriendsDialog from '@/components/share/ShareToFriendsDialog';
import { supabase } from '@/integrations/supabase/client';

interface Stream {
  id: string;
  title: string;
  category: string | null;
  thumbnail_url: string | null;
  viewer_count: number | null;
  started_at: string | null;
  ended_at: string | null;
  streamer: { name: string | null } | null;
}

const StreamCard: React.FC<{ stream: Stream; live: boolean; onOpen: () => void; liveLabel: string; watching: string }> = ({ stream, live, onOpen, liveLabel, watching }) => (
  <button type="button" onClick={onOpen} className="text-left rounded-xl border border-border bg-card overflow-hidden hover:border-primary/40 transition-colors">
    <div className="relative aspect-video bg-stage">
      {stream.thumbnail_url && <img src={stream.thumbnail_url} alt="" className="h-full w-full object-cover" />}
      {live && <span className="absolute top-2 left-2 rounded-full bg-destructive px-2 py-0.5 text-xs font-semibold text-white">{liveLabel}</span>}
      {live && (
        <span className="absolute bottom-2 right-2 rounded-full bg-black/70 px-2 py-0.5 text-xs text-white tabular-nums">
          {(stream.viewer_count ?? 0).toLocaleString()} {watching}
        </span>
      )}
    </div>
    <div className="p-3 min-w-0">
      <h3 className="font-semibold truncate">{stream.title}</h3>
      <p className="text-sm text-muted-foreground truncate">
        {stream.streamer?.name}
        {!live && stream.ended_at && ` · ${new Date(stream.ended_at).toLocaleDateString()}`}
      </p>
      {stream.category && <span className="mt-2 inline-block rounded-full bg-accent px-2 py-0.5 text-xs text-accent-foreground">{stream.category}</span>}
    </div>
  </button>
);

const OnlineTV: React.FC = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [liveStreams, setLiveStreams] = useState<Stream[]>([]);
  const [recordings, setRecordings] = useState<Stream[]>([]);
  const [tvLink, setTvLink] = useState('');
  const [tvTitle, setTvTitle] = useState('');
  const [tvDescription, setTvDescription] = useState('');
  const [addedLinks, setAddedLinks] = useState<{ url: string; title: string; description: string }[]>([]);

  useEffect(() => {
    const select = 'id, title, category, thumbnail_url, viewer_count, started_at, ended_at, streamer:profiles!live_streams_streamer_id_fkey(name)';
    Promise.all([
      supabase.from('live_streams').select(select).eq('is_live', true).order('viewer_count', { ascending: false }).limit(12),
      supabase.from('live_streams').select(select).eq('is_live', false).not('ended_at', 'is', null).order('ended_at', { ascending: false }).limit(12),
    ]).then(([live, ended]) => {
      setLiveStreams((live.data as Stream[] | null) ?? []);
      setRecordings((ended.data as Stream[] | null) ?? []);
      setLoading(false);
    });
  }, []);

  const handleAddLink = () => {
    if (!tvLink.trim()) return;
    try {
      new URL(tvLink);
      setAddedLinks(prev => [...prev, { url: tvLink.trim(), title: tvTitle.trim() || tvLink.trim(), description: tvDescription.trim() }]);
      setTvLink('');
      setTvTitle('');
      setTvDescription('');
      toast.success(t('tv.linkAdded'));
    } catch {
      toast.error(t('tv.invalidLink'));
    }
  };

  const removeLink = (i: number) => setAddedLinks(prev => prev.filter((_, idx) => idx !== i));

  const renderList = (streams: Stream[], live: boolean, empty: string) => {
    if (loading) return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;
    if (streams.length === 0) {
      return (
        <div className="rounded-xl border border-dashed border-border p-10 text-center">
          <p className="text-sm text-muted-foreground">{empty}</p>
          <Button className="mt-4" variant="outline" onClick={() => navigate('/live')}>
            <Radio className="h-4 w-4" />YAT Live
          </Button>
        </div>
      );
    }
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {streams.map(stream => (
          <StreamCard key={stream.id} stream={stream} live={live} onOpen={() => navigate('/live')} liveLabel={t('tv.liveLabel')} watching={t('tv.watching')} />
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen">
      <main className="max-w-5xl mx-auto px-4 py-6 md:py-8 space-y-8">
        <header>
          <h1 className="flex items-center gap-2 text-2xl md:text-3xl font-semibold"><Tv className="h-7 w-7 text-primary" />{t('tv.title')}</h1>
        </header>

        <Tabs defaultValue="live">
          <TabsList className="mb-6">
            <TabsTrigger value="live" className="gap-2"><Radio className="h-4 w-4" />{t('tv.liveNow')}</TabsTrigger>
            <TabsTrigger value="recordings" className="gap-2"><Video className="h-4 w-4" />{t('tv.recordings')}</TabsTrigger>
          </TabsList>
          <TabsContent value="live">{renderList(liveStreams, true, 'Aucune diffusion en direct pour le moment.')}</TabsContent>
          <TabsContent value="recordings">{renderList(recordings, false, 'Aucune diffusion terminée pour le moment.')}</TabsContent>
        </Tabs>

        {/* Ajouter un lien de flux TV */}
        <section className="rounded-xl border border-border bg-card p-5">
          <h2 className="flex items-center gap-2 text-lg font-semibold mb-4">
            <Link className="h-5 w-5 text-primary" />
            {t('tv.addStreamLink')}
          </h2>
          <div className="space-y-2">
            <Input value={tvTitle} onChange={e => setTvTitle(e.target.value)} placeholder="Titre du flux (optionnel)" />
            <Input
              value={tvLink}
              onChange={e => setTvLink(e.target.value)}
              placeholder={t('tv.streamLinkPlaceholder')}
              onKeyDown={e => e.key === 'Enter' && handleAddLink()}
            />
            <Textarea value={tvDescription} onChange={e => setTvDescription(e.target.value)} placeholder="Description (optionnel)" className="min-h-[70px]" />
            <Button onClick={handleAddLink} className="w-full sm:w-auto">
              <Plus className="h-4 w-4" />
              {t('tv.addLink')}
            </Button>
          </div>

          {addedLinks.length > 0 && (
            <div className="mt-4 space-y-2">
              {addedLinks.map((link, i) => (
                <div key={i} className="flex items-start gap-3 rounded-lg bg-background p-3">
                  <Tv className="h-4 w-4 text-primary shrink-0 mt-1" />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate">{link.title}</p>
                    <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline truncate block">{link.url}</a>
                    {link.description && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{link.description}</p>}
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <ShareToFriendsDialog url={link.url} title={link.title} description={link.description}>
                      <Button size="sm" variant="outline"><Users className="h-3 w-3" />Amis</Button>
                    </ShareToFriendsDialog>
                    <Button size="icon" variant="ghost" onClick={() => removeLink(i)} aria-label="Supprimer">
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default OnlineTV;
