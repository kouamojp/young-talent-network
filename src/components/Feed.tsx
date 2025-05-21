
import React from 'react';
import PostCard from './PostCard';
import { Button } from './ui/button';
import { Plus } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';

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
    <div className="max-w-2xl mx-auto py-4 space-y-4">
      {/* Create Post */}
      <div className="bg-white rounded-lg shadow p-4 mb-4">
        <div className="flex items-center space-x-4">
          <Avatar className="h-10 w-10">
            <AvatarImage src="/placeholder.svg" alt="User avatar" />
            <AvatarFallback>U</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <Button variant="outline" className="w-full justify-start text-gray-500 font-normal rounded-full h-10">
              What's on your mind?
            </Button>
          </div>
        </div>
        <div className="flex justify-between mt-3 pt-3 border-t border-gray-100">
          <Button variant="ghost" size="sm" className="flex-1 text-sm text-gray-600">
            Live Video
          </Button>
          <Button variant="ghost" size="sm" className="flex-1 text-sm text-gray-600">
            Photo/Video
          </Button>
          <Button variant="ghost" size="sm" className="flex-1 text-sm text-gray-600">
            Feeling/Activity
          </Button>
        </div>
      </div>

      {/* Stories Carousel (Facebook style) */}
      <div className="bg-white rounded-lg shadow p-4 mb-4">
        <div className="flex space-x-2 overflow-x-auto pb-2">
          {/* Create Story */}
          <div className="flex-shrink-0 w-32 h-48 rounded-lg bg-gray-100 border border-gray-200 relative overflow-hidden">
            <div className="absolute inset-x-0 bottom-0 h-1/2 bg-white">
              <div className="flex flex-col items-center justify-end h-full p-2">
                <div className="absolute -top-4 bg-blue-500 rounded-full p-1 border-4 border-white">
                  <Plus className="h-4 w-4 text-white" />
                </div>
                <p className="text-xs font-medium mt-3 text-center">Create Story</p>
              </div>
            </div>
          </div>
          
          {/* Sample Stories */}
          {[1, 2, 3, 4].map(id => (
            <div key={id} className="flex-shrink-0 w-32 h-48 rounded-lg bg-gradient-to-b from-gray-500 to-gray-800 relative overflow-hidden">
              <Avatar className="absolute top-2 left-2 ring-4 ring-blue-500 h-8 w-8">
                <AvatarImage src="/placeholder.svg" />
                <AvatarFallback>U</AvatarFallback>
              </Avatar>
              <div className="absolute bottom-2 left-2 right-2">
                <p className="text-xs text-white font-medium">User Story {id}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Posts */}
      <div className="space-y-4">
        {samplePosts.map(post => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
    </div>
  );
};

export default Feed;
