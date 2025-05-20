
import React from 'react';
import GlassMorphism from './GlassMorphism';
import PostCard from './PostCard';
import { Button } from './ui/button';
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
    <div className="max-w-2xl mx-auto py-8 space-y-6">
      <GlassMorphism className="p-4 mb-6">
        <div className="flex items-center space-x-4">
          <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden">
            <img src="/placeholder.svg" alt="User avatar" className="w-full h-full object-cover" />
          </div>
          <Button variant="outline" className="w-full justify-start text-gray-500 font-normal">
            What's on your mind?
          </Button>
          <Button size="icon" variant="ghost">
            <Plus className="h-5 w-5" />
          </Button>
        </div>
      </GlassMorphism>

      <div className="space-y-4">
        {samplePosts.map(post => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
    </div>
  );
};

export default Feed;
