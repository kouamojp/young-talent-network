
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import GlassMorphism from '@/components/GlassMorphism';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import PostCard from '@/components/PostCard';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface Post {
  id: string;
  author: {
    name: string;
    avatar: string;
  };
  content: string;
  timestamp: string;
  likes: number;
  comments: number;
  shares: number;
}

interface ProfileTabsProps {
  userPosts: Post[];
}

const ProfileTabs: React.FC<ProfileTabsProps> = ({ userPosts }) => {
  return (
    <Tabs defaultValue="posts">
      <TabsList className="w-full justify-start mb-6">
        <TabsTrigger value="posts">Posts</TabsTrigger>
        <TabsTrigger value="media">Media</TabsTrigger>
        <TabsTrigger value="about">About</TabsTrigger>
      </TabsList>
      
      <TabsContent value="posts" className="space-y-6">
        <div className="mb-4">
          <GlassMorphism className="p-4">
            <textarea 
              className="w-full p-3 rounded bg-white/50 resize-none"
              placeholder="What's your talent heart singing today? Share it with your future fans!"
              rows={3}
            ></textarea>
            <div className="flex justify-end mt-2">
              <Button>Share your brilliance</Button>
            </div>
          </GlassMorphism>
        </div>
        
        {userPosts.map(post => (
          <PostCard key={post.id} post={post} />
        ))}
      </TabsContent>
      
      <TabsContent value="media">
        <GlassMorphism className="p-6">
          <h3 className="text-lg font-medium mb-4">These moments capture my brilliance 📸</h3>
          <div className="grid grid-cols-3 gap-2">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="aspect-square bg-gray-200 rounded-md overflow-hidden">
                <img src="/placeholder.svg" alt="" className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
          
          <h3 className="text-lg font-medium my-4">Watch me come alive on screen 🎬</h3>
          <div className="grid grid-cols-2 gap-4">
            {[1, 2].map(i => (
              <div key={i} className="aspect-video bg-gray-200 rounded-md flex items-center justify-center">
                <Tooltip>
                  <TooltipTrigger>
                    <p className="text-gray-500">+ Add Video</p>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Even 30 seconds can change someone's mind!</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            ))}
          </div>
        </GlassMorphism>
      </TabsContent>
      
      <TabsContent value="about">
        <GlassMorphism className="p-6">
          <h3 className="text-lg font-medium mb-4">About</h3>
          <div className="space-y-4">
            <Card>
              <CardContent className="p-4">
                <h4 className="font-medium">Talents & Skills</h4>
                <ul className="mt-2 list-disc list-inside text-gray-600">
                  <li>Piano - Advanced (15 years experience)</li>
                  <li>Composition - Intermediate</li>
                  <li>Music Theory - Expert</li>
                </ul>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <h4 className="font-medium">Achievements</h4>
                <ul className="mt-2 list-disc list-inside text-gray-600">
                  <li>First place in National Young Pianist Competition, 2022</li>
                  <li>Featured performer at Lincoln Center, 2023</li>
                  <li>Juilliard School of Music - Bachelor's Degree</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </GlassMorphism>
      </TabsContent>
    </Tabs>
  );
};

export default ProfileTabs;
