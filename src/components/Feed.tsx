
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
    <div className="w-full py-4 space-y-3">
      {/* Create Post */}
      <div className="bg-card rounded-lg shadow-sm p-4 border border-border">
        <div className="flex items-center space-x-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src="/placeholder.svg" alt="User avatar" />
            <AvatarFallback>U</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <Button variant="outline" className="w-full justify-start text-muted-foreground font-normal rounded-full h-10 hover:bg-muted">
              What's on your mind?
            </Button>
          </div>
        </div>
        <div className="flex justify-between mt-3 pt-3 border-t">
          <Button variant="ghost" size="sm" className="flex-1 text-sm">
            Live Video
          </Button>
          <Button variant="ghost" size="sm" className="flex-1 text-sm">
            Photo/Video
          </Button>
          <Button variant="ghost" size="sm" className="flex-1 text-sm">
            Feeling
          </Button>
        </div>
      </div>

      {/* Stories Carousel */}
      <div className="bg-card rounded-lg shadow-sm p-4 border border-border">
        <div className="flex space-x-2 overflow-x-auto pb-2">
          {/* Create Story */}
          <div className="flex-shrink-0 w-28 h-40 rounded-lg bg-muted border border-border relative overflow-hidden cursor-pointer hover:opacity-90 transition-opacity">
            <div className="absolute inset-x-0 bottom-0 h-1/2 bg-card">
              <div className="flex flex-col items-center justify-end h-full p-2">
                <div className="absolute -top-4 bg-primary rounded-full p-1 border-4 border-card">
                  <Plus className="h-3 w-3 text-white" />
                </div>
                <p className="text-xs font-medium mt-3 text-center">Create Story</p>
              </div>
            </div>
          </div>
          
          {/* Sample Stories */}
          {[1, 2, 3, 4, 5].map(id => (
            <div key={id} className="flex-shrink-0 w-28 h-40 rounded-lg bg-gradient-to-b from-muted to-muted-foreground relative overflow-hidden cursor-pointer hover:opacity-90 transition-opacity">
              <Avatar className="absolute top-2 left-2 ring-2 ring-primary h-8 w-8">
                <AvatarImage src="/placeholder.svg" />
                <AvatarFallback>U</AvatarFallback>
              </Avatar>
              <div className="absolute bottom-2 left-2 right-2">
                <p className="text-xs text-white font-medium truncate">User {id}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Posts */}
      <div className="space-y-3">
        {samplePosts.map(post => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
    </div>
  );
};

export default Feed;
