import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MapPin, Phone, Mail, Globe } from 'lucide-react';

const OrganisationsMap = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapboxToken, setMapboxToken] = useState('');
  const [selectedOrg, setSelectedOrg] = useState<any>(null);

  // Sample organisations data
  const organisations = [
    { 
      id: 1, 
      name: 'Sports Academy', 
      type: 'Школа', 
      location: [30.5234, 50.4501], 
      phone: '+380123456789',
      email: 'info@academy.com',
      website: 'academy.com',
      logo: ''
    },
    { 
      id: 2, 
      name: 'Fitness Club', 
      type: 'Клуб', 
      location: [30.5334, 50.4601],
      phone: '+380987654321',
      email: 'contact@fitness.com',
      website: 'fitness.com',
      logo: ''
    },
    { 
      id: 3, 
      name: 'Talent Agency', 
      type: 'Агенство', 
      location: [30.5134, 50.4401],
      phone: '+380555555555',
      email: 'hello@agency.com',
      website: 'agency.com',
      logo: ''
    },
  ];

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

    // Add markers for organisations
    organisations.forEach(org => {
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
        .setLngLat(org.location as [number, number])
        .addTo(map.current!);

      el.addEventListener('click', () => {
        setSelectedOrg(org);
      });
    });

    return () => {
      map.current?.remove();
    };
  }, [mapboxToken]);

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
      
      {selectedOrg && (
        <Card className="absolute bottom-4 left-4 right-4 max-w-md mx-auto shadow-xl">
          <CardContent className="p-4">
            <div className="flex items-start gap-4">
              <Avatar className="h-16 w-16 border-2 border-primary">
                <AvatarImage src={selectedOrg.logo} />
                <AvatarFallback>{selectedOrg.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h3 className="font-bold text-lg">{selectedOrg.name}</h3>
                <p className="text-sm text-primary font-medium">{selectedOrg.type}</p>
                <div className="space-y-1 mt-2">
                  <a href={`tel:${selectedOrg.phone}`} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
                    <Phone className="h-4 w-4" />
                    {selectedOrg.phone}
                  </a>
                  <a href={`mailto:${selectedOrg.email}`} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
                    <Mail className="h-4 w-4" />
                    {selectedOrg.email}
                  </a>
                  <a href={`https://${selectedOrg.website}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
                    <Globe className="h-4 w-4" />
                    {selectedOrg.website}
                  </a>
                </div>
                <div className="flex gap-2 mt-3">
                  <Button size="sm" className="flex-1">Visit Profile</Button>
                  <Button size="sm" variant="outline">Directions</Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default OrganisationsMap;
