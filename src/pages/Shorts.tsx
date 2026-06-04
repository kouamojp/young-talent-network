import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Heart, MessageCircle, Share2, Music, Volume2, VolumeX, Play, ArrowLeft, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import ShareMenu from '@/components/share/ShareMenu';

interface Short {
  id: string;
  user_id: string;
  url: string;
  title: string | null;
  description: string | null;
  profile?: { name: string | null; avatar_url: string | null };
  likes?: number;
  liked?: boolean;
}

const shuffle = <T,>(arr: T[]): T[] => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

const ShortsPage: React.FC = () => {
  const navigate = useNavigate();
  const [shorts, setShorts] = useState<Short[]>([]);
  const [loading, setLoading] = useState(true);
  const [muted, setMuted] = useState(true);
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [videoErrors, setVideoErrors] = useState<Record<string, boolean>>({});
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    setCurrentUser(user?.id || null);

    let followedIds: string[] = [];
    if (user) {
      const { data: conns } = await supabase
        .from('connections')
        .select('user_id, connected_user_id, status')
        .or(`user_id.eq.${user.id},connected_user_id.eq.${user.id}`)
        .eq('status', 'accepted');
      followedIds = (conns || [])
        .map(c => c.user_id === user.id ? c.connected_user_id : c.user_id)
        .filter(Boolean);
    }

    let query = supabase
      .from('talent_media')
      .select('*')
      .in('media_type', ['short', 'video'])
      .limit(100);

    if (followedIds.length > 0) {
      query = query.in('user_id', followedIds);
    }

    let { data } = await query;
    if (!data || data.length === 0) {
      const fallback = await supabase
        .from('talent_media')
        .select('*')
        .in('media_type', ['short', 'video'])
        .limit(50);
      data = fallback.data || [];
    }

    const items = shuffle(data || []);
    const enriched = await enrich(items, user?.id);
    setShorts(enriched);
    setLoading(false);
  };

  const enrich = async (items: any[], uid?: string): Promise<Short[]> => {
    if (items.length === 0) return [];
    const ids = [...new Set(items.map(i => i.user_id))];
    const mediaIds = items.map(i => i.id);
    const [{ data: profiles }, likesAgg, mineLikes] = await Promise.all([
      supabase.from('profiles').select('id, name, avatar_url').in('id', ids),
      supabase.from('media_likes' as any).select('media_id').in('media_id', mediaIds),
      uid ? supabase.from('media_likes' as any).select('media_id').in('media_id', mediaIds).eq('user_id', uid) : Promise.resolve({ data: [] as any[] }),
    ]);
    const pmap = new Map((profiles || []).map(p => [p.id, p]));
    const likeCount = new Map<string, number>();
    (likesAgg.data as any[] || []).forEach((l: any) => likeCount.set(l.media_id, (likeCount.get(l.media_id) || 0) + 1));
    const mineSet = new Set((mineLikes.data as any[] || []).map((l: any) => l.media_id));
    return items.map(i => ({
      ...i,
      profile: pmap.get(i.user_id),
      likes: likeCount.get(i.id) || 0,
      liked: mineSet.has(i.id),
    }));
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => entries.forEach(e => {
        const v = e.target as HTMLVideoElement;
        if (e.intersectionRatio > 0.7) v.play().catch(() => {});
        else v.pause();
      }),
      { threshold: [0, 0.7, 1] }
    );
    videoRefs.current.forEach(v => v && observer.observe(v));
    return () => observer.disconnect();
  }, [shorts]);

  const toggleLike = async (s: Short, idx: number) => {
    if (!currentUser) { toast.error('Connectez-vous'); return; }
    const was = s.liked;
    setShorts(prev => prev.map((x, i) => i === idx ? { ...x, liked: !was, likes: (x.likes || 0) + (was ? -1 : 1) } : x));
    if (was) await supabase.from('media_likes' as any).delete().eq('media_id', s.id).eq('user_id', currentUser);
    else await supabase.from('media_likes' as any).insert({ media_id: s.id, user_id: currentUser });
  };

  const togglePlay = (idx: number) => {
    const v = videoRefs.current[idx];
    if (!v) return;
    if (v.paused) v.play().catch(() => {}); else v.pause();
  };

  return (
    <div className="fixed inset-0 z-40 bg-black">
      <div className="absolute top-3 left-3 right-3 z-30 flex items-center justify-between">
        <Button size="icon" variant="secondary" className="rounded-full h-9 w-9" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <span className="text-white font-semibold text-sm">Shorts • Abonnements</span>
        <Button size="icon" variant="secondary" className="rounded-full h-9 w-9" onClick={() => setMuted(m => !m)}>
          {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
        </Button>
      </div>

      {loading ? (
        <div className="h-full flex items-center justify-center text-white/70 text-sm">Chargement...</div>
      ) : shorts.length === 0 ? (
        <div className="h-full flex flex-col items-center justify-center text-white/70 text-sm gap-2 px-6 text-center">
          <Play className="h-10 w-10 opacity-40" />
          <p>Aucun Short de vos abonnements pour l'instant.</p>
        </div>
      ) : (
        <div className="h-full overflow-y-auto snap-y snap-mandatory scrollbar-hide" style={{ scrollbarWidth: 'none' }}>
          {shorts.map((short, idx) => (
            <div key={short.id} className="relative h-full w-full snap-start snap-always" style={{ height: '100dvh' }}>
              {videoErrors[short.id] ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-white/80">
                  <AlertTriangle className="h-10 w-10 mb-2 text-yellow-400" />
                  <p className="text-sm">Vidéo indisponible</p>
                </div>
              ) : (
                <video
                  ref={el => (videoRefs.current[idx] = el)}
                  src={short.url}
                  className="absolute inset-0 w-full h-full object-cover"
                  loop
                  muted={muted}
                  playsInline
                  preload="metadata"
                  onClick={() => togglePlay(idx)}
                  onError={() => setVideoErrors(p => ({ ...p, [short.id]: true }))}
                />
              )}

              <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/80 to-transparent pointer-events-none" />

              <div className="absolute right-2 bottom-24 flex flex-col items-center gap-4 z-10">
                <button onClick={() => toggleLike(short, idx)} className="flex flex-col items-center text-white">
                  <div className="bg-black/40 backdrop-blur-sm rounded-full p-2.5">
                    <Heart className={`h-6 w-6 ${short.liked ? 'fill-red-500 text-red-500' : ''}`} />
                  </div>
                  <span className="text-xs mt-1 font-semibold">{short.likes || 0}</span>
                </button>
                <button onClick={() => navigate(`/media?tab=shorts&v=${short.id}`)} className="flex flex-col items-center text-white">
                  <div className="bg-black/40 backdrop-blur-sm rounded-full p-2.5">
                    <MessageCircle className="h-6 w-6" />
                  </div>
                  <span className="text-xs mt-1 font-semibold">Commenter</span>
                </button>
                <ShareMenu url={`${window.location.origin}/media?tab=shorts&v=${short.id}`} title={short.title || 'Short'}>
                  <button className="flex flex-col items-center text-white">
                    <div className="bg-black/40 backdrop-blur-sm rounded-full p-2.5">
                      <Share2 className="h-6 w-6" />
                    </div>
                    <span className="text-xs mt-1 font-semibold">Partager</span>
                  </button>
                </ShareMenu>
              </div>

              <div className="absolute left-3 right-16 bottom-20 text-white z-10">
                <div className="flex items-center gap-2 mb-2">
                  <Link to={`/talent/${short.user_id}`}>
                    <Avatar className="h-9 w-9 border-2 border-white">
                      <AvatarImage src={short.profile?.avatar_url || undefined} />
                      <AvatarFallback>{short.profile?.name?.[0] || 'U'}</AvatarFallback>
                    </Avatar>
                  </Link>
                  <Link to={`/talent/${short.user_id}`} className="font-semibold text-sm hover:underline">
                    @{short.profile?.name || 'user'}
                  </Link>
                </div>
                {short.title && <p className="text-sm font-semibold mb-1">{short.title}</p>}
                {short.description && <p className="text-xs opacity-90 line-clamp-2">{short.description}</p>}
                <div className="flex items-center gap-1.5 mt-2 text-xs opacity-90">
                  <Music className="h-3 w-3" />
                  <span className="truncate">Original audio - @{short.profile?.name || 'user'}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ShortsPage;
