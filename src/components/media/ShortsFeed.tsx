import React, { useEffect, useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Heart, MessageCircle, Share2, Music, Volume2, VolumeX, Play, Upload } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

interface Short {
  id: string;
  user_id: string;
  url: string;
  title: string | null;
  description: string | null;
  created_at: string;
  profile?: { name: string | null; avatar_url: string | null };
  likes?: number;
  liked?: boolean;
}

const ShortsFeed: React.FC = () => {
  const [shorts, setShorts] = useState<Short[]>([]);
  const [loading, setLoading] = useState(true);
  const [muted, setMuted] = useState(true);
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setCurrentUser(data.user?.id || null));
    fetchShorts();
  }, []);

  const fetchShorts = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('talent_media')
      .select('*')
      .eq('media_type', 'short')
      .order('created_at', { ascending: false })
      .limit(50);

    if (!data || data.length === 0) {
      // fallback: also include regular videos as shorts
      const { data: videos } = await supabase
        .from('talent_media')
        .select('*')
        .eq('media_type', 'video')
        .order('created_at', { ascending: false })
        .limit(20);
      const items = videos || [];
      const enriched = await enrichWithProfiles(items);
      setShorts(enriched);
    } else {
      const enriched = await enrichWithProfiles(data);
      setShorts(enriched);
    }
    setLoading(false);
  };

  const enrichWithProfiles = async (items: any[]): Promise<Short[]> => {
    if (items.length === 0) return [];
    const ids = [...new Set(items.map(i => i.user_id))];
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, name, avatar_url')
      .in('id', ids);
    const map = new Map((profiles || []).map(p => [p.id, p]));
    return items.map(i => ({ ...i, profile: map.get(i.user_id), likes: 0, liked: false }));
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          const video = entry.target as HTMLVideoElement;
          if (entry.intersectionRatio > 0.7) {
            video.play().catch(() => {});
          } else {
            video.pause();
          }
        });
      },
      { threshold: [0, 0.7, 1] }
    );
    videoRefs.current.forEach(v => v && observer.observe(v));
    return () => observer.disconnect();
  }, [shorts]);

  const toggleLike = (idx: number) => {
    setShorts(prev =>
      prev.map((s, i) =>
        i === idx ? { ...s, liked: !s.liked, likes: (s.likes || 0) + (s.liked ? -1 : 1) } : s
      )
    );
  };

  const togglePlay = (idx: number) => {
    const v = videoRefs.current[idx];
    if (!v) return;
    if (v.paused) v.play(); else v.pause();
  };

  if (loading) {
    return <div className="text-center py-12 text-muted-foreground text-sm">Chargement des Shorts...</div>;
  }

  if (shorts.length === 0) {
    return (
      <div className="text-center py-16 text-muted-foreground">
        <Play className="h-10 w-10 mx-auto mb-2 opacity-30" />
        <p className="text-sm">Aucun Short pour l'instant</p>
        <p className="text-xs mt-1">Soyez le premier à publier !</p>
        <div className="mt-4 flex justify-center">
          <UploadShortDialog onUploaded={fetchShorts} />
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="absolute top-2 right-2 z-20 flex gap-2">
        <UploadShortDialog onUploaded={fetchShorts} />
        <Button size="icon" variant="secondary" onClick={() => setMuted(m => !m)} className="rounded-full h-9 w-9">
          {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
        </Button>
      </div>

      <div
        ref={containerRef}
        className="h-[calc(100vh-180px)] md:h-[80vh] max-w-md mx-auto overflow-y-auto snap-y snap-mandatory rounded-xl bg-black scrollbar-hide"
        style={{ scrollbarWidth: 'none' }}
      >
        {shorts.map((short, idx) => (
          <div key={short.id} className="relative h-full w-full snap-start snap-always flex items-center justify-center" style={{ height: '100%' }}>
            <div className="relative w-full h-full" style={{ minHeight: '100%' }}>
              <video
                ref={el => (videoRefs.current[idx] = el)}
                src={short.url}
                className="absolute inset-0 w-full h-full object-cover"
                loop
                muted={muted}
                playsInline
                onClick={() => togglePlay(idx)}
              />

              {/* Gradient overlay */}
              <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/80 to-transparent pointer-events-none" />

              {/* Right side actions */}
              <div className="absolute right-2 bottom-20 flex flex-col items-center gap-4 z-10">
                <button onClick={() => toggleLike(idx)} className="flex flex-col items-center text-white">
                  <div className="bg-black/40 backdrop-blur-sm rounded-full p-2.5">
                    <Heart className={`h-6 w-6 ${short.liked ? 'fill-red-500 text-red-500' : ''}`} />
                  </div>
                  <span className="text-xs mt-1 font-semibold">{short.likes || 0}</span>
                </button>
                <button
                  onClick={() => toast.info('Commentaires bientôt disponibles')}
                  className="flex flex-col items-center text-white"
                >
                  <div className="bg-black/40 backdrop-blur-sm rounded-full p-2.5">
                    <MessageCircle className="h-6 w-6" />
                  </div>
                  <span className="text-xs mt-1 font-semibold">0</span>
                </button>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(short.url);
                    toast.success('Lien copié !');
                  }}
                  className="flex flex-col items-center text-white"
                >
                  <div className="bg-black/40 backdrop-blur-sm rounded-full p-2.5">
                    <Share2 className="h-6 w-6" />
                  </div>
                  <span className="text-xs mt-1 font-semibold">Partager</span>
                </button>
              </div>

              {/* Bottom info */}
              <div className="absolute left-3 right-16 bottom-4 text-white z-10">
                <div className="flex items-center gap-2 mb-2">
                  <Avatar className="h-9 w-9 border-2 border-white">
                    <AvatarImage src={short.profile?.avatar_url || undefined} />
                    <AvatarFallback>{short.profile?.name?.[0] || 'U'}</AvatarFallback>
                  </Avatar>
                  <span className="font-semibold text-sm">@{short.profile?.name || 'user'}</span>
                  <Button size="sm" variant="outline" className="h-7 px-3 text-xs border-white text-white bg-transparent hover:bg-white hover:text-black ml-1">
                    Suivre
                  </Button>
                </div>
                {short.title && <p className="text-sm font-semibold mb-1">{short.title}</p>}
                {short.description && <p className="text-xs opacity-90 line-clamp-2">{short.description}</p>}
                <div className="flex items-center gap-1.5 mt-2 text-xs opacity-90">
                  <Music className="h-3 w-3" />
                  <span className="truncate">Original audio - @{short.profile?.name || 'user'}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const UploadShortDialog: React.FC<{ onUploaded: () => void }> = ({ onUploaded }) => {
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [uploading, setUploading] = useState(false);

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { toast.error('Connectez-vous'); return; }
      const ext = file.name.split('.').pop();
      const path = `${user.id}/shorts/${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage.from('profile-files').upload(path, file);
      if (upErr) throw upErr;
      const { data: urlData } = supabase.storage.from('profile-files').getPublicUrl(path);
      const { error } = await supabase.from('talent_media').insert({
        user_id: user.id,
        media_type: 'short',
        url: urlData.publicUrl,
        title: title || null,
        description: description || null,
      });
      if (error) throw error;
      toast.success('Short publié !');
      setFile(null); setTitle(''); setDescription(''); setOpen(false);
      onUploaded();
    } catch (e: any) {
      toast.error(e.message || 'Erreur');
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="icon" variant="secondary" className="rounded-full h-9 w-9">
          <Upload className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>Publier un Short</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <Input type="file" accept="video/*" onChange={e => setFile(e.target.files?.[0] || null)} />
          <Input placeholder="Titre" value={title} onChange={e => setTitle(e.target.value)} />
          <Textarea placeholder="Description, #hashtags..." value={description} onChange={e => setDescription(e.target.value)} rows={3} />
          <Button onClick={handleUpload} disabled={!file || uploading} className="w-full">
            {uploading ? 'Envoi...' : 'Publier'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ShortsFeed;
