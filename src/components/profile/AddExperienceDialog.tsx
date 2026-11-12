import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { tr } from '@/i18n';

interface Props {
  userId: string;
  onAdded: () => void;
}

const AddExperienceDialog: React.FC<Props> = ({ userId, onAdded }) => {
  const [open, setOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [form, setForm] = React.useState({
    title: '', organization: '', country: '', city: '',
    start_date: '', end_date: '', is_current: false, description: '',
  });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    setLoading(true);
    try {
      const { error } = await (supabase.from('talent_experiences') as any).insert({
        user_id: userId,
        title: form.title.trim(),
        organization: form.organization.trim() || null,
        country: form.country.trim() || null,
        city: form.city.trim() || null,
        start_date: form.start_date || null,
        end_date: form.is_current ? null : (form.end_date || null),
        is_current: form.is_current,
        description: form.description.trim() || null,
      });
      if (error) throw error;
      toast.success(tr('addExperienceDialog.experienceAdded'));
      setForm({ title: '', organization: '', country: '', city: '', start_date: '', end_date: '', is_current: false, description: '' });
      setOpen(false);
      onAdded();
    } catch (err: any) {
      toast.error(err.message || tr('settings.error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="gap-1">
          <Plus className="h-3.5 w-3.5" /> {tr('tv.addLink')}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>{tr('addExperienceDialog.newExperience')}</DialogTitle></DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div>
            <Label>{tr('events.eventName')}</Label>
            <Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder={tr('addExperienceDialog.eGLeadPianist')} required />
          </div>
          <div>
            <Label>{tr('profile.organization')}</Label>
            <Input value={form.organization} onChange={e => setForm(f => ({ ...f, organization: e.target.value }))} placeholder={tr('addExperienceDialog.eGNationalOrchestra')} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>{tr('settings.country')}</Label>
              <Input value={form.country} onChange={e => setForm(f => ({ ...f, country: e.target.value }))} />
            </div>
            <div>
              <Label>{tr('settings.city')}</Label>
              <Input value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>{tr('common.startDate')}</Label>
              <Input type="date" value={form.start_date} onChange={e => setForm(f => ({ ...f, start_date: e.target.value }))} />
            </div>
            <div>
              <Label>{tr('addExperienceDialog.endDate')}</Label>
              <Input type="date" value={form.end_date} disabled={form.is_current} onChange={e => setForm(f => ({ ...f, end_date: e.target.value }))} />
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm">
            <Checkbox checked={form.is_current} onCheckedChange={(c) => setForm(f => ({ ...f, is_current: !!c }))} />
            {tr('addExperienceDialog.currentPosition')}
          </label>
          <div>
            <Label>{tr('events.description')}</Label>
            <Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3} placeholder={tr('addExperienceDialog.roleTasksContext')} />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Ajout...' : tr('addExperienceDialog.addExperience')}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddExperienceDialog;
