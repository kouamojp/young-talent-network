import React, { useState, useEffect, useRef } from 'react';
import { Search, Plus, Star, MapPin, ShoppingBag, Heart, MessageSquare, Eye, Upload, X, Image, Film, FileText, Loader2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLanguage } from '@/i18n/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface MarketplaceListing {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  price: number;
  currency: string;
  category: string;
  type: string;
  location: string | null;
  media_urls: string[] | null;
  likes_count: number;
  views_count: number;
  created_at: string;
  profiles?: { name: string; avatar_url: string | null };
}

const categories = ['All', 'Coaching', 'Equipment', 'Creative', 'Nutrition', 'Events', 'Digital', 'Other'];

const Marketplace: React.FC = () => {
  const { t } = useLanguage();
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [activeTab, setActiveTab] = useState('all');
  const [listings, setListings] = useState<MarketplaceListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);

  // Form state
  const [formTitle, setFormTitle] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formPrice, setFormPrice] = useState('');
  const [formType, setFormType] = useState('product');
  const [formCategory, setFormCategory] = useState('');
  const [formLocation, setFormLocation] = useState('');
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [mediaPreviews, setMediaPreviews] = useState<string[]>([]);
  const [publishing, setPublishing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchListings();
  }, []);

  const fetchListings = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('marketplace_listings')
      .select('*, profiles(name, avatar_url)')
      .eq('status', 'active')
      .order('created_at', { ascending: false });
    if (!error && data) setListings(data as any);
    setLoading(false);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (mediaFiles.length + files.length > 10) {
      toast.error('Maximum 10 files allowed');
      return;
    }
    const newFiles = [...mediaFiles, ...files];
    setMediaFiles(newFiles);

    // Generate previews
    files.forEach(file => {
      const url = URL.createObjectURL(file);
      setMediaPreviews(prev => [...prev, url]);
    });
  };

  const removeFile = (index: number) => {
    URL.revokeObjectURL(mediaPreviews[index]);
    setMediaFiles(prev => prev.filter((_, i) => i !== index));
    setMediaPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) return <Image className="h-4 w-4" />;
    if (file.type.startsWith('video/')) return <Film className="h-4 w-4" />;
    return <FileText className="h-4 w-4" />;
  };

  const isVideo = (file: File) => file.type.startsWith('video/');
  const isImage = (file: File) => file.type.startsWith('image/');

  const handlePublish = async () => {
    if (!formTitle.trim()) { toast.error('Title is required'); return; }

    setPublishing(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { toast.error('Please sign in'); setPublishing(false); return; }

      // Upload files
      const uploadedUrls: string[] = [];
      for (const file of mediaFiles) {
        const ext = file.name.split('.').pop();
        const path = `${user.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from('marketplace-files')
          .upload(path, file);
        if (uploadError) throw uploadError;
        const { data: urlData } = supabase.storage
          .from('marketplace-files')
          .getPublicUrl(path);
        uploadedUrls.push(urlData.publicUrl);
      }

      const { error } = await supabase.from('marketplace_listings').insert({
        user_id: user.id,
        title: formTitle,
        description: formDesc || null,
        price: parseFloat(formPrice) || 0,
        type: formType,
        category: formCategory || 'Other',
        location: formLocation || null,
        media_urls: uploadedUrls,
      });

      if (error) throw error;

      toast.success('Listing published!');
      setDialogOpen(false);
      resetForm();
      fetchListings();
    } catch (err: any) {
      toast.error(err.message || 'Failed to publish');
    } finally {
      setPublishing(false);
    }
  };

  const resetForm = () => {
    setFormTitle(''); setFormDesc(''); setFormPrice('');
    setFormType('product'); setFormCategory(''); setFormLocation('');
    mediaPreviews.forEach(url => URL.revokeObjectURL(url));
    setMediaFiles([]); setMediaPreviews([]);
  };

  const filtered = listings.filter(item => {
    const matchSearch = item.title.toLowerCase().includes(search.toLowerCase());
    const matchCategory = selectedCategory === 'All' || item.category === selectedCategory;
    const matchType = activeTab === 'all' || item.type === activeTab;
    return matchSearch && matchCategory && matchType;
  });

  const getMediaPreview = (urls: string[] | null) => {
    if (!urls || urls.length === 0) return null;
    const first = urls[0];
    const isVid = /\.(mp4|webm|mov|avi)$/i.test(first);
    if (isVid) {
      return (
        <video src={first} className="w-full h-full object-cover" muted playsInline
          onMouseOver={e => (e.target as HTMLVideoElement).play()}
          onMouseOut={e => { const v = e.target as HTMLVideoElement; v.pause(); v.currentTime = 0; }}
        />
      );
    }
    return <img src={first} alt="" className="w-full h-full object-cover" />;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <div className="bg-gradient-to-br from-primary/10 via-accent to-primary/5 px-4 py-8 md:py-12">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-sm font-semibold">
            <ShoppingBag className="h-4 w-4" /> {t('marketplace.title')}
          </div>
          <h1 className="text-2xl md:text-4xl font-bold text-foreground">{t('marketplace.heroTitle')}</h1>
          <p className="text-muted-foreground max-w-xl mx-auto text-sm md:text-base">{t('marketplace.heroDesc')}</p>
          <div className="flex items-center gap-2 max-w-lg mx-auto mt-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder={t('marketplace.searchPlaceholder')} value={search} onChange={e => setSearch(e.target.value)} className="pl-10 bg-card border-border" />
            </div>
            <Dialog open={dialogOpen} onOpenChange={v => { setDialogOpen(v); if (!v) resetForm(); }}>
              <DialogTrigger asChild>
                <Button className="gap-1.5"><Plus className="h-4 w-4" /> {t('marketplace.sell')}</Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                <DialogHeader><DialogTitle>{t('marketplace.createListing')}</DialogTitle></DialogHeader>
                <div className="space-y-4 pt-2">
                  {/* Media Upload */}
                  <div>
                    <Label className="flex items-center gap-2 mb-2">
                      <Upload className="h-4 w-4" /> Медиа файлы (фото, видео, документы)
                    </Label>
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      accept="image/*,video/*,.pdf,.doc,.docx"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed border-border rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-colors"
                    >
                      <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">
                        Нажмите для загрузки или перетащите файлы
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Фото, видео, PDF · до 10 файлов
                      </p>
                    </div>

                    {/* File previews */}
                    {mediaFiles.length > 0 && (
                      <div className="grid grid-cols-3 gap-2 mt-3">
                        {mediaFiles.map((file, i) => (
                          <div key={i} className="relative group rounded-lg overflow-hidden border border-border aspect-square bg-muted">
                            {isImage(file) ? (
                              <img src={mediaPreviews[i]} alt="" className="w-full h-full object-cover" />
                            ) : isVideo(file) ? (
                              <video src={mediaPreviews[i]} className="w-full h-full object-cover" muted />
                            ) : (
                              <div className="w-full h-full flex flex-col items-center justify-center gap-1 p-2">
                                <FileText className="h-8 w-8 text-muted-foreground" />
                                <span className="text-[10px] text-muted-foreground text-center line-clamp-2">{file.name}</span>
                              </div>
                            )}
                            <button
                              onClick={(e) => { e.stopPropagation(); removeFile(i); }}
                              className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X className="h-3 w-3" />
                            </button>
                            <div className="absolute bottom-1 left-1 bg-black/60 text-white rounded px-1.5 py-0.5 text-[10px] flex items-center gap-1">
                              {getFileIcon(file)}
                              {(file.size / 1024 / 1024).toFixed(1)} MB
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div><Label>{t('marketplace.title_field')}</Label><Input value={formTitle} onChange={e => setFormTitle(e.target.value)} placeholder={t('marketplace.titlePlaceholder')} /></div>
                  <div><Label>{t('marketplace.description')}</Label><Textarea value={formDesc} onChange={e => setFormDesc(e.target.value)} placeholder={t('marketplace.descPlaceholder')} rows={3} /></div>
                  <div className="grid grid-cols-2 gap-3">
                    <div><Label>{t('marketplace.price')}</Label><Input type="number" value={formPrice} onChange={e => setFormPrice(e.target.value)} placeholder="0" /></div>
                    <div>
                      <Label>{t('marketplace.type')}</Label>
                      <Select value={formType} onValueChange={setFormType}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="product">{t('marketplace.product')}</SelectItem>
                          <SelectItem value="service">{t('marketplace.service')}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label>{t('marketplace.category')}</Label>
                      <Select value={formCategory} onValueChange={setFormCategory}>
                        <SelectTrigger><SelectValue placeholder={t('marketplace.select')} /></SelectTrigger>
                        <SelectContent>
                          {categories.filter(c => c !== 'All').map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Локация</Label>
                      <Input value={formLocation} onChange={e => setFormLocation(e.target.value)} placeholder="Paris, France" />
                    </div>
                  </div>
                  <Button className="w-full" onClick={handlePublish} disabled={publishing}>
                    {publishing ? <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Публикация...</> : t('marketplace.publish')}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="px-4 py-4 border-b border-border">
        <div className="max-w-5xl mx-auto">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <TabsList className="bg-muted">
                <TabsTrigger value="all">{t('marketplace.all')}</TabsTrigger>
                <TabsTrigger value="product">{t('marketplace.products')}</TabsTrigger>
                <TabsTrigger value="service">{t('marketplace.services')}</TabsTrigger>
              </TabsList>
              <div className="flex gap-1.5 overflow-x-auto">
                {categories.map(cat => (
                  <Button key={cat} variant={selectedCategory === cat ? 'default' : 'outline'} size="sm" onClick={() => setSelectedCategory(cat)} className="text-xs whitespace-nowrap">{cat}</Button>
                ))}
              </div>
            </div>
          </Tabs>
        </div>
      </div>

      {/* Listings Grid */}
      <div className="px-4 py-6 max-w-5xl mx-auto">
        {loading ? (
          <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(item => (
              <div key={item.id} className="bg-card border border-border rounded-xl overflow-hidden hover:shadow-md transition-shadow group">
                <div className="h-48 bg-gradient-to-br from-muted to-accent flex items-center justify-center relative overflow-hidden">
                  {getMediaPreview(item.media_urls) || (
                    <ShoppingBag className="h-12 w-12 text-muted-foreground/30" />
                  )}
                  {item.media_urls && item.media_urls.length > 1 && (
                    <div className="absolute top-2 right-2 bg-black/60 text-white rounded-full px-2 py-0.5 text-xs flex items-center gap-1">
                      <Image className="h-3 w-3" /> {item.media_urls.length}
                    </div>
                  )}
                </div>
                <div className="p-4 space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-sm text-foreground line-clamp-1">{item.title}</h3>
                      <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{item.description}</p>
                    </div>
                    <Badge variant={item.type === 'service' ? 'default' : 'secondary'} className="text-[10px] shrink-0 ml-2">
                      {item.type === 'service' ? t('marketplace.service') : t('marketplace.product')}
                    </Badge>
                  </div>
                  {item.location && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground"><MapPin className="h-3 w-3" /> {item.location}</div>
                  )}
                  <div className="flex items-center justify-between pt-2 border-t border-border">
                    <span className="text-lg font-bold text-primary">{item.currency}{item.price}</span>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-0.5"><Heart className="h-3 w-3" />{item.likes_count}</span>
                      <span className="flex items-center gap-0.5"><Eye className="h-3 w-3" />{item.views_count}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center gap-1.5">
                      <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center text-[10px] font-bold text-muted-foreground">
                        {item.profiles?.name?.charAt(0) || 'U'}
                      </div>
                      <span className="text-xs text-muted-foreground">{item.profiles?.name || 'User'}</span>
                    </div>
                    <Button size="sm" variant="outline" className="h-7 text-xs gap-1"><MessageSquare className="h-3 w-3" /> {t('marketplace.contact')}</Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        {!loading && filtered.length === 0 && (
          <div className="text-center py-16 text-muted-foreground">
            <ShoppingBag className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p>{t('marketplace.noListings')}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Marketplace;
