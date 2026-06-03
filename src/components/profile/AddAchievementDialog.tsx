import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface AddAchievementDialogProps {
  userId: string;
  onAdded: () => void;
}

const AddAchievementDialog: React.FC<AddAchievementDialogProps> = ({ userId, onAdded }) => {
  const [open, setOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [form, setForm] = React.useState({
    title: '',
    description: '',
    category: '',
    level: '',
    date: '',
    achievement_type: '',
    external_link: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    setLoading(true);
    try {
      const { error } = await supabase.from('talent_achievements').insert({
        user_id: userId,
        title: form.title.trim(),
        description: form.description.trim() || null,
        category: form.category || null,
        level: form.level || null,
        date: form.date || null,
        achievement_type: form.achievement_type || null,
        external_link: form.external_link.trim() || null,
      } as any);
      if (error) throw error;
      toast.success('Réalisation ajoutée');
      setForm({ title: '', description: '', category: '', level: '', date: '', achievement_type: '', external_link: '' });
      setOpen(false);
      onAdded();
    } catch (err) {
      toast.error("Erreur lors de l'ajout");
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
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nouvelle réalisation</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Titre *</Label>
            <Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Ex: Champion national 2025" required />
          </div>
          <div>
            <Label>Description</Label>
            <Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Détails de la réalisation..." rows={3} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Catégorie</Label>
              <Select value={form.category} onValueChange={v => setForm(f => ({ ...f, category: v }))}>
                <SelectTrigger><SelectValue placeholder="Choisir" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="sport">Sport</SelectItem>
                  <SelectItem value="education">Éducation</SelectItem>
                  <SelectItem value="art">Art & Culture</SelectItem>
                  <SelectItem value="tech">Technologie</SelectItem>
                  <SelectItem value="business">Business</SelectItem>
                  <SelectItem value="other">Autre</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Niveau</Label>
              <Select value={form.level} onValueChange={v => setForm(f => ({ ...f, level: v }))}>
                <SelectTrigger><SelectValue placeholder="Choisir" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="local">Local</SelectItem>
                  <SelectItem value="regional">Régional</SelectItem>
                  <SelectItem value="national">National</SelectItem>
                  <SelectItem value="international">International</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Type de réalisation</Label>
              <Select value={form.achievement_type} onValueChange={v => setForm(f => ({ ...f, achievement_type: v }))}>
                <SelectTrigger><SelectValue placeholder="Choisir" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="award">Prix / Award</SelectItem>
                  <SelectItem value="competition">Compétition</SelectItem>
                  <SelectItem value="publication">Publication</SelectItem>
                  <SelectItem value="performance">Performance</SelectItem>
                  <SelectItem value="certification">Certification</SelectItem>
                  <SelectItem value="record">Record</SelectItem>
                  <SelectItem value="other">Autre</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Date</Label>
              <Input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
            </div>
          </div>
          <div>
            <Label>Lien externe</Label>
            <Input type="url" value={form.external_link} onChange={e => setForm(f => ({ ...f, external_link: e.target.value }))} placeholder="https://..." />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Ajout...' : 'Ajouter la réalisation'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddAchievementDialog;
