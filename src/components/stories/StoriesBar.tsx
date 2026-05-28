import { useState, useEffect, useRef } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { supabase } from '@/integrations/supabase/client';
import { Plus, X, Eye, Loader2, Image as ImageIcon, Smile, Type, Video } from 'lucide-react';
import { useLanguage } from '@/i18n/LanguageContext';
import { toast } from '@/components/ui/use-toast';
import { formatDistanceToNow } from 'date-fns';

interface Story {
  id: string;
  user_id: string;
  media_url: string | null;
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

const isVideo = (url?: string | null) => !!url && /\.(mp4|webm|mov|m4v)(\?|$)/i.test(url);

export const StoriesBar = () => {
  const { t } = useLanguage();
  const [groups, setGroups] = useState<GroupedStories[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [viewing, setViewing] = useState<{ group: GroupedStories; index: number } | null>(null);
  const [creating, setCreating] = useState(false);
  const [text, setText] = useState('');
  const [bgColor, setBgColor] = useState('#1a1a2e');
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [fileKind, setFileKind] = useState<'image' | 'video' | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [textAlign, setTextAlign] = useState<'center' | 'top' | 'bottom'>('center');
  const [fontSize, setFontSize] = useState(28);
  const scrollRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLTextAreaElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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
      grouped.get(s.user_id)!.stories.push({ ...s, profile: p || undefined } as any);
    }
    setGroups(Array.from(grouped.values()));
  };

  const resetForm = () => {
    setText(''); setFile(null); setPreview(null); setFileKind(null);
    setBgColor('#1a1a2e'); setTextAlign('center'); setFontSize(28);
  };

  const createStory = async () => {
    if (!text.trim() && !file) {
      toast({ title: t('stories.emptyError') || 'Add text or media', variant: 'destructive' });
      return;
    }
    setSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      let mediaUrl: string | null = null;
      if (file) {
        const ext = file.name.split('.').pop();
        const path = `${user.id}/stories/${Date.now()}.${ext}`;
        const { error } = await supabase.storage.from('profile-files').upload(path, file);
        if (error) throw error;
        mediaUrl = supabase.storage.from('profile-files').getPublicUrl(path).data.publicUrl;
      }

      const { error } = await supabase.from('stories').insert({
        user_id: user.id,
        media_url: mediaUrl,
        text_overlay: text.trim() || null,
        background_color: bgColor,
      });
      if (error) throw error;

      toast({ title: t('stories.created') || 'Story published!' });
      setCreating(false);
      resetForm();
      loadStories();
    } catch (e: any) {
      toast({ title: e.message, variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  const openStory = (group: GroupedStories, index = 0) => {
    setViewing({ group, index });
    startTimer(group, index);
  };

  const startTimer = (group: GroupedStories, index: number) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    const story = group.stories[index];
    // Don't auto-advance videos — let them play out
    if (isVideo(story?.media_url)) return;
    timerRef.current = setTimeout(() => {
      if (index < group.stories.length - 1) {
        setViewing({ group, index: index + 1 });
        startTimer(group, index + 1);
      } else {
        setViewing(null);
      }
    }, 5000);
  };

  const navStory = (dir: number) => {
    if (!viewing) return;
    const newIdx = viewing.index + dir;
    if (newIdx >= 0 && newIdx < viewing.group.stories.length) {
      setViewing({ ...viewing, index: newIdx });
      startTimer(viewing.group, newIdx);
    } else {
      setViewing(null);
    }
  };

  useEffect(() => {
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 50 * 1024 * 1024) {
      toast({ title: 'Fichier trop volumineux (max 50MB)', variant: 'destructive' });
      return;
    }
    setFile(f);
    setFileKind(f.type.startsWith('video') ? 'video' : 'image');
    const reader = new FileReader();
    reader.onload = (ev) => setPreview(ev.target?.result as string);
    reader.readAsDataURL(f);
  };

  const insertEmoji = (emoji: string) => {
    const el = textRef.current;
    if (!el) { setText(t => t + emoji); return; }
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
  const alignClass = textAlign === 'top' ? 'items-start pt-12' : textAlign === 'bottom' ? 'items-end pb-12' : 'items-center';

  return (
    <>
      {/* Stories horizontal scroll */}
      <div className="relative mb-4">
        <div ref={scrollRef} className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide px-1">
          {/* Create story button */}
          {currentUser && (
            <button onClick={() => setCreating(true)} className="flex flex-col items-center gap-1 min-w-[72px]">
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

      {/* Story viewer — enlarged */}
      <Dialog open={!!viewing} onOpenChange={() => { setViewing(null); if (timerRef.current) clearTimeout(timerRef.current); }}>
        <DialogContent className="max-w-md md:max-w-lg p-0 overflow-hidden bg-black border-none aspect-[9/16] max-h-[95vh]">
          {currentStory && (
            <div className="relative w-full h-full" style={{ backgroundColor: currentStory.background_color }}>
              {/* Progress bars */}
              <div className="absolute top-2 left-2 right-2 flex gap-1 z-20">
                {viewing!.group.stories.map((_, i) => (
                  <div key={i} className="flex-1 h-0.5 rounded bg-white/30 overflow-hidden">
                    <div className={`h-full bg-white transition-all ${i === viewing!.index ? 'w-full duration-[5000ms]' : i < viewing!.index ? 'w-full' : 'w-0'}`} />
                  </div>
                ))}
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
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-white hover:bg-white/20" onClick={() => setViewing(null)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Media */}
              {currentStory.media_url && (
                isVideo(currentStory.media_url) ? (
                  <video
                    src={currentStory.media_url}
                    className="w-full h-full object-cover"
                    autoPlay
                    playsInline
                    controls
                    onEnded={() => navStory(1)}
                  />
                ) : (
                  <img src={currentStory.media_url} alt="" className="w-full h-full object-cover" />
                )
              )}

              {/* Text overlay */}
              {currentStory.text_overlay && (
                <div className="absolute inset-0 flex items-center justify-center p-8 z-10 pointer-events-none">
                  <p className="text-white text-2xl font-bold text-center drop-shadow-lg leading-relaxed whitespace-pre-wrap">{currentStory.text_overlay}</p>
                </div>
              )}

              {/* Navigation */}
              <button onClick={() => navStory(-1)} className="absolute left-0 top-0 bottom-0 w-1/3 z-10" />
              <button onClick={() => navStory(1)} className="absolute right-0 top-0 bottom-0 w-1/3 z-10" />
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Create story dialog — enlarged with editor */}
      <Dialog open={creating} onOpenChange={(o) => { setCreating(o); if (!o) resetForm(); }}>
        <DialogContent className="max-w-3xl w-[95vw] max-h-[95vh] overflow-y-auto">
          <h3 className="font-semibold text-lg">{t('stories.create') || 'Créer une story'}</h3>

          <div className="grid md:grid-cols-[1fr_320px] gap-4">
            {/* Big preview */}
            <div
              className="aspect-[9/16] max-h-[70vh] w-full mx-auto rounded-xl overflow-hidden relative shadow-xl"
              style={{ backgroundColor: bgColor }}
            >
              {preview && fileKind === 'image' && <img src={preview} alt="" className="w-full h-full object-cover" />}
              {preview && fileKind === 'video' && (
                <video src={preview} className="w-full h-full object-cover" autoPlay muted loop playsInline />
              )}
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
              {!preview && !text && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <p className="text-white/40 text-sm">{t('stories.preview') || 'Aperçu'}</p>
                </div>
              )}
            </div>

            {/* Editor side panel */}
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

              {/* Emoji + position + size */}
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
                        <button
                          key={e}
                          onClick={() => insertEmoji(e)}
                          className="text-xl hover:bg-muted rounded p-1 transition-colors"
                          type="button"
                        >
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
                <input
                  type="range"
                  min={16}
                  max={64}
                  value={fontSize}
                  onChange={(e) => setFontSize(Number(e.target.value))}
                  className="w-full accent-primary"
                />
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
                    <ImageIcon className="h-4 w-4" /> Photo
                    <input type="file" accept="image/*" className="hidden" onChange={handleFileSelect} />
                  </label>
                </Button>
                <Button variant="outline" size="sm" asChild>
                  <label className="cursor-pointer flex items-center justify-center gap-1">
                    <Video className="h-4 w-4" /> Vidéo
                    <input type="file" accept="video/*" className="hidden" onChange={handleFileSelect} />
                  </label>
                </Button>
              </div>

              {file && (
                <div className="text-[11px] text-muted-foreground flex items-center justify-between bg-muted/50 rounded p-2">
                  <span className="truncate">{file.name}</span>
                  <button onClick={() => { setFile(null); setPreview(null); setFileKind(null); }} className="text-destructive hover:underline">Retirer</button>
                </div>
              )}

              <Button onClick={createStory} disabled={submitting} className="w-full">
                {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
                {t('stories.publish') || 'Publier'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
