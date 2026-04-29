import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ThumbsUp, MessageSquare, Loader2 } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { formatDistanceToNow } from 'date-fns';

const Article: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [page, setPage] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { if (id) load(); }, [id]);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from('user_pages').select('*').eq('id', id!).single();
    setPage(data);
    if (data) {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: like } = await supabase.from('page_likes').select('id').eq('page_id', data.id).eq('user_id', user.id).maybeSingle();
        setIsLiked(!!like);
      }
      const { data: cs } = await supabase.from('page_comments').select('*').eq('page_id', data.id).order('created_at');
      const userIds = [...new Set((cs || []).map((c: any) => c.user_id))];
      const { data: profs } = await supabase.from('profiles').select('id,name,avatar_url').in('id', userIds);
      const profMap = new Map((profs || []).map((p: any) => [p.id, p]));
      setComments((cs || []).map((c: any) => ({ ...c, profile: profMap.get(c.user_id) })));
    }
    setLoading(false);
  };

  const toggleLike = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { toast({ title: 'Please log in', variant: 'destructive' }); return; }
    if (isLiked) {
      await supabase.from('page_likes').delete().eq('page_id', page.id).eq('user_id', user.id);
      setIsLiked(false);
      setPage((p: any) => ({ ...p, likes_count: Math.max((p.likes_count || 1) - 1, 0) }));
    } else {
      await supabase.from('page_likes').insert({ page_id: page.id, user_id: user.id });
      setIsLiked(true);
      setPage((p: any) => ({ ...p, likes_count: (p.likes_count || 0) + 1 }));
    }
  };

  const submitComment = async () => {
    if (!newComment.trim()) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { toast({ title: 'Please log in', variant: 'destructive' }); return; }
    setSubmitting(true);
    const { error } = await supabase.from('page_comments').insert({ page_id: page.id, user_id: user.id, content: newComment.trim() });
    if (!error) { setNewComment(''); load(); }
    setSubmitting(false);
  };

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  if (!page) return <div className="p-8 text-center">Article not found</div>;

  return (
    <article className="max-w-3xl mx-auto py-6 px-4">
      <h1 className="text-3xl font-bold mb-2">{page.title}</h1>
      {page.category && <div className="text-sm text-muted-foreground mb-4">{page.category}</div>}
      <div className="prose prose-sm max-w-none whitespace-pre-wrap mb-8">{page.content}</div>

      <div className="flex items-center gap-2 border-t border-b py-3 mb-6">
        <Button variant="ghost" size="sm" onClick={toggleLike}>
          <ThumbsUp className={`h-5 w-5 mr-2 ${isLiked ? 'fill-primary text-primary' : ''}`} />
          {page.likes_count || 0}
        </Button>
        <Button variant="ghost" size="sm">
          <MessageSquare className="h-5 w-5 mr-2" />
          {page.comments_count || 0}
        </Button>
      </div>

      <section>
        <h2 className="font-semibold mb-3">Comments</h2>
        <div className="flex gap-2 mb-4">
          <Textarea placeholder="Write a comment..." value={newComment} onChange={(e) => setNewComment(e.target.value)} className="min-h-[60px]" />
          <Button onClick={submitComment} disabled={submitting || !newComment.trim()}>Post</Button>
        </div>
        <div className="space-y-3">
          {comments.map((c) => (
            <div key={c.id} className="flex gap-2">
              <Avatar className="h-8 w-8"><AvatarFallback>{c.profile?.name?.[0] || 'U'}</AvatarFallback></Avatar>
              <div className="flex-1 bg-muted rounded-lg p-2">
                <p className="text-sm font-semibold">{c.profile?.name || 'User'}</p>
                <p className="text-sm">{c.content}</p>
                <p className="text-xs text-muted-foreground mt-1">{formatDistanceToNow(new Date(c.created_at), { addSuffix: true })}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </article>
  );
};

export default Article;
