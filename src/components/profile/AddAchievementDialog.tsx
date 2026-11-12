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
import { tr } from '@/i18n';

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
      toast.success(tr('addAchievementDialog.achievementAdded'));
      setForm({ title: '', description: '', category: '', level: '', date: '', achievement_type: '', external_link: '' });
      setOpen(false);
      onAdded();
    } catch (err) {
      toast.error(tr('common.errorWhileAdding'));
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
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{tr('addAchievementDialog.newAchievement')}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>{tr('events.eventName')}</Label>
            <Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder={tr('addAchievementDialog.eGNationalChampion2025')} required />
          </div>
          <div>
            <Label>{tr('events.description')}</Label>
            <Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder={tr('addAchievementDialog.achievementDetails')} rows={3} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>{tr('categories.selectCategory')}</Label>
              <Select value={form.category} onValueChange={v => setForm(f => ({ ...f, category: v }))}>
                <SelectTrigger><SelectValue placeholder={tr('marketplace.select')} /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="sport">{tr('landing.sport')}</SelectItem>
                  <SelectItem value="education">{tr('addAchievementDialog.education')}</SelectItem>
                  <SelectItem value="art">{tr('addAchievementDialog.artCulture')}</SelectItem>
                  <SelectItem value="tech">{tr('common.technology')}</SelectItem>
                  <SelectItem value="business">{tr('addAchievementDialog.business')}</SelectItem>
                  <SelectItem value="other">{tr('profile.other')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>{tr('common.level')}</Label>
              <Select value={form.level} onValueChange={v => setForm(f => ({ ...f, level: v }))}>
                <SelectTrigger><SelectValue placeholder={tr('marketplace.select')} /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="local">{tr('addAchievementDialog.local')}</SelectItem>
                  <SelectItem value="regional">{tr('addAchievementDialog.regional')}</SelectItem>
                  <SelectItem value="national">{tr('addAchievementDialog.national')}</SelectItem>
                  <SelectItem value="international">{tr('addAchievementDialog.international')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>{tr('addAchievementDialog.achievementType')}</Label>
              <Select value={form.achievement_type} onValueChange={v => setForm(f => ({ ...f, achievement_type: v }))}>
                <SelectTrigger><SelectValue placeholder={tr('marketplace.select')} /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="award">{tr('addAchievementDialog.award')}</SelectItem>
                  <SelectItem value="competition">{tr('addAchievementDialog.competition')}</SelectItem>
                  <SelectItem value="publication">{tr('post.tab.post')}</SelectItem>
                  <SelectItem value="performance">{tr('investDialog.performance')}</SelectItem>
                  <SelectItem value="certification">{tr('profile.certification')}</SelectItem>
                  <SelectItem value="record">{tr('addAchievementDialog.record')}</SelectItem>
                  <SelectItem value="other">{tr('profile.other')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>{tr('common.date')}</Label>
              <Input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
            </div>
          </div>
          <div>
            <Label>{tr('addAchievementDialog.externalLink')}</Label>
            <Input type="url" value={form.external_link} onChange={e => setForm(f => ({ ...f, external_link: e.target.value }))} placeholder="https://..." />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Ajout...' : tr('addAchievementDialog.addAchievement')}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddAchievementDialog;
