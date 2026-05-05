import React, { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Globe, Zap, Heart, Search, Video, Eye, MapPin, Radio, Filter, ChevronDown, ArrowLeft } from 'lucide-react';
import { countries } from '@/data/countries';
import { liveStreams, trendingStreams, followingStreams, streamCategories } from '@/components/live/data/liveData';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import LiveBroadcast from '@/components/live/LiveBroadcast';

const Live: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('live');
  const [regionFilter, setRegionFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [showBroadcast, setShowBroadcast] = useState(false);

  const getFilteredStreams = () => {
    let streams = activeTab === 'popular' ? trendingStreams :
                  activeTab === 'following' ? followingStreams :
                  liveStreams;

    if (searchQuery.trim()) {
      streams = streams.filter(s =>
        s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (s.streamerName && s.streamerName.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }
    if (categoryFilter !== 'all') {
      streams = streams.filter(s => s.category.toLowerCase() === categoryFilter.toLowerCase());
    }
    if (regionFilter !== 'all') {
      streams = streams.filter(s => s.location.toLowerCase().includes(regionFilter.toLowerCase()));
    }
    return streams;
  };

  const streams = getFilteredStreams();

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
            <Button size="sm" className="gap-1.5 bg-destructive hover:bg-destructive/90" onClick={() => {
              toast.info('Подготовка трансляции...');
              navigate('/tv');
            }}>
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
                  <SelectItem value="current">Текущий / Actuel</SelectItem>
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
              {streams.length === 0 ? (
                <div className="text-center py-16 text-muted-foreground">
                  <Video className="h-10 w-10 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">Нет трансляций / Aucun stream</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {streams.map((stream: any) => (
                    <div key={stream.id} className="bg-card border border-border rounded-xl overflow-hidden hover:shadow-md transition-shadow cursor-pointer group">
                      <div className="relative h-40 bg-muted overflow-hidden">
                        <img src={stream.thumbnail} alt={stream.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                        <div className="absolute top-2 left-2 flex gap-1">
                          <Badge className="bg-destructive text-destructive-foreground text-[10px] px-1.5 py-0.5">
                            <Radio className="h-2.5 w-2.5 mr-0.5" /> LIVE
                          </Badge>
                          {stream.badges?.includes('rising') && (
                            <Badge className="bg-orange-500 text-white text-[10px] px-1.5 py-0.5">🔥 Rising</Badge>
                          )}
                        </div>
                        <div className="absolute bottom-2 right-2">
                          <Badge variant="secondary" className="text-[10px] bg-black/60 text-white border-0">
                            <Eye className="h-2.5 w-2.5 mr-0.5" /> {stream.viewers}
                          </Badge>
                        </div>
                      </div>
                      <div className="p-3">
                        <h3 className="font-semibold text-sm text-foreground line-clamp-1">{stream.title}</h3>
                        <p className="text-xs text-muted-foreground mt-0.5">{stream.streamerName || stream.communityName}</p>
                        <div className="flex items-center gap-2 mt-1.5">
                          <Badge variant="outline" className="text-[10px]">{stream.category}</Badge>
                          <span className="flex items-center text-[10px] text-muted-foreground">
                            <MapPin className="h-2.5 w-2.5 mr-0.5" /> {stream.location}
                          </span>
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
