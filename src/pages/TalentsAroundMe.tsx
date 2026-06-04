import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MapPin, Users, Sparkles, Loader2, Locate, Database, Star, MessageCircle, Shield, EyeOff } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { countries } from '@/data/countries';

interface NearbyTalent {
  id: string;
  name: string;
  avatar_url: string | null;
  bio: string | null;
  city: string | null;
  country: string | null;
  sport_type: string | null;
  user_type: 'talent' | 'agent' | 'organization';
  latitude: number | null;
  longitude: number | null;
  platform_rating: number | null;
  distance_km: number | null;
}

const haversine = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
};

const typeColor = (t: string) =>
  t === 'agent' ? 'bg-emerald-500/10 text-emerald-600 border-emerald-200'
  : t === 'organization' ? 'bg-purple-500/10 text-purple-600 border-purple-200'
  : 'bg-blue-500/10 text-blue-600 border-blue-200';

const profileLink = (t: NearbyTalent) =>
  t.user_type === 'organization' ? `/organization/${t.id}`
  : t.user_type === 'agent' ? `/agent/${t.id}`
  : `/talent/${t.id}`;

const TalentsAroundMe: React.FC = () => {
  const [viewMode, setViewMode] = useState<'map' | 'list'>('list');
  const [distance, setDistance] = useState<number>(50);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [cityFallback, setCityFallback] = useState('');
  const [talents, setTalents] = useState<NearbyTalent[]>([]);
  const [loading, setLoading] = useState(false);
  const [locating, setLocating] = useState(false);
  const [savingLoc, setSavingLoc] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [myProfile, setMyProfile] = useState<{ latitude: number | null; longitude: number | null; city: string | null } | null>(null);
  const [categoryQuery, setCategoryQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'talent' | 'agent' | 'organization'>('all');
  const [countryFilter, setCountryFilter] = useState('all');
  const [removingLoc, setRemovingLoc] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      const uid = data.user?.id || null;
      setCurrentUserId(uid);
      if (uid) {
        const { data: p } = await supabase
          .from('profiles')
          .select('latitude, longitude, city')
          .eq('id', uid)
          .maybeSingle();
        setMyProfile(p as any);
        if (p?.latitude && p?.longitude) {
          setCoords({ lat: Number(p.latitude), lng: Number(p.longitude) });
        }
      }
    });
  }, []);

  const detectLocation = useCallback(() => {
    if (!navigator.geolocation) {
      toast.error('Géolocalisation non supportée');
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      pos => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocating(false);
        toast.success('Position détectée');
      },
      err => {
        setLocating(false);
        toast.error(err.message || 'Impossible de détecter votre position');
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  }, []);

  const saveLocationToProfile = async () => {
    if (!coords || !currentUserId) { toast.error('Connectez-vous d\'abord'); return; }
    setSavingLoc(true);
    const { error } = await supabase.from('profiles')
      .update({ latitude: coords.lat, longitude: coords.lng })
      .eq('id', currentUserId);
    setSavingLoc(false);
    if (error) toast.error(error.message);
    else { toast.success('Localisation enregistrée sur votre profil'); setMyProfile(p => ({ ...(p || {}), latitude: coords.lat, longitude: coords.lng } as any)); }
  };

  const hideMyLocation = async () => {
    if (!currentUserId) return;
    setRemovingLoc(true);
    const { error } = await supabase.from('profiles')
      .update({ latitude: null, longitude: null })
      .eq('id', currentUserId);
    setRemovingLoc(false);
    if (error) { toast.error(error.message); return; }
    setCoords(null);
    setMyProfile(p => ({ ...(p || {}), latitude: null, longitude: null } as any));
    toast.success('Géolocalisation désactivée. Seule votre ville/pays sera visible.');
  };
    setLoading(true);
    try {
      let q = supabase.from('profiles')
        .select('id, name, avatar_url, bio, city, country, sport_type, user_type, latitude, longitude, platform_rating')
        .in('user_type', ['talent', 'agent', 'organization']);

      if (currentUserId) q = q.neq('id', currentUserId);
      if (categoryQuery.trim()) {
        q = q.or(`sport_type.ilike.%${categoryQuery}%,bio.ilike.%${categoryQuery}%,name.ilike.%${categoryQuery}%`);
      }

      // If we have coords, fetch profiles with coords first
      if (coords) {
        q = q.not('latitude', 'is', null).not('longitude', 'is', null);
      } else if (cityFallback.trim()) {
        q = q.or(`city.ilike.%${cityFallback}%,country.ilike.%${cityFallback}%`);
      }

      const { data, error } = await q.limit(200).order('platform_rating', { ascending: false });
      if (error) throw error;

      const enriched: NearbyTalent[] = (data || []).map((p: any) => {
        const dist = coords && p.latitude && p.longitude
          ? haversine(coords.lat, coords.lng, Number(p.latitude), Number(p.longitude))
          : null;
        return { ...p, distance_km: dist };
      });

      const filtered = coords
        ? enriched.filter(t => t.distance_km !== null && t.distance_km <= distance).sort((a, b) => (a.distance_km! - b.distance_km!))
        : enriched;

      setTalents(filtered);
    } catch (e: any) {
      toast.error(e.message || 'Erreur de chargement');
    } finally {
      setLoading(false);
    }
  }, [coords, distance, categoryQuery, cityFallback, currentUserId]);

  useEffect(() => {
    const t = setTimeout(() => fetchTalents(), 300);
    return () => clearTimeout(t);
  }, [fetchTalents]);

  const totalProfilesWithLocation = useMemo(() => talents.length, [talents]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-purple-50 pb-20 md:pb-0">
      <div className="container mx-auto py-6 px-4 space-y-4">
        {/* Hero */}
        <div className="rounded-xl bg-gradient-to-r from-purple-400 to-blue-400 text-white p-6 shadow">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
                <MapPin className="h-6 w-6" /> Talents Around Me
              </h1>
              <p className="text-sm md:text-base text-white/90 mt-1">
                {coords
                  ? <>Il y a <b>{totalProfilesWithLocation}</b> talents dans un rayon de <b>{distance} km</b>.</>
                  : <>Activez votre position pour découvrir les talents près de vous.</>}
              </p>
            </div>
            <div className="flex gap-2 flex-wrap">
              <Button size="sm" onClick={detectLocation} disabled={locating} variant="secondary" className="gap-1">
                {locating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Locate className="h-3.5 w-3.5" />}
                Détecter ma position
              </Button>
              {coords && currentUserId && (!myProfile?.latitude || Number(myProfile.latitude) !== coords.lat) && (
                <Button size="sm" onClick={saveLocationToProfile} disabled={savingLoc} variant="secondary" className="gap-1">
                  {savingLoc ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
                  Enregistrer sur mon profil
                </Button>
              )}
              <Button size="sm" variant="secondary" asChild className="gap-1">
                <Link to="/yat-database"><Database className="h-3.5 w-3.5" /> YAT Database</Link>
              </Button>
            </div>
          </div>
          {coords && (
            <p className="text-xs text-white/80 mt-2">📍 {coords.lat.toFixed(4)}, {coords.lng.toFixed(4)}</p>
          )}
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4 grid md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">Recherche (nom, sport, catégorie)</label>
              <Input value={categoryQuery} onChange={e => setCategoryQuery(e.target.value)} placeholder="Football, piano, dev..." />
            </div>
            {!coords && (
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground">Ville / Pays (sans GPS)</label>
                <Input value={cityFallback} onChange={e => setCityFallback(e.target.value)} placeholder="Paris, France..." />
              </div>
            )}
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground flex justify-between">
                <span>Rayon</span><b>{distance} km</b>
              </label>
              <Slider value={[distance]} min={1} max={500} step={1} onValueChange={v => setDistance(v[0])} disabled={!coords} />
            </div>
          </CardContent>
        </Card>

        {/* View toggle */}
        <Tabs value={viewMode} onValueChange={v => setViewMode(v as 'map' | 'list')}>
          <TabsList>
            <TabsTrigger value="list"><Users className="h-3.5 w-3.5 mr-1" /> Liste</TabsTrigger>
            <TabsTrigger value="map"><MapPin className="h-3.5 w-3.5 mr-1" /> Carte</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Results */}
        {loading ? (
          <div className="text-center py-12 text-muted-foreground"><Loader2 className="h-6 w-6 mx-auto animate-spin" /></div>
        ) : talents.length === 0 ? (
          <Card><CardContent className="text-center py-12">
            <div className="text-5xl mb-3">🔭</div>
            <h3 className="font-semibold mb-1">Personne dans ce rayon pour l'instant</h3>
            <p className="text-sm text-muted-foreground mb-3">
              {coords ? 'Élargissez le rayon ou changez de filtre.' : 'Activez votre géolocalisation pour voir les talents proches.'}
            </p>
            <Button asChild variant="outline" size="sm"><Link to="/yat-database">Explorer tout YAT Database</Link></Button>
          </CardContent></Card>
        ) : viewMode === 'list' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {talents.map(t => (
              <Card key={t.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex gap-3">
                    <Link to={profileLink(t)} className="shrink-0">
                      <Avatar className="h-14 w-14 border-2 border-primary/20">
                        <AvatarImage src={t.avatar_url || undefined} />
                        <AvatarFallback>{t.name?.[0] || '?'}</AvatarFallback>
                      </Avatar>
                    </Link>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <Link to={profileLink(t)} className="font-semibold hover:underline truncate">{t.name}</Link>
                        <Badge variant="outline" className={`text-[10px] ${typeColor(t.user_type)} shrink-0`}>{t.user_type}</Badge>
                      </div>
                      {t.sport_type && <p className="text-xs text-primary font-medium truncate">{t.sport_type}</p>}
                      <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1 flex-wrap">
                        <MapPin className="h-3 w-3" />
                        <span className="truncate">{[t.city, t.country].filter(Boolean).join(', ') || '—'}</span>
                        {t.distance_km !== null && (
                          <Badge variant="secondary" className="text-[10px] ml-auto">{t.distance_km.toFixed(1)} km</Badge>
                        )}
                      </div>
                      {t.platform_rating ? (
                        <div className="flex items-center gap-1 text-xs mt-1"><Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />{Number(t.platform_rating).toFixed(1)}</div>
                      ) : null}
                      {t.bio && <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{t.bio}</p>}
                      <div className="mt-3 flex gap-1.5">
                        <Button asChild size="sm" className="flex-1 h-7 text-xs"><Link to={profileLink(t)}>Profil</Link></Button>
                        <Button asChild size="sm" variant="outline" className="h-7 w-7 p-0"><Link to="/messages"><MessageCircle className="h-3.5 w-3.5" /></Link></Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card><CardContent className="p-0 overflow-hidden">
            <div className="relative bg-gradient-to-br from-blue-100 to-purple-100 h-[500px] rounded-lg">
              {coords && (
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
                  <div className="relative">
                    <div className="absolute inset-0 rounded-full bg-primary/40 animate-ping" style={{ width: 40, height: 40 }} />
                    <div className="relative h-10 w-10 rounded-full bg-primary border-4 border-white flex items-center justify-center text-white text-[10px] font-bold">Moi</div>
                  </div>
                </div>
              )}
              {talents.slice(0, 30).map((t, idx) => {
                if (!coords || t.distance_km === null) return null;
                const maxR = distance;
                const angle = (idx * 37) % 360;
                const r = Math.min(t.distance_km / maxR, 1) * 200;
                const x = 50 + (r * Math.cos(angle * Math.PI / 180)) / 5;
                const y = 50 + (r * Math.sin(angle * Math.PI / 180)) / 5;
                return (
                  <Link key={t.id} to={profileLink(t)} style={{ top: `${y}%`, left: `${x}%` }}
                    className="absolute -translate-x-1/2 -translate-y-1/2 group">
                    <Avatar className="h-8 w-8 border-2 border-white shadow group-hover:scale-125 transition">
                      <AvatarImage src={t.avatar_url || undefined} />
                      <AvatarFallback className="text-[10px]">{t.name?.[0]}</AvatarFallback>
                    </Avatar>
                    <span className="absolute top-full left-1/2 -translate-x-1/2 mt-1 text-[10px] bg-white px-1 rounded shadow opacity-0 group-hover:opacity-100 whitespace-nowrap">
                      {t.name} · {t.distance_km.toFixed(1)}km
                    </span>
                  </Link>
                );
              })}
              {!coords && (
                <div className="absolute inset-0 flex items-center justify-center text-muted-foreground text-sm bg-white/40 backdrop-blur-sm">
                  Activez votre géolocalisation pour voir la carte
                </div>
              )}
            </div>
          </CardContent></Card>
        )}
      </div>
    </div>
  );
};

export default TalentsAroundMe;
