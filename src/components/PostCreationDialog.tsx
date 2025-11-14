import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { supabase } from '@/integrations/supabase/client';
import { toast } from './ui/use-toast';
import { Loader2 } from 'lucide-react';

interface PostCreationDialogProps {
  trigger: React.ReactNode;
  onPostCreated?: () => void;
  userAvatar?: string;
  userName?: string;
}

export const PostCreationDialog = ({ trigger, onPostCreated, userAvatar, userName }: PostCreationDialogProps) => {
  const [open, setOpen] = useState(false);
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!content.trim()) {
      toast({ title: "Please write something", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({ title: "Please log in to post", variant: "destructive" });
        return;
      }

      const { error } = await supabase
        .from('posts')
        .insert({ content: content.trim(), user_id: user.id });

      if (error) throw error;

      toast({ title: "Post created successfully!" });
      setContent('');
      setOpen(false);
      onPostCreated?.();
    } catch (error) {
      console.error('Error creating post:', error);
      toast({ title: "Failed to create post", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Create Post</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-4">
          <div className="flex items-start space-x-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={userAvatar} />
              <AvatarFallback>{userName?.[0] || 'U'}</AvatarFallback>
            </Avatar>
            <Textarea
              placeholder="What's on your mind?"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[120px]"
              disabled={isSubmitting}
            />
          </div>
          <div className="flex justify-end">
            <Button onClick={handleSubmit} disabled={isSubmitting || !content.trim()}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Post
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
