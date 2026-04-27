
import React, { useState, useEffect } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { MessageSquare, ThumbsUp, Share, MoreHorizontal } from 'lucide-react';
import { Button } from './ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Textarea } from './ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { toast } from './ui/use-toast';

interface Author {
  name: string;
  avatar: string;
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
}

interface PostCardProps {
  post: Post;
  onUpdate?: () => void;
}

const PostCard: React.FC<PostCardProps> = ({ post, onUpdate }) => {
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(post.likes);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    checkIfLiked();
    if (showComments) {
      fetchComments();
    }
  }, [post.id, showComments]);

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
      toast({ title: "Please log in to like posts", variant: "destructive" });
      return;
    }

    try {
      if (isLiked) {
        await supabase
          .from('post_likes')
          .delete()
          .eq('post_id', post.id)
          .eq('user_id', user.id);
        setLikesCount(prev => prev - 1);
      } else {
        await supabase
          .from('post_likes')
          .insert({ post_id: post.id, user_id: user.id });
        setLikesCount(prev => prev + 1);
      }
      setIsLiked(!isLiked);
      onUpdate?.();
    } catch (error) {
      console.error('Error toggling like:', error);
      toast({ title: "Failed to update like", variant: "destructive" });
    }
  };

  const fetchComments = async () => {
    const { data } = await supabase
      .from('comments')
      .select(`
        *,
        profiles (
          name,
          avatar_url
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
      toast({ title: "Please log in to comment", variant: "destructive" });
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
      toast({ title: "Comment added!" });
    } catch (error) {
      console.error('Error adding comment:', error);
      toast({ title: "Failed to add comment", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <div className="bg-card rounded-lg shadow-sm border border-border">
      {/* Post Header */}
      <div className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center">
            <Avatar className="h-10 w-10">
              <AvatarImage src={post.author.avatar} alt={post.author.name} />
              <AvatarFallback>{post.author.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="ml-3">
              <h3 className="font-semibold text-[15px]">{post.author.name}</h3>
              <span className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(post.timestamp), { addSuffix: true })}
              </span>
            </div>
          </div>
          <button className="text-muted-foreground hover:text-foreground transition-colors">
            <MoreHorizontal className="h-5 w-5" />
          </button>
        </div>
      </div>
      
      {/* Post Content */}
      <div className="px-4 pb-3">
        <p className="text-[15px] whitespace-pre-wrap">{post.content}</p>
      </div>

      {/* Post Media */}
      {post.media_urls && post.media_urls.length > 0 && (
        <div className={`grid gap-1 px-1 pb-2 ${post.media_urls.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
          {post.media_urls.map((url, i) => (
            <img key={i} src={url} alt="" className="w-full max-h-[500px] object-cover rounded-md" />
          ))}
        </div>
      )}
      
      {/* Like/Comment/Share Count */}
      <div className="px-4 py-2 flex justify-between border-t border-b text-xs text-muted-foreground">
        <div className="flex items-center">
          <div className="bg-primary rounded-full p-1">
            <ThumbsUp className="h-3 w-3 text-white" />
          </div>
          <span className="ml-2">{likesCount}</span>
        </div>
        
        <div className="flex space-x-3">
          <span>{comments.length || post.comments} comments</span>
          <span>{post.shares} shares</span>
        </div>
      </div>
      
      {/* Actions */}
      <div className="px-4 py-1 flex justify-between">
        <Button variant="ghost" size="sm" className="flex-1 text-sm" onClick={handleLike}>
          <ThumbsUp className={`h-5 w-5 mr-2 ${isLiked ? 'fill-primary text-primary' : ''}`} />
          Like
        </Button>
        <Button variant="ghost" size="sm" className="flex-1 text-sm" onClick={() => setShowComments(!showComments)}>
          <MessageSquare className="h-5 w-5 mr-2" />
          Comment
        </Button>
        <Button variant="ghost" size="sm" className="flex-1 text-sm">
          <Share className="h-5 w-5 mr-2" />
          Share
        </Button>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="px-4 pb-4 space-y-3 border-t pt-3">
          {comments.map((comment) => (
            <div key={comment.id} className="flex gap-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src={comment.profiles.avatar_url} />
                <AvatarFallback>{comment.profiles.name[0]}</AvatarFallback>
              </Avatar>
              <div className="flex-1 bg-muted rounded-lg p-2">
                <p className="text-sm font-semibold">{comment.profiles.name}</p>
                <p className="text-sm">{comment.content}</p>
              </div>
            </div>
          ))}
          <div className="flex gap-2 mt-3">
            <Textarea
              placeholder="Write a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="min-h-[60px]"
              disabled={isSubmitting}
            />
            <Button onClick={handleComment} disabled={isSubmitting || !newComment.trim()}>
              Post
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PostCard;
