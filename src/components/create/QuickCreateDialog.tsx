import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Plus } from "lucide-react";

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
        title: "Created successfully",
        description: `Your ${type} has been created.`,
      });
      
      onOpenChange(false);
      setTitle("");
      setContent("");
      setCategory("");
    } catch (error: any) {
      toast({
        title: "Error",
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
            Create {type.charAt(0).toUpperCase() + type.slice(1)}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {type !== 'post' && (
            <Input
              placeholder="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          )}
          
          <Textarea
            placeholder={type === 'post' ? "What's on your mind?" : "Description"}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={4}
          />

          {type === 'page' && (
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="work">Work</SelectItem>
                <SelectItem value="learning">Learning</SelectItem>
                <SelectItem value="events">Events</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          )}

          <Button onClick={handleCreate} disabled={loading} className="w-full">
            {loading ? "Creating..." : "Create"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};