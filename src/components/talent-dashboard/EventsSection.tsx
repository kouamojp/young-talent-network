import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Plus, Calendar as CalendarIcon, Users, MapPin, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface EventRow {
  id: string;
  title: string;
  start_date: string;
  location: string | null;
  is_virtual: boolean | null;
  capacity: number | null;
  attendees_count: number | null;
  status: string;
}

const statusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'active':
    case 'published':
      return 'bg-green-100 text-green-800';
    case 'sold out':
    case 'full':
      return 'bg-red-100 text-red-800';
    case 'draft':
      return 'bg-yellow-100 text-yellow-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const EventsSection: React.FC = () => {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [events, setEvents] = useState<EventRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }
      const { data } = await supabase
        .from('events')
        .select('id, title, start_date, location, is_virtual, capacity, attendees_count, status')
        .eq('organizer_id', user.id)
        .order('start_date', { ascending: true });
      setEvents((data || []) as EventRow[]);
      setLoading(false);
    })();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">🗓️ Mes événements</h3>
        <Button onClick={() => navigate('/events')}>
          <Plus className="h-4 w-4 mr-2" />
          Créer un événement
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Calendrier</CardTitle>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              className="rounded-md border"
            />
          </CardContent>
        </Card>

        <div className="lg:col-span-2 space-y-4">
          {loading ? (
            <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
          ) : events.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="p-6 text-center">
                <CalendarIcon className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-600 mb-4">Vous n'avez pas encore créé d'événement</p>
                <Button variant="outline" onClick={() => navigate('/events')}>
                  <Plus className="h-4 w-4 mr-2" />
                  Créer un événement
                </Button>
              </CardContent>
            </Card>
          ) : (
            events.map((event) => {
              const registered = event.attendees_count || 0;
              const capacity = event.capacity || 0;
              const pct = capacity > 0 ? Math.round((registered / capacity) * 100) : 0;
              return (
                <Card key={event.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-semibold mb-1">{event.title}</h4>
                        <div className="flex items-center gap-2 mb-2">
                          {event.is_virtual && <Badge className="bg-blue-100 text-blue-800">En ligne</Badge>}
                          <Badge className={statusColor(event.status)}>{event.status}</Badge>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => navigate('/events')}>Gérer</Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-gray-600">
                          <CalendarIcon className="h-3 w-3" />
                          {new Date(event.start_date).toLocaleDateString('fr-FR')}
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <MapPin className="h-3 w-3" />
                          {event.location || (event.is_virtual ? 'En ligne' : '—')}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Users className="h-3 w-3 text-gray-600" />
                          <span>{registered}{capacity > 0 ? ` / ${capacity}` : ''} inscrits</span>
                        </div>
                      </div>
                    </div>

                    {capacity > 0 && (
                      <div className="mt-4 bg-gray-100 rounded-lg p-2">
                        <div className="flex justify-between text-xs text-gray-600 mb-1">
                          <span>Progression des inscriptions</span>
                          <span>{pct}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${Math.min(100, pct)}%` }}></div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default EventsSection;
