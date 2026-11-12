import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Loader2, MapPin, X } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { MAPBOX_TOKEN, type LngLat } from '@/lib/mapbox';

export interface KartaPoint<T> { id: string; lngLat: LngLat; data: T }

interface KartaMapProps<T> {
  points: KartaPoint<T>[];
  loading?: boolean;
  /** Shown when there is nothing to place on the map. */
  emptyLabel: string;
  renderSelected: (point: KartaPoint<T>) => React.ReactNode;
}

/** Map with one marker per point; clicking a marker opens a card at the bottom. */
function KartaMap<T>({ points, loading, emptyLabel, renderSelected }: KartaMapProps<T>) {
  const container = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markers = useRef<mapboxgl.Marker[]>([]);
  const [selected, setSelected] = useState<KartaPoint<T> | null>(null);

  useEffect(() => {
    if (!container.current || !MAPBOX_TOKEN) return;
    mapboxgl.accessToken = MAPBOX_TOKEN;
    map.current = new mapboxgl.Map({
      container: container.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [10, 20],
      zoom: 1.5,
    });
    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
    return () => { map.current?.remove(); map.current = null; };
  }, []);

  useEffect(() => {
    const m = map.current;
    if (!m) return;
    markers.current.forEach(mk => mk.remove());
    markers.current = points.map(point => {
      const el = document.createElement('button');
      el.type = 'button';
      el.setAttribute('aria-label', 'Voir le détail');
      Object.assign(el.style, {
        width: '28px', height: '28px', borderRadius: '50%', cursor: 'pointer',
        backgroundColor: 'hsl(var(--primary))', border: '3px solid white', boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
      });
      el.addEventListener('click', () => setSelected(point));
      return new mapboxgl.Marker(el).setLngLat(point.lngLat).addTo(m);
    });

    if (points.length === 1) {
      m.flyTo({ center: points[0].lngLat, zoom: 10 });
    } else if (points.length > 1) {
      const bounds = new mapboxgl.LngLatBounds();
      points.forEach(p => bounds.extend(p.lngLat));
      m.fitBounds(bounds, { padding: 60, maxZoom: 12, duration: 600 });
    }
  }, [points]);

  if (!MAPBOX_TOKEN) {
    return (
      <Card><CardContent className="p-6 flex items-center gap-2 text-muted-foreground">
        <MapPin className="h-5 w-5" /> Carte indisponible : la clé Mapbox (VITE_MAPBOX_TOKEN) n'est pas configurée.
      </CardContent></Card>
    );
  }

  return (
    <div className="relative">
      <div ref={container} className="w-full h-[600px] rounded-lg shadow-lg" />
      {(loading || points.length === 0) && (
        <div className="absolute top-3 left-3 flex items-center gap-2 rounded-full bg-card/95 border border-border px-3 py-1.5 text-sm shadow">
          {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Chargement…</> : <><MapPin className="h-4 w-4 text-muted-foreground" /> {emptyLabel}</>}
        </div>
      )}
      {selected && (
        <Card className="absolute bottom-4 left-4 right-4 max-w-md mx-auto shadow-xl">
          <CardContent className="p-4 relative">
            <button type="button" onClick={() => setSelected(null)} aria-label="Fermer" className="absolute top-2 right-2 text-muted-foreground hover:text-foreground">
              <X className="h-4 w-4" />
            </button>
            {renderSelected(selected)}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default KartaMap;
