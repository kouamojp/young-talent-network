import React, { useEffect, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useMusicPlayer, MusicTrack } from '@/contexts/MusicPlayerContext';
import { GENRES, STYLES } from '@/components/music/musicConstants';
import { toast } from 'sonner';
import { Play, Heart, Upload, Sparkles, Mic2, Music as MusicIcon, Disc3, Library, PlusCircle, Radio } from 'lucide-react';

interface Album { id: string; title: string; cover_url: string | null; year: number | null; user_id: string; }

const Music: React.FC = () => {
  const [tab, setTab] = useState('discover');
  return (
    <div className="min-h-screen bg-background pb-32 md:pb-24">
      <div className="bg-gradient-to-r from-purple-600 via-pink-500 to-orange-500 text-white">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            <Disc3 className="h-8 w-8" />
            <div>
              <h1 className="text-2xl font-bold">YAT Musique</h1>
              <p className="text-sm text-white/80">Streaming des créations IA et humaines de la communauté</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-4">
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="mb-4 w-full grid grid-cols-3">
            <TabsTrigger value="discover" className="gap-1.5"><Radio className="h-4 w-4" /> Découverte</TabsTrigger>
            <TabsTrigger value="library" className="gap-1.5"><Library className="h-4 w-4" /> Bibliothèque</TabsTrigger>
            <TabsTrigger value="creator" className="gap-1.5"><PlusCircle className="h-4 w-4" /> Créateur</TabsTrigger>
          </TabsList>
          <TabsContent value="discover"><DiscoverView /></TabsContent>
          <TabsContent value="library"><LibraryView /></TabsContent>
          <TabsContent value="creator"><CreatorView /></TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

const TrackRow: React.FC<{ track: MusicTrack; queue: MusicTrack[]; onLike?: () => void; liked?: boolean }> = ({ track, queue, onLike, liked }) => {
  const { playTrack, current, isPlaying, toggle } = useMusicPlayer();
  const isCurrent = current?.id === track.id;
  return (
    <Card className="p-3 flex items-center gap-3 hover:bg-muted/50 transition-colors">
      <div className="h-12 w-12 bg-muted rounded overflow-hidden shrink-0 flex items-center justify-center">
        {track.cover_url ? <img src={track.cover_url} className="w-full h-full object-cover" /> : <MusicIcon className="h-5 w-5 text-muted-foreground" />}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <p className="text-sm font-medium truncate">{track.title}</p>
          {track.origin === 'ai'
            ? <Badge variant="secondary" className="h-4 px-1 text-[9px] gap-0.5"><Sparkles className="h-2.5 w-2.5" />IA</Badge>
            : <Badge variant="secondary" className="h-4 px-1 text-[9px] gap-0.5"><Mic2 className="h-2.5 w-2.5" />Humain</Badge>}
        </div>
        <p className="text-xs text-muted-foreground truncate">
          {[track.genre, track.style].filter(Boolean).join(' · ') || '—'}
        </p>
      </div>
      {onLike && (
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={onLike}>
          <Heart className={`h-4 w-4 ${liked ? 'fill-red-500 text-red-500' : ''}`} />
        </Button>
      )}
      <Button size="sm" variant={isCurrent ? 'default' : 'outline'} className="h-8 w-8 p-0" onClick={() => isCurrent ? toggle() : playTrack(track, queue)}>
        <Play className="h-4 w-4" />
      </Button>
    </Card>
  );
};

const DiscoverView: React.FC = () => {
  const [tracks, setTracks] = useState<MusicTrack[]>([]);
  const [loading, setLoading] = useState(true);
  const [genre, setGenre] = useState<string>('all');
  const [style, setStyle] = useState<string>('all');
  const [origin, setOrigin] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [likes, setLikes] = useState<Set<string>>(new Set());

  const fetchTracks = async () => {
    setLoading(true);
    let q = supabase.from('music_tracks').select('*').order('created_at', { ascending: false }).limit(60);
    if (genre !== 'all') q = q.eq('genre', genre);
    if (style !== 'all') q = q.eq('style', style);
    if (origin !== 'all') q = q.eq('origin', origin);
    if (search.trim()) q = q.ilike('title', `%${search}%`);
    const { data } = await q;
    setTracks((data || []) as MusicTrack[]);
    setLoading(false);
  };

  const fetchLikes = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase.from('music_likes').select('track_id').eq('user_id', user.id);
    setLikes(new Set((data || []).map(l => l.track_id)));
  };

  useEffect(() => { fetchTracks(); }, [genre, style, origin]);
  useEffect(() => { const t = setTimeout(fetchTracks, 300); return () => clearTimeout(t); }, [search]);
  useEffect(() => { fetchLikes(); }, []);

  const toggleLike = async (id: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { toast.error('Connectez-vous pour liker'); return; }
    if (likes.has(id)) {
      await supabase.from('music_likes').delete().eq('user_id', user.id).eq('track_id', id);
      setLikes(prev => { const n = new Set(prev); n.delete(id); return n; });
    } else {
      await supabase.from('music_likes').insert({ user_id: user.id, track_id: id });
      setLikes(prev => new Set(prev).add(id));
    }
  };

  return (
    <div className="space-y-3">
      <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher un morceau…" />
      <div className="grid grid-cols-3 gap-2">
        <Select value={genre} onValueChange={setGenre}>
          <SelectTrigger className="h-9 text-xs"><SelectValue placeholder="Genre" /></SelectTrigger>
          <SelectContent><SelectItem value="all">Tous genres</SelectItem>{GENRES.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}</SelectContent>
        </Select>
        <Select value={style} onValueChange={setStyle}>
          <SelectTrigger className="h-9 text-xs"><SelectValue placeholder="Style" /></SelectTrigger>
          <SelectContent><SelectItem value="all">Tous styles</SelectItem>{STYLES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
        </Select>
        <Select value={origin} onValueChange={setOrigin}>
          <SelectTrigger className="h-9 text-xs"><SelectValue placeholder="Origine" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">IA + Humain</SelectItem>
            <SelectItem value="human">Uniquement humain</SelectItem>
            <SelectItem value="ai">Uniquement IA</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {loading ? <p className="text-center text-sm text-muted-foreground py-8">Chargement…</p>
        : tracks.length === 0 ? <p className="text-center text-sm text-muted-foreground py-8">Aucun morceau. Soyez le premier à publier !</p>
        : <div className="space-y-2">{tracks.map(t => <TrackRow key={t.id} track={t} queue={tracks} onLike={() => toggleLike(t.id)} liked={likes.has(t.id)} />)}</div>}
    </div>
  );
};

const LibraryView: React.FC = () => {
  const [liked, setLiked] = useState<MusicTrack[]>([]);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }
    const [{ data: likeRows }, { data: albumRows }] = await Promise.all([
      supabase.from('music_likes').select('track_id, music_tracks(*)').eq('user_id', user.id),
      supabase.from('music_albums').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
    ]);
    setLiked((likeRows || []).map((r: any) => r.music_tracks).filter(Boolean));
    setAlbums((albumRows || []) as Album[]);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  if (loading) return <p className="text-center text-sm text-muted-foreground py-8">Chargement…</p>;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-sm font-semibold mb-2 flex items-center gap-1.5"><Heart className="h-4 w-4 text-red-500" /> Morceaux likés</h2>
        {liked.length === 0 ? <p className="text-xs text-muted-foreground">Aucun favori pour l'instant.</p>
          : <div className="space-y-2">{liked.map(t => <TrackRow key={t.id} track={t} queue={liked} />)}</div>}
      </div>
      <div>
        <h2 className="text-sm font-semibold mb-2 flex items-center gap-1.5"><Disc3 className="h-4 w-4" /> Mes albums</h2>
        {albums.length === 0 ? <p className="text-xs text-muted-foreground">Aucun album créé.</p>
          : <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {albums.map(a => (
                <Card key={a.id} className="p-2">
                  <div className="aspect-square bg-muted rounded mb-2 overflow-hidden flex items-center justify-center">
                    {a.cover_url ? <img src={a.cover_url} className="w-full h-full object-cover" /> : <Disc3 className="h-8 w-8 text-muted-foreground" />}
                  </div>
                  <p className="text-sm font-medium truncate">{a.title}</p>
                  <p className="text-xs text-muted-foreground">{a.year || ''}</p>
                </Card>
              ))}
            </div>}
      </div>
    </div>
  );
};

const CreatorView: React.FC = () => {
  const [albums, setAlbums] = useState<Album[]>([]);
  const loadAlbums = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase.from('music_albums').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
    setAlbums((data || []) as Album[]);
  };
  useEffect(() => { loadAlbums(); }, []);

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <UploadTrackDialog albums={albums} onDone={loadAlbums} />
        <CreateAlbumDialog onDone={loadAlbums} />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2">
        {albums.map(a => (
          <Card key={a.id} className="p-2">
            <div className="aspect-square bg-muted rounded mb-2 overflow-hidden flex items-center justify-center">
              {a.cover_url ? <img src={a.cover_url} className="w-full h-full object-cover" /> : <Disc3 className="h-8 w-8 text-muted-foreground" />}
            </div>
            <p className="text-sm font-medium truncate">{a.title}</p>
            <p className="text-xs text-muted-foreground">{a.year || ''}</p>
          </Card>
        ))}
      </div>
    </div>
  );
};

const AUDIO_EXT_MIME: Record<string, string> = {
  mp3: 'audio/mpeg', wav: 'audio/wav', flac: 'audio/flac', aac: 'audio/aac',
  ogg: 'audio/ogg', oga: 'audio/ogg', m4a: 'audio/mp4', mp4: 'audio/mp4', webm: 'audio/webm',
};
const LOSSLESS_EXTS = new Set(['wav', 'flac']);
const MAX_DURATION_SEC = 15 * 60;

const getAudioDuration = (file: File): Promise<number> => new Promise((resolve) => {
  try {
    const url = URL.createObjectURL(file);
    const a = document.createElement('audio');
    a.preload = 'metadata';
    a.onloadedmetadata = () => { const d = a.duration; URL.revokeObjectURL(url); resolve(isFinite(d) ? d : 0); };
    a.onerror = () => { URL.revokeObjectURL(url); resolve(0); };
    a.src = url;
  } catch { resolve(0); }
});

export const validateAudioFile = async (file: File): Promise<{ ok: true; ext: string; mime: string } | { ok: false; error: string }> => {
  const ext = (file.name.split('.').pop() || '').toLowerCase();
  if (!AUDIO_EXT_MIME[ext]) {
    return { ok: false, error: `Format "${ext || 'inconnu'}" non supporté. Formats acceptés : MP3, WAV, FLAC, AAC, OGG, M4A, WEBM` };
  }
  const maxBytes = (LOSSLESS_EXTS.has(ext) ? 200 : 50) * 1024 * 1024;
  if (file.size > maxBytes) {
    return { ok: false, error: `Fichier trop volumineux (max ${LOSSLESS_EXTS.has(ext) ? '200 Mo' : '50 Mo'} pour .${ext})` };
  }
  const duration = await getAudioDuration(file);
  if (duration && duration > MAX_DURATION_SEC) {
    return { ok: false, error: `Durée trop longue (${Math.round(duration/60)} min, max 15 min)` };
  }
  return { ok: true, ext, mime: AUDIO_EXT_MIME[ext] };
};

const uploadFile = async (file: File, folder: string, contentType?: string) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('not auth');
  const ext = (file.name.split('.').pop() || 'bin').toLowerCase();
  const path = `${user.id}/${folder}/${Date.now()}.${ext}`;
  const { error } = await supabase.storage.from('profile-files').upload(path, file, {
    contentType: contentType || file.type || 'application/octet-stream',
    upsert: false,
  });
  if (error) throw error;
  return supabase.storage.from('profile-files').getPublicUrl(path).data.publicUrl;
};

const UploadTrackDialog: React.FC<{ albums: Album[]; onDone: () => void }> = ({ albums, onDone }) => {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [cover, setCover] = useState<File | null>(null);
  const [genre, setGenre] = useState('');
  const [style, setStyle] = useState('');
  const [origin, setOrigin] = useState<'human' | 'ai'>('human');
  const [albumId, setAlbumId] = useState<string>('none');
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (!file || !title) { toast.error('Titre + fichier audio requis'); return; }
    const v = await validateAudioFile(file);
    if (!v.ok) { toast.error((v as { error: string }).error); return; }
    setBusy(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Connectez-vous');
      const audio_url = await uploadFile(file, 'music', v.mime);
      const cover_url = cover ? await uploadFile(cover, 'music-cover', cover.type) : null;
      const { error } = await supabase.from('music_tracks').insert({
        user_id: user.id, title, audio_url, cover_url,
        genre: genre || null, style: style || null, origin,
        album_id: albumId !== 'none' ? albumId : null,
      });
      if (error) throw error;
      toast.success('Morceau publié !');
      setOpen(false); setTitle(''); setFile(null); setCover(null); setGenre(''); setStyle(''); setAlbumId('none');
      onDone();
    } catch (e: any) { toast.error(e.message || 'Upload échoué'); }
    finally { setBusy(false); }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild><Button size="sm" className="gap-1.5"><Upload className="h-4 w-4" />Publier un morceau</Button></DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>Publier un morceau</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <Input placeholder="Titre" value={title} onChange={e => setTitle(e.target.value)} />
          <div>
            <label className="text-xs text-muted-foreground">Fichier audio</label>
            <Input type="file" accept="audio/*" onChange={e => setFile(e.target.files?.[0] || null)} />
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Pochette (optionnel)</label>
            <Input type="file" accept="image/*" onChange={e => setCover(e.target.files?.[0] || null)} />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Select value={genre} onValueChange={setGenre}>
              <SelectTrigger><SelectValue placeholder="Genre" /></SelectTrigger>
              <SelectContent>{GENRES.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}</SelectContent>
            </Select>
            <Select value={style} onValueChange={setStyle}>
              <SelectTrigger><SelectValue placeholder="Style" /></SelectTrigger>
              <SelectContent>{STYLES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Select value={origin} onValueChange={(v: any) => setOrigin(v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="human">🎤 Humain</SelectItem>
                <SelectItem value="ai">🎵 IA</SelectItem>
              </SelectContent>
            </Select>
            <Select value={albumId} onValueChange={setAlbumId}>
              <SelectTrigger><SelectValue placeholder="Album" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Aucun album</SelectItem>
                {albums.map(a => <SelectItem key={a.id} value={a.id}>{a.title}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <Button onClick={submit} disabled={busy} className="w-full">{busy ? 'Envoi…' : 'Publier'}</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const CreateAlbumDialog: React.FC<{ onDone: () => void }> = ({ onDone }) => {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [year, setYear] = useState('');
  const [cover, setCover] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (!title) { toast.error('Titre requis'); return; }
    setBusy(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Connectez-vous');
      const cover_url = cover ? await uploadFile(cover, 'album-cover') : null;
      const { error } = await supabase.from('music_albums').insert({
        user_id: user.id, title, cover_url, year: year ? parseInt(year) : null,
      });
      if (error) throw error;
      toast.success('Album créé !');
      setOpen(false); setTitle(''); setYear(''); setCover(null);
      onDone();
    } catch (e: any) { toast.error(e.message); }
    finally { setBusy(false); }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild><Button size="sm" variant="outline" className="gap-1.5"><Disc3 className="h-4 w-4" />Créer un album</Button></DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>Nouvel album</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <Input placeholder="Titre de l'album" value={title} onChange={e => setTitle(e.target.value)} />
          <Input placeholder="Année (ex: 2026)" type="number" value={year} onChange={e => setYear(e.target.value)} />
          <div>
            <label className="text-xs text-muted-foreground">Pochette</label>
            <Input type="file" accept="image/*" onChange={e => setCover(e.target.files?.[0] || null)} />
          </div>
          <Button onClick={submit} disabled={busy} className="w-full">{busy ? 'Création…' : 'Créer'}</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default Music;
