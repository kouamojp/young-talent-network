import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Plus } from "lucide-react";
import { tr } from '@/i18n';

interface QuickCreateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: 'post' | 'event' | 'job' | 'course' | 'page';
}

export const QuickCreateDialog = ({ open, onOpenChange, type }: QuickCreateDialogProps) => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleCreate = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      switch (type) {
        case 'post':
          await supabase.from('posts').insert({ content, user_id: user.id });
          break;
        case 'page':
          await supabase.from('user_pages').insert({ title, content, category, user_id: user.id });
          break;
        case 'event':
          await supabase.from('events').insert({
            title,
            description: content,
            start_date: new Date().toISOString(),
            end_date: new Date(Date.now() + 3600000).toISOString(),
            organizer_id: user.id
          });
          break;
        case 'job':
          await supabase.from('job_postings').insert({
            title,
            description: content,
            organization_id: user.id
          });
          break;
        case 'course':
          await supabase.from('courses').insert({
            title,
            description: content,
            instructor_id: user.id
          });
          break;
      }

      toast({
        title: tr('quickCreateDialog.createdSuccessfully'),
        description: tr('quickCreateDialog.yourHasBeenCreated', { p0: type }),
      });
      
      onOpenChange(false);
      setTitle("");
      setContent("");
      setCategory("");
    } catch (error: any) {
      toast({
        title: tr('settings.error'),
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            {tr('common.create')} {type.charAt(0).toUpperCase() + type.slice(1)}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {type !== 'post' && (
            <Input
              placeholder={tr('marketplace.title_field')}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          )}
          
          <Textarea
            placeholder={type === 'post' ? tr('common.whatSOnYourMind') : tr('events.description')}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={4}
          />

          {type === 'page' && (
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue placeholder={tr('quickCreateDialog.selectCategory')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="work">{tr('talent.work')}</SelectItem>
                <SelectItem value="learning">{tr('talent.learning')}</SelectItem>
                <SelectItem value="events">{tr('landing.events')}</SelectItem>
                <SelectItem value="other">{tr('profile.other')}</SelectItem>
              </SelectContent>
            </Select>
          )}

          <Button onClick={handleCreate} disabled={loading} className="w-full">
            {loading ? "Creating..." : tr('common.create')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};