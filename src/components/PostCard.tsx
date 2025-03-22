
import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Heart, MessageCircle, Share } from 'lucide-react';
import GlassMorphism from './GlassMorphism';
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
    <GlassMorphism className="p-4">
      <div className="flex items-start space-x-3">
        <Avatar>
          <AvatarImage src={post.author.avatar} alt={post.author.name} />
          <AvatarFallback>{post.author.name.charAt(0)}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold">{post.author.name}</h3>
            <span className="text-xs text-gray-500">
              {formatDistanceToNow(new Date(post.timestamp), { addSuffix: true })}
            </span>
          </div>
          <p className="mt-2 text-sm">{post.content}</p>
          
          <div className="flex justify-between mt-4 pt-3 border-t border-gray-100">
            <Button variant="ghost" size="sm" className="text-xs gap-1">
              <Heart className="h-4 w-4" /> {post.likes}
            </Button>
            <Button variant="ghost" size="sm" className="text-xs gap-1">
              <MessageCircle className="h-4 w-4" /> {post.comments}
            </Button>
            <Button variant="ghost" size="sm" className="text-xs gap-1">
              <Share className="h-4 w-4" /> {post.shares}
            </Button>
          </div>
        </div>
      </div>
    </GlassMorphism>
  );
};

export default PostCard;
