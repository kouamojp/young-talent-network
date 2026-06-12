import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Heart, MessageCircle, Share2, Music, Volume2, VolumeX, Play, Upload, AlertTriangle, Send } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import ShareMenu from '@/components/share/ShareMenu';

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
  comments_count?: number;
}

const ShortsFeed: React.FC = () => {
  const [shorts, setShorts] = useState<Short[]>([]);
  const [loading, setLoading] = useState(true);
  const [muted, setMuted] = useState(true);
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [videoErrors, setVideoErrors] = useState<Record<string, boolean>>({});
  const [videoLoading, setVideoLoading] = useState<Record<string, boolean>>({});
  const [commentsOpen, setCommentsOpen] = useState<Short | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setCurrentUser(data.user?.id || null));
    fetchShorts();

    const channel = supabase
      .channel('shorts-feed-realtime')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'talent_media' },
        (payload) => {
          const row: any = payload.new;
          if (!row || (row.media_type !== 'short' && row.media_type !== 'video')) return;
          fetchShorts();
        }
      )
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'talent_media' },
        () => fetchShorts()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchShorts = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    let { data } = await supabase
      .from('talent_media')
      .select('*')
      .eq('media_type', 'short')
      .order('created_at', { ascending: false })
      .limit(50);

    if (!data || data.length === 0) {
      const { data: videos } = await supabase
        .from('talent_media')
        .select('*')
        .eq('media_type', 'video')
        .order('created_at', { ascending: false })
        .limit(20);
      data = videos || [];
    }
    const enriched = await enrichWithProfiles(data, user?.id);
    setShorts(enriched);
    setLoading(false);
  };

  const enrichWithProfiles = async (items: any[], uid?: string): Promise<Short[]> => {
    if (items.length === 0) return [];
    const ids = [...new Set(items.map(i => i.user_id))];
    const mediaIds = items.map(i => i.id);
    const [{ data: profiles }, likesAgg, mineLikes, commentsAgg] = await Promise.all([
      supabase.from('profiles').select('id, name, avatar_url').in('id', ids),
      supabase.from('media_likes' as any).select('media_id, user_id').in('media_id', mediaIds),
      uid ? supabase.from('media_likes' as any).select('media_id').in('media_id', mediaIds).eq('user_id', uid) : Promise.resolve({ data: [] as any[] }),
      supabase.from('media_comments' as any).select('media_id').in('media_id', mediaIds),
    ]);
    const pmap = new Map((profiles || []).map(p => [p.id, p]));
    const likeCount = new Map<string, number>();
    (likesAgg.data as any[] || []).forEach((l: any) => likeCount.set(l.media_id, (likeCount.get(l.media_id) || 0) + 1));
    const mineSet = new Set((mineLikes.data as any[] || []).map((l: any) => l.media_id));
    const commentCount = new Map<string, number>();
    (commentsAgg.data as any[] || []).forEach((c: any) => commentCount.set(c.media_id, (commentCount.get(c.media_id) || 0) + 1));
    return items.map(i => ({
      ...i,
      profile: pmap.get(i.user_id),
      likes: likeCount.get(i.id) || 0,
      liked: mineSet.has(i.id),
      comments_count: commentCount.get(i.id) || 0,
    }));
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

  const toggleLike = async (short: Short, idx: number) => {
    if (!currentUser) { toast.error('Connectez-vous pour aimer'); return; }
    const wasLiked = short.liked;
    setShorts(prev => prev.map((s, i) => i === idx ? { ...s, liked: !wasLiked, likes: (s.likes || 0) + (wasLiked ? -1 : 1) } : s));
    if (wasLiked) {
      await supabase.from('media_likes' as any).delete().eq('media_id', short.id).eq('user_id', currentUser);
    } else {
      await supabase.from('media_likes' as any).insert({ media_id: short.id, user_id: currentUser });
    }
  };

  const togglePlay = (idx: number) => {
    const v = videoRefs.current[idx];
    if (!v) return;
    if (v.paused) v.play().catch(() => toast.error('Lecture impossible')); else v.pause();
  };

  const shareUrl = (s: Short) => `${window.location.origin}/media?tab=shorts&v=${s.id}`;

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
              {videoErrors[short.id] ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-white/80 bg-gradient-to-br from-zinc-900 to-black">
                  <AlertTriangle className="h-10 w-10 mb-2 text-yellow-400" />
                  <p className="text-sm">Vidéo indisponible</p>
                  <Button size="sm" variant="secondary" className="mt-3" onClick={() => {
                    setVideoErrors(p => ({ ...p, [short.id]: false }));
                    const v = videoRefs.current[idx];
                    if (v) { v.load(); v.play().catch(() => {}); }
                  }}>Réessayer</Button>
                </div>
              ) : (
                <>
                  {videoLoading[short.id] && (
                    <div className="absolute inset-0 flex items-center justify-center z-10">
                      <div className="h-10 w-10 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    </div>
                  )}
                  <video
                    ref={el => (videoRefs.current[idx] = el)}
                    src={short.url}
                    className="absolute inset-0 w-full h-full object-cover"
                    loop
                    muted={muted}
                    playsInline
                    preload="metadata"
                    onClick={() => togglePlay(idx)}
                    onLoadStart={() => setVideoLoading(p => ({ ...p, [short.id]: true }))}
                    onCanPlay={() => setVideoLoading(p => ({ ...p, [short.id]: false }))}
                    onError={() => {
                      setVideoLoading(p => ({ ...p, [short.id]: false }));
                      setVideoErrors(p => ({ ...p, [short.id]: true }));
                    }}
                  />
                </>
              )}

              <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/80 to-transparent pointer-events-none" />

              <div className="absolute right-2 bottom-20 flex flex-col items-center gap-4 z-10">
                <button onClick={() => toggleLike(short, idx)} className="flex flex-col items-center text-white">
                  <div className="bg-black/40 backdrop-blur-sm rounded-full p-2.5">
                    <Heart className={`h-6 w-6 ${short.liked ? 'fill-red-500 text-red-500' : ''}`} />
                  </div>
                  <span className="text-xs mt-1 font-semibold">{short.likes || 0}</span>
                </button>
                <button onClick={() => setCommentsOpen(short)} className="flex flex-col items-center text-white">
                  <div className="bg-black/40 backdrop-blur-sm rounded-full p-2.5">
                    <MessageCircle className="h-6 w-6" />
                  </div>
                  <span className="text-xs mt-1 font-semibold">{short.comments_count || 0}</span>
                </button>
                <ShareMenu url={shareUrl(short)} title={short.title || 'Regarde ce Short !'}>
                  <button className="flex flex-col items-center text-white">
                    <div className="bg-black/40 backdrop-blur-sm rounded-full p-2.5">
                      <Share2 className="h-6 w-6" />
                    </div>
                    <span className="text-xs mt-1 font-semibold">Partager</span>
                  </button>
                </ShareMenu>
              </div>

              <div className="absolute left-3 right-16 bottom-4 text-white z-10">
                <div className="flex items-center gap-2 mb-2">
                  <Link to={`/talent/${short.user_id}`}>
                    <Avatar className="h-9 w-9 border-2 border-white hover:scale-105 transition">
                      <AvatarImage src={short.profile?.avatar_url || undefined} />
                      <AvatarFallback>{short.profile?.name?.[0] || 'U'}</AvatarFallback>
                    </Avatar>
                  </Link>
                  <Link to={`/talent/${short.user_id}`} className="font-semibold text-sm hover:underline">
                    @{short.profile?.name || 'user'}
                  </Link>
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

      <CommentsDialog short={commentsOpen} onClose={() => { setCommentsOpen(null); fetchShorts(); }} currentUser={currentUser} />
    </div>
  );
};

const CommentsDialog: React.FC<{ short: Short | null; onClose: () => void; currentUser: string | null }> = ({ short, onClose, currentUser }) => {
  const [comments, setComments] = useState<any[]>([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!short) return;
    (async () => {
      const { data } = await supabase
        .from('media_comments' as any)
        .select('*')
        .eq('media_id', short.id)
        .order('created_at', { ascending: true });
      const list = (data as any[]) || [];
      const ids = [...new Set(list.map((c: any) => c.user_id))];
      const { data: profiles } = ids.length ? await supabase.from('profiles').select('id,name,avatar_url').in('id', ids) : { data: [] };
      const map = new Map((profiles || []).map(p => [p.id, p]));
      setComments(list.map((c: any) => ({ ...c, profile: map.get(c.user_id) })));
    })();
  }, [short?.id]);

  const submit = async () => {
    if (!short || !currentUser || !text.trim()) return;
    setLoading(true);
    const { data, error } = await supabase.from('media_comments' as any).insert({
      media_id: short.id, user_id: currentUser, content: text.trim(),
    }).select().single();
    setLoading(false);
    if (error) { toast.error(error.message); return; }
    const { data: prof } = await supabase.from('profiles').select('id,name,avatar_url').eq('id', currentUser).maybeSingle();
    setComments(prev => [...prev, { ...(data as any), profile: prof }]);
    setText('');
  };

  return (
    <Dialog open={!!short} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md max-h-[80vh] flex flex-col">
        <DialogHeader><DialogTitle>Commentaires</DialogTitle></DialogHeader>
        <div className="flex-1 overflow-y-auto space-y-3 py-2">
          {comments.length === 0 && <p className="text-sm text-muted-foreground text-center py-6">Aucun commentaire. Soyez le premier !</p>}
          {comments.map(c => (
            <div key={c.id} className="flex gap-2">
              <Avatar className="h-8 w-8"><AvatarImage src={c.profile?.avatar_url || undefined} /><AvatarFallback>{c.profile?.name?.[0] || 'U'}</AvatarFallback></Avatar>
              <div className="flex-1 bg-muted rounded-lg px-3 py-2">
                <p className="text-xs font-semibold">{c.profile?.name || 'User'}</p>
                <p className="text-sm">{c.content}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="flex gap-2 pt-2 border-t">
          <Input value={text} onChange={e => setText(e.target.value)} placeholder="Ajouter un commentaire..." onKeyDown={e => e.key === 'Enter' && submit()} />
          <Button onClick={submit} disabled={loading || !text.trim()} size="icon"><Send className="h-4 w-4" /></Button>
        </div>
      </DialogContent>
    </Dialog>
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
      const { error: upErr } = await supabase.storage.from('profile-files').upload(path, file, { contentType: file.type });
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
