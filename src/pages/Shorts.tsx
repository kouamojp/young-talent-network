import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Heart, MessageCircle, Share2, Music, Volume2, VolumeX, Play, ArrowLeft, AlertTriangle, Send, Plus, Check } from 'lucide-react';
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
  comments_count?: number;
}

interface Comment {
  id: string;
  user_id: string;
  content: string;
  created_at: string;
  profile?: { name: string | null; avatar_url: string | null };
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
  const [progress, setProgress] = useState<Record<string, number>>({});
  const [heartBurst, setHeartBurst] = useState<Record<string, number>>({});
  const [following, setFollowing] = useState<Set<string>>(new Set());
  const [activeIdx, setActiveIdx] = useState(0);
  const [commentsOpen, setCommentsOpen] = useState<string | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const tapTimers = useRef<Record<string, any>>({});
  // Recommendation tracking: per-author and per-category engagement scores
  const authorScore = useRef<Map<string, number>>(new Map());
  const categoryScore = useRef<Map<string, number>>(new Map());
  const seenIds = useRef<Set<string>>(new Set());
  const watchAccum = useRef<Map<string, number>>(new Map()); // shortKey -> seconds watched
  const lastTickRef = useRef<{ key: string; t: number } | null>(null);

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
      const fset = new Set<string>();
      (conns || []).forEach(c => {
        const other = c.user_id === user.id ? c.connected_user_id : c.user_id;
        if (other) fset.add(other);
      });
      followedIds = Array.from(fset);
      setFollowing(fset);
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
    const [{ data: profiles }, likesAgg, mineLikes, commentsAgg] = await Promise.all([
      supabase.from('profiles').select('id, name, avatar_url').in('id', ids),
      supabase.from('media_likes' as any).select('media_id').in('media_id', mediaIds),
      uid ? supabase.from('media_likes' as any).select('media_id').in('media_id', mediaIds).eq('user_id', uid) : Promise.resolve({ data: [] as any[] }),
      supabase.from('media_comments' as any).select('media_id').in('media_id', mediaIds),
    ]);
    const pmap = new Map((profiles || []).map(p => [p.id, p]));
    const likeCount = new Map<string, number>();
    (likesAgg.data as any[] || []).forEach((l: any) => likeCount.set(l.media_id, (likeCount.get(l.media_id) || 0) + 1));
    const commentCount = new Map<string, number>();
    (commentsAgg.data as any[] || []).forEach((c: any) => commentCount.set(c.media_id, (commentCount.get(c.media_id) || 0) + 1));
    const mineSet = new Set((mineLikes.data as any[] || []).map((l: any) => l.media_id));
    return items.map(i => ({
      ...i,
      profile: pmap.get(i.user_id),
      likes: likeCount.get(i.id) || 0,
      liked: mineSet.has(i.id),
      comments_count: commentCount.get(i.id) || 0,
    }));
  };

  // Autoplay current video, track active index
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => entries.forEach(e => {
        const v = e.target as HTMLVideoElement;
        const idx = Number(v.dataset.idx);
        if (e.intersectionRatio > 0.7) {
          v.play().catch(() => {});
          setActiveIdx(idx);
        } else {
          v.pause();
        }
      }),
      { threshold: [0, 0.7, 1] }
    );
    videoRefs.current.forEach(v => v && observer.observe(v));
    return () => observer.disconnect();
  }, [shorts]);

  // Recommendation: when reaching the end, append more shuffled items
  useEffect(() => {
    if (shorts.length > 0 && activeIdx >= shorts.length - 2) {
      appendMore();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeIdx]);

  const appendMore = async () => {
    const { data } = await supabase
      .from('talent_media')
      .select('*')
      .in('media_type', ['short', 'video'])
      .limit(30);
    if (!data) return;
    const more = await enrich(shuffle(data), currentUser || undefined);
    // append with new keys to avoid duplicate observer issues
    setShorts(prev => [...prev, ...more.map(m => ({ ...m, id: `${m.id}-${prev.length}` }))]);
  };

  const toggleLike = async (s: Short, idx: number, animate = false) => {
    if (!currentUser) { toast.error('Connectez-vous'); return; }
    const realId = String(s.id).split('-')[0];
    const was = s.liked;
    setShorts(prev => prev.map((x, i) => i === idx ? { ...x, liked: animate ? true : !was, likes: (x.likes || 0) + ((animate ? !was : !was) ? 1 : -1) } : x));
    if (animate) setHeartBurst(p => ({ ...p, [s.id]: Date.now() }));
    if (animate && was) return; // double-tap on already-liked: just animate
    if (was) await supabase.from('media_likes' as any).delete().eq('media_id', realId).eq('user_id', currentUser);
    else await supabase.from('media_likes' as any).insert({ media_id: realId, user_id: currentUser });
  };

  const handleTap = (s: Short, idx: number) => {
    const key = s.id;
    if (tapTimers.current[key]) {
      clearTimeout(tapTimers.current[key]);
      tapTimers.current[key] = null;
      // double tap -> like
      toggleLike(s, idx, true);
    } else {
      tapTimers.current[key] = setTimeout(() => {
        tapTimers.current[key] = null;
        // single tap -> toggle mute
        setMuted(m => !m);
      }, 250);
    }
  };

  const toggleFollow = async (targetId: string) => {
    if (!currentUser) { toast.error('Connectez-vous'); return; }
    if (currentUser === targetId) return;
    const isFollowing = following.has(targetId);
    if (isFollowing) {
      await supabase.from('connections').delete()
        .or(`and(user_id.eq.${currentUser},connected_user_id.eq.${targetId}),and(user_id.eq.${targetId},connected_user_id.eq.${currentUser})`);
      setFollowing(prev => { const n = new Set(prev); n.delete(targetId); return n; });
    } else {
      await supabase.from('connections').insert({ user_id: currentUser, connected_user_id: targetId, status: 'accepted' });
      setFollowing(prev => new Set(prev).add(targetId));
      toast.success('Abonné');
    }
  };

  const openComments = async (mediaId: string) => {
    const realId = mediaId.split('-')[0];
    setCommentsOpen(mediaId);
    setComments([]);
    const { data } = await supabase
      .from('media_comments' as any)
      .select('*')
      .eq('media_id', realId)
      .order('created_at', { ascending: false });
    if (!data) return;
    const ids = [...new Set((data as any[]).map(c => c.user_id))];
    const { data: profiles } = await supabase.from('profiles').select('id, name, avatar_url').in('id', ids);
    const pmap = new Map((profiles || []).map(p => [p.id, p]));
    setComments((data as any[]).map(c => ({ ...c, profile: pmap.get(c.user_id) })));
  };

  const submitComment = async () => {
    if (!currentUser || !commentsOpen || !newComment.trim()) return;
    const realId = commentsOpen.split('-')[0];
    const { data, error } = await supabase.from('media_comments' as any)
      .insert({ media_id: realId, user_id: currentUser, content: newComment.trim() })
      .select().single();
    if (error) { toast.error(error.message); return; }
    const { data: profile } = await supabase.from('profiles').select('id, name, avatar_url').eq('id', currentUser).single();
    setComments(prev => [{ ...(data as any), profile }, ...prev]);
    setNewComment('');
    setShorts(prev => prev.map(s => s.id === commentsOpen ? { ...s, comments_count: (s.comments_count || 0) + 1 } : s));
  };

  return (
    <div className="fixed inset-0 z-40 bg-black">
      <div className="absolute top-3 left-3 right-3 z-30 flex items-center justify-between pointer-events-none">
        <Button size="icon" variant="secondary" className="rounded-full h-9 w-9 pointer-events-auto" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <span className="text-white font-semibold text-sm bg-black/30 px-3 py-1 rounded-full pointer-events-auto">Shorts</span>
        <Button size="icon" variant="secondary" className="rounded-full h-9 w-9 pointer-events-auto" onClick={() => setMuted(m => !m)}>
          {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
        </Button>
      </div>

      {loading ? (
        <div className="h-full flex items-center justify-center text-white/70 text-sm">Chargement...</div>
      ) : shorts.length === 0 ? (
        <div className="h-full flex flex-col items-center justify-center text-white/70 text-sm gap-2 px-6 text-center">
          <Play className="h-10 w-10 opacity-40" />
          <p>Aucun Short pour l'instant.</p>
        </div>
      ) : (
        <div className="h-full overflow-y-auto snap-y snap-mandatory scrollbar-hide" style={{ scrollbarWidth: 'none' }}>
          {shorts.map((short, idx) => {
            const isFollowing = following.has(short.user_id);
            const isSelf = currentUser === short.user_id;
            const prog = progress[short.id] || 0;
            return (
              <div key={short.id} className="relative h-full w-full snap-start snap-always overflow-hidden" style={{ height: '100dvh' }}>
                {videoErrors[short.id] ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-white/80">
                    <AlertTriangle className="h-10 w-10 mb-2 text-yellow-400" />
                    <p className="text-sm">Vidéo indisponible</p>
                  </div>
                ) : (
                  <video
                    ref={el => (videoRefs.current[idx] = el)}
                    data-idx={idx}
                    src={short.url}
                    className="absolute inset-0 w-full h-full object-cover"
                    loop
                    muted={muted}
                    playsInline
                    preload="metadata"
                    onClick={() => handleTap(short, idx)}
                    onTimeUpdate={(e) => {
                      const v = e.currentTarget;
                      if (v.duration) setProgress(p => ({ ...p, [short.id]: (v.currentTime / v.duration) * 100 }));
                    }}
                    onError={() => setVideoErrors(p => ({ ...p, [short.id]: true }))}
                  />
                )}

                {/* Heart burst animation on double-tap */}
                {heartBurst[short.id] && (
                  <div
                    key={heartBurst[short.id]}
                    className="absolute inset-0 flex items-center justify-center pointer-events-none z-20"
                  >
                    <Heart className="h-32 w-32 fill-red-500 text-red-500 animate-scale-in drop-shadow-2xl" style={{ animation: 'scale-in 0.4s ease-out, fade-out 0.6s ease-out 0.4s forwards' }} />
                  </div>
                )}

                <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/80 to-transparent pointer-events-none" />

                {/* Right side action rail */}
                <div className="absolute right-2 bottom-28 flex flex-col items-center gap-4 z-10">
                  <button onClick={() => toggleLike(short, idx)} className="flex flex-col items-center text-white">
                    <div className="bg-black/40 backdrop-blur-sm rounded-full p-2.5">
                      <Heart className={`h-6 w-6 transition-transform ${short.liked ? 'fill-red-500 text-red-500 scale-110' : ''}`} />
                    </div>
                    <span className="text-xs mt-1 font-semibold">{short.likes || 0}</span>
                  </button>
                  <button onClick={() => openComments(short.id)} className="flex flex-col items-center text-white">
                    <div className="bg-black/40 backdrop-blur-sm rounded-full p-2.5">
                      <MessageCircle className="h-6 w-6" />
                    </div>
                    <span className="text-xs mt-1 font-semibold">{short.comments_count || 0}</span>
                  </button>
                  <ShareMenu url={`${window.location.origin}/media?tab=shorts&v=${String(short.id).split('-')[0]}`} title={short.title || 'Short'}>
                    <button className="flex flex-col items-center text-white">
                      <div className="bg-black/40 backdrop-blur-sm rounded-full p-2.5">
                        <Share2 className="h-6 w-6" />
                      </div>
                      <span className="text-xs mt-1 font-semibold">Partager</span>
                    </button>
                  </ShareMenu>
                  <button onClick={() => setMuted(m => !m)} className="flex flex-col items-center text-white">
                    <div className="bg-black/40 backdrop-blur-sm rounded-full p-2.5">
                      {muted ? <VolumeX className="h-6 w-6" /> : <Volume2 className="h-6 w-6" />}
                    </div>
                  </button>
                </div>

                {/* Bottom info: avatar + follow, title, description, music */}
                <div className="absolute left-3 right-16 bottom-8 text-white z-10">
                  <div className="flex items-center gap-2 mb-2">
                    <Link to={`/talent/${short.user_id}`} className="relative">
                      <Avatar className="h-10 w-10 border-2 border-white">
                        <AvatarImage src={short.profile?.avatar_url || undefined} />
                        <AvatarFallback>{short.profile?.name?.[0] || 'U'}</AvatarFallback>
                      </Avatar>
                      {!isSelf && (
                        <button
                          onClick={(e) => { e.preventDefault(); toggleFollow(short.user_id); }}
                          className={`absolute -bottom-1.5 left-1/2 -translate-x-1/2 rounded-full h-5 w-5 flex items-center justify-center border-2 border-black ${isFollowing ? 'bg-emerald-500' : 'bg-red-500'}`}
                        >
                          {isFollowing ? <Check className="h-3 w-3 text-white" /> : <Plus className="h-3 w-3 text-white" />}
                        </button>
                      )}
                    </Link>
                    <Link to={`/talent/${short.user_id}`} className="font-semibold text-sm hover:underline">
                      @{short.profile?.name || 'user'}
                    </Link>
                  </div>
                  {short.title && <p className="text-sm font-semibold mb-1 line-clamp-1">{short.title}</p>}
                  {short.description && <p className="text-xs opacity-90 line-clamp-2">{short.description}</p>}
                  <div className="flex items-center gap-1.5 mt-2 text-xs opacity-90">
                    <Music className="h-3 w-3 animate-spin" style={{ animationDuration: '4s' }} />
                    <span className="truncate">Audio original · @{short.profile?.name || 'user'}</span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20 z-10">
                  <div className="h-full bg-white transition-all" style={{ width: `${prog}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Comments overlay */}
      <Sheet open={!!commentsOpen} onOpenChange={(o) => !o && setCommentsOpen(null)}>
        <SheetContent side="bottom" className="h-[70vh] flex flex-col p-0 rounded-t-2xl">
          <SheetHeader className="px-4 py-3 border-b">
            <SheetTitle>Commentaires</SheetTitle>
          </SheetHeader>
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
            {comments.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-8">Soyez le premier à commenter.</p>
            )}
            {comments.map(c => (
              <div key={c.id} className="flex gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={c.profile?.avatar_url || undefined} />
                  <AvatarFallback>{c.profile?.name?.[0] || 'U'}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="text-xs font-semibold">@{c.profile?.name || 'user'}</p>
                  <p className="text-sm">{c.content}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="border-t p-3 flex gap-2">
            <Input
              value={newComment}
              onChange={e => setNewComment(e.target.value)}
              placeholder="Ajouter un commentaire..."
              onKeyDown={e => e.key === 'Enter' && submitComment()}
            />
            <Button size="icon" onClick={submitComment} disabled={!newComment.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default ShortsPage;
