import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MapPin, Calendar, Users, Clock } from 'lucide-react';

const EventsMap = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapboxToken, setMapboxToken] = useState('');
  const [selectedEvent, setSelectedEvent] = useState<any>(null);

  // Événements géolocalisés de la base
  const [events, setEvents] = useState<{ id: string; title: string; date: string; time: string; location: [number, number]; attendees: number }[]>([]);
  useEffect(() => {
    supabase
      .from('events')
      .select('id, title, start_date, latitude, longitude, attendees_count')
      .not('latitude', 'is', null)
      .not('longitude', 'is', null)
      .then(({ data }) => setEvents((data ?? []).map((e) => {
        const start = new Date(e.start_date);
        return {
          id: e.id,
          title: e.title,
          date: start.toLocaleDateString(),
          time: start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          location: [Number(e.longitude), Number(e.latitude)] as [number, number],
          attendees: e.attendees_count ?? 0,
        };
      })));
  }, []);

  useEffect(() => {
    if (!mapContainer.current || !mapboxToken) return;

    mapboxgl.accessToken = mapboxToken;
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [30.5234, 50.4501],
      zoom: 12,
    });

    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    // Add markers for events
    events.forEach(event => {
      const el = document.createElement('div');
      el.className = 'custom-marker';
      el.style.width = '32px';
      el.style.height = '32px';
      el.style.borderRadius = '50%';
      el.style.backgroundColor = 'hsl(var(--primary))';
      el.style.border = '3px solid white';
      el.style.cursor = 'pointer';
      el.style.boxShadow = '0 2px 8px rgba(0,0,0,0.3)';

      new mapboxgl.Marker(el)
        .setLngLat(event.location as [number, number])
        .addTo(map.current!);

      el.addEventListener('click', () => {
        setSelectedEvent(event);
      });
    });

    return () => {
      map.current?.remove();
    };
  }, [mapboxToken, events]);

  if (!mapboxToken) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="h-5 w-5" />
              <p>Enter your Mapbox token to view the interactive map</p>
            </div>
            <Input
              type="text"
              placeholder="pk.eyJ1IjoiZXhhbXBsZS..."
              value={mapboxToken}
              onChange={(e) => setMapboxToken(e.target.value)}
            />
            <p className="text-sm text-muted-foreground">
              Get your free token at{' '}
              <a href="https://mapbox.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                mapbox.com
              </a>
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="relative">
      <div ref={mapContainer} className="w-full h-[600px] rounded-lg shadow-lg" />
      
      {selectedEvent && (
        <Card className="absolute bottom-4 left-4 right-4 max-w-md mx-auto shadow-xl">
          <CardContent className="p-4">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-primary/10 rounded-lg">
                <Calendar className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-lg">{selectedEvent.title}</h3>
                <div className="space-y-2 mt-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    {selectedEvent.date}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    {selectedEvent.time}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Users className="h-4 w-4" />
                    {selectedEvent.attendees} attending
                  </div>
                </div>
                <div className="flex gap-2 mt-3">
                  <Button size="sm" className="flex-1">Join Event</Button>
                  <Button size="sm" variant="outline">Share</Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default EventsMap;
