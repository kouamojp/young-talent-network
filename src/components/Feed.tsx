
import React from 'react';
import GlassMorphism from './GlassMorphism';
import PostCard from './PostCard';
import { Button } from './ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Plus } from 'lucide-react';

// Sample data for demonstration
const samplePosts = [
  {
    id: '1',
    author: {
      name: 'John Doe',
      avatar: '/placeholder.svg'
    },
    content: 'Just joined Young & Talented! Excited to connect with other talented individuals.',
    timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    likes: 23,
    comments: 5,
    shares: 2
  },
  {
    id: '2',
    author: {
      name: 'Jane Smith',
      avatar: '/placeholder.svg'
    },
    content: 'Looking for a vocal coach in Los Angeles. Any recommendations from the Y&T community?',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    likes: 15,
    comments: 12,
    shares: 3
  },
  {
    id: '3',
    author: {
      name: 'Mike Johnson',
      avatar: '/placeholder.svg'
    },
    content: 'Just uploaded my first violin performance. Check out my profile to listen!',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    likes: 47,
    comments: 8,
    shares: 6
  }
];

const Feed: React.FC = () => {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="bg-white p-4 rounded-xl shadow-sm mb-6">
        <div className="flex items-center space-x-4">
          <Avatar className="h-10 w-10">
            <AvatarImage src="/placeholder.svg" alt="User avatar" />
            <AvatarFallback>U</AvatarFallback>
          </Avatar>
          <input
            type="text"
            placeholder="What's on your mind?"
            className="w-full p-2 px-4 bg-gray-50 rounded-full text-sm focus:outline-none border border-gray-100"
          />
          <Button size="icon" variant="ghost" className="text-gray-500">
            <Plus className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        {samplePosts.map(post => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
    </div>
  );
};

export default Feed;
