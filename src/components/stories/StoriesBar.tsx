import { useState, useEffect, useRef } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { Plus, X, ChevronLeft, ChevronRight, Eye, Loader2, Image as ImageIcon } from 'lucide-react';
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
  const [submitting, setSubmitting] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const colors = ['#1a1a2e', '#16213e', '#0f3460', '#533483', '#e94560', '#1b9c85', '#ff6b35', '#f7dc6f'];

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
      setText('');
      setFile(null);
      setPreview(null);
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
    setFile(f);
    const reader = new FileReader();
    reader.onload = (ev) => setPreview(ev.target?.result as string);
    reader.readAsDataURL(f);
  };

  const currentStory = viewing ? viewing.group.stories[viewing.index] : null;

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

      {/* Story viewer */}
      <Dialog open={!!viewing} onOpenChange={() => { setViewing(null); if (timerRef.current) clearTimeout(timerRef.current); }}>
        <DialogContent className="max-w-sm p-0 overflow-hidden bg-black border-none aspect-[9/16] max-h-[90vh]">
          {currentStory && (
            <div className="relative w-full h-full" style={{ backgroundColor: currentStory.background_color }}>
              {/* Progress bars */}
              <div className="absolute top-2 left-2 right-2 flex gap-1 z-20">
                {viewing!.group.stories.map((_, i) => (
                  <div key={i} className="flex-1 h-0.5 rounded bg-white/30 overflow-hidden">
                    <div className={`h-full bg-white transition-all duration-[5000ms] ${i === viewing!.index ? 'w-full' : i < viewing!.index ? 'w-full' : 'w-0'}`} />
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
                <img src={currentStory.media_url} alt="" className="w-full h-full object-cover" />
              )}

              {/* Text overlay */}
              {currentStory.text_overlay && (
                <div className="absolute inset-0 flex items-center justify-center p-8 z-10">
                  <p className="text-white text-xl font-bold text-center drop-shadow-lg leading-relaxed">{currentStory.text_overlay}</p>
                </div>
              )}

              {/* Navigation */}
              <button onClick={() => navStory(-1)} className="absolute left-0 top-0 bottom-0 w-1/3 z-10" />
              <button onClick={() => navStory(1)} className="absolute right-0 top-0 bottom-0 w-1/3 z-10" />
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Create story dialog */}
      <Dialog open={creating} onOpenChange={setCreating}>
        <DialogContent className="max-w-sm">
          <h3 className="font-semibold text-lg">{t('stories.create') || 'Create Story'}</h3>

          <div className="aspect-[9/16] max-h-[50vh] rounded-lg overflow-hidden relative" style={{ backgroundColor: bgColor }}>
            {preview && <img src={preview} alt="" className="w-full h-full object-cover" />}
            {text && (
              <div className="absolute inset-0 flex items-center justify-center p-6">
                <p className="text-white text-lg font-bold text-center drop-shadow-lg">{text}</p>
              </div>
            )}
            {!preview && !text && (
              <div className="absolute inset-0 flex items-center justify-center">
                <p className="text-white/40 text-sm">{t('stories.preview') || 'Preview'}</p>
              </div>
            )}
          </div>

          <Textarea
            placeholder={t('stories.textPlaceholder') || 'Add text overlay...'}
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="resize-none"
            rows={2}
          />

          <div className="flex gap-1 flex-wrap">
            {colors.map(c => (
              <button
                key={c}
                onClick={() => setBgColor(c)}
                className={`w-7 h-7 rounded-full border-2 transition-transform ${bgColor === c ? 'border-primary scale-110' : 'border-transparent'}`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>

          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" asChild>
              <label className="cursor-pointer flex items-center justify-center gap-1">
                <ImageIcon className="h-4 w-4" />
                {t('stories.addMedia') || 'Photo/Video'}
                <input type="file" accept="image/*,video/*" className="hidden" onChange={handleFileSelect} />
              </label>
            </Button>
            <Button onClick={createStory} disabled={submitting} className="flex-1">
              {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
              {t('stories.publish') || 'Publish'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
