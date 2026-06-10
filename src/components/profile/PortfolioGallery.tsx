import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Image as ImgIcon, Video, FileText, Youtube, Instagram, Facebook, Music, ExternalLink, Trash2, Calendar, Folder } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import AddMediaDialog from './AddMediaDialog';

interface Props {
  userId: string;
  ownerId: string;
  items: any[];
  onChanged?: () => void;
}

const ICONS: Record<string, any> = {
  image: ImgIcon, photo: ImgIcon, video: Video, audio: Music,
  pdf: FileText, document: FileText, youtube: Youtube,
  instagram: Instagram, facebook: Facebook, tiktok: Music, link: ExternalLink,
};

const COLORS: Record<string, string> = {
  image: 'bg-blue-500/20 text-blue-600', photo: 'bg-blue-500/20 text-blue-600',
  video: 'bg-rose-500/20 text-rose-600', audio: 'bg-purple-500/20 text-purple-600',
  pdf: 'bg-orange-500/20 text-orange-600', document: 'bg-orange-500/20 text-orange-600',
  youtube: 'bg-red-500/20 text-red-600', instagram: 'bg-pink-500/20 text-pink-600',
  facebook: 'bg-blue-600/20 text-blue-700', tiktok: 'bg-foreground/20 text-foreground',
  link: 'bg-emerald-500/20 text-emerald-600',
};

const getYoutubeEmbed = (url: string) => {
  const m = url.match(/(?:youtube\.com\/(?:.*[?&]v=|embed\/|shorts\/)|youtu\.be\/)([^&?\/\s]{11})/);
  return m ? `https://www.youtube.com/embed/${m[1]}` : null;
};

const PortfolioGallery: React.FC<Props> = ({ userId, ownerId, items, onChanged }) => {
  const [filter, setFilter] = useState<string>('all');
  const [preview, setPreview] = useState<any>(null);
  const isOwner = userId === ownerId;

  const categories = useMemo(() => {
    const set = new Set<string>();
    items.forEach(i => i.category && set.add(i.category));
    return Array.from(set);
  }, [items]);

  const filtered = filter === 'all' ? items
    : filter.startsWith('cat:') ? items.filter(i => i.category === filter.slice(4))
    : items.filter(i => i.media_type === filter);

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer cet élément ?')) return;
    const { error } = await supabase.from('talent_media').delete().eq('id', id);
    if (error) { toast.error(error.message); return; }
    toast.success('Supprimé');
    onChanged?.();
  };

  const renderThumb = (m: any) => {
    const isImage = m.media_type === 'image' || m.media_type === 'photo';
    const yt = m.media_type === 'youtube' ? getYoutubeEmbed(m.url) : null;
    if (isImage) {
      return <img src={m.url} alt={m.title || ''} className="w-full h-40 object-cover" loading="lazy" />;
    }
    if (yt) {
      const id = yt.split('/').pop();
      return <img src={`https://img.youtube.com/vi/${id}/hqdefault.jpg`} alt={m.title || ''} className="w-full h-40 object-cover" />;
    }
    if (m.media_type === 'video') {
      return <video src={m.url} className="w-full h-40 object-cover" muted preload="metadata" />;
    }
    const Icon = ICONS[m.media_type] || ExternalLink;
    return (
      <div className={`w-full h-40 flex items-center justify-center ${COLORS[m.media_type] || 'bg-muted'}`}>
        <Icon className="h-12 w-12" />
      </div>
    );
  };

  const openItem = (m: any) => {
    const isExternalSocial = ['instagram', 'facebook', 'tiktok', 'link', 'pdf', 'document'].includes(m.media_type);
    if (isExternalSocial) {
      window.open(m.url, '_blank', 'noopener,noreferrer');
    } else {
      setPreview(m);
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Folder className="h-4 w-4" /> Portfolio
            <Badge variant="secondary">{items.length}</Badge>
          </CardTitle>
          {isOwner && <AddMediaDialog userId={userId} onAdded={() => onChanged?.()} />}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <Tabs value={filter} onValueChange={setFilter}>
          <TabsList className="flex flex-wrap h-auto">
            <TabsTrigger value="all">Tout</TabsTrigger>
            <TabsTrigger value="image">Photos</TabsTrigger>
            <TabsTrigger value="video">Vidéos</TabsTrigger>
            <TabsTrigger value="pdf">PDF</TabsTrigger>
            <TabsTrigger value="youtube">YouTube</TabsTrigger>
            <TabsTrigger value="instagram">Instagram</TabsTrigger>
            <TabsTrigger value="tiktok">TikTok</TabsTrigger>
            <TabsTrigger value="link">Liens</TabsTrigger>
            {categories.map(c => (
              <TabsTrigger key={c} value={`cat:${c}`}>{c}</TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        {filtered.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            {isOwner ? 'Aucun élément. Ajoute photos, vidéos, PDF ou liens.' : 'Aucun élément.'}
          </p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {filtered.map(m => {
              const Icon = ICONS[m.media_type] || ExternalLink;
              return (
                <div key={m.id} className="group relative rounded-lg overflow-hidden border border-border hover:shadow-md transition cursor-pointer">
                  <div onClick={() => openItem(m)}>{renderThumb(m)}</div>
                  <div className="p-2 bg-card">
                    <div className="flex items-center gap-1 mb-1">
                      <Icon className="h-3 w-3 text-muted-foreground" />
                      <p className="font-medium text-xs truncate flex-1">{m.title || m.media_type}</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-1 text-[10px] text-muted-foreground">
                      {m.category && <Badge variant="outline" className="text-[9px] py-0 px-1.5">{m.category}</Badge>}
                      {m.item_date && (
                        <span className="flex items-center gap-0.5"><Calendar className="h-2.5 w-2.5" />{new Date(m.item_date).toLocaleDateString('fr-FR')}</span>
                      )}
                    </div>
                  </div>
                  {isOwner && (
                    <Button
                      size="icon" variant="destructive"
                      className="absolute top-1 right-1 h-7 w-7 opacity-0 group-hover:opacity-100 transition"
                      onClick={(e) => { e.stopPropagation(); handleDelete(m.id); }}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>

      <Dialog open={!!preview} onOpenChange={() => setPreview(null)}>
        <DialogContent className="max-w-3xl">
          {preview && (
            <div className="space-y-2">
              <h3 className="font-semibold text-lg">{preview.title || preview.media_type}</h3>
              {(preview.media_type === 'image' || preview.media_type === 'photo') && (
                <img src={preview.url} alt={preview.title || ''} className="w-full max-h-[70vh] object-contain rounded" />
              )}
              {preview.media_type === 'video' && (
                <video src={preview.url} controls className="w-full max-h-[70vh] rounded" />
              )}
              {preview.media_type === 'audio' && (
                <audio src={preview.url} controls className="w-full" />
              )}
              {preview.media_type === 'youtube' && getYoutubeEmbed(preview.url) && (
                <div className="relative aspect-video">
                  <iframe src={getYoutubeEmbed(preview.url)!} className="w-full h-full rounded" allowFullScreen />
                </div>
              )}
              {preview.description && <p className="text-sm text-muted-foreground">{preview.description}</p>}
              <div className="flex flex-wrap gap-2">
                {preview.category && <Badge variant="secondary">{preview.category}</Badge>}
                {preview.item_date && <Badge variant="outline">{new Date(preview.item_date).toLocaleDateString('fr-FR')}</Badge>}
                <Button size="sm" variant="outline" asChild>
                  <a href={preview.url} target="_blank" rel="noopener noreferrer"><ExternalLink className="h-3 w-3 mr-1" /> Ouvrir</a>
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default PortfolioGallery;
