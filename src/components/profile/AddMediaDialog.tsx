import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Upload } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface AddMediaDialogProps {
  userId: string;
  onAdded: () => void;
}

const MEDIA_TYPES = [
  { value: 'image', label: '🖼️ Photo' },
  { value: 'video', label: '🎬 Vidéo' },
  { value: 'audio', label: '🎵 Audio' },
  { value: 'pdf', label: '📄 PDF / Document' },
  { value: 'youtube', label: '▶️ Lien YouTube' },
  { value: 'instagram', label: '📸 Lien Instagram' },
  { value: 'facebook', label: '👤 Lien Facebook' },
  { value: 'tiktok', label: '🎵 Lien TikTok' },
  { value: 'link', label: '🔗 Lien externe' },
];

const CATEGORIES = ['Sport', 'Musique', 'Art', 'Photographie', 'Vidéo', 'Mode', 'Académique', 'Projet', 'Récompense', 'Autre'];

const AddMediaDialog: React.FC<AddMediaDialogProps> = ({ userId, onAdded }) => {
  const [open, setOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [uploading, setUploading] = React.useState(false);
  const [form, setForm] = React.useState({
    title: '', description: '', url: '', media_type: 'image', category: '', item_date: '',
  });

  const isFileType = ['image', 'video', 'audio', 'pdf'].includes(form.media_type);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const ext = file.name.split('.').pop();
      const path = `${userId}/portfolio/${Date.now()}.${ext}`;
      const { error } = await supabase.storage.from('profile-files').upload(path, file);
      if (error) throw error;
      const { data } = supabase.storage.from('profile-files').getPublicUrl(path);
      setForm(f => ({ ...f, url: data.publicUrl }));
      toast.success('Fichier téléchargé');
    } catch (err: any) {
      toast.error(err.message || 'Erreur upload');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.url.trim()) { toast.error('Ajoute un fichier ou un lien'); return; }
    setLoading(true);
    try {
      const { error } = await (supabase.from('talent_media') as any).insert({
        user_id: userId,
        title: form.title.trim() || null,
        description: form.description.trim() || null,
        url: form.url.trim(),
        media_type: form.media_type,
        category: form.category || null,
        item_date: form.item_date || null,
      });
      if (error) throw error;
      toast.success('Ajouté au portfolio');
      setForm({ title: '', description: '', url: '', media_type: 'image', category: '', item_date: '' });
      setOpen(false);
      onAdded();
    } catch (err: any) {
      toast.error(err.message || "Erreur lors de l'ajout");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="gap-1">
          <Plus className="h-3.5 w-3.5" /> Ajouter
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>Ajouter au portfolio</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Type *</Label>
            <Select value={form.media_type} onValueChange={v => setForm(f => ({ ...f, media_type: v, url: '' }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {MEDIA_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          {isFileType && (
            <div>
              <Label>Téléverser un fichier</Label>
              <div className="flex gap-2 mt-1">
                <Input
                  type="file"
                  accept={form.media_type === 'image' ? 'image/*' : form.media_type === 'video' ? 'video/*' : form.media_type === 'audio' ? 'audio/*' : 'application/pdf,.pdf,.doc,.docx'}
                  onChange={handleFileUpload}
                  disabled={uploading}
                />
                {uploading && <Upload className="h-5 w-5 animate-pulse text-primary" />}
              </div>
            </div>
          )}

          <div>
            <Label>{isFileType ? 'Ou URL directe' : 'Lien *'}</Label>
            <Input value={form.url} onChange={e => setForm(f => ({ ...f, url: e.target.value }))} placeholder="https://..." />
          </div>

          <div>
            <Label>Titre</Label>
            <Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Titre de l'élément" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Catégorie</Label>
              <Select value={form.category} onValueChange={v => setForm(f => ({ ...f, category: v }))}>
                <SelectTrigger><SelectValue placeholder="Choisir..." /></SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Date</Label>
              <Input type="date" value={form.item_date} onChange={e => setForm(f => ({ ...f, item_date: e.target.value }))} />
            </div>
          </div>

          <div>
            <Label>Description</Label>
            <Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Description..." rows={2} />
          </div>

          <Button type="submit" className="w-full" disabled={loading || uploading}>
            {loading ? 'Ajout...' : 'Ajouter au portfolio'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddMediaDialog;
