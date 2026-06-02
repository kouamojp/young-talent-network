import { useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Input } from './ui/input';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { supabase } from '@/integrations/supabase/client';
import { toast } from './ui/use-toast';
import { Loader2, Image as ImageIcon, MapPin, Smile, X, Plus, Globe, Users, Link as LinkIcon, Save, FileClock, Clock, Edit3, Sparkles } from 'lucide-react';
import { useLanguage } from '@/i18n/LanguageContext';
import { LocationPicker, LocationValue } from '@/components/location/LocationPicker';

interface PostCreationDialogProps {
  trigger: React.ReactNode;
  onPostCreated?: () => void;
  userAvatar?: string;
  userName?: string;
}

type TabType = 'post' | 'article' | 'poll';
type Visibility = 'public' | 'friends' | 'link';

export const PostCreationDialog = ({ trigger, onPostCreated, userAvatar, userName }: PostCreationDialogProps) => {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<TabType>('post');
  const [content, setContent] = useState('');
  const [location, setLocation] = useState<LocationValue | null>(null);
  const [showLocation, setShowLocation] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [visibility, setVisibility] = useState<Visibility>('public');
  const [drafts, setDrafts] = useState<any[]>([]);
  const [activeDraftId, setActiveDraftId] = useState<string | null>(null);
  const [showDrafts, setShowDrafts] = useState(false);
  const [scheduledFor, setScheduledFor] = useState<string>(''); // datetime-local string
  const [linkUrl, setLinkUrl] = useState('');
  const [linkPreview, setLinkPreview] = useState<{ title?: string; description?: string; image?: string | null; siteName?: string; url?: string } | null>(null);
  const [importing, setImporting] = useState(false);
  const [rotations, setRotations] = useState<number[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const articleMediaRef = useRef<HTMLInputElement>(null);
  const pollMediaRef = useRef<HTMLInputElement>(null);
  const MAX_IMAGES = 10;
  const [articleMedia, setArticleMedia] = useState<File[]>([]);
  const [articleMediaPreviews, setArticleMediaPreviews] = useState<string[]>([]);
  const [articleLinkUrl, setArticleLinkUrl] = useState('');
  const [pollMedia, setPollMedia] = useState<File | null>(null);
  const [pollMediaPreview, setPollMediaPreview] = useState<string>('');
  const articleTextareaRef = useRef<HTMLTextAreaElement>(null);

  const importFromLink = async () => {
    if (!linkUrl.trim()) return;
    setImporting(true);
    try {
      const { data, error } = await supabase.functions.invoke('post-from-link', { body: { url: linkUrl.trim() } });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setContent((prev) => (prev ? prev + '\n\n' : '') + (data.content || ''));
      setLinkPreview({ title: data.title, description: data.description, image: data.image, siteName: data.siteName, url: linkUrl.trim() });
      toast({ title: t('post.linkImported') || 'Content imported from link' });
    } catch (e: any) {
      toast({ title: e.message || 'Failed to import link', variant: 'destructive' });
    } finally {
      setImporting(false);
    }
  };

  const [articleTitle, setArticleTitle] = useState('');
  const [articleCategory, setArticleCategory] = useState('');
  const [pollQuestion, setPollQuestion] = useState('');
  const [pollOptions, setPollOptions] = useState<string[]>(['', '']);

  useEffect(() => { if (open) loadDrafts(); }, [open]);

  const loadDrafts = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase
      .from('post_drafts')
      .select('*')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false });
    setDrafts(data || []);
  };

  const reset = () => {
    setContent(''); setLocation(null); setShowLocation(false);
    setFiles([]); setPreviews([]);
    setArticleTitle(''); setArticleCategory('');
    setPollQuestion(''); setPollOptions(['', '']);
    setTab('post'); setVisibility('public');
    setActiveDraftId(null); setShowDrafts(false);
    setScheduledFor('');
    setLinkUrl(''); setLinkPreview(null);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files || []);
    if (selected.length === 0) return;
    setFiles(prev => [...prev, ...selected]);
    selected.forEach(file => {
      const reader = new FileReader();
      reader.onload = (ev) => setPreviews(prev => [...prev, ev.target?.result as string]);
      reader.readAsDataURL(file);
    });
  };

  const removeFile = (idx: number) => {
    setFiles(prev => prev.filter((_, i) => i !== idx));
    setPreviews(prev => prev.filter((_, i) => i !== idx));
  };

  const uploadFiles = async (userId: string): Promise<string[]> => {
    const urls: string[] = [];
    for (const file of files) {
      const ext = file.name.split('.').pop();
      const path = `${userId}/posts/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error } = await supabase.storage.from('profile-files').upload(path, file);
      if (error) throw error;
      const { data } = supabase.storage.from('profile-files').getPublicUrl(path);
      urls.push(data.publicUrl);
    }
    return urls;
  };

  const saveDraft = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({ title: t('post.loginRequired') || 'Please log in', variant: 'destructive' });
      return;
    }
    const payload: any = {
      user_id: user.id,
      draft_type: tab,
      title: tab === 'article' ? articleTitle : null,
      content: tab === 'poll' ? null : content,
      category: tab === 'article' ? articleCategory : null,
      visibility,
      poll_question: tab === 'poll' ? pollQuestion : null,
      poll_options: tab === 'poll' ? pollOptions.filter(o => o.trim()) : null,
      scheduled_for: scheduledFor ? new Date(scheduledFor).toISOString() : null,
    };
    try {
      if (activeDraftId) {
        await supabase.from('post_drafts').update(payload).eq('id', activeDraftId);
      } else {
        const { data, error } = await supabase.from('post_drafts').insert(payload).select('id').single();
        if (error) throw error;
        setActiveDraftId(data.id);
      }
      toast({ title: t('post.draftSaved') || 'Draft saved' });
      loadDrafts();
    } catch (e: any) {
      toast({ title: e.message || 'Failed to save draft', variant: 'destructive' });
    }
  };

  const loadDraft = (d: any) => {
    setActiveDraftId(d.id);
    setTab(d.draft_type as TabType);
    setVisibility((d.visibility as Visibility) || 'public');
    setContent(d.content || '');
    setArticleTitle(d.title || '');
    setArticleCategory(d.category || '');
    setPollQuestion(d.poll_question || '');
    setPollOptions(d.poll_options?.length ? d.poll_options : ['', '']);
    setScheduledFor(d.scheduled_for ? new Date(d.scheduled_for).toISOString().slice(0, 16) : '');
    setShowDrafts(false);
    toast({ title: t('post.draftLoaded') || 'Draft loaded — edit and update', });
  };

  const deleteDraft = async (id: string) => {
    await supabase.from('post_drafts').delete().eq('id', id);
    if (id === activeDraftId) setActiveDraftId(null);
    loadDrafts();
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({ title: t('post.loginRequired') || 'Please log in', variant: 'destructive' });
        return;
      }
      const shareToken = visibility === 'link' ? Math.random().toString(36).slice(2, 12) : null;

      if (tab === 'post') {
        if (!content.trim() && files.length === 0) {
          toast({ title: t('post.emptyError') || 'Add text or media', variant: 'destructive' });
          return;
        }
        const mediaUrls = files.length ? await uploadFiles(user.id) : [];
        const finalContent = showLocation && location?.address ? `${content}\n📍 ${location.address}` : content;
        const isScheduled = !!scheduledFor;
        const { error } = await supabase.from('posts').insert({
          content: finalContent.trim() || ' ',
          user_id: user.id,
          media_urls: mediaUrls.length ? mediaUrls : null,
          visibility,
          share_token: shareToken,
          scheduled_for: isScheduled ? new Date(scheduledFor).toISOString() : null,
          is_published: !isScheduled,
        });
        if (error) throw error;
        toast({ title: isScheduled ? (t('post.scheduled') || `Scheduled for ${new Date(scheduledFor).toLocaleString()}`) : (t('post.created') || 'Post published!') });
      } else if (tab === 'article') {
        if (!articleTitle.trim() || !content.trim()) {
          toast({ title: t('post.articleError') || 'Title and content required', variant: 'destructive' });
          return;
        }
        const { error } = await supabase.from('user_pages').insert({
          title: articleTitle.trim(),
          content: content.trim(),
          category: articleCategory || 'other',
          user_id: user.id,
          is_public: visibility === 'public',
          visibility,
          share_token: shareToken,
        });
        if (error) throw error;
        await supabase.from('posts').insert({
          content: `📄 ${articleTitle}\n\n${content.slice(0, 200)}${content.length > 200 ? '...' : ''}`,
          user_id: user.id,
          visibility,
          share_token: shareToken,
        });
        toast({ title: t('post.articleCreated') || 'Article published!' });
      } else if (tab === 'poll') {
        const validOptions = pollOptions.filter(o => o.trim());
        if (!pollQuestion.trim() || validOptions.length < 2) {
          toast({ title: t('post.pollError') || 'Question and 2+ options required', variant: 'destructive' });
          return;
        }
        const pollContent = `📊 ${pollQuestion}\n\n${validOptions.map((o, i) => `${i + 1}. ${o}`).join('\n')}`;
        const { error } = await supabase.from('posts').insert({
          content: pollContent,
          user_id: user.id,
          visibility,
          share_token: shareToken,
        });
        if (error) throw error;
        toast({ title: t('post.pollCreated') || 'Poll published!' });
      }

      if (activeDraftId) await supabase.from('post_drafts').delete().eq('id', activeDraftId);
      reset();
      setOpen(false);
      onPostCreated?.();
    } catch (error: any) {
      console.error('Error creating post:', error);
      toast({ title: error.message || 'Failed to publish', variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const visibilityIcon = visibility === 'public' ? Globe : visibility === 'friends' ? Users : LinkIcon;
  const VIcon = visibilityIcon;

  return (
    <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) reset(); }}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>{t('post.create') || 'Create Post'}</span>
            {drafts.length > 0 && (
              <Button variant="ghost" size="sm" onClick={() => setShowDrafts(s => !s)}>
                <FileClock className="h-4 w-4 mr-1" />
                {t('post.drafts') || 'Drafts'} ({drafts.length})
              </Button>
            )}
          </DialogTitle>
        </DialogHeader>

        {showDrafts && (
          <div className="border rounded-lg p-2 space-y-1 max-h-48 overflow-y-auto">
            {drafts.map(d => (
              <div key={d.id} className="flex items-center justify-between gap-2 p-2 hover:bg-muted rounded">
                <button onClick={() => loadDraft(d)} className="flex-1 text-left text-sm">
                  <div className="font-medium truncate">{d.title || d.content?.slice(0, 50) || d.poll_question || '(empty)'}</div>
                  <div className="text-xs text-muted-foreground flex items-center gap-1">
                    {d.draft_type} · {new Date(d.updated_at).toLocaleString()}
                    {d.scheduled_for && (
                      <span className="inline-flex items-center gap-0.5 text-primary ml-1">
                        <Clock className="h-3 w-3" />
                        {new Date(d.scheduled_for).toLocaleString()}
                      </span>
                    )}
                  </div>
                </button>
                <Button variant="ghost" size="icon" onClick={() => deleteDraft(d.id)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}

        <div className="flex items-center gap-3 pt-2">
          <Avatar className="h-10 w-10">
            <AvatarImage src={userAvatar} />
            <AvatarFallback>{userName?.[0] || 'U'}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="font-semibold text-sm">{userName || 'You'}</div>
            <Select value={visibility} onValueChange={(v) => setVisibility(v as Visibility)}>
              <SelectTrigger className="h-7 w-auto text-xs gap-1 mt-0.5">
                <VIcon className="h-3 w-3" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="public"><div className="flex items-center gap-2"><Globe className="h-3 w-3" />{t('post.vis.public') || 'Public'}</div></SelectItem>
                <SelectItem value="friends"><div className="flex items-center gap-2"><Users className="h-3 w-3" />{t('post.vis.friends') || 'Friends only'}</div></SelectItem>
                <SelectItem value="link"><div className="flex items-center gap-2"><LinkIcon className="h-3 w-3" />{t('post.vis.link') || 'By link'}</div></SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Tabs value={tab} onValueChange={(v) => setTab(v as TabType)} className="mt-2">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="post">{t('post.tab.post') || 'Post'}</TabsTrigger>
            <TabsTrigger value="article">{t('post.tab.article') || 'Article'}</TabsTrigger>
            <TabsTrigger value="poll">{t('post.tab.poll') || 'Poll'}</TabsTrigger>
          </TabsList>

          <TabsContent value="post" className="space-y-3 mt-4">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <LinkIcon className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  className="pl-8"
                  placeholder={t('post.linkPlaceholder') || 'Paste a link to auto-generate a post...'}
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  disabled={importing}
                />
              </div>
              <Button type="button" variant="outline" onClick={importFromLink} disabled={importing || !linkUrl.trim()}>
                {importing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                <span className="ml-1 hidden sm:inline">{t('post.import') || 'Import'}</span>
              </Button>
            </div>
            {linkPreview && (
              <div className="flex gap-2 p-2 border rounded-lg bg-muted/30">
                {linkPreview.image && <img src={linkPreview.image} alt="" className="w-16 h-16 object-cover rounded" />}
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-muted-foreground truncate">{linkPreview.siteName}</div>
                  <div className="text-sm font-medium truncate">{linkPreview.title}</div>
                </div>
                <button onClick={() => setLinkPreview(null)} className="p-1 hover:bg-muted rounded">
                  <X className="h-3 w-3" />
                </button>
              </div>
            )}
            <Textarea
              placeholder={t('post.placeholder') || "What's on your mind?"}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[120px] resize-none border-0 focus-visible:ring-0 text-base p-0"
              disabled={isSubmitting}
            />

            {previews.length > 0 && (
              <div className={`grid gap-2 ${previews.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
                {previews.map((src, i) => (
                  <div key={i} className="relative rounded-lg overflow-hidden bg-muted">
                    <img src={src} alt="" className="w-full h-40 object-cover" />
                    <button onClick={() => removeFile(i)} className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-1 hover:bg-black/80">
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {showLocation && (
              <div className="bg-muted/50 p-2 rounded-lg space-y-1">
                <div className="flex items-center justify-between px-1">
                  <span className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                    <MapPin className="h-3 w-3" /> {t('location.label') || 'Location'}
                  </span>
                  <button onClick={() => { setShowLocation(false); setLocation(null); }} className="p-0.5 rounded hover:bg-muted">
                    <X className="h-3.5 w-3.5 text-muted-foreground" />
                  </button>
                </div>
                <LocationPicker value={location} onChange={setLocation} showLabel={false} />
              </div>
            )}

            <input ref={fileInputRef} type="file" accept="image/*,video/*" multiple className="hidden" onChange={handleFileSelect} />

            <div className="flex items-center justify-between border rounded-lg p-2">
              <span className="text-sm text-muted-foreground ml-2">{t('post.addToPost') || 'Add to post'}</span>
              <div className="flex gap-1">
                <Button variant="ghost" size="icon" type="button" onClick={() => fileInputRef.current?.click()} title={t('post.addPhoto') || 'Photo/Video'}>
                  <ImageIcon className="h-5 w-5 text-green-500" />
                </Button>
                <Button variant="ghost" size="icon" type="button" onClick={() => setShowLocation(true)} title={t('post.addLocation') || 'Location'}>
                  <MapPin className="h-5 w-5 text-red-500" />
                </Button>
                <Button variant="ghost" size="icon" type="button" title="Emoji">
                  <Smile className="h-5 w-5 text-yellow-500" />
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="article" className="space-y-3 mt-4">
            <Input placeholder={t('post.articleTitle') || 'Article title'} value={articleTitle} onChange={(e) => setArticleTitle(e.target.value)} className="text-lg font-semibold" />
            <Input placeholder={t('post.articleCategory') || 'Category'} value={articleCategory} onChange={(e) => setArticleCategory(e.target.value)} />
            <Textarea placeholder={t('post.articleContent') || 'Write your article...'} value={content} onChange={(e) => setContent(e.target.value)} className="min-h-[250px]" />
            <p className="text-xs text-muted-foreground">{t('post.articleHint') || 'Articles are saved to your pages and shared as a preview in the feed.'}</p>
          </TabsContent>

          <TabsContent value="poll" className="space-y-3 mt-4">
            <Input placeholder={t('post.pollQuestion') || 'Ask a question...'} value={pollQuestion} onChange={(e) => setPollQuestion(e.target.value)} className="font-medium" />
            {pollOptions.map((opt, i) => (
              <div key={i} className="flex gap-2">
                <Input placeholder={`${t('post.pollOption') || 'Option'} ${i + 1}`} value={opt} onChange={(e) => setPollOptions(prev => prev.map((o, idx) => idx === i ? e.target.value : o))} />
                {pollOptions.length > 2 && (
                  <Button variant="ghost" size="icon" onClick={() => setPollOptions(prev => prev.filter((_, idx) => idx !== i))}>
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
            {pollOptions.length < 6 && (
              <Button variant="outline" size="sm" onClick={() => setPollOptions(prev => [...prev, ''])}>
                <Plus className="h-4 w-4 mr-1" />{t('post.pollAddOption') || 'Add option'}
              </Button>
            )}
          </TabsContent>
        </Tabs>

        {(tab === 'post' || tab === 'article') && (
          <div className="flex items-center gap-2 border rounded-lg p-2 mt-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <label className="text-xs text-muted-foreground whitespace-nowrap">
              {t('post.scheduleFor') || 'Schedule for'}:
            </label>
            <Input
              type="datetime-local"
              value={scheduledFor}
              onChange={(e) => setScheduledFor(e.target.value)}
              className="h-8 text-xs flex-1"
              min={new Date().toISOString().slice(0, 16)}
            />
            {scheduledFor && (
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setScheduledFor('')}>
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
        )}

        {activeDraftId && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 rounded p-2">
            <Edit3 className="h-3 w-3" />
            <span>{t('post.editingDraft') || 'Editing draft'}</span>
          </div>
        )}

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" onClick={saveDraft} disabled={isSubmitting}>
            <Save className="h-4 w-4 mr-1" />
            {activeDraftId ? (t('post.updateDraft') || 'Update draft') : (t('post.saveDraft') || 'Save draft')}
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting} className="flex-1">
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {scheduledFor ? (t('post.schedule') || 'Schedule') : (t('create.post') || 'Publish')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
