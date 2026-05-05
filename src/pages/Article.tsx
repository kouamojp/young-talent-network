import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ThumbsUp, MessageSquare, Loader2 } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/i18n/LanguageContext';

const Article: React.FC = () => {
  const { t } = useLanguage();
  const { id } = useParams<{ id: string }>();
  const [page, setPage] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [animateLike, setAnimateLike] = useState(false);

  useEffect(() => { if (id) load(); }, [id]);

  // Realtime subscriptions for likes and comments
  useEffect(() => {
    if (!id) return;

    const likesChannel = supabase
      .channel(`page-likes-${id}`)
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'page_likes', filter: `page_id=eq.${id}` },
        async () => {
          const { count } = await supabase
            .from('page_likes')
            .select('id', { count: 'exact', head: true })
            .eq('page_id', id);
          if (typeof count === 'number') setLikesCount(count);
        }
      )
      .subscribe();

    const commentsChannel = supabase
      .channel(`page-comments-${id}`)
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'page_comments', filter: `page_id=eq.${id}` },
        () => loadComments()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(likesChannel);
      supabase.removeChannel(commentsChannel);
    };
  }, [id]);

  const loadComments = async () => {
    const { data: cs } = await supabase.from('page_comments').select('*').eq('page_id', id!).order('created_at');
    const userIds = [...new Set((cs || []).map((c: any) => c.user_id))];
    if (userIds.length === 0) { setComments([]); return; }
    const { data: profs } = await supabase.from('profiles').select('id,name,avatar_url').in('id', userIds);
    const profMap = new Map((profs || []).map((p: any) => [p.id, p]));
    setComments((cs || []).map((c: any) => ({ ...c, profile: profMap.get(c.user_id) })));
  };

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from('user_pages').select('*').eq('id', id!).single();
    setPage(data);
    if (data) {
      setLikesCount(data.likes_count || 0);
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: like } = await supabase.from('page_likes').select('id').eq('page_id', data.id).eq('user_id', user.id).maybeSingle();
        setIsLiked(!!like);
      }
      await loadComments();
    }
    setLoading(false);
  };

  const toggleLike = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { toast({ title: 'Please log in', variant: 'destructive' }); return; }

    // Optimistic update
    const wasLiked = isLiked;
    setIsLiked(!wasLiked);
    setLikesCount(c => wasLiked ? Math.max(c - 1, 0) : c + 1);
    setAnimateLike(true);
    setTimeout(() => setAnimateLike(false), 300);

    if (wasLiked) {
      const { error } = await supabase.from('page_likes').delete().eq('page_id', page.id).eq('user_id', user.id);
      if (error) { setIsLiked(true); setLikesCount(c => c + 1); toast({ title: 'Failed', variant: 'destructive' }); }
    } else {
      const { error } = await supabase.from('page_likes').insert({ page_id: page.id, user_id: user.id });
      if (error) { setIsLiked(false); setLikesCount(c => Math.max(c - 1, 0)); toast({ title: 'Failed', variant: 'destructive' }); }
    }
  };

  const submitComment = async () => {
    if (!newComment.trim()) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { toast({ title: 'Please log in', variant: 'destructive' }); return; }
    setSubmitting(true);
    const { error } = await supabase.from('page_comments').insert({ page_id: page.id, user_id: user.id, content: newComment.trim() });
    if (!error) { setNewComment(''); }
    else toast({ title: 'Failed to post comment', variant: 'destructive' });
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
        <Button
          variant={isLiked ? 'default' : 'ghost'}
          size="sm"
          onClick={toggleLike}
          className={cn('transition-all', animateLike && 'scale-110')}
          aria-pressed={isLiked}
        >
          <ThumbsUp className={cn('h-5 w-5 mr-2 transition-transform', isLiked && 'fill-current')} />
          <span className="tabular-nums">{likesCount}</span>
        </Button>
        <Button variant="ghost" size="sm">
          <MessageSquare className="h-5 w-5 mr-2" />
          <span className="tabular-nums">{comments.length}</span>
        </Button>
      </div>

      <section>
        <h2 className="font-semibold mb-3">{t('articles.comments')} ({comments.length})</h2>
        <div className="flex gap-2 mb-4">
          <Textarea placeholder={t('articles.writeComment')} value={newComment} onChange={(e) => setNewComment(e.target.value)} className="min-h-[60px]" />
          <Button onClick={submitComment} disabled={submitting || !newComment.trim()}>{t('common.post')}</Button>
        </div>
        <div className="space-y-3">
          {comments.map((c) => (
            <div key={c.id} className="flex gap-2 animate-in fade-in slide-in-from-top-1">
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
