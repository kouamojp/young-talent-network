import React, { useState, useEffect, useRef } from 'react';
import { Calendar, MapPin, Clock, Users, Filter, Search, Plus, ChevronDown, Map, Eye } from 'lucide-react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { countries } from '@/data/countries';
import { sportCategories } from '@/data/sportCategories';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useLanguage } from '@/i18n/LanguageContext';

const thematicCategories = [
  { name: 'Спорт / Sport', subcategories: sportCategories.map(s => s.name) },
  { name: 'IT', subcategories: ['Web', 'Mobile', 'AI', 'DevOps', 'Cybersecurity'] },
  { name: 'Киберспорт / Esports', subcategories: ['Valorant', 'Fortnite', 'LoL', 'CS2', 'Dota 2'] },
  { name: 'Наука / Science', subcategories: ['Физика', 'Химия', 'Биология', 'Математика'] },
  { name: 'Мода / Fashion', subcategories: [] },
  { name: 'Медицина / Medicine', subcategories: [] },
  { name: 'Музыка / Music', subcategories: ['Поп', 'Рок', 'Джаз', 'Классика', 'Электронная'] },
  { name: 'Танцы / Dance', subcategories: ['Бальные', 'Хип-хоп', 'Контемпорари', 'Брейк'] },
  { name: 'Хобби / Hobbies', subcategories: [] },
  { name: 'Кулинария / Cooking', subcategories: [] },
  { name: 'Искусство / Art', subcategories: ['Живопись', 'Скульптура', 'Фотография', 'Графика'] },
  { name: 'Финансы / Finance', subcategories: [] },
];

interface EventItem {
  id: string;
  title: string;
  description: string | null;
  location: string | null;
  start_date: string;
  end_date: string;
  image_url: string | null;
  attendees_count: number | null;
  capacity: number | null;
  is_virtual: boolean | null;
  organizer_id: string;
  latitude: number | null;
  longitude: number | null;
}

const Events: React.FC = () => {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const [activeTab, setActiveTab] = useState('upcoming');
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [regionFilter, setRegionFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newLocation, setNewLocation] = useState('');
  const [newStartDate, setNewStartDate] = useState('');
  const [newEndDate, setNewEndDate] = useState('');
  const [newCapacity, setNewCapacity] = useState('');
  const [newIsVirtual, setNewIsVirtual] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUserId(data.user?.id || null));
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    setLoading(true);
    const now = new Date().toISOString();
    let q = supabase.from('events').select('*').order('start_date', { ascending: true });

    if (activeTab === 'upcoming') q = q.gte('start_date', now);
    else if (activeTab === 'past') q = q.lt('end_date', now);
    else if (activeTab === 'popular') q = q.gte('start_date', now).order('attendees_count', { ascending: false });

    if (searchQuery.trim()) q = q.or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%,location.ilike.%${searchQuery}%`);
    if (regionFilter && regionFilter !== 'all') q = q.ilike('location', `%${regionFilter}%`);

    const { data } = await q.limit(50);
    setEvents(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchEvents(); }, [activeTab, searchQuery, regionFilter]);

  const handleCreateEvent = async () => {
    if (!userId) { toast.error(t('events.loginRequired')); return; }
    if (!newTitle || !newStartDate || !newEndDate) { toast.error(t('events.fillRequired')); return; }

    const { error } = await supabase.from('events').insert({
      title: newTitle, description: newDescription, location: newLocation,
      start_date: newStartDate, end_date: newEndDate,
      capacity: newCapacity ? parseInt(newCapacity) : null,
      is_virtual: newIsVirtual, organizer_id: userId,
    });

    if (error) toast.error(error.message);
    else {
      toast.success(t('events.created'));
      setCreateOpen(false);
      setNewTitle(''); setNewDescription(''); setNewLocation('');
      setNewStartDate(''); setNewEndDate(''); setNewCapacity('');
      fetchEvents();
    }
  };

  const handleJoinEvent = async (eventId: string) => {
    if (!userId) { toast.error(t('events.loginRequired')); return; }
    const { error } = await supabase.from('event_attendees').insert({ event_id: eventId, user_id: userId });
    if (error) {
      if (error.code === '23505') toast.info(t('events.alreadyJoined'));
      else toast.error(error.message);
    } else toast.success(t('events.joined'));
  };

  const formatDate = (d: string) => {
    const locale = language === 'fr' ? 'fr-FR' : language === 'ru' ? 'ru-RU' : 'en-US';
    return new Date(d).toLocaleDateString(locale, { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <div className="bg-muted/50 border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-xl font-bold text-foreground">{t('events.title')}</h1>
            <Dialog open={createOpen} onOpenChange={setCreateOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="gap-1.5"><Plus className="h-4 w-4" />{t('events.create')}</Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader><DialogTitle>{t('events.createEvent')}</DialogTitle></DialogHeader>
                <div className="space-y-3">
                  <Input placeholder={t('events.eventName')} value={newTitle} onChange={e => setNewTitle(e.target.value)} />
                  <Textarea placeholder={t('events.description')} value={newDescription} onChange={e => setNewDescription(e.target.value)} rows={3} />
                  <Input placeholder={t('events.location')} value={newLocation} onChange={e => setNewLocation(e.target.value)} />
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-xs text-muted-foreground">{t('events.start')}</label>
                      <Input type="datetime-local" value={newStartDate} onChange={e => setNewStartDate(e.target.value)} />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground">{t('events.end')}</label>
                      <Input type="datetime-local" value={newEndDate} onChange={e => setNewEndDate(e.target.value)} />
                    </div>
                  </div>
                  <Input placeholder={t('events.capacity')} type="number" value={newCapacity} onChange={e => setNewCapacity(e.target.value)} />
                  <div className="flex items-center gap-2">
                    <input type="checkbox" id="virtual" checked={newIsVirtual} onChange={e => setNewIsVirtual(e.target.checked)} />
                    <label htmlFor="virtual" className="text-sm">{t('events.online')}</label>
                  </div>
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger className="text-xs"><SelectValue placeholder={t('events.category')} /></SelectTrigger>
                    <SelectContent>
                      {thematicCategories.map(c => (<SelectItem key={c.name} value={c.name}>{c.name}</SelectItem>))}
                    </SelectContent>
                  </Select>
                  <Button onClick={handleCreateEvent} className="w-full">{t('events.create')}</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="flex gap-2">
            <Input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder={t('events.searchEvents')} className="flex-1 h-10 text-sm bg-card" />
            <Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)} className="gap-1">
              <Filter className="h-3.5 w-3.5" />
              <ChevronDown className={`h-3.5 w-3.5 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </Button>
          </div>

          {showFilters && (
            <div className="grid grid-cols-2 gap-2 mt-3">
              <Select value={regionFilter} onValueChange={setRegionFilter}>
                <SelectTrigger className="text-xs h-8"><SelectValue placeholder={t('events.region')} /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('events.all')}</SelectItem>
                  {countries.map(c => (<SelectItem key={c.value} value={c.label}>{c.label}</SelectItem>))}
                </SelectContent>
              </Select>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="text-xs h-8"><SelectValue placeholder={t('events.category')} /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('events.allCategories')}</SelectItem>
                  {thematicCategories.map(c => (<SelectItem key={c.name} value={c.name}>{c.name}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      </div>

      <div className="border-b border-border">
        <div className="container mx-auto px-4">
          <div className="h-48 md:h-64 rounded-lg my-3 overflow-hidden border border-border/50">
            <EventsMapbox events={events} />
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-4">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4 w-full grid grid-cols-4 text-xs">
            <TabsTrigger value="upcoming" className="text-xs">{t('events.upcoming')}</TabsTrigger>
            <TabsTrigger value="popular" className="text-xs">{t('events.popular')}</TabsTrigger>
            <TabsTrigger value="my" className="text-xs">{t('events.my')}</TabsTrigger>
            <TabsTrigger value="past" className="text-xs">{t('events.past')}</TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming"><EventGrid events={events} loading={loading} onJoin={handleJoinEvent} formatDate={formatDate} t={t} /></TabsContent>
          <TabsContent value="popular"><EventGrid events={events} loading={loading} onJoin={handleJoinEvent} formatDate={formatDate} t={t} /></TabsContent>
          <TabsContent value="my">
            <div className="text-center py-12 text-muted-foreground">
              <Calendar className="h-10 w-10 mx-auto mb-2 opacity-30" />
              <p className="text-sm">{t('events.loginToSee')}</p>
            </div>
          </TabsContent>
          <TabsContent value="past"><EventGrid events={events} loading={loading} onJoin={handleJoinEvent} formatDate={formatDate} t={t} /></TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

interface EventGridProps {
  events: EventItem[];
  loading: boolean;
  onJoin: (id: string) => void;
  formatDate: (d: string) => string;
  t: (key: string) => string;
}

const EventGrid: React.FC<EventGridProps> = ({ events, loading, onJoin, formatDate, t }) => {
  if (loading) return <div className="text-center py-12 text-muted-foreground text-sm">{t('common.loading')}</div>;
  if (events.length === 0) return (
    <div className="text-center py-12 text-muted-foreground">
      <Calendar className="h-10 w-10 mx-auto mb-2 opacity-30" />
      <p className="text-sm">{t('events.noEvents')}</p>
    </div>
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
      {events.map(event => (
        <div key={event.id} className="bg-card border border-border rounded-xl overflow-hidden hover:shadow-md transition-shadow">
          <div className="h-32 bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
            {event.image_url ? (
              <img src={event.image_url} alt={event.title} className="w-full h-full object-cover" />
            ) : (
              <Calendar className="h-10 w-10 text-primary/30" />
            )}
          </div>
          <div className="p-3">
            <h3 className="font-semibold text-sm text-foreground line-clamp-1">{event.title}</h3>
            <div className="space-y-1 mt-2">
              <div className="flex items-center text-xs text-muted-foreground">
                <Clock className="h-3 w-3 mr-1 shrink-0" />
                <span className="truncate">{formatDate(event.start_date)}</span>
              </div>
              {event.location && (
                <div className="flex items-center text-xs text-muted-foreground">
                  <MapPin className="h-3 w-3 mr-1 shrink-0" />
                  <span className="truncate">{event.location}</span>
                </div>
              )}
              <div className="flex items-center text-xs text-muted-foreground">
                <Users className="h-3 w-3 mr-1 shrink-0" />
                <span>{event.attendees_count || 0} {t('events.attendees')}</span>
                {event.capacity && <span className="ml-1">/ {event.capacity}</span>}
              </div>
            </div>
            {event.is_virtual && <Badge variant="secondary" className="text-[10px] mt-2">🌐 {t('events.online')}</Badge>}
            {event.description && <p className="text-[11px] text-muted-foreground mt-2 line-clamp-2">{event.description}</p>}
            <Button size="sm" className="w-full mt-3 text-xs" onClick={() => onJoin(event.id)}>{t('events.participate')}</Button>
          </div>
        </div>
      ))}
    </div>
  );
};

const EventsMapbox: React.FC<{ events: EventItem[] }> = ({ events }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);

  useEffect(() => {
    if (!mapContainer.current || map.current) return;
    mapboxgl.accessToken = 'pk.eyJ1IjoibG92YWJsZSIsImEiOiJjbHRpY3B2MG0wMXVjMmtwNjlzOHV5dGxzIn0.a_bGOwlDWjFEeSbQ1SInjQ';
    map.current = new mapboxgl.Map({
      container: mapContainer.current, style: 'mapbox://styles/mapbox/light-v11',
      center: [2.35, 46.85], zoom: 3,
    });
    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
    return () => { map.current?.remove(); map.current = null; };
  }, []);

  useEffect(() => {
    if (!map.current) return;
    document.querySelectorAll('.mapboxgl-marker').forEach(m => m.remove());
    events.forEach(event => {
      if (event.latitude != null && event.longitude != null) {
        const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(
          `<div style="max-width:200px"><strong>${event.title}</strong><br/><small>${event.location || ''}</small></div>`
        );
        new mapboxgl.Marker({ color: '#3b82f6' })
          .setLngLat([event.longitude, event.latitude]).setPopup(popup).addTo(map.current!);
      }
    });
  }, [events]);

  return <div ref={mapContainer} className="w-full h-full" />;
};

export default Events;
