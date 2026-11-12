import React, { useCallback, useEffect, useState } from 'react';
import GlassMorphism from '@/components/GlassMorphism';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Globe, Clock, Heart, MessageSquare, Send, Loader2, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/i18n/LanguageContext';
import { tr } from '@/i18n';
import { localeTag } from '@/i18n/format';

interface JoinedCommunity { id: string; name: string; }

interface Post {
  id: string;
  content: string;
  created_at: string;
  likes_count: number;
  comments_count: number;
  user_id: string;
  community_id: string;
  author?: { name: string | null; avatar_url: string | null } | null;
  community?: { name: string | null } | null;
  liked: boolean;
}

interface Comment {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  author?: { name: string | null; avatar_url: string | null } | null;
}

interface CommunityFeedProps {
  joinedCommunities: JoinedCommunity[];
  currentUserId: string | null;
  /** When set, only this community's posts are shown and it is preselected in the composer. */
  focusCommunityId?: string | null;
  onClearFocus?: () => void;
}

const timeAgo = (iso: string) => new Date(iso).toLocaleString(localeTag(), { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });

const CommunityFeed: React.FC<CommunityFeedProps> = ({ joinedCommunities, currentUserId, focusCommunityId, onClearFocus }) => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState('');
  const [targetCommunity, setTargetCommunity] = useState<string>('');
  const [posting, setPosting] = useState(false);
  const [openComments, setOpenComments] = useState<string | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentText, setCommentText] = useState('');
  const [loadingComments, setLoadingComments] = useState(false);

  const joinedKey = joinedCommunities.map(c => c.id).join(',');

  const fetchPosts = useCallback(async (silent = false) => {
    const joinedIds = joinedKey ? joinedKey.split(',') : [];
    if (joinedIds.length === 0) { setPosts([]); setLoading(false); return; }
    if (!silent) setLoading(true);

    const { data } = await supabase
      .from('community_posts')
      .select('*, author:profiles!community_posts_user_id_fkey(name, avatar_url), community:communities!community_posts_community_id_fkey(name)')
      .in('community_id', joinedIds)
      .order('created_at', { ascending: false })
      .limit(30);

    const rows = (data || []) as unknown as Post[];

    let likedIds = new Set<string>();
    if (currentUserId && rows.length) {
      const { data: likes } = await supabase
        .from('community_post_likes')
        .select('post_id')
        .eq('user_id', currentUserId)
        .in('post_id', rows.map(r => r.id));
      likedIds = new Set((likes || []).map((l: { post_id: string }) => l.post_id));
    }

    setPosts(rows.map(r => ({ ...r, liked: likedIds.has(r.id) })));
    setLoading(false);
  }, [joinedKey, currentUserId]);

  useEffect(() => {
    fetchPosts();
    const channel = supabase
      .channel('community-posts-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'community_posts' }, () => fetchPosts(true))
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [fetchPosts]);

  useEffect(() => {
    if (!targetCommunity && joinedCommunities.length) setTargetCommunity(joinedCommunities[0].id);
  }, [joinedCommunities, targetCommunity]);

  useEffect(() => {
    if (focusCommunityId) setTargetCommunity(focusCommunityId);
  }, [focusCommunityId]);

  const focusedName = focusCommunityId ? joinedCommunities.find(c => c.id === focusCommunityId)?.name : null;
  const visiblePosts = focusCommunityId ? posts.filter(p => p.community_id === focusCommunityId) : posts;

  const submitPost = async () => {
    if (!currentUserId || !content.trim() || !targetCommunity) return;
    setPosting(true);
    const { error } = await supabase.from('community_posts').insert({
      community_id: targetCommunity,
      user_id: currentUserId,
      content: content.trim(),
    });
    setPosting(false);
    if (error) { toast({ title: tr('settings.error'), description: error.message, variant: 'destructive' }); return; }
    setContent('');
    fetchPosts(true);
  };

  const toggleLike = async (post: Post) => {
    if (!currentUserId) {
      toast({ title: tr('messages.loginRequired'), variant: 'destructive' });
      return;
    }
    const liking = !post.liked;
    // Optimistic update.
    setPosts(prev => prev.map(p => p.id === post.id
      ? { ...p, liked: liking, likes_count: Math.max(0, p.likes_count + (liking ? 1 : -1)) }
      : p));
    if (liking) {
      await supabase.from('community_post_likes').insert({ post_id: post.id, user_id: currentUserId });
    } else {
      await supabase.from('community_post_likes').delete().eq('post_id', post.id).eq('user_id', currentUserId);
    }
  };

  const loadComments = async (postId: string) => {
    if (openComments === postId) { setOpenComments(null); return; }
    setOpenComments(postId);
    setLoadingComments(true);
    const { data } = await supabase
      .from('community_post_comments')
      .select('*, author:profiles!community_post_comments_user_id_fkey(name, avatar_url)')
      .eq('post_id', postId)
      .order('created_at', { ascending: true });
    setComments((data || []) as unknown as Comment[]);
    setLoadingComments(false);
  };

  const submitComment = async (postId: string) => {
    if (!currentUserId || !commentText.trim()) return;
    const { error } = await supabase.from('community_post_comments').insert({
      post_id: postId,
      user_id: currentUserId,
      content: commentText.trim(),
    });
    if (error) { toast({ title: tr('settings.error'), description: error.message, variant: 'destructive' }); return; }
    setCommentText('');
    // Refresh comments and the post's comment count.
    const { data } = await supabase
      .from('community_post_comments')
      .select('*, author:profiles!community_post_comments_user_id_fkey(name, avatar_url)')
      .eq('post_id', postId)
      .order('created_at', { ascending: true });
    setComments((data || []) as unknown as Comment[]);
    setPosts(prev => prev.map(p => p.id === postId ? { ...p, comments_count: p.comments_count + 1 } : p));
  };

  if (joinedCommunities.length === 0) {
    return (
      <GlassMorphism className="p-6">
        <h2 className="text-xl font-semibold mb-2">{t('communities.communityPosts')}</h2>
        <div className="text-center py-8 text-gray-500">
          <MessageSquare className="h-10 w-10 mx-auto mb-2 opacity-40" />
          <p>{tr('communityFeed.joinACommunityToSeeAnd')}</p>
        </div>
      </GlassMorphism>
    );
  }

  return (
    <GlassMorphism className="p-6">
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <h2 className="text-xl font-semibold">{t('communities.communityPosts')}</h2>
        {focusedName && (
          <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 text-primary text-sm px-3 py-1">
            {focusedName}
            <button type="button" onClick={onClearFocus} aria-label={tr('communityFeed.showAllCommunities')} className="hover:text-foreground">
              <X className="h-3.5 w-3.5" />
            </button>
          </span>
        )}
      </div>

      {/* Composer */}
      <div className="mb-6 space-y-2">
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={tr('communityFeed.shareSomethingWithYourCommunity')}
          rows={2}
        />
        <div className="flex items-center gap-2 justify-between">
          <Select value={targetCommunity} onValueChange={setTargetCommunity}>
            <SelectTrigger className="w-56"><SelectValue placeholder={tr('communityFeed.chooseACommunity')} /></SelectTrigger>
            <SelectContent>
              {joinedCommunities.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button onClick={submitPost} disabled={!content.trim() || !targetCommunity || posting}>
            {posting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Send className="h-4 w-4 mr-2" />}
            {tr('common.post')}
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
      ) : visiblePosts.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <MessageSquare className="h-10 w-10 mx-auto mb-2 opacity-40" />
          <p>{tr('communityFeed.noPostsYetBeTheFirst')}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {visiblePosts.map((post) => (
            <GlassMorphism key={post.id} className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <Avatar>
                  <AvatarImage src={post.author?.avatar_url || undefined} />
                  <AvatarFallback>{post.author?.name?.charAt(0) || 'U'}</AvatarFallback>
                </Avatar>
                <div>
                  <h4 className="font-medium">{post.author?.name || tr('admin.user')}</h4>
                  <div className="flex items-center text-xs text-gray-500">
                    <Globe className="h-3 w-3 mr-1" /><span>{post.community?.name}</span>
                    <span className="mx-1">•</span>
                    <Clock className="h-3 w-3 mr-1" /><span>{timeAgo(post.created_at)}</span>
                  </div>
                </div>
              </div>

              <p className="text-gray-700 mb-3 whitespace-pre-wrap">{post.content}</p>

              <div className="flex items-center gap-4 text-sm">
                <button
                  onClick={() => toggleLike(post)}
                  className={`flex items-center gap-1 transition-colors ${post.liked ? 'text-red-500' : 'text-gray-600 hover:text-primary'}`}
                >
                  <Heart className={`h-4 w-4 ${post.liked ? 'fill-current' : ''}`} /> {post.likes_count}
                </button>
                <button onClick={() => loadComments(post.id)} className="flex items-center gap-1 text-gray-600 hover:text-primary">
                  <MessageSquare className="h-4 w-4" /> {post.comments_count}
                </button>
              </div>

              {openComments === post.id && (
                <div className="mt-3 border-t pt-3 space-y-3">
                  {loadingComments ? (
                    <div className="flex justify-center py-2"><Loader2 className="h-4 w-4 animate-spin text-primary" /></div>
                  ) : (
                    <>
                      {comments.map((c) => (
                        <div key={c.id} className="flex items-start gap-2">
                          <Avatar className="h-7 w-7">
                            <AvatarImage src={c.author?.avatar_url || undefined} />
                            <AvatarFallback>{c.author?.name?.charAt(0) || 'U'}</AvatarFallback>
                          </Avatar>
                          <div className="bg-muted rounded-lg px-3 py-1.5 flex-1">
                            <p className="text-xs font-medium">{c.author?.name || tr('admin.user')}</p>
                            <p className="text-sm">{c.content}</p>
                          </div>
                        </div>
                      ))}
                      {comments.length === 0 && <p className="text-xs text-gray-500">{tr('communityFeed.noComments')}</p>}
                    </>
                  )}
                  {currentUserId && (
                    <div className="flex items-center gap-2">
                      <Textarea
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        placeholder={tr('articles.writeComment')}
                        rows={1}
                        className="flex-1 min-h-0"
                      />
                      <Button size="sm" onClick={() => submitComment(post.id)} disabled={!commentText.trim()}>
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </GlassMorphism>
          ))}
        </div>
      )}
    </GlassMorphism>
  );
};

export default CommunityFeed;
