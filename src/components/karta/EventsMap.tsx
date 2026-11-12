import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, Users } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import KartaMap, { type KartaPoint } from './KartaMap';

interface EventPoint { id: string; title: string; date: string; time: string; attendees: number }

/** Événements géolocalisés. */
const EventsMap = () => {
  const navigate = useNavigate();
  const [points, setPoints] = useState<KartaPoint<EventPoint>[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from('events')
      .select('id, title, start_date, latitude, longitude, attendees_count')
      .not('latitude', 'is', null)
      .not('longitude', 'is', null)
      .then(({ data }) => {
        setPoints((data ?? []).map(e => {
          const start = new Date(e.start_date);
          return {
            id: e.id,
            lngLat: [Number(e.longitude), Number(e.latitude)],
            data: {
              id: e.id, title: e.title, attendees: e.attendees_count ?? 0,
              date: start.toLocaleDateString(),
              time: start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            },
          };
        }));
        setLoading(false);
      });
  }, []);

  return (
    <KartaMap
      points={points}
      loading={loading}
      emptyLabel="Aucun événement localisé pour le moment"
      renderSelected={({ data: ev }) => (
        <div className="flex items-start gap-4 pr-4">
          <div className="p-3 bg-primary/10 rounded-lg"><Calendar className="h-6 w-6 text-primary" /></div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-lg break-words">{ev.title}</h3>
            <div className="flex flex-wrap gap-3 mt-2 text-sm text-muted-foreground">
              <span className="flex items-center gap-1"><Calendar className="h-4 w-4" />{ev.date}</span>
              <span className="flex items-center gap-1"><Clock className="h-4 w-4" />{ev.time}</span>
              <span className="flex items-center gap-1"><Users className="h-4 w-4" />{ev.attendees} participants</span>
            </div>
            <Button size="sm" className="mt-3 w-full" onClick={() => navigate('/events')}>Voir les événements</Button>
          </div>
        </div>
      )}
    />
  );
};

export default EventsMap;
