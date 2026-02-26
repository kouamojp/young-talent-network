import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface AddEducationDialogProps {
  userId: string;
  onAdded: () => void;
}

const AddEducationDialog: React.FC<AddEducationDialogProps> = ({ userId, onAdded }) => {
  const [open, setOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [form, setForm] = React.useState({
    institution: '',
    degree: '',
    field_of_study: '',
    start_year: '',
    end_year: '',
    is_current: false,
    description: '',
    education_type: 'university',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.institution.trim()) return;
    setLoading(true);
    try {
      const { error } = await (supabase.from('talent_education') as any).insert({
        user_id: userId,
        institution: form.institution.trim(),
        degree: form.degree.trim() || null,
        field_of_study: form.field_of_study.trim() || null,
        start_year: form.start_year ? parseInt(form.start_year) : null,
        end_year: form.end_year ? parseInt(form.end_year) : null,
        is_current: form.is_current,
        description: form.description.trim() || null,
        education_type: form.education_type,
      });
      if (error) throw error;
      toast.success('Formation ajoutée');
      setForm({ institution: '', degree: '', field_of_study: '', start_year: '', end_year: '', is_current: false, description: '', education_type: 'university' });
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
          <DialogTitle>Nouvelle formation / diplôme</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Type *</Label>
            <Select value={form.education_type} onValueChange={v => setForm(f => ({ ...f, education_type: v }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="school">École</SelectItem>
                <SelectItem value="university">Université</SelectItem>
                <SelectItem value="training">Formation professionnelle</SelectItem>
                <SelectItem value="certification">Certification</SelectItem>
                <SelectItem value="diploma">Diplôme</SelectItem>
                <SelectItem value="other">Autre</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Établissement *</Label>
            <Input value={form.institution} onChange={e => setForm(f => ({ ...f, institution: e.target.value }))} placeholder="Nom de l'établissement" required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Diplôme / Titre</Label>
              <Input value={form.degree} onChange={e => setForm(f => ({ ...f, degree: e.target.value }))} placeholder="Licence, Master..." />
            </div>
            <div>
              <Label>Domaine d'étude</Label>
              <Input value={form.field_of_study} onChange={e => setForm(f => ({ ...f, field_of_study: e.target.value }))} placeholder="Informatique..." />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Année début</Label>
              <Input type="number" value={form.start_year} onChange={e => setForm(f => ({ ...f, start_year: e.target.value }))} placeholder="2020" />
            </div>
            <div>
              <Label>Année fin</Label>
              <Input type="number" value={form.end_year} onChange={e => setForm(f => ({ ...f, end_year: e.target.value }))} placeholder="2024" disabled={form.is_current} />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox checked={form.is_current} onCheckedChange={v => setForm(f => ({ ...f, is_current: !!v }))} />
            <Label className="text-sm">En cours</Label>
          </div>
          <div>
            <Label>Description</Label>
            <Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Détails supplémentaires..." rows={2} />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Ajout...' : 'Ajouter'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddEducationDialog;
