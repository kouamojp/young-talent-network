import { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { MapPin, Loader2, Crosshair, X } from 'lucide-react';
import { useLanguage } from '@/i18n/LanguageContext';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

export interface LocationValue {
  address: string;
  city?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
}

interface Props {
  value: LocationValue | null;
  onChange: (v: LocationValue | null) => void;
  placeholder?: string;
  showLabel?: boolean;
  compact?: boolean;
}

interface NominatimResult {
  display_name: string;
  lat: string;
  lon: string;
  address?: { city?: string; town?: string; village?: string; country?: string };
}

/**
 * Centralized location picker used across YAT services.
 * Uses OpenStreetMap Nominatim (no API key) for search and reverse geocoding.
 */
export const LocationPicker = ({ value, onChange, placeholder, showLabel = true, compact = false }: Props) => {
  const { t } = useLanguage();
  const [query, setQuery] = useState(value?.address || '');
  const [results, setResults] = useState<NominatimResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [geoLoading, setGeoLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const debounceRef = useRef<number | null>(null);
  const lastSyncedAddress = useRef<string>(value?.address || '');

  useEffect(() => {
    if (value?.address && value.address !== lastSyncedAddress.current) {
      setQuery(value.address);
      lastSyncedAddress.current = value.address;
    }
  }, [value?.address]);

  const search = async (q: string) => {
    if (q.trim().length < 3) { setResults([]); return; }
    setLoading(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&limit=5&q=${encodeURIComponent(q)}`,
        { headers: { 'Accept-Language': 'en,fr,ru' } }
      );
      const data = await res.json();
      setResults(data || []);
      setOpen(true);
    } catch {
      setResults([]);
    } finally { setLoading(false); }
  };

  const handleQueryChange = (v: string) => {
    setQuery(v);
    if (debounceRef.current) window.clearTimeout(debounceRef.current);
    debounceRef.current = window.setTimeout(() => search(v), 400);
  };

  const select = (r: NominatimResult) => {
    const city = r.address?.city || r.address?.town || r.address?.village;
    const next: LocationValue = {
      address: r.display_name,
      city,
      country: r.address?.country,
      latitude: parseFloat(r.lat),
      longitude: parseFloat(r.lon),
    };
    lastSyncedAddress.current = next.address;
    setQuery(next.address);
    setResults([]);
    setOpen(false);
    onChange(next);
  };

  const useCurrentLocation = () => {
    if (!navigator.geolocation) return;
    setGeoLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&addressdetails=1&lat=${latitude}&lon=${longitude}`,
            { headers: { 'Accept-Language': 'en,fr,ru' } }
          );
          const data = await res.json();
          const next: LocationValue = {
            address: data.display_name || `${latitude}, ${longitude}`,
            city: data.address?.city || data.address?.town || data.address?.village,
            country: data.address?.country,
            latitude, longitude,
          };
          lastSyncedAddress.current = next.address;
          setQuery(next.address);
          onChange(next);
        } finally { setGeoLoading(false); }
      },
      () => setGeoLoading(false),
      { timeout: 10000 }
    );
  };

  const clear = () => {
    setQuery(''); setResults([]); onChange(null);
    lastSyncedAddress.current = '';
  };

  return (
    <div className="space-y-1.5">
      {showLabel && !compact && (
        <label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
          <MapPin className="h-3 w-3" /> {t('location.label') || 'Location'}
        </label>
      )}
      <div className="flex gap-1.5">
        <Popover open={open && results.length > 0} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <div className="relative flex-1">
              <MapPin className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              <Input
                value={query}
                onChange={(e) => handleQueryChange(e.target.value)}
                onFocus={() => results.length > 0 && setOpen(true)}
                placeholder={placeholder || t('location.placeholder') || 'Search a city or address…'}
                className="pl-8 pr-8"
              />
              {loading && <Loader2 className="absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />}
              {!loading && query && (
                <button type="button" onClick={clear} className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 rounded hover:bg-muted">
                  <X className="h-3.5 w-3.5 text-muted-foreground" />
                </button>
              )}
            </div>
          </PopoverTrigger>
          <PopoverContent
            className="p-1 w-[--radix-popover-trigger-width]"
            align="start"
            onOpenAutoFocus={(e) => e.preventDefault()}
          >
            {results.map((r, i) => (
              <button
                key={i}
                type="button"
                onClick={() => select(r)}
                className="w-full text-left px-2 py-1.5 rounded text-sm hover:bg-muted flex items-start gap-2"
              >
                <MapPin className="h-3.5 w-3.5 mt-0.5 shrink-0 text-primary" />
                <span className="line-clamp-2">{r.display_name}</span>
              </button>
            ))}
          </PopoverContent>
        </Popover>
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={useCurrentLocation}
          disabled={geoLoading}
          title={t('location.useCurrent') || 'Use my current location'}
        >
          {geoLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Crosshair className="h-4 w-4" />}
        </Button>
      </div>
      {value?.latitude != null && value?.longitude != null && (
        <p className="text-[10px] text-muted-foreground pl-1">
          {value.city || ''}{value.city && value.country ? ', ' : ''}{value.country || ''}
          {' · '}{value.latitude.toFixed(4)}, {value.longitude.toFixed(4)}
        </p>
      )}
    </div>
  );
};
