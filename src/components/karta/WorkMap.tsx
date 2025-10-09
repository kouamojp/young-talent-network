import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MapPin, Briefcase, DollarSign } from 'lucide-react';

const WorkMap = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapboxToken, setMapboxToken] = useState('');
  const [selectedJob, setSelectedJob] = useState<any>(null);

  // Sample job data
  const jobs = [
    { id: 1, title: 'Frontend Developer', company: 'Tech Corp', location: [30.5234, 50.4501], salary: '$60k-80k', type: 'Full-time' },
    { id: 2, title: 'Designer', company: 'Creative Studio', location: [30.5334, 50.4601], salary: '$50k-70k', type: 'Contract' },
    { id: 3, title: 'Marketing Manager', company: 'Brand Agency', location: [30.5134, 50.4401], salary: '$55k-75k', type: 'Full-time' },
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

    // Add markers for jobs
    jobs.forEach(job => {
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
        .setLngLat(job.location as [number, number])
        .addTo(map.current!);

      el.addEventListener('click', () => {
        setSelectedJob(job);
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
      
      {selectedJob && (
        <Card className="absolute bottom-4 left-4 right-4 max-w-md mx-auto shadow-xl">
          <CardContent className="p-4">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-primary/10 rounded-lg">
                <Briefcase className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-lg">{selectedJob.title}</h3>
                <p className="text-sm text-muted-foreground">{selectedJob.company}</p>
                <div className="flex items-center gap-4 mt-2">
                  <span className="text-sm flex items-center gap-1">
                    <DollarSign className="h-4 w-4" />
                    {selectedJob.salary}
                  </span>
                  <span className="text-sm px-2 py-1 bg-primary/10 rounded-full">
                    {selectedJob.type}
                  </span>
                </div>
                <div className="flex gap-2 mt-3">
                  <Button size="sm" className="flex-1">Apply Now</Button>
                  <Button size="sm" variant="outline">Details</Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default WorkMap;
