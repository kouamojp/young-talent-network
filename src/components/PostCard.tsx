
import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Heart, MessageCircle, Share } from 'lucide-react';
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
    <div className="bg-white rounded-xl p-4 shadow-sm">
      <div className="flex items-start space-x-3">
        <Avatar className="h-10 w-10">
          <AvatarImage src={post.author.avatar} alt={post.author.name} />
          <AvatarFallback>{post.author.name.charAt(0)}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="flex justify-between items-center">
            <h3 className="font-medium">{post.author.name}</h3>
            <span className="text-xs text-gray-500">
              {formatDistanceToNow(new Date(post.timestamp), { addSuffix: true })}
            </span>
          </div>
          <p className="mt-2 text-sm">{post.content}</p>
          
          <div className="flex justify-between mt-4 pt-3">
            <button className="flex items-center gap-1 text-gray-500 hover:text-gray-700">
              <Heart className="h-4 w-4" /> 
              <span className="text-xs">{post.likes}</span>
            </button>
            
            <button className="flex items-center gap-1 text-gray-500 hover:text-gray-700">
              <MessageCircle className="h-4 w-4" /> 
              <span className="text-xs">{post.comments}</span>
            </button>
            
            <button className="flex items-center gap-1 text-gray-500 hover:text-gray-700">
              <Share className="h-4 w-4" /> 
              <span className="text-xs">{post.shares}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostCard;
