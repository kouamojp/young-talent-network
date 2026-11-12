
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow, format } from 'date-fns';
import { MessageSquare, ThumbsUp, Share, MoreHorizontal, MapPin, Calendar, ChevronDown, Copy, Trash2, Flag, Edit3 } from 'lucide-react';
import { Button } from './ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Textarea } from './ui/textarea';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';
import { supabase } from '@/integrations/supabase/client';
import { toast } from './ui/use-toast';
import ShareMenu from './share/ShareMenu';
import ShareToFriendsDialog from './share/ShareToFriendsDialog';
import LinkPreview from './LinkPreview';
import PostMediaGallery from './PostMediaGallery';
import { PostCreationDialog } from './PostCreationDialog';
import { Users } from 'lucide-react';
import TranslateButton from './TranslateButton';
import { tr } from '@/i18n';

const URL_REGEX = /(https?:\/\/[^\s<>"')]+)/gi;
const isUrl = (s: string) => /^https?:\/\//i.test(s);

function extractUrls(text: string): string[] {
  return Array.from(new Set(text.match(URL_REGEX) || []));
}

function renderTextWithLinks(text: string) {
  const parts = text.split(URL_REGEX);
  return parts.map((part, i) =>
    isUrl(part) ? (
      <a key={i} href={part} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline break-all">
        {part}
      </a>
    ) : (
      <React.Fragment key={i}>{part}</React.Fragment>
    )
  );
}

interface Author {
  name: string;
  avatar: string;
  id?: string;
  user_type?: string;
}

interface Post {
  id: string;
  author: Author;
  content: string;
  timestamp: string;
  likes: number;
  comments: number;
  shares: number;
  media_urls?: string[] | null;
  user_id?: string;
  external_source_url?: string | null;
  external_source_platform?: string | null;
}

interface PostCardProps {
  post: Post;
  onUpdate?: () => void;
}

const PostCard: React.FC<PostCardProps> = ({ post, onUpdate }) => {
  const navigate = useNavigate();
  const authorId = post.author.id || post.user_id;
  const goToUserProfile = (id?: string, type?: string | null) => {
    if (!id) return;
    if (type === 'organization') navigate(`/organization/${id}`);
    else if (type === 'agent') navigate(`/agent/${id}`);
    else navigate(`/talent/${id}`);
  };
  const goToProfile = () => goToUserProfile(authorId, post.author.user_type);
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(post.likes);
  const [commentsCount, setCommentsCount] = useState(post.comments);
  const [sharesCount, setSharesCount] = useState(post.shares);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [editOpen, setEditOpen] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setCurrentUserId(data.user?.id || null));
  }, []);

  const postUrl = `${window.location.origin}/feed?post=${post.id}`;

  const deletePost = async () => {
    if (!confirm(tr('common.deleteThisPost'))) return;
    const { error } = await supabase.from('posts').delete().eq('id', post.id);
    if (error) { toast({ title: error.message, variant: 'destructive' }); return; }
    toast({ title: tr('admin.postDeleted') });
    onUpdate?.();
  };

  const reportPost = async () => {
    const reason = window.prompt('Pourquoi signalez-vous ce contenu ?');
    if (!reason || !reason.trim()) return;
    try {
      await supabase.functions.invoke('moderate-content', {
        body: {
          content: post.content,
          content_type: 'post',
          content_id: post.id,
          reported_user_id: post.user_id || post.author.id,
          manual_reason: reason.trim(),
        },
      });
      toast({ title: tr('postCard.thankYouYourReportHasBeen') });
    } catch (e: any) {
      toast({ title: tr('postCard.reportFailed'), description: e.message, variant: 'destructive' });
    }
  };
  const copyLink = async () => { try { await navigator.clipboard.writeText(postUrl); toast({ title: tr('postCard.linkCopied') }); } catch { toast({ title: tr('postCard.couldNotCopy'), variant: 'destructive' }); } };


  useEffect(() => {
    checkIfLiked();
    refreshCounts();
    if (showComments) {
      fetchComments();
    }
  }, [post.id, showComments]);

  // Realtime: subscribe to counter changes on this post
  useEffect(() => {
    const channel = supabase
      .channel(`post-counts-${post.id}`)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'posts', filter: `id=eq.${post.id}` }, (payload: any) => {
        const n = payload.new || {};
        if (typeof n.likes_count === 'number') setLikesCount(n.likes_count);
        if (typeof n.comments_count === 'number') setCommentsCount(n.comments_count);
        if (typeof n.shares_count === 'number') setSharesCount(n.shares_count);
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'comments', filter: `post_id=eq.${post.id}` }, () => {
        if (showComments) fetchComments();
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [post.id, showComments]);

  const refreshCounts = async () => {
    const { data } = await supabase
      .from('posts')
      .select('likes_count, comments_count, shares_count')
      .eq('id', post.id)
      .maybeSingle();
    if (data) {
      setLikesCount(data.likes_count ?? 0);
      setCommentsCount(data.comments_count ?? 0);
      setSharesCount((data as any).shares_count ?? 0);
    }
  };

  const recordShare = async (channel: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from('post_shares').insert({ post_id: post.id, user_id: user.id, channel } as any);
  };

  const checkIfLiked = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from('post_likes')
      .select('id')
      .eq('post_id', post.id)
      .eq('user_id', user.id)
      .single();

    setIsLiked(!!data);
  };

  const handleLike = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({ title: tr('postCard.pleaseLogInToLikePosts'), variant: "destructive" });
      return;
    }

    // Optimistic toggle; realtime UPDATE on posts will reconcile counters
    const wasLiked = isLiked;
    setIsLiked(!wasLiked);
    setLikesCount(prev => prev + (wasLiked ? -1 : 1));
    try {
      if (wasLiked) {
        await supabase.from('post_likes').delete().eq('post_id', post.id).eq('user_id', user.id);
      } else {
        await supabase.from('post_likes').insert({ post_id: post.id, user_id: user.id });
      }
      onUpdate?.();
    } catch (error) {
      console.error('Error toggling like:', error);
      setIsLiked(wasLiked);
      setLikesCount(prev => prev + (wasLiked ? 1 : -1));
      toast({ title: tr('postCard.failedToUpdateLike'), variant: "destructive" });
    }
  };

  const fetchComments = async () => {
    const { data } = await supabase
      .from('comments')
      .select(`
        *,
        profiles (
          name,
          avatar_url,
          user_type
        )
      `)
      .eq('post_id', post.id)
      .order('created_at', { ascending: true });

    setComments(data || []);
  };

  const handleComment = async () => {
    if (!newComment.trim()) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({ title: tr('postCard.pleaseLogInToComment'), variant: "destructive" });
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('comments')
        .insert({ post_id: post.id, user_id: user.id, content: newComment.trim() });

      if (error) throw error;

      setNewComment('');
      fetchComments();
      onUpdate?.();
      toast({ title: tr('postCard.commentAdded') });
    } catch (error) {
      console.error('Error adding comment:', error);
      toast({ title: tr('postCard.failedToAddComment'), variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };
  // Parse out location (📍) appended to content
  const locationMatch = post.content.match(/\n?📍\s*(.+)$/);
  const locationText = locationMatch?.[1]?.trim() || null;
  const rawText = locationMatch ? post.content.replace(locationMatch[0], '').trim() : post.content;

  const MAX_DESC = 500;
  const [expanded, setExpanded] = useState(false);
  const [translation, setTranslation] = useState<{ text: string; lang: string } | null>(null);
  const shownText = translation?.text ?? rawText;
  const isLong = shownText.length > MAX_DESC;
  const displayText = !expanded && isLong ? shownText.slice(0, MAX_DESC).trimEnd() + '…' : shownText;

  const postDate = new Date(post.timestamp);

  return (
    <div className="bg-card rounded-lg shadow-sm border border-border">
      {/* Post Header */}
      <div className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center">
            <button onClick={goToProfile} className="shrink-0" aria-label={tr('postCard.viewSProfile', { p0: post.author.name })}>
              <Avatar className="h-10 w-10 cursor-pointer hover:ring-2 hover:ring-primary/40 transition">
                <AvatarImage src={post.author.avatar} alt={post.author.name} />
                <AvatarFallback>{post.author.name.charAt(0)}</AvatarFallback>
              </Avatar>
            </button>
            <div className="ml-3">
              <button onClick={goToProfile} className="font-semibold text-[15px] hover:underline text-left">
                {post.author.name}
              </button>
              <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1" title={format(postDate, 'PPpp')}>
                  <Calendar className="h-3 w-3" />
                  {format(postDate, 'd MMM yyyy, HH:mm')}
                </span>
                <span>·</span>
                <span>{formatDistanceToNow(postDate, { addSuffix: true })}</span>
                {locationText && (
                  <>
                    <span>·</span>
                    <span className="inline-flex items-center gap-1 text-primary">
                      <MapPin className="h-3 w-3" />
                      {locationText}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded-full hover:bg-muted">
                <MoreHorizontal className="h-5 w-5" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {currentUserId && currentUserId === (post.user_id || post.author.id) && (
                <DropdownMenuItem onClick={() => setEditOpen(true)}><Edit3 className="h-4 w-4 mr-2" />{tr('common.edit')}</DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={copyLink}><Copy className="h-4 w-4 mr-2" />{tr('common.copyLink')}</DropdownMenuItem>
              <DropdownMenuItem onClick={reportPost}><Flag className="h-4 w-4 mr-2" />{tr('postCard.report')}</DropdownMenuItem>
              {currentUserId && currentUserId === (post.user_id || post.author.id) && (
                <DropdownMenuItem onClick={deletePost} className="text-destructive"><Trash2 className="h-4 w-4 mr-2" />{tr('common.delete')}</DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
          <PostCreationDialog
            open={editOpen}
            onOpenChange={setEditOpen}
            editPost={{ id: post.id, content: rawText, media_urls: post.media_urls || undefined }}
            onPostCreated={() => { setEditOpen(false); onUpdate?.(); }}
            userName={post.author.name}
            userAvatar={post.author.avatar}
          />

        </div>
      </div>

      {/* Post Content (description, max 500 chars) */}
      {rawText && (
        <div className="px-4 pb-3">
          <p className="text-[15px] whitespace-pre-wrap break-words">{renderTextWithLinks(displayText)}</p>
          <div className="mt-1 flex items-center gap-2 flex-wrap">
            {isLong && (
              <button
                onClick={() => setExpanded(e => !e)}
                className="text-xs font-medium text-primary hover:underline inline-flex items-center gap-1"
              >
                {expanded ? tr('postCard.showLess') : tr('postCard.showMore')}
                <ChevronDown className={`h-3 w-3 transition-transform ${expanded ? 'rotate-180' : ''}`} />
              </button>
            )}
            <TranslateButton
              text={rawText}
              currentLang={translation?.lang || null}
              onTranslated={(t, lang) => setTranslation(t && lang ? { text: t, lang } : null)}
            />
            {translation && (
              <span className="text-[10px] text-muted-foreground italic">{tr('common.translatedByAi')}</span>
            )}
          </div>
        </div>
      )}

      {/* Link Previews */}
      {extractUrls(rawText).slice(0, 3).length > 0 && (
        <div className="px-4 pb-3 space-y-2">
          {extractUrls(rawText).slice(0, 3).map((u) => (
            <LinkPreview key={u} url={u} />
          ))}
        </div>
      )}

      {/* Post Media */}
      {post.media_urls && post.media_urls.length > 0 && (
        <PostMediaGallery urls={post.media_urls} />
      )}

      {/* External source attribution */}
      {post.external_source_url && (
        <div className="px-4 pb-2">
          <a
            href={post.external_source_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground hover:text-primary bg-muted/50 hover:bg-muted px-2 py-1 rounded-full transition-colors"
          >
            <span className="capitalize font-medium">
              {post.external_source_platform || 'source'}
            </span>
            <span>{tr('postCard.importedFromOutside')}</span>
          </a>
        </div>
      )}


      <div className="px-4 py-2 flex justify-between border-t border-b text-xs text-muted-foreground">
        <div className="flex items-center">
          <div className="bg-primary rounded-full p-1">
            <ThumbsUp className="h-3 w-3 text-white" />
          </div>
          <span className="ml-2">{likesCount}</span>
        </div>
        
        <div className="flex space-x-3">
          <span>{commentsCount} {tr('postCard.comments')}</span>
          <span>{sharesCount} {tr('postCard.shares')}</span>
        </div>
      </div>
      
      {/* Actions */}
      <div className="px-4 py-1 flex justify-between">
        <Button variant="ghost" size="sm" className="flex-1 text-sm" onClick={handleLike}>
          <ThumbsUp className={`h-5 w-5 mr-2 ${isLiked ? 'fill-primary text-primary' : ''}`} />
          {/* Like */}
        </Button>
        <Button variant="ghost" size="sm" className="flex-1 text-sm" onClick={() => setShowComments(!showComments)}>
          <MessageSquare className="h-5 w-5 mr-2" />
         {/*  Comment */}
        </Button>
        <ShareToFriendsDialog url={postUrl} title={post.author.name + ' sur YAT'} description={rawText.slice(0, 200)} onShared={() => recordShare('messaging')}>
          <Button variant="ghost" size="sm" className="flex-1 text-sm">
            <Users className="h-5 w-5 mr-2" />
            {/* Amis */}
          </Button>
        </ShareToFriendsDialog>
        <ShareMenu url={postUrl} title={post.author.name + ' sur YAT'}>
          <Button variant="ghost" size="sm" className="flex-1 text-sm" onClick={() => recordShare('external')}>
            <Share className="h-5 w-5 mr-2" />
            {/* Share */}
          </Button>
        </ShareMenu>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="px-4 pb-4 space-y-3 border-t pt-3">
          {comments.map((comment) => (
            <div key={comment.id} className="flex gap-2">
              <button onClick={() => goToUserProfile(comment.user_id, comment.profiles?.user_type)} className="shrink-0" aria-label={tr('postCard.viewSProfile', { p0: comment.profiles.name })}>
                <Avatar className="h-8 w-8 cursor-pointer hover:ring-2 hover:ring-primary/40 transition">
                  <AvatarImage src={comment.profiles.avatar_url} />
                  <AvatarFallback>{comment.profiles.name[0]}</AvatarFallback>
                </Avatar>
              </button>
              <div className="flex-1 bg-muted rounded-lg p-2">
                <button onClick={() => goToUserProfile(comment.user_id, comment.profiles?.user_type)} className="text-sm font-semibold hover:underline text-left">{comment.profiles.name}</button>
                <p className="text-sm">{comment.content}</p>
              </div>
            </div>
          ))}
          <div className="flex gap-2 mt-3">
            <Textarea
              placeholder={tr('articles.writeComment')}
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="min-h-[60px]"
              disabled={isSubmitting}
            />
            <Button onClick={handleComment} disabled={isSubmitting || !newComment.trim()}>
              {tr('common.post')}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PostCard;
