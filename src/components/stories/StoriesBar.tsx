import { useState, useEffect, useRef } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { supabase } from '@/integrations/supabase/client';
import {
  Plus, X, Eye, Loader2, Image as ImageIcon, Smile, Type, Video,
  Heart, MessageCircle, Share2, MoreVertical, Trash2, Pencil,
  ChevronLeft, ChevronRight, AlertTriangle,
} from 'lucide-react';
import { useLanguage } from '@/i18n/LanguageContext';
import { toast } from '@/components/ui/use-toast';
import { formatDistanceToNow } from 'date-fns';

type MediaKind = 'image' | 'video';
interface StoryMediaItem { url: string; type: MediaKind }

interface Story {
  id: string;
  user_id: string;
  media_url: string | null;
  media_items: StoryMediaItem[] | null;
  text_overlay: string | null;
  background_color: string;
  views_count: number;
  created_at: string;
  expires_at: string;
  profile?: { name: string; avatar_url: string | null };
}

interface GroupedStories {
  user_id: string;
  name: string;
  avatar_url: string | null;
  stories: Story[];
}

const EMOJIS = [
  '😀','😂','🥰','😍','😎','🤩','🥳','😇','🤔','😉',
  '😢','😭','😡','🤯','🥺','😱','🤗','🤤','😴','🤓',
  '❤️','🧡','💛','💚','💙','💜','🖤','🤍','💔','💖',
  '🔥','✨','⭐','🌟','💫','⚡','💥','🎉','🎊','🎈',
  '👍','👎','👏','🙏','💪','🤝','✌️','🤞','👌','🫶',
  '🚀','🏆','🥇','🎯','💎','💰','📸','🎵','🎤','🎬',
];

const guessKind = (file: File | string): MediaKind => {
  if (typeof file === 'string') return /\.(mp4|webm|mov|m4v|ogv)(\?|$)/i.test(file) ? 'video' : 'image';
  return file.type.startsWith('video') ? 'video' : 'image';
};

const getMediaList = (s: Story): StoryMediaItem[] => {
  if (Array.isArray(s.media_items) && s.media_items.length) return s.media_items;
  if (s.media_url) return [{ url: s.media_url, type: guessKind(s.media_url) }];
  return [];
};

export const StoriesBar = () => {
  const { t } = useLanguage();
  const [groups, setGroups] = useState<GroupedStories[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Viewer state
  const [viewing, setViewing] = useState<{ group: GroupedStories; index: number; mediaIdx: number } | null>(null);
  const [videoError, setVideoError] = useState(false);
  const [videoLoaded, setVideoLoaded] = useState(false);

  // Like/comment local state (per story id)
  const [liked, setLiked] = useState<Record<string, boolean>>({});
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState<any[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [commentsHasMore, setCommentsHasMore] = useState(false);
  const [commentsPosting, setCommentsPosting] = useState(false);
  const [paused, setPaused] = useState(false);
  const COMMENTS_PAGE = 15;

  // gesture refs
  const touchStartRef = useRef<{ x: number; y: number; t: number } | null>(null);
  const holdTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const holdRepeatRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const holdActiveRef = useRef(false);

  // Creation state
  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [text, setText] = useState('');
  const [bgColor, setBgColor] = useState('#1a1a2e');
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<{ url: string; kind: MediaKind }[]>([]);
  const [existingMedia, setExistingMedia] = useState<StoryMediaItem[]>([]); // when editing
  const [submitting, setSubmitting] = useState(false);
  const [textAlign, setTextAlign] = useState<'center' | 'top' | 'bottom'>('center');
  const [fontSize, setFontSize] = useState(28);
  const [previewIndex, setPreviewIndex] = useState(0);

  const scrollRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLTextAreaElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const videoElRef = useRef<HTMLVideoElement>(null);

  const colors = ['#1a1a2e', '#16213e', '#0f3460', '#533483', '#e94560', '#1b9c85', '#ff6b35', '#f7dc6f', '#000000', '#ffffff'];

  useEffect(() => {
    loadStories();
    loadUser();
  }, []);

  const loadUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data } = await supabase.from('profiles').select('id, name, avatar_url').eq('id', user.id).single();
      setCurrentUser(data);
    }
  };

  const loadStories = async () => {
    const { data } = await supabase
      .from('stories')
      .select('*')
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false });

    if (!data?.length) { setGroups([]); return; }

    const userIds = [...new Set(data.map(s => s.user_id))];
    const { data: profiles } = await supabase.from('profiles').select('id, name, avatar_url').in('id', userIds);
    const profMap = new Map((profiles || []).map(p => [p.id, p]));

    const grouped = new Map<string, GroupedStories>();
    for (const s of data) {
      const p = profMap.get(s.user_id);
      if (!grouped.has(s.user_id)) {
        grouped.set(s.user_id, {
          user_id: s.user_id,
          name: p?.name || 'User',
          avatar_url: p?.avatar_url || null,
          stories: [],
        });
      }
      grouped.get(s.user_id)!.stories.push({ ...(s as any), profile: p || undefined });
    }
    setGroups(Array.from(grouped.values()));
  };

  const resetForm = () => {
    setText(''); setFiles([]); setPreviews([]); setExistingMedia([]);
    setBgColor('#1a1a2e'); setTextAlign('center'); setFontSize(28);
    setEditingId(null); setPreviewIndex(0);
  };

  const startEdit = (story: Story) => {
    setEditingId(story.id);
    setText(story.text_overlay || '');
    setBgColor(story.background_color || '#1a1a2e');
    setExistingMedia(getMediaList(story));
    setFiles([]); setPreviews([]);
    setCreating(true);
    setViewing(null);
  };

  const saveStory = async () => {
    const totalMedia = existingMedia.length + previews.length;
    if (!text.trim() && totalMedia === 0) {
      toast({ title: 'Ajoutez du texte ou un média', variant: 'destructive' });
      return;
    }
    setSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Non authentifié');

      const uploaded: StoryMediaItem[] = [];
      for (const f of files) {
        const ext = f.name.split('.').pop();
        const path = `${user.id}/stories/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
        const { error } = await supabase.storage.from('profile-files').upload(path, f, {
          cacheControl: '3600',
          contentType: f.type,
        });
        if (error) throw error;
        const url = supabase.storage.from('profile-files').getPublicUrl(path).data.publicUrl;
        uploaded.push({ url, type: guessKind(f) });
      }

      const media_items = [...existingMedia, ...uploaded];

      if (editingId) {
        const { error } = await supabase.from('stories').update({
          text_overlay: text.trim() || null,
          background_color: bgColor,
          media_items: media_items as any,
          media_url: media_items[0]?.url || null,
        }).eq('id', editingId);
        if (error) throw error;
        toast({ title: 'Story mise à jour' });
      } else {
        const { error } = await supabase.from('stories').insert({
          user_id: user.id,
          text_overlay: text.trim() || null,
          background_color: bgColor,
          media_url: media_items[0]?.url || null,
          media_items: media_items as any,
        });
        if (error) throw error;
        toast({ title: 'Story publiée !' });
      }

      setCreating(false);
      resetForm();
      loadStories();
    } catch (e: any) {
      toast({ title: e.message, variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  const deleteStory = async (id: string) => {
    if (!confirm('Supprimer cette story ?')) return;
    const { error } = await supabase.from('stories').delete().eq('id', id);
    if (error) { toast({ title: error.message, variant: 'destructive' }); return; }
    toast({ title: 'Story supprimée' });
    setViewing(null);
    loadStories();
  };

  const openStory = (group: GroupedStories, index = 0) => {
    setVideoError(false); setVideoLoaded(false);
    setViewing({ group, index, mediaIdx: 0 });
    scheduleAdvance(group, index, 0);
  };

  const scheduleAdvance = (group: GroupedStories, index: number, mediaIdx: number) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (paused) return;
    const story = group.stories[index];
    const list = getMediaList(story);
    const current = list[mediaIdx];
    if (current?.type === 'video') return;
    timerRef.current = setTimeout(() => advance(1), 5000);
  };

  const advanceGroup = (dir: number) => {
    setViewing(v => {
      if (!v) return v;
      const idx = groups.findIndex(g => g.user_id === v.group.user_id);
      const nextIdx = idx + dir;
      if (nextIdx < 0 || nextIdx >= groups.length) return null;
      const next = { group: groups[nextIdx], index: 0, mediaIdx: 0 };
      setVideoError(false); setVideoLoaded(false);
      setShowComments(false); setComments([]);
      scheduleAdvance(next.group, 0, 0);
      return next;
    });
  };

  const advance = (dir: number) => {
    setViewing(v => {
      if (!v) return v;
      const list = getMediaList(v.group.stories[v.index]);
      let newMediaIdx = v.mediaIdx + dir;
      let newIndex = v.index;
      if (newMediaIdx >= list.length) {
        newMediaIdx = 0;
        newIndex = v.index + 1;
      } else if (newMediaIdx < 0) {
        newIndex = v.index - 1;
        if (newIndex < 0) { return null; }
        newMediaIdx = getMediaList(v.group.stories[newIndex]).length - 1;
        if (newMediaIdx < 0) newMediaIdx = 0;
      }
      if (newIndex >= v.group.stories.length) return null;
      const next = { ...v, index: newIndex, mediaIdx: newMediaIdx };
      setVideoError(false); setVideoLoaded(false);
      scheduleAdvance(v.group, newIndex, newMediaIdx);
      return next;
    });
  };

  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current); }, []);

  // ===== Preload next & next-of-next media to make transitions instant =====
  useEffect(() => {
    if (!viewing) return;
    const preloadOne = (item?: StoryMediaItem) => {
      if (!item) return;
      if (item.type === 'image') {
        const img = new Image();
        img.src = item.url;
      } else {
        const v = document.createElement('video');
        v.preload = 'auto';
        v.src = item.url;
        // hint browser to start fetching
        try { v.load(); } catch {}
      }
    };
    const list = getMediaList(viewing.group.stories[viewing.index]);
    // next within same story
    preloadOne(list[viewing.mediaIdx + 1]);
    preloadOne(list[viewing.mediaIdx + 2]);
    // first item of next story
    const nextStory = viewing.group.stories[viewing.index + 1];
    if (nextStory) {
      const nextList = getMediaList(nextStory);
      preloadOne(nextList[0]);
      preloadOne(nextList[1]);
    }
  }, [viewing?.index, viewing?.mediaIdx, viewing?.group.user_id]);

  // Preload first media of each story group on bar mount (so first open is instant)
  useEffect(() => {
    if (!groups.length) return;
    const idle = (cb: () => void) => (window as any).requestIdleCallback ? (window as any).requestIdleCallback(cb) : setTimeout(cb, 200);
    idle(() => {
      groups.slice(0, 8).forEach(g => {
        const first = getMediaList(g.stories[0])[0];
        if (first?.type === 'image') { const i = new Image(); i.src = first.url; }
      });
    });
  }, [groups]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const list = Array.from(e.target.files || []);
    if (!list.length) return;
    const oversize = list.find(f => f.size > 50 * 1024 * 1024);
    if (oversize) { toast({ title: `${oversize.name} dépasse 50MB`, variant: 'destructive' }); return; }
    const nextFiles = [...files, ...list];
    setFiles(nextFiles);
    list.forEach(f => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setPreviews(prev => [...prev, { url: ev.target?.result as string, kind: guessKind(f) }]);
      };
      reader.readAsDataURL(f);
    });
    e.target.value = '';
  };

  const removePreview = (i: number) => {
    setPreviews(prev => prev.filter((_, idx) => idx !== i));
    setFiles(prev => prev.filter((_, idx) => idx !== i));
  };
  const removeExisting = (i: number) => setExistingMedia(prev => prev.filter((_, idx) => idx !== i));

  const insertEmoji = (emoji: string) => {
    const el = textRef.current;
    if (!el) { setText(prev => prev + emoji); return; }
    const start = el.selectionStart ?? text.length;
    const end = el.selectionEnd ?? text.length;
    const next = text.slice(0, start) + emoji + text.slice(end);
    setText(next);
    requestAnimationFrame(() => {
      el.focus();
      el.selectionStart = el.selectionEnd = start + emoji.length;
    });
  };

  const currentStory = viewing ? viewing.group.stories[viewing.index] : null;
  const currentMediaList = currentStory ? getMediaList(currentStory) : [];
  const currentMedia = viewing && currentMediaList[viewing.mediaIdx];
  const isOwnStory = currentStory && currentUser && currentStory.user_id === currentUser.id;

  const alignClass = textAlign === 'top' ? 'items-start pt-12' : textAlign === 'bottom' ? 'items-end pb-12' : 'items-center';

  // Combined previews for editor (existing + new)
  const allPreviewItems: { url: string; kind: MediaKind; existing: boolean; idx: number }[] = [
    ...existingMedia.map((m, idx) => ({ url: m.url, kind: m.type, existing: true, idx })),
    ...previews.map((p, idx) => ({ url: p.url, kind: p.kind, existing: false, idx })),
  ];
  const activePreview = allPreviewItems[previewIndex] || allPreviewItems[0];

  const handleShare = async (story: Story) => {
    const url = `${window.location.origin}/feed?story=${story.id}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: 'Story', url });
      } else {
        await navigator.clipboard.writeText(url);
        toast({ title: 'Lien copié !' });
      }
    } catch {}
  };

  const toggleLike = (story: Story) => {
    setLiked(prev => ({ ...prev, [story.id]: !prev[story.id] }));
    toast({ title: liked[story.id] ? 'J\'aime retiré' : 'Vous aimez cette story ❤️' });
  };

  const submitComment = async () => {
    if (!commentText.trim() || !currentStory || !currentUser) {
      if (!currentUser) toast({ title: 'Connectez-vous pour commenter', variant: 'destructive' });
      return;
    }
    setCommentsPosting(true);
    const { data, error } = await supabase.from('story_comments').insert({
      story_id: currentStory.id,
      user_id: currentUser.id,
      content: commentText.trim(),
    }).select().single();
    setCommentsPosting(false);
    if (error) { toast({ title: error.message, variant: 'destructive' }); return; }
    setComments(prev => [...prev, { ...data, profile: currentUser }]);
    setCommentText('');
  };

  const loadComments = async (storyId: string, reset = true) => {
    setCommentsLoading(true);
    const offset = reset ? 0 : comments.length;
    const { data } = await supabase
      .from('story_comments')
      .select('*')
      .eq('story_id', storyId)
      .order('created_at', { ascending: true })
      .range(offset, offset + COMMENTS_PAGE - 1);
    const list = data || [];
    const ids = [...new Set(list.map((c: any) => c.user_id))];
    const { data: profs } = ids.length
      ? await supabase.from('profiles').select('id,name,avatar_url').in('id', ids)
      : { data: [] as any[] };
    const pmap = new Map((profs || []).map(p => [p.id, p]));
    const enriched = list.map((c: any) => ({ ...c, profile: pmap.get(c.user_id) }));
    setComments(prev => reset ? enriched : [...prev, ...enriched]);
    setCommentsHasMore(list.length === COMMENTS_PAGE);
    setCommentsLoading(false);
  };

  // Load comments when panel opens / story changes
  useEffect(() => {
    if (showComments && currentStory) loadComments(currentStory.id, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showComments, currentStory?.id]);

  // Pause auto-advance while comments are open or paused via long-press
  useEffect(() => {
    if (paused || showComments) {
      if (timerRef.current) clearTimeout(timerRef.current);
    } else if (viewing) {
      scheduleAdvance(viewing.group, viewing.index, viewing.mediaIdx);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paused, showComments]);

  // ===== Gesture handlers (swipe between groups, long-press to fast nav) =====
  const startHold = (dir: number) => {
    holdActiveRef.current = false;
    if (holdTimerRef.current) clearTimeout(holdTimerRef.current);
    holdTimerRef.current = setTimeout(() => {
      holdActiveRef.current = true;
      setPaused(true);
      if (holdRepeatRef.current) clearInterval(holdRepeatRef.current);
      holdRepeatRef.current = setInterval(() => advance(dir), 300);
    }, 350);
  };
  const endHold = () => {
    if (holdTimerRef.current) clearTimeout(holdTimerRef.current);
    if (holdRepeatRef.current) clearInterval(holdRepeatRef.current);
    holdTimerRef.current = null;
    holdRepeatRef.current = null;
    setPaused(false);
  };
  const wasHold = () => holdActiveRef.current;

  const onTouchStart = (e: React.TouchEvent) => {
    const t0 = e.touches[0];
    touchStartRef.current = { x: t0.clientX, y: t0.clientY, t: Date.now() };
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    const s = touchStartRef.current;
    touchStartRef.current = null;
    if (!s) return;
    const t1 = e.changedTouches[0];
    const dx = t1.clientX - s.x;
    const dy = t1.clientY - s.y;
    if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5) {
      advanceGroup(dx < 0 ? 1 : -1);
    }
  };

  return (
    <>
      {/* Stories horizontal scroll */}
      <div className="relative mb-4">
        <div ref={scrollRef} className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide px-1">
          {currentUser && (
            <button onClick={() => { resetForm(); setCreating(true); }} className="flex flex-col items-center gap-1 min-w-[72px]">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center border-2 border-background shadow">
                <Plus className="h-6 w-6 text-primary-foreground" />
              </div>
              <span className="text-[10px] text-muted-foreground truncate w-16 text-center">
                {t('stories.add') || 'Your story'}
              </span>
            </button>
          )}

          {groups.map(g => (
            <button key={g.user_id} onClick={() => openStory(g)} className="flex flex-col items-center gap-1 min-w-[72px]">
              <div className="w-16 h-16 rounded-full p-0.5 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500">
                <Avatar className="w-full h-full border-2 border-background">
                  <AvatarImage src={g.avatar_url || undefined} />
                  <AvatarFallback>{g.name[0]}</AvatarFallback>
                </Avatar>
              </div>
              <span className="text-[10px] text-muted-foreground truncate w-16 text-center">{g.name.split(' ')[0]}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Story viewer */}
      <Dialog open={!!viewing} onOpenChange={() => { setViewing(null); if (timerRef.current) clearTimeout(timerRef.current); }}>
        <DialogContent className="max-w-md md:max-w-lg p-0 overflow-hidden bg-black border-none aspect-[9/16] max-h-[95vh]">
          {currentStory && (
            <div
              className="relative w-full h-full"
              style={{ backgroundColor: currentStory.background_color }}
              onTouchStart={onTouchStart}
              onTouchEnd={onTouchEnd}
            >
              {/* Progress bars - one per media item */}
              <div className="absolute top-2 left-2 right-2 flex gap-1 z-20">
                {currentMediaList.map((_, i) => (
                  <div key={i} className="flex-1 h-0.5 rounded bg-white/30 overflow-hidden">
                    <div className={`h-full bg-white ${i === viewing!.mediaIdx ? (currentMedia?.type === 'video' ? 'w-0' : 'w-full transition-all duration-[5000ms] ease-linear') : i < viewing!.mediaIdx ? 'w-full' : 'w-0'}`} />
                  </div>
                ))}
                {currentMediaList.length === 0 && (
                  <div className="flex-1 h-0.5 rounded bg-white/30 overflow-hidden">
                    <div className="h-full bg-white w-full transition-all duration-[5000ms] ease-linear" />
                  </div>
                )}
              </div>

              {/* Header */}
              <div className="absolute top-4 left-2 right-2 flex items-center justify-between z-20 pt-2">
                <div className="flex items-center gap-2">
                  <Avatar className="h-8 w-8 border border-white/50">
                    <AvatarImage src={viewing!.group.avatar_url || undefined} />
                    <AvatarFallback className="text-xs">{viewing!.group.name[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-white text-xs font-semibold">{viewing!.group.name}</p>
                    <p className="text-white/60 text-[10px]">{formatDistanceToNow(new Date(currentStory.created_at), { addSuffix: true })}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-white/60 text-[10px] flex items-center gap-0.5"><Eye className="h-3 w-3" />{currentStory.views_count}</span>
                  {isOwnStory && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-white hover:bg-white/20">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => startEdit(currentStory)}>
                          <Pencil className="h-4 w-4 mr-2" /> Modifier
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive" onClick={() => deleteStory(currentStory.id)}>
                          <Trash2 className="h-4 w-4 mr-2" /> Supprimer
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-white hover:bg-white/20" onClick={() => setViewing(null)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Media */}
              {currentMedia && (
                currentMedia.type === 'video' ? (
                  videoError ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-white/80 gap-2 p-6 text-center">
                      <AlertTriangle className="h-10 w-10 text-yellow-400" />
                      <p className="text-sm">Impossible de charger la vidéo.</p>
                      <Button size="sm" variant="secondary" onClick={() => { setVideoError(false); setVideoLoaded(false); videoElRef.current?.load(); }}>
                        Réessayer
                      </Button>
                    </div>
                  ) : (
                    <>
                      {!videoLoaded && (
                        <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
                          <Loader2 className="h-8 w-8 text-white/80 animate-spin" />
                        </div>
                      )}
                      <video
                        ref={videoElRef}
                        key={currentMedia.url}
                        src={currentMedia.url}
                        className="w-full h-full object-cover"
                        autoPlay
                        playsInline
                        controls
                        preload="metadata"
                        onLoadedData={() => setVideoLoaded(true)}
                        onError={() => setVideoError(true)}
                        onEnded={() => advance(1)}
                      />
                    </>
                  )
                ) : (
                  <img
                    src={currentMedia.url}
                    alt=""
                    className="w-full h-full object-cover"
                    loading="eager"
                    onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
                  />
                )
              )}

              {/* Text overlay */}
              {currentStory.text_overlay && (
                <div className="absolute inset-0 flex items-center justify-center p-8 z-10 pointer-events-none">
                  <p className="text-white text-2xl font-bold text-center drop-shadow-lg leading-relaxed whitespace-pre-wrap">{currentStory.text_overlay}</p>
                </div>
              )}

              {/* Navigation taps */}
              <button onClick={() => advance(-1)} className="absolute left-0 top-16 bottom-32 w-1/3 z-10" aria-label="Précédent" />
              <button onClick={() => advance(1)} className="absolute right-0 top-16 bottom-32 w-1/3 z-10" aria-label="Suivant" />

              {/* Media nav arrows visible */}
              {currentMediaList.length > 1 && (
                <>
                  <button onClick={() => advance(-1)} className="absolute left-2 top-1/2 -translate-y-1/2 z-20 bg-black/40 rounded-full p-1.5 text-white">
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button onClick={() => advance(1)} className="absolute right-2 top-1/2 -translate-y-1/2 z-20 bg-black/40 rounded-full p-1.5 text-white">
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </>
              )}

              {/* Action bar */}
              <div className="absolute bottom-0 left-0 right-0 z-20 p-3 bg-gradient-to-t from-black/70 to-transparent flex items-center gap-2">
                <input
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  onFocus={() => { if (timerRef.current) clearTimeout(timerRef.current); }}
                  onKeyDown={(e) => { if (e.key === 'Enter') submitComment(); }}
                  placeholder="Envoyer un message..."
                  className="flex-1 bg-white/10 backdrop-blur-sm text-white placeholder:text-white/60 rounded-full px-3 py-1.5 text-xs border border-white/20 outline-none focus:border-white/60"
                />
                <button onClick={() => toggleLike(currentStory)} className="text-white p-1.5">
                  <Heart className={`h-5 w-5 ${liked[currentStory.id] ? 'fill-red-500 text-red-500' : ''}`} />
                </button>
                <button onClick={() => setShowComment(s => !s)} className="text-white p-1.5">
                  <MessageCircle className="h-5 w-5" />
                </button>
                <button onClick={() => handleShare(currentStory)} className="text-white p-1.5">
                  <Share2 className="h-5 w-5" />
                </button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Create / edit dialog */}
      <Dialog open={creating} onOpenChange={(o) => { setCreating(o); if (!o) resetForm(); }}>
        <DialogContent className="max-w-3xl w-[95vw] max-h-[95vh] overflow-y-auto">
          <h3 className="font-semibold text-lg">
            {editingId ? 'Modifier la story' : (t('stories.create') || 'Créer une story')}
          </h3>

          <div className="grid md:grid-cols-[1fr_320px] gap-4">
            {/* Big preview */}
            <div
              className="aspect-[9/16] max-h-[70vh] w-full mx-auto rounded-xl overflow-hidden relative shadow-xl"
              style={{ backgroundColor: bgColor }}
            >
              {activePreview ? (
                activePreview.kind === 'image' ? (
                  <img src={activePreview.url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <video src={activePreview.url} className="w-full h-full object-cover" autoPlay muted loop playsInline preload="metadata" />
                )
              ) : null}

              {text && (
                <div className={`absolute inset-0 flex justify-center p-6 ${alignClass}`}>
                  <p
                    className="text-white font-bold text-center drop-shadow-lg whitespace-pre-wrap leading-snug"
                    style={{ fontSize: `${fontSize}px` }}
                  >
                    {text}
                  </p>
                </div>
              )}
              {!activePreview && !text && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <p className="text-white/40 text-sm">{t('stories.preview') || 'Aperçu'}</p>
                </div>
              )}

              {/* Preview nav */}
              {allPreviewItems.length > 1 && (
                <>
                  <button type="button" onClick={() => setPreviewIndex(i => Math.max(0, i - 1))} className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/40 rounded-full p-1.5 text-white">
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button type="button" onClick={() => setPreviewIndex(i => Math.min(allPreviewItems.length - 1, i + 1))} className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/40 rounded-full p-1.5 text-white">
                    <ChevronRight className="h-4 w-4" />
                  </button>
                  <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                    {allPreviewItems.map((_, i) => (
                      <span key={i} className={`block h-1.5 w-1.5 rounded-full ${i === previewIndex ? 'bg-white' : 'bg-white/40'}`} />
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Editor */}
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Texte</label>
                <Textarea
                  ref={textRef}
                  placeholder={t('stories.textPlaceholder') || 'Écrivez votre texte... 😊'}
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  className="resize-none"
                  rows={4}
                />
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-1">
                      <Smile className="h-4 w-4" /> Emoji
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-72 p-2" align="start">
                    <div className="grid grid-cols-10 gap-1 max-h-60 overflow-y-auto">
                      {EMOJIS.map(e => (
                        <button key={e} onClick={() => insertEmoji(e)} className="text-xl hover:bg-muted rounded p-1 transition-colors" type="button">
                          {e}
                        </button>
                      ))}
                    </div>
                  </PopoverContent>
                </Popover>

                <div className="flex border rounded-md overflow-hidden">
                  {(['top','center','bottom'] as const).map(a => (
                    <button
                      key={a}
                      type="button"
                      onClick={() => setTextAlign(a)}
                      className={`px-2 py-1 text-[10px] uppercase ${textAlign === a ? 'bg-primary text-primary-foreground' : 'bg-background hover:bg-muted'}`}
                    >
                      {a === 'top' ? 'Haut' : a === 'center' ? 'Centre' : 'Bas'}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 flex items-center gap-1">
                  <Type className="h-3 w-3" /> Taille du texte : {fontSize}px
                </label>
                <input type="range" min={16} max={64} value={fontSize} onChange={(e) => setFontSize(Number(e.target.value))} className="w-full accent-primary" />
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Couleur de fond</label>
                <div className="flex gap-1.5 flex-wrap">
                  {colors.map(c => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setBgColor(c)}
                      className={`w-7 h-7 rounded-full border-2 transition-transform ${bgColor === c ? 'border-primary scale-110' : 'border-border'}`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" size="sm" asChild>
                  <label className="cursor-pointer flex items-center justify-center gap-1">
                    <ImageIcon className="h-4 w-4" /> Photos
                    <input type="file" accept="image/*" multiple className="hidden" onChange={handleFileSelect} />
                  </label>
                </Button>
                <Button variant="outline" size="sm" asChild>
                  <label className="cursor-pointer flex items-center justify-center gap-1">
                    <Video className="h-4 w-4" /> Vidéos
                    <input type="file" accept="video/*" multiple className="hidden" onChange={handleFileSelect} />
                  </label>
                </Button>
              </div>

              {/* Media thumbnails */}
              {allPreviewItems.length > 0 && (
                <div className="flex gap-1.5 flex-wrap">
                  {allPreviewItems.map((item, i) => (
                    <div key={`${item.existing}-${item.idx}-${i}`} className={`relative h-14 w-14 rounded overflow-hidden border-2 ${i === previewIndex ? 'border-primary' : 'border-border'}`}>
                      <button type="button" onClick={() => setPreviewIndex(i)} className="absolute inset-0">
                        {item.kind === 'image' ? (
                          <img src={item.url} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <video src={item.url} className="w-full h-full object-cover" muted preload="metadata" />
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (item.existing) removeExisting(item.idx);
                          else removePreview(item.idx);
                          setPreviewIndex(p => Math.max(0, p - 1));
                        }}
                        className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground rounded-full p-0.5 z-10"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <Button onClick={saveStory} disabled={submitting} className="w-full">
                {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
                {editingId ? 'Enregistrer' : (t('stories.publish') || 'Publier')}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
