import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MapPin, MessageCircle, UserPlus } from 'lucide-react';

const PeopleMap = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapboxToken, setMapboxToken] = useState('');
  const [selectedPerson, setSelectedPerson] = useState<any>(null);

  // Profils qui ont renseigné leur position
  const [people, setPeople] = useState<{ id: string; name: string; role: string; sport: string; location: [number, number]; avatar: string }[]>([]);
  useEffect(() => {
    supabase
      .from('profiles')
      .select('id, name, user_type, sport_type, latitude, longitude, avatar_url')
      .not('latitude', 'is', null)
      .not('longitude', 'is', null)
      .limit(500)
      .then(({ data }) => setPeople((data ?? []).map((p) => ({
        id: p.id,
        name: p.name || '?',
        role: p.user_type || '',
        sport: p.sport_type || '',
        location: [Number(p.longitude), Number(p.latitude)] as [number, number],
        avatar: p.avatar_url || '',
      }))));
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

    // Add markers for people
    people.forEach(person => {
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
        .setLngLat(person.location as [number, number])
        .addTo(map.current!);

      el.addEventListener('click', () => {
        setSelectedPerson(person);
      });
    });

    return () => {
      map.current?.remove();
    };
  }, [mapboxToken, people]);

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
      
      {selectedPerson && (
        <Card className="absolute bottom-4 left-4 right-4 max-w-md mx-auto shadow-xl">
          <CardContent className="p-4">
            <div className="flex items-start gap-4">
              <Avatar className="h-16 w-16 border-2 border-primary">
                <AvatarImage src={selectedPerson.avatar} />
                <AvatarFallback>{selectedPerson.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h3 className="font-bold text-lg">{selectedPerson.name}</h3>
                <div className="flex gap-2 mt-2">
                  <Badge variant="secondary">{selectedPerson.role}</Badge>
                  <Badge variant="outline">{selectedPerson.sport}</Badge>
                </div>
                <div className="flex gap-2 mt-3">
                  <Button size="sm" className="flex-1 gap-2">
                    <MessageCircle className="h-4 w-4" />
                    Message
                  </Button>
                  <Button size="sm" variant="outline" className="gap-2">
                    <UserPlus className="h-4 w-4" />
                    Connect
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PeopleMap;
