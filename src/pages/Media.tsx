import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Camera, Video, Music, Upload, Filter, Play, ChevronDown, Image as ImageIcon, Zap } from 'lucide-react';
import ShortsFeed from '@/components/media/ShortsFeed';
import { supabase } from '@/integrations/supabase/client';
import { countries } from '@/data/countries';
import { toast } from 'sonner';
import { useLanguage } from '@/i18n/LanguageContext';

const mediaCategories = [
  'Sport', 'IT', 'Esports', 'Science', 'Fashion', 'Medicine', 'Music', 'Dance', 'Hobbies', 'Cooking', 'Art', 'Finance',
];

interface MediaItem {
  id: string; user_id: string; media_type: string; url: string; title: string | null; description: string | null; created_at: string;
}

const Media: React.FC = () => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('photo');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchMedia(); }, [activeTab]);

  const fetchMedia = async () => {
    setLoading(true);
    let q = supabase.from('talent_media').select('*').order('created_at', { ascending: false });
    if (activeTab === 'photo') q = q.eq('media_type', 'image');
    else if (activeTab === 'video') q = q.eq('media_type', 'video');
    else if (activeTab === 'music') q = q.eq('media_type', 'audio');
    if (searchQuery.trim()) q = q.or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`);
    const { data } = await q.limit(50);
    setMedia(data || []);
    setLoading(false);
  };

  useEffect(() => { const timeout = setTimeout(fetchMedia, 300); return () => clearTimeout(timeout); }, [searchQuery]);

  const handleUpload = async (file: File, type: string, title: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { toast.error(t('common.loading')); return; }
    const fileExt = file.name.split('.').pop();
    const filePath = `${user.id}/${Date.now()}.${fileExt}`;
    const { error: uploadError } = await supabase.storage.from('profile-files').upload(filePath, file);
    if (uploadError) { toast.error(uploadError.message); return; }
    const { data: urlData } = supabase.storage.from('profile-files').getPublicUrl(filePath);
    const { error } = await supabase.from('talent_media').insert({ user_id: user.id, media_type: type, url: urlData.publicUrl, title: title || file.name });
    if (error) toast.error(error.message);
    else { toast.success('OK!'); fetchMedia(); }
  };

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <div className="bg-muted/50 border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-xl font-bold text-foreground">{t('media.title')}</h1>
            <UploadDialog onUpload={handleUpload} activeTab={activeTab} />
          </div>
          <div className="flex gap-2">
            <Input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder={t('media.searchPlaceholder')} className="flex-1 h-10 text-sm bg-card" />
            <Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)} className="gap-1">
              <Filter className="h-3.5 w-3.5" /><ChevronDown className={`h-3.5 w-3.5 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </Button>
          </div>
          {showFilters && (
            <div className="grid grid-cols-2 gap-2 mt-3">
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="text-xs h-8"><SelectValue placeholder={t('marketplace.category')} /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('media.allCategories')}</SelectItem>
                  {mediaCategories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select>
                <SelectTrigger className="text-xs h-8"><SelectValue placeholder={t('media.region')} /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('media.allRegions')}</SelectItem>
                  {countries.slice(0, 20).map(c => <SelectItem key={c.value} value={c.label}>{c.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      </div>

      <div className="container mx-auto px-4 py-4">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4 w-full grid grid-cols-4 text-xs">
            <TabsTrigger value="shorts" className="gap-1 text-xs"><Zap className="h-3.5 w-3.5" /> Shorts</TabsTrigger>
            <TabsTrigger value="photo" className="gap-1 text-xs"><Camera className="h-3.5 w-3.5" /> {t('media.photo')}</TabsTrigger>
            <TabsTrigger value="video" className="gap-1 text-xs"><Video className="h-3.5 w-3.5" /> {t('media.video')}</TabsTrigger>
            <TabsTrigger value="music" className="gap-1 text-xs"><Music className="h-3.5 w-3.5" /> {t('media.music')}</TabsTrigger>
          </TabsList>
          <TabsContent value="shorts"><ShortsFeed /></TabsContent>
          <TabsContent value="photo"><MediaGrid items={media} loading={loading} type="photo" /></TabsContent>
          <TabsContent value="video"><MediaGrid items={media} loading={loading} type="video" /></TabsContent>
          <TabsContent value="music"><MusicList items={media} loading={loading} /></TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

const MediaGrid: React.FC<{ items: MediaItem[]; loading: boolean; type: string }> = ({ items, loading, type }) => {
  const { t } = useLanguage();
  if (loading) return <div className="text-center py-12 text-muted-foreground text-sm">{t('media.loading')}</div>;
  if (items.length === 0) return (
    <div className="text-center py-16 text-muted-foreground">
      <ImageIcon className="h-10 w-10 mx-auto mb-2 opacity-30" />
      <p className="text-sm">{t('media.noContent')}</p>
      <p className="text-xs mt-1">{t('media.uploadFirst')} {type === 'photo' ? t('media.photo').toLowerCase() : t('media.video').toLowerCase()}!</p>
    </div>
  );
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
      {items.map(item => (
        <div key={item.id} className="relative group aspect-square bg-muted rounded-lg overflow-hidden border border-border">
          {type === 'photo' ? <img src={item.url} alt={item.title || ''} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center bg-muted"><Play className="h-10 w-10 text-primary/40" /></div>}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-end opacity-0 group-hover:opacity-100"><div className="p-2 text-white w-full"><p className="text-xs font-medium truncate">{item.title}</p></div></div>
        </div>
      ))}
    </div>
  );
};

const MusicList: React.FC<{ items: MediaItem[]; loading: boolean }> = ({ items, loading }) => {
  const { t } = useLanguage();
  if (loading) return <div className="text-center py-12 text-muted-foreground text-sm">{t('media.loading')}</div>;
  if (items.length === 0) return (
    <div className="text-center py-16 text-muted-foreground"><Music className="h-10 w-10 mx-auto mb-2 opacity-30" /><p className="text-sm">{t('media.noMusic')}</p></div>
  );
  return (
    <div className="space-y-2">
      {items.map(item => (
        <div key={item.id} className="bg-card border border-border rounded-lg p-3 flex items-center gap-3 hover:bg-muted/50 transition-colors">
          <div className="h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center shrink-0"><Music className="h-5 w-5 text-primary" /></div>
          <div className="flex-1 min-w-0"><p className="text-sm font-medium text-foreground truncate">{item.title}</p><p className="text-xs text-muted-foreground">{new Date(item.created_at).toLocaleDateString()}</p></div>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 shrink-0"><Play className="h-4 w-4" /></Button>
        </div>
      ))}
    </div>
  );
};

interface UploadDialogProps { onUpload: (file: File, type: string, title: string) => void; activeTab: string; }

const UploadDialog: React.FC<UploadDialogProps> = ({ onUpload, activeTab }) => {
  const { t } = useLanguage();
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [open, setOpen] = useState(false);
  const typeMap: Record<string, string> = { photo: 'image', video: 'video', music: 'audio' };

  const handleSubmit = () => { if (!file) return; onUpload(file, typeMap[activeTab] || 'image', title); setFile(null); setTitle(''); setOpen(false); };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild><Button size="sm" className="gap-1.5"><Upload className="h-4 w-4" />{t('media.upload')}</Button></DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>{t('media.uploadTitle')} {activeTab === 'photo' ? t('media.photo') : activeTab === 'video' ? t('media.video') : t('media.music')}</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <Input placeholder={t('media.titleField')} value={title} onChange={e => setTitle(e.target.value)} />
          <Input type="file" accept={activeTab === 'photo' ? 'image/*' : activeTab === 'video' ? 'video/*' : 'audio/*'} onChange={e => setFile(e.target.files?.[0] || null)} />
          <Button onClick={handleSubmit} disabled={!file} className="w-full">{t('media.downloadBtn')}</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default Media;
