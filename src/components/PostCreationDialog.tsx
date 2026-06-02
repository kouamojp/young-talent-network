import React, { useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Input } from './ui/input';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Slider } from './ui/slider';
import { supabase } from '@/integrations/supabase/client';
import { toast } from './ui/use-toast';
import { Loader2, Image as ImageIcon, MapPin, Smile, X, Plus, Globe, Users, Link as LinkIcon, Save, FileClock, Clock, Edit3, Sparkles, RotateCw, Video, Eye, Crop, GripVertical } from 'lucide-react';
import { useLanguage } from '@/i18n/LanguageContext';
import { LocationPicker, LocationValue } from '@/components/location/LocationPicker';
import LinkPreview from './LinkPreview';

interface ExistingPost {
  id: string;
  content: string;
  media_urls?: string[] | null;
  visibility?: string;
}

interface PostCreationDialogProps {
  trigger?: React.ReactNode;
  onPostCreated?: () => void;
  userAvatar?: string;
  userName?: string;
  editPost?: ExistingPost;
  open?: boolean;
  onOpenChange?: (o: boolean) => void;
}

type TabType = 'post' | 'article' | 'poll';
type Visibility = 'public' | 'friends' | 'link';
type AspectRatio = '16:9' | '9:16' | '1:1';

interface MediaItem {
  file?: File;
  existingUrl?: string;
  preview: string;
  isVideo: boolean;
  rotation: number;
  offsetX: number; // 0-100
  offsetY: number; // 0-100
}

export const PostCreationDialog = ({ trigger, onPostCreated, userAvatar, userName, editPost, open: openProp, onOpenChange }: PostCreationDialogProps) => {
  const { t } = useLanguage();
  const [openState, setOpenState] = useState(false);
  const open = openProp ?? openState;
  const setOpen = (o: boolean) => { if (onOpenChange) onOpenChange(o); else setOpenState(o); };
  const isEditing = !!editPost;
  const [tab, setTab] = useState<TabType>('post');
  const [content, setContent] = useState('');
  const [location, setLocation] = useState<LocationValue | null>(null);
  const [showLocation, setShowLocation] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [items, setItems] = useState<MediaItem[]>([]);
  const [visibility, setVisibility] = useState<Visibility>('public');
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('16:9');
  const [cropIdx, setCropIdx] = useState<number | null>(null);
  const [showArticlePreview, setShowArticlePreview] = useState(false);
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [drafts, setDrafts] = useState<any[]>([]);
  const [activeDraftId, setActiveDraftId] = useState<string | null>(null);
  const [showDrafts, setShowDrafts] = useState(false);
  const [scheduledFor, setScheduledFor] = useState<string>('');
  const [linkUrl, setLinkUrl] = useState('');
  const [linkPreview, setLinkPreview] = useState<{ title?: string; description?: string; image?: string | null; siteName?: string; url?: string } | null>(null);
  const [importing, setImporting] = useState(false);
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

  const aspectClass = aspectRatio === '16:9' ? 'aspect-video' : aspectRatio === '9:16' ? 'aspect-[9/16]' : 'aspect-square';
  const aspectNum = aspectRatio === '16:9' ? 16 / 9 : aspectRatio === '9:16' ? 9 / 16 : 1;

  // Load existing post when opening in edit mode
  useEffect(() => {
    if (open && editPost) {
      setTab('post');
      setContent(editPost.content || '');
      setVisibility((editPost.visibility as Visibility) || 'public');
      const urls = editPost.media_urls || [];
      setItems(urls.map((url) => ({
        existingUrl: url,
        preview: url,
        isVideo: /\.(mp4|webm|mov|m4v)(\?|$)/i.test(url),
        rotation: 0, offsetX: 50, offsetY: 50,
      })));
    }
  }, [open, editPost]);

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
    setItems([]); setCropIdx(null); setDragIdx(null);
    setArticleTitle(''); setArticleCategory('');
    setArticleMedia([]); setArticleMediaPreviews([]); setArticleLinkUrl('');
    setPollQuestion(''); setPollOptions(['', '']);
    setPollMedia(null); setPollMediaPreview('');
    setTab('post'); setVisibility('public');
    setActiveDraftId(null); setShowDrafts(false);
    setScheduledFor('');
    setLinkUrl(''); setLinkPreview(null);
    setShowArticlePreview(false);
  };

  const readFileAsDataURL = (file: File) => new Promise<string>((res, rej) => {
    const r = new FileReader();
    r.onload = (e) => res(e.target?.result as string);
    r.onerror = rej;
    r.readAsDataURL(file);
  });

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files || []);
    e.target.value = '';
    if (selected.length === 0) return;
    const remaining = MAX_IMAGES - items.length;
    if (remaining <= 0) {
      toast({ title: t('post.maxImages') || `Maximum ${MAX_IMAGES} files`, variant: 'destructive' });
      return;
    }
    const accepted = selected.slice(0, remaining);
    if (selected.length > remaining) {
      toast({ title: `Only ${remaining} more file(s) added (max ${MAX_IMAGES})` });
    }
    const newItems: MediaItem[] = await Promise.all(accepted.map(async (file) => ({
      file,
      preview: await readFileAsDataURL(file),
      isVideo: file.type.startsWith('video/'),
      rotation: 0,
      offsetX: 50,
      offsetY: 50,
    })));
    setItems(prev => [...prev, ...newItems]);
  };

  const removeFile = (idx: number) => setItems(prev => prev.filter((_, i) => i !== idx));
  const rotateFile = (idx: number) => setItems(prev => prev.map((it, i) => i === idx ? { ...it, rotation: (it.rotation + 90) % 360 } : it));
  const updateItem = (idx: number, patch: Partial<MediaItem>) => setItems(prev => prev.map((it, i) => i === idx ? { ...it, ...patch } : it));

  const reorderItems = (from: number, to: number) => {
    if (from === to || from < 0 || to < 0 || from >= items.length || to >= items.length) return;
    setItems(prev => {
      const arr = [...prev];
      const [moved] = arr.splice(from, 1);
      arr.splice(to, 0, moved);
      return arr;
    });
  };

  // Crop an image File to the chosen aspect ratio using a canvas, framing around (offsetX, offsetY)
  const cropImageFile = (file: File, aspect: number, offX: number, offY: number, rotation: number): Promise<File> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        try {
          const rot = ((rotation % 360) + 360) % 360;
          const swap = rot === 90 || rot === 270;
          const srcW = swap ? img.height : img.width;
          const srcH = swap ? img.width : img.height;
          let cw = srcW, ch = Math.round(srcW / aspect);
          if (ch > srcH) { ch = srcH; cw = Math.round(srcH * aspect); }
          const maxOffX = srcW - cw;
          const maxOffY = srcH - ch;
          const sx = Math.round((offX / 100) * maxOffX);
          const sy = Math.round((offY / 100) * maxOffY);
          const canvas = document.createElement('canvas');
          canvas.width = cw; canvas.height = ch;
          const ctx = canvas.getContext('2d')!;
          // Apply rotation by translating and rotating, then drawing source
          ctx.save();
          ctx.translate(cw / 2, ch / 2);
          ctx.rotate((rot * Math.PI) / 180);
          // We want to draw the (potentially rotated) image so a crop of (sx, sy, cw, ch) in rotated space is centered
          // Simplification: draw whole rotated image into an offscreen, then crop
          const off = document.createElement('canvas');
          off.width = srcW; off.height = srcH;
          const octx = off.getContext('2d')!;
          octx.translate(srcW / 2, srcH / 2);
          octx.rotate((rot * Math.PI) / 180);
          octx.drawImage(img, -img.width / 2, -img.height / 2);
          ctx.restore();
          ctx.clearRect(0, 0, cw, ch);
          ctx.drawImage(off, sx, sy, cw, ch, 0, 0, cw, ch);
          canvas.toBlob((blob) => {
            if (!blob) return reject(new Error('Canvas blob failed'));
            const out = new File([blob], file.name.replace(/\.[^.]+$/, '') + '.jpg', { type: 'image/jpeg' });
            resolve(out);
          }, 'image/jpeg', 0.9);
        } catch (e) { reject(e); }
      };
      img.onerror = reject;
      img.src = URL.createObjectURL(file);
    });
  };

  const handleArticleMediaSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files || []);
    if (!selected.length) return;
    setArticleMedia(prev => [...prev, ...selected]);
    selected.forEach(file => {
      const reader = new FileReader();
      reader.onload = (ev) => setArticleMediaPreviews(prev => [...prev, ev.target?.result as string]);
      reader.readAsDataURL(file);
    });
    e.target.value = '';
  };

  const insertIntoArticle = (text: string) => {
    const el = articleTextareaRef.current;
    const insertion = `\n${text}\n`;
    if (!el) { setContent(prev => prev + insertion); return; }
    const start = el.selectionStart ?? content.length;
    const end = el.selectionEnd ?? content.length;
    setContent(content.slice(0, start) + insertion + content.slice(end));
  };

  const importArticleLink = async () => {
    if (!articleLinkUrl.trim()) return;
    try {
      const { data, error } = await supabase.functions.invoke('post-from-link', { body: { url: articleLinkUrl.trim() } });
      if (error) throw error;
      const md = `[${data.title || articleLinkUrl}](${articleLinkUrl})${data.description ? `\n${data.description}` : ''}`;
      insertIntoArticle(md);
      setArticleLinkUrl('');
      toast({ title: t('post.linkInserted') || 'Link inserted into article' });
    } catch (e: any) {
      toast({ title: e.message || 'Failed to import link', variant: 'destructive' });
    }
  };

  const handlePollMediaSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPollMedia(file);
    const reader = new FileReader();
    reader.onload = (ev) => setPollMediaPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const uploadOne = async (userId: string, file: File): Promise<string> => {
    const ext = file.name.split('.').pop();
    const path = `${userId}/posts/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const { error } = await supabase.storage.from('profile-files').upload(path, file);
    if (error) throw error;
    return supabase.storage.from('profile-files').getPublicUrl(path).data.publicUrl;
  };

  // Upload items in order: existing URLs are kept; new files are cropped (if image) then uploaded
  const uploadItems = async (userId: string): Promise<string[]> => {
    const urls: string[] = [];
    for (const it of items) {
      if (it.existingUrl) { urls.push(it.existingUrl); continue; }
      if (!it.file) continue;
      let toUpload = it.file;
      if (!it.isVideo) {
        try {
          toUpload = await cropImageFile(it.file, aspectNum, it.offsetX, it.offsetY, it.rotation);
        } catch (e) {
          console.error('Crop failed, uploading original', e);
        }
      }
      urls.push(await uploadOne(userId, toUpload));
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
        if (!content.trim() && items.length === 0) {
          toast({ title: t('post.emptyError') || 'Add text or media', variant: 'destructive' });
          return;
        }
        const mediaUrls = await uploadItems(user.id);
        const finalContent = showLocation && location?.address ? `${content}\n📍 ${location.address}` : content;
        const isScheduled = !!scheduledFor;
        if (isEditing && editPost) {
          const { error } = await supabase.from('posts').update({
            content: finalContent.trim() || ' ',
            media_urls: mediaUrls.length ? mediaUrls : null,
            visibility,
          }).eq('id', editPost.id);
          if (error) throw error;
          toast({ title: t('post.updated') || 'Publication mise à jour' });
        } else {
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
        }
      } else if (tab === 'article') {

        if (!articleTitle.trim() || !content.trim()) {
          toast({ title: t('post.articleError') || 'Title and content required', variant: 'destructive' });
          return;
        }
        const articleMediaUrls: string[] = [];
        for (const f of articleMedia) articleMediaUrls.push(await uploadOne(user.id, f));
        let finalArticle = content.trim();
        if (articleMediaUrls.length) {
          finalArticle += '\n\n' + articleMediaUrls.map(u => `![media](${u})`).join('\n');
        }
        const { error } = await supabase.from('user_pages').insert({
          title: articleTitle.trim(),
          content: finalArticle,
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
          media_urls: articleMediaUrls.length ? articleMediaUrls : null,
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
        const pollMediaUrl = pollMedia ? await uploadOne(user.id, pollMedia) : null;
        const pollContent = `📊 ${pollQuestion}\n\n${validOptions.map((o, i) => `${i + 1}. ${o}`).join('\n')}`;
        const { error } = await supabase.from('posts').insert({
          content: pollContent,
          user_id: user.id,
          media_urls: pollMediaUrl ? [pollMediaUrl] : null,
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
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>{isEditing ? (t('post.edit') || 'Modifier la publication') : (t('post.create') || 'Create Post')}</span>
            {!isEditing && drafts.length > 0 && (
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
              <div className="border rounded-lg overflow-hidden bg-muted/30">
                {linkPreview.image && (
                  <div className="relative w-full aspect-video bg-muted">
                    <img src={linkPreview.image} alt="" className="absolute inset-0 w-full h-full object-cover" />
                    <button onClick={() => setLinkPreview(null)} className="absolute top-2 right-2 bg-black/60 text-white rounded-full p-1 hover:bg-black/80">
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                )}
                <div className="p-2 space-y-1">
                  {linkPreview.siteName && <div className="text-xs text-muted-foreground truncate">{linkPreview.siteName}</div>}
                  {linkPreview.title && <div className="text-sm font-medium line-clamp-2">{linkPreview.title}</div>}
                  {linkPreview.description && <div className="text-xs text-muted-foreground line-clamp-2">{linkPreview.description}</div>}
                  {linkPreview.url && (
                    <a href={linkPreview.url} target="_blank" rel="noreferrer" className="text-xs text-primary truncate block hover:underline">
                      {linkPreview.url}
                    </a>
                  )}
                </div>
              </div>
            )}
            <Textarea
              placeholder={t('post.placeholder') || "What's on your mind?"}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[120px] resize-none border-0 focus-visible:ring-0 text-base p-0"
              disabled={isSubmitting}
            />

            {items.length > 0 && (
              <>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs text-muted-foreground">{t('post.aspect') || 'Format'}:</span>
                  {(['16:9', '9:16', '1:1'] as AspectRatio[]).map(a => (
                    <button
                      key={a}
                      type="button"
                      onClick={() => setAspectRatio(a)}
                      className={`text-xs px-2 py-1 rounded border ${aspectRatio === a ? 'bg-primary text-primary-foreground border-primary' : 'border-border hover:bg-muted'}`}
                    >{a}</button>
                  ))}
                  <span className="ml-auto text-xs text-muted-foreground">{t('post.dragHint') || 'Glisser pour réorganiser'}</span>
                </div>
                <div className={`grid gap-2 ${items.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
                  {items.map((it, i) => (
                    <div
                      key={i}
                      draggable
                      onDragStart={() => setDragIdx(i)}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={() => { if (dragIdx !== null) { reorderItems(dragIdx, i); setDragIdx(null); } }}
                      onDragEnd={() => setDragIdx(null)}
                      className={`relative rounded-lg overflow-hidden bg-muted ${aspectClass} group cursor-move ${dragIdx === i ? 'opacity-50 ring-2 ring-primary' : ''}`}
                    >
                      {it.isVideo ? (
                        <video src={it.preview} className="absolute inset-0 w-full h-full object-cover" />
                      ) : (
                        <img
                          src={it.preview}
                          alt=""
                          className="absolute inset-0 w-full h-full object-cover transition-transform"
                          style={{
                            transform: `rotate(${it.rotation}deg)${it.rotation % 180 !== 0 ? ' scale(1.4)' : ''}`,
                            objectPosition: `${it.offsetX}% ${it.offsetY}%`,
                          }}
                        />
                      )}
                      <div className="absolute top-1 left-1 flex items-center gap-1">
                        <span className="bg-black/60 text-white text-[10px] rounded px-1.5 py-0.5 inline-flex items-center gap-1">
                          <GripVertical className="h-2.5 w-2.5" />{i + 1}/{items.length}
                        </span>
                      </div>
                      <div className="absolute inset-x-0 bottom-0 p-1 flex justify-end gap-1 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition">
                        {!it.isVideo && (
                          <>
                            <button type="button" onClick={() => setCropIdx(cropIdx === i ? null : i)} className="bg-black/60 text-white rounded p-1 hover:bg-black/80" title={t('post.crop') || 'Recadrer'}>
                              <Crop className="h-3 w-3" />
                            </button>
                            <button type="button" onClick={() => rotateFile(i)} className="bg-black/60 text-white rounded p-1 hover:bg-black/80" title="Rotate">
                              <RotateCw className="h-3 w-3" />
                            </button>
                          </>
                        )}
                      </div>
                      <button onClick={() => removeFile(i)} className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-1 hover:bg-black/80">
                        <X className="h-3 w-3" />
                      </button>
                      {cropIdx === i && !it.isVideo && (
                        <div className="absolute inset-x-0 bottom-0 bg-black/80 backdrop-blur p-2 space-y-1.5">
                          <div className="flex items-center gap-2 text-white text-[10px]">
                            <span className="w-4">X</span>
                            <Slider value={[it.offsetX]} onValueChange={([v]) => updateItem(i, { offsetX: v })} max={100} step={1} className="flex-1" />
                            <span className="w-8 text-right">{it.offsetX}%</span>
                          </div>
                          <div className="flex items-center gap-2 text-white text-[10px]">
                            <span className="w-4">Y</span>
                            <Slider value={[it.offsetY]} onValueChange={([v]) => updateItem(i, { offsetY: v })} max={100} step={1} className="flex-1" />
                            <span className="w-8 text-right">{it.offsetY}%</span>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                <div className="text-xs text-muted-foreground text-right">{items.length}/{MAX_IMAGES}</div>
              </>
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
            <div className="flex justify-end">
              <Button type="button" variant={showArticlePreview ? 'default' : 'outline'} size="sm" onClick={() => setShowArticlePreview(s => !s)}>
                <Eye className="h-4 w-4 mr-1" />
                {showArticlePreview ? (t('post.editMode') || 'Édition') : (t('post.preview') || 'Aperçu')}
              </Button>
            </div>

            {showArticlePreview ? (
              <ArticlePreview
                title={articleTitle}
                category={articleCategory}
                content={content}
                mediaPreviews={articleMediaPreviews}
                mediaFiles={articleMedia}
                authorName={userName}
                authorAvatar={userAvatar}
              />
            ) : (
              <>
                <Input placeholder={t('post.articleTitle') || 'Article title'} value={articleTitle} onChange={(e) => setArticleTitle(e.target.value)} className="text-lg font-semibold" />
                <Input placeholder={t('post.articleCategory') || 'Category'} value={articleCategory} onChange={(e) => setArticleCategory(e.target.value)} />
                <Textarea
                  ref={articleTextareaRef}
                  placeholder={t('post.articleContent') || 'Write your article...'}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="min-h-[250px]"
                />
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <LinkIcon className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      className="pl-8"
                      placeholder={t('post.articleLink') || 'Insert a link from another source...'}
                      value={articleLinkUrl}
                      onChange={(e) => setArticleLinkUrl(e.target.value)}
                    />
                  </div>
                  <Button type="button" variant="outline" onClick={importArticleLink} disabled={!articleLinkUrl.trim()}>
                    <Sparkles className="h-4 w-4" />
                    <span className="ml-1 hidden sm:inline">{t('post.insert') || 'Insert'}</span>
                  </Button>
                </div>
                <input ref={articleMediaRef} type="file" accept="image/*,video/*" multiple className="hidden" onChange={handleArticleMediaSelect} />
                <div className="flex gap-2">
                  <Button type="button" variant="outline" size="sm" onClick={() => articleMediaRef.current?.click()}>
                    <ImageIcon className="h-4 w-4 mr-1 text-green-500" />
                    {t('post.addMedia') || 'Add image / video'}
                  </Button>
                </div>
                {articleMediaPreviews.length > 0 && (
                  <div className="grid grid-cols-2 gap-2">
                    {articleMediaPreviews.map((src, i) => {
                      const isVideo = articleMedia[i]?.type.startsWith('video/');
                      return (
                        <div key={i} className="relative rounded-lg overflow-hidden bg-muted aspect-video">
                          {isVideo ? (
                            <video src={src} className="absolute inset-0 w-full h-full object-cover" controls />
                          ) : (
                            <img src={src} alt="" className="absolute inset-0 w-full h-full object-cover" />
                          )}
                          <button
                            type="button"
                            onClick={() => insertIntoArticle(isVideo ? `[video](${i + 1})` : `[image ${i + 1}]`)}
                            className="absolute bottom-1 left-1 bg-black/60 text-white text-[10px] rounded px-2 py-0.5 hover:bg-black/80"
                          >
                            {t('post.insertInText') || 'Insert in text'}
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setArticleMedia(prev => prev.filter((_, idx) => idx !== i));
                              setArticleMediaPreviews(prev => prev.filter((_, idx) => idx !== i));
                            }}
                            className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-1 hover:bg-black/80"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
                <p className="text-xs text-muted-foreground">{t('post.articleHint') || 'Articles are saved to your pages and shared as a preview in the feed.'}</p>
              </>
            )}
          </TabsContent>


          <TabsContent value="poll" className="space-y-3 mt-4">
            <Input placeholder={t('post.pollQuestion') || 'Ask a question...'} value={pollQuestion} onChange={(e) => setPollQuestion(e.target.value)} className="font-medium" />
            <input ref={pollMediaRef} type="file" accept="image/*,video/*" className="hidden" onChange={handlePollMediaSelect} />
            {pollMediaPreview ? (
              <div className="relative rounded-lg overflow-hidden bg-muted aspect-video">
                {pollMedia?.type.startsWith('video/') ? (
                  <video src={pollMediaPreview} className="absolute inset-0 w-full h-full object-cover" controls />
                ) : (
                  <img src={pollMediaPreview} alt="" className="absolute inset-0 w-full h-full object-cover" />
                )}
                <button type="button" onClick={() => { setPollMedia(null); setPollMediaPreview(''); }} className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-1 hover:bg-black/80">
                  <X className="h-3 w-3" />
                </button>
              </div>
            ) : (
              <Button type="button" variant="outline" size="sm" onClick={() => pollMediaRef.current?.click()}>
                <ImageIcon className="h-4 w-4 mr-1 text-green-500" />
                {t('post.addPollMedia') || 'Add image / video'}
              </Button>
            )}
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
          {!isEditing && (
            <Button variant="outline" onClick={saveDraft} disabled={isSubmitting}>
              <Save className="h-4 w-4 mr-1" />
              {activeDraftId ? (t('post.updateDraft') || 'Update draft') : (t('post.saveDraft') || 'Save draft')}
            </Button>
          )}
          <Button onClick={handleSubmit} disabled={isSubmitting} className="flex-1">
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isEditing ? (t('post.update') || 'Enregistrer') : scheduledFor ? (t('post.schedule') || 'Schedule') : (t('create.post') || 'Publish')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// ---------------- Article live preview ----------------
const URL_REGEX_AP = /(https?:\/\/[^\s<>"')]+)/gi;
const isUrlAp = (s: string) => /^https?:\/\//i.test(s);

const ArticlePreview: React.FC<{
  title: string;
  category: string;
  content: string;
  mediaPreviews: string[];
  mediaFiles: File[];
  authorName?: string;
  authorAvatar?: string;
}> = ({ title, category, content, mediaPreviews, mediaFiles, authorName, authorAvatar }) => {
  const renderInline = (line: string, key: number) => {
    const parts = line.split(URL_REGEX_AP);
    return (
      <React.Fragment key={key}>
        {parts.map((p, i) => isUrlAp(p)
          ? <a key={i} href={p} target="_blank" rel="noreferrer" className="text-primary hover:underline break-all">{p}</a>
          : <React.Fragment key={i}>{p}</React.Fragment>
        )}
      </React.Fragment>
    );
  };

  const blocks: React.ReactNode[] = [];
  const lines = (content || '').split('\n');
  const urlsSeen = new Set<string>();
  const referencedImgs = new Set<number>();
  const referencedVids = new Set<number>();

  lines.forEach((line, idx) => {
    const imgMatch = line.match(/^\s*\[image\s+(\d+)\]\s*$/i);
    const vidMatch = line.match(/^\s*\[video\]\(\s*(\d+)\s*\)\s*$/i);
    if (imgMatch) {
      const i = parseInt(imgMatch[1], 10) - 1;
      referencedImgs.add(i);
      if (mediaPreviews[i] && !mediaFiles[i]?.type.startsWith('video/')) {
        blocks.push(<img key={`b${idx}`} src={mediaPreviews[i]} alt="" className="w-full rounded-lg my-3 object-cover max-h-[500px]" />);
        return;
      }
    }
    if (vidMatch) {
      const i = parseInt(vidMatch[1], 10) - 1;
      referencedVids.add(i);
      if (mediaPreviews[i]) {
        blocks.push(<video key={`b${idx}`} src={mediaPreviews[i]} controls className="w-full rounded-lg my-3" />);
        return;
      }
    }
    if (line.trim()) {
      (line.match(URL_REGEX_AP) || []).forEach(u => urlsSeen.add(u));
      blocks.push(<p key={`p${idx}`} className="text-[15px] leading-relaxed whitespace-pre-wrap">{renderInline(line, idx)}</p>);
    } else {
      blocks.push(<div key={`s${idx}`} className="h-2" />);
    }
  });

  return (
    <article className="border rounded-lg p-4 bg-card space-y-3">
      <div className="flex items-center gap-2">
        <Avatar className="h-8 w-8">
          <AvatarImage src={authorAvatar} />
          <AvatarFallback>{authorName?.[0] || 'U'}</AvatarFallback>
        </Avatar>
        <div className="text-xs">
          <div className="font-semibold">{authorName || 'You'}</div>
          <div className="text-muted-foreground">Aperçu en direct</div>
        </div>
      </div>
      {title && <h1 className="text-2xl font-bold leading-tight">{title}</h1>}
      {category && <div className="text-xs text-muted-foreground uppercase tracking-wide">{category}</div>}
      <div className="space-y-1">{blocks.length ? blocks : <p className="text-muted-foreground italic">Commencez à écrire pour voir l'aperçu...</p>}</div>
      {mediaPreviews.map((src, i) => {
        const isVid = mediaFiles[i]?.type.startsWith('video/');
        if (isVid ? referencedVids.has(i) : referencedImgs.has(i)) return null;
        return isVid
          ? <video key={`u${i}`} src={src} controls className="w-full rounded-lg" />
          : <img key={`u${i}`} src={src} alt="" className="w-full rounded-lg object-cover max-h-[500px]" />;
      })}
      {[...urlsSeen].slice(0, 3).map(u => <LinkPreview key={u} url={u} />)}
    </article>
  );
};
