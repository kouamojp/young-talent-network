import React, { useCallback, useEffect, useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Globe, Zap, Heart, Search, Video, Eye, MapPin, Radio, Filter, ChevronDown, ArrowLeft, Loader2 } from 'lucide-react';
import { countries } from '@/data/countries';
import { streamCategories } from '@/components/live/data/liveData';
import { supabase } from '@/integrations/supabase/client';
import LiveBroadcast from '@/components/live/LiveBroadcast';
import LiveWatch from '@/components/live/LiveWatch';

interface StreamCard {
  id: string;
  title: string;
  streamerName: string;
  streamerId: string;
  streamerAvatar?: string;
  thumbnail: string;
  viewers: number;
  category: string;
  location: string;
  description?: string;
}

interface ConnectionRow {
  user_id: string;
  connected_user_id: string;
  status: string | null;
}

interface StreamRow {
  id: string;
  title: string;
  description: string | null;
  category: string | null;
  thumbnail_url: string | null;
  viewer_count: number | null;
  started_at: string | null;
  streamer_id: string;
  streamer?: { id: string; name: string | null; avatar_url: string | null; country: string | null } | null;
}

const FALLBACK_THUMB = '/placeholder.svg';

const Live: React.FC = () => {
  const [activeTab, setActiveTab] = useState('live');
  const [regionFilter, setRegionFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [showBroadcast, setShowBroadcast] = useState(false);
  const [loading, setLoading] = useState(true);
  const [streams, setStreams] = useState<StreamCard[]>([]);
  const [followingIds, setFollowingIds] = useState<Set<string>>(new Set());
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [watchStream, setWatchStream] = useState<StreamCard | null>(null);

  const fetchStreams = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    setCurrentUserId(user?.id || null);

    const [streamsRes, connectionsRes] = await Promise.all([
      supabase
        .from('live_streams')
        .select('id, title, description, category, thumbnail_url, viewer_count, started_at, streamer_id, streamer:profiles!live_streams_streamer_id_fkey(id, name, avatar_url, country)')
        .eq('is_live', true)
        .order('started_at', { ascending: false }),
      user
        ? supabase.from('connections').select('user_id, connected_user_id, status').or(`user_id.eq.${user.id},connected_user_id.eq.${user.id}`).eq('status', 'accepted')
        : Promise.resolve({ data: [] as ConnectionRow[] }),
    ]);

    const mapped: StreamCard[] = ((streamsRes.data || []) as unknown as StreamRow[]).map((s) => ({
      id: s.id,
      title: s.title,
      streamerName: s.streamer?.name || 'Streamer',
      streamerId: s.streamer_id,
      streamerAvatar: s.streamer?.avatar_url || undefined,
      thumbnail: s.thumbnail_url || FALLBACK_THUMB,
      viewers: s.viewer_count || 0,
      category: s.category || '',
      location: s.streamer?.country || '',
      description: s.description || undefined,
    }));
    setStreams(mapped);
    // Keep an open watch view in sync (e.g. live viewer count). If the stream is no
    // longer live it drops from the list; we keep the last data so LiveWatch can show
    // its own "ended" state from its dedicated subscription.
    setWatchStream(prev => (prev ? mapped.find(m => m.id === prev.id) || prev : null));

    if (user) {
      const ids = new Set<string>();
      ((connectionsRes.data || []) as ConnectionRow[]).forEach((c) => {
        ids.add(c.user_id === user.id ? c.connected_user_id : c.user_id);
      });
      setFollowingIds(ids);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchStreams();
    const channel = supabase
      .channel('live-streams-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'live_streams' }, () => {
        fetchStreams(true);
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [fetchStreams]);

  const getFilteredStreams = () => {
    let list = [...streams];

    if (activeTab === 'popular') {
      list = list.sort((a, b) => b.viewers - a.viewers);
    } else if (activeTab === 'following') {
      list = list.filter(s => followingIds.has(s.streamerId));
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(s =>
        s.title.toLowerCase().includes(q) ||
        s.streamerName.toLowerCase().includes(q)
      );
    }
    if (categoryFilter !== 'all') {
      list = list.filter(s => s.category.toLowerCase() === categoryFilter.toLowerCase());
    }
    if (regionFilter !== 'all') {
      list = list.filter(s => s.location.toLowerCase().includes(regionFilter.toLowerCase()));
    }
    return list;
  };

  const filteredStreams = getFilteredStreams();

  const handleWentLive = () => {
    setShowBroadcast(false);
    setActiveTab('live');
    fetchStreams(true);
  };

  if (watchStream) {
    return (
      <div className="min-h-screen bg-background pb-20 md:pb-0">
        <div className="container mx-auto px-4 py-4 max-w-3xl">
          <LiveWatch
            stream={watchStream}
            currentUserId={currentUserId}
            onBack={() => setWatchStream(null)}
            onEnded={() => { setWatchStream(null); fetchStreams(true); }}
          />
        </div>
      </div>
    );
  }

  if (showBroadcast) {
    return (
      <div className="min-h-screen bg-background pb-20 md:pb-0">
        <div className="bg-muted/50 border-b border-border">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" onClick={() => setShowBroadcast(false)} className="gap-1.5">
                <ArrowLeft className="h-4 w-4" />
                Назад
              </Button>
              <div className="flex items-center gap-2">
                <Radio className="h-5 w-5 text-destructive animate-pulse" />
                <h1 className="text-xl font-bold text-foreground">Прямой эфир</h1>
              </div>
            </div>
          </div>
        </div>
        <div className="container mx-auto px-4 py-4 max-w-2xl">
          <LiveBroadcast onWentLive={handleWentLive} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      {/* Header */}
      <div className="bg-muted/50 border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Radio className="h-5 w-5 text-destructive animate-pulse" />
              <h1 className="text-xl font-bold text-foreground">YAT LIVE</h1>
            </div>
            <Button size="sm" className="gap-1.5 bg-destructive hover:bg-destructive/90" onClick={() => setShowBroadcast(true)}>
              <Video className="h-4 w-4" />
              Запустить / Go Live
            </Button>
          </div>

          <div className="flex gap-2">
            <Input
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Поиск трансляций / Rechercher..."
              className="flex-1 h-10 text-sm bg-card"
            />
            <Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)} className="gap-1">
              <Filter className="h-3.5 w-3.5" />
              <ChevronDown className={`h-3.5 w-3.5 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </Button>
          </div>

          {showFilters && (
            <div className="grid grid-cols-2 gap-2 mt-3">
              <Select value={regionFilter} onValueChange={setRegionFilter}>
                <SelectTrigger className="text-xs h-8"><SelectValue placeholder="Регион / Région" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все / Tous</SelectItem>
                  {countries.slice(0, 20).map(c => (
                    <SelectItem key={c.value} value={c.label}>{c.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="text-xs h-8"><SelectValue placeholder="Тематика / Catégorie" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все / Toutes</SelectItem>
                  {streamCategories.map(c => (
                    <SelectItem key={c.id} value={c.name}>{c.icon} {c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-4">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4 w-full grid grid-cols-4 text-xs">
            <TabsTrigger value="live" className="gap-1 text-xs">
              <Globe className="h-3.5 w-3.5" /> LIVE
            </TabsTrigger>
            <TabsTrigger value="popular" className="gap-1 text-xs">
              <Zap className="h-3.5 w-3.5" /> Популярные
            </TabsTrigger>
            <TabsTrigger value="following" className="gap-1 text-xs">
              <Heart className="h-3.5 w-3.5" /> Мои
            </TabsTrigger>
            <TabsTrigger value="search" className="gap-1 text-xs">
              <Search className="h-3.5 w-3.5" /> Поиск
            </TabsTrigger>
          </TabsList>

          {['live', 'popular', 'following', 'search'].map(tab => (
            <TabsContent key={tab} value={tab}>
              {loading ? (
                <div className="flex justify-center py-16">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : filteredStreams.length === 0 ? (
                <div className="text-center py-16 text-muted-foreground">
                  <Video className="h-10 w-10 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">Нет трансляций / Aucun stream en direct</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {filteredStreams.map((stream) => (
                    <div key={stream.id} onClick={() => setWatchStream(stream)} className="bg-card border border-border rounded-xl overflow-hidden hover:shadow-md transition-shadow cursor-pointer group">
                      <div className="relative h-40 bg-muted overflow-hidden">
                        <img src={stream.thumbnail} alt={stream.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                        <div className="absolute top-2 left-2 flex gap-1">
                          <Badge className="bg-destructive text-destructive-foreground text-[10px] px-1.5 py-0.5">
                            <Radio className="h-2.5 w-2.5 mr-0.5" /> LIVE
                          </Badge>
                        </div>
                        <div className="absolute bottom-2 right-2">
                          <Badge variant="secondary" className="text-[10px] bg-black/60 text-white border-0">
                            <Eye className="h-2.5 w-2.5 mr-0.5" /> {stream.viewers}
                          </Badge>
                        </div>
                      </div>
                      <div className="p-3">
                        <h3 className="font-semibold text-sm text-foreground line-clamp-1">{stream.title}</h3>
                        <p className="text-xs text-muted-foreground mt-0.5">{stream.streamerName}</p>
                        <div className="flex items-center gap-2 mt-1.5">
                          {stream.category && <Badge variant="outline" className="text-[10px]">{stream.category}</Badge>}
                          {stream.location && (
                            <span className="flex items-center text-[10px] text-muted-foreground">
                              <MapPin className="h-2.5 w-2.5 mr-0.5" /> {stream.location}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
};

export default Live;
