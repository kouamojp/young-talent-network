
import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { MessageSquare, ThumbsUp, Share, MoreHorizontal } from 'lucide-react';
import { Button } from './ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';

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
}

interface PostCardProps {
  post: Post;
}

const PostCard: React.FC<PostCardProps> = ({ post }) => {
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
        <p className="text-[15px]">{post.content}</p>
      </div>
      
      {/* Like/Comment/Share Count */}
      <div className="px-4 py-2 flex justify-between border-t border-b text-xs text-muted-foreground">
        <div className="flex items-center">
          <div className="bg-primary rounded-full p-1">
            <ThumbsUp className="h-3 w-3 text-white" />
          </div>
          <span className="ml-2">{post.likes}</span>
        </div>
        
        <div className="flex space-x-3">
          <span>{post.comments} comments</span>
          <span>{post.shares} shares</span>
        </div>
      </div>
      
      {/* Actions */}
      <div className="px-4 py-1 flex justify-between">
        <Button variant="ghost" size="sm" className="flex-1 text-sm">
          <ThumbsUp className="h-5 w-5 mr-2" />
          Like
        </Button>
        <Button variant="ghost" size="sm" className="flex-1 text-sm">
          <MessageSquare className="h-5 w-5 mr-2" />
          Comment
        </Button>
        <Button variant="ghost" size="sm" className="flex-1 text-sm">
          <Share className="h-5 w-5 mr-2" />
          Share
        </Button>
      </div>
    </div>
  );
};

export default PostCard;
