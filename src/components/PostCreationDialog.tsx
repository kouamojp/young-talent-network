import { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Input } from './ui/input';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { toast } from './ui/use-toast';
import { Loader2, Image as ImageIcon, FileText, MapPin, Smile, X, BarChart3, Plus } from 'lucide-react';
import { useLanguage } from '@/i18n/LanguageContext';

interface PostCreationDialogProps {
  trigger: React.ReactNode;
  onPostCreated?: () => void;
  userAvatar?: string;
  userName?: string;
}

type TabType = 'post' | 'article' | 'poll';

export const PostCreationDialog = ({ trigger, onPostCreated, userAvatar, userName }: PostCreationDialogProps) => {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<TabType>('post');
  const [content, setContent] = useState('');
  const [location, setLocation] = useState('');
  const [showLocation, setShowLocation] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Article fields
  const [articleTitle, setArticleTitle] = useState('');
  const [articleCategory, setArticleCategory] = useState('');

  // Poll fields
  const [pollQuestion, setPollQuestion] = useState('');
  const [pollOptions, setPollOptions] = useState<string[]>(['', '']);

  const reset = () => {
    setContent(''); setLocation(''); setShowLocation(false);
    setFiles([]); setPreviews([]);
    setArticleTitle(''); setArticleCategory('');
    setPollQuestion(''); setPollOptions(['', '']);
    setTab('post');
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

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({ title: t('post.loginRequired') || 'Please log in', variant: 'destructive' });
        return;
      }

      if (tab === 'post') {
        if (!content.trim() && files.length === 0) {
          toast({ title: t('post.emptyError') || 'Add text or media', variant: 'destructive' });
          return;
        }
        const mediaUrls = files.length ? await uploadFiles(user.id) : [];
        const finalContent = showLocation && location ? `${content}\n📍 ${location}` : content;
        const { error } = await supabase.from('posts').insert({
          content: finalContent.trim() || ' ',
          user_id: user.id,
          media_urls: mediaUrls.length ? mediaUrls : null,
        });
        if (error) throw error;
        toast({ title: t('post.created') || 'Post published!' });
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
          is_public: true,
        });
        if (error) throw error;
        // Also share as post
        await supabase.from('posts').insert({
          content: `📄 ${articleTitle}\n\n${content.slice(0, 200)}${content.length > 200 ? '...' : ''}`,
          user_id: user.id,
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
        });
        if (error) throw error;
        toast({ title: t('post.pollCreated') || 'Poll published!' });
      }

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

  return (
    <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) reset(); }}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t('post.create') || 'Create Post'}</DialogTitle>
        </DialogHeader>

        <div className="flex items-center gap-3 pt-2">
          <Avatar className="h-10 w-10">
            <AvatarImage src={userAvatar} />
            <AvatarFallback>{userName?.[0] || 'U'}</AvatarFallback>
          </Avatar>
          <div className="font-semibold text-sm">{userName || 'You'}</div>
        </div>

        <Tabs value={tab} onValueChange={(v) => setTab(v as TabType)} className="mt-2">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="post">{t('post.tab.post') || 'Post'}</TabsTrigger>
            <TabsTrigger value="article">{t('post.tab.article') || 'Article'}</TabsTrigger>
            <TabsTrigger value="poll">{t('post.tab.poll') || 'Poll'}</TabsTrigger>
          </TabsList>

          <TabsContent value="post" className="space-y-3 mt-4">
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
                    <button
                      onClick={() => removeFile(i)}
                      className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-1 hover:bg-black/80"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {showLocation && (
              <div className="flex items-center gap-2 bg-muted p-2 rounded-lg">
                <MapPin className="h-4 w-4 text-primary" />
                <Input
                  placeholder={t('post.locationPlaceholder') || 'Add location'}
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="border-0 bg-transparent focus-visible:ring-0 h-7 p-0"
                />
                <button onClick={() => { setShowLocation(false); setLocation(''); }}>
                  <X className="h-4 w-4 text-muted-foreground" />
                </button>
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,video/*"
              multiple
              className="hidden"
              onChange={handleFileSelect}
            />

            <div className="flex items-center justify-between border rounded-lg p-2">
              <span className="text-sm text-muted-foreground ml-2">{t('post.addToPost') || 'Add to post'}</span>
              <div className="flex gap-1">
                <Button
                  variant="ghost" size="icon" type="button"
                  onClick={() => fileInputRef.current?.click()}
                  title={t('post.addPhoto') || 'Photo/Video'}
                >
                  <ImageIcon className="h-5 w-5 text-green-500" />
                </Button>
                <Button
                  variant="ghost" size="icon" type="button"
                  onClick={() => setShowLocation(true)}
                  title={t('post.addLocation') || 'Location'}
                >
                  <MapPin className="h-5 w-5 text-red-500" />
                </Button>
                <Button variant="ghost" size="icon" type="button" title="Emoji">
                  <Smile className="h-5 w-5 text-yellow-500" />
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="article" className="space-y-3 mt-4">
            <Input
              placeholder={t('post.articleTitle') || 'Article title'}
              value={articleTitle}
              onChange={(e) => setArticleTitle(e.target.value)}
              className="text-lg font-semibold"
            />
            <Input
              placeholder={t('post.articleCategory') || 'Category (work, learning, events...)'}
              value={articleCategory}
              onChange={(e) => setArticleCategory(e.target.value)}
            />
            <Textarea
              placeholder={t('post.articleContent') || 'Write your article...'}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[250px]"
            />
            <p className="text-xs text-muted-foreground">
              {t('post.articleHint') || 'Articles are saved to your pages and shared as a preview in the feed.'}
            </p>
          </TabsContent>

          <TabsContent value="poll" className="space-y-3 mt-4">
            <Input
              placeholder={t('post.pollQuestion') || 'Ask a question...'}
              value={pollQuestion}
              onChange={(e) => setPollQuestion(e.target.value)}
              className="font-medium"
            />
            {pollOptions.map((opt, i) => (
              <div key={i} className="flex gap-2">
                <Input
                  placeholder={`${t('post.pollOption') || 'Option'} ${i + 1}`}
                  value={opt}
                  onChange={(e) => setPollOptions(prev => prev.map((o, idx) => idx === i ? e.target.value : o))}
                />
                {pollOptions.length > 2 && (
                  <Button variant="ghost" size="icon" onClick={() => setPollOptions(prev => prev.filter((_, idx) => idx !== i))}>
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
            {pollOptions.length < 6 && (
              <Button variant="outline" size="sm" onClick={() => setPollOptions(prev => [...prev, ''])}>
                <Plus className="h-4 w-4 mr-1" />
                {t('post.pollAddOption') || 'Add option'}
              </Button>
            )}
          </TabsContent>
        </Tabs>

        <div className="flex justify-end pt-2">
          <Button onClick={handleSubmit} disabled={isSubmitting} className="w-full">
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {t('create.post') || 'Publish'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
