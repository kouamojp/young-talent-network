
import React from 'react';
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardContent } from "@/components/ui/card";
import { UserRound, Users } from 'lucide-react';
import { followingStreams } from './data/liveData';

const LiveFollowing: React.FC = () => {
  const peopleStreams = followingStreams.filter(stream => stream.type === 'people');
  const communityStreams = followingStreams.filter(stream => stream.type === 'community');
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Heart className="h-5 w-5 text-red-500 fill-red-500" />
          Following
        </h2>
        <Button variant="outline" size="sm">
          Find More to Follow
        </Button>
      </div>
      
      <Tabs defaultValue="people">
        <TabsList className="mb-4">
          <TabsTrigger value="people" className="flex items-center gap-2">
            <UserRound className="h-4 w-4" />
            <span>People</span>
          </TabsTrigger>
          <TabsTrigger value="communities" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span>Communities</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="people">
          {peopleStreams.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {peopleStreams.map((stream, index) => (
                <Card key={index} className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer">
                  <div className="relative">
                    <img 
                      src={stream.thumbnail} 
                      alt={stream.title}
                      className="w-full aspect-video object-cover"
                    />
                    <div className="absolute top-2 left-2 bg-red-600 text-white text-xs px-2 py-1 rounded-full">
                      LIVE
                    </div>
                    <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded-full">
                      {stream.viewers.toLocaleString()} watching
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold mb-1">{stream.title}</h3>
                    <p className="text-sm text-gray-600 mb-2">
                      {stream.streamerName} is live!
                    </p>
                    {stream.description && (
                      <p className="text-sm text-gray-700">💬 "{stream.description}"</p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white/50 rounded-lg">
              <div className="text-6xl mb-4">🎭</div>
              <h3 className="text-xl font-medium mb-2">The stage is empty!</h3>
              <p className="text-gray-600 mb-4">Notify your favorites to go live!</p>
              <Button>Find People to Follow</Button>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="communities">
          {communityStreams.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {communityStreams.map((stream, index) => (
                <Card key={index} className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer">
                  <div className="relative">
                    <img 
                      src={stream.thumbnail} 
                      alt={stream.title}
                      className="w-full aspect-video object-cover"
                    />
                    <div className="absolute top-2 left-2 bg-red-600 text-white text-xs px-2 py-1 rounded-full">
                      LIVE
                    </div>
                    <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded-full">
                      {stream.viewers.toLocaleString()} watching
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold mb-1">{stream.title}</h3>
                    <p className="text-sm text-gray-600 mb-2">
                      {stream.communityName}
                    </p>
                    {stream.description && (
                      <p className="text-sm text-gray-700">💬 "{stream.description}"</p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white/50 rounded-lg">
              <div className="text-6xl mb-4">👥</div>
              <h3 className="text-xl font-medium mb-2">No community streams!</h3>
              <p className="text-gray-600 mb-4">Join communities to see their live broadcasts</p>
              <Button>Explore Communities</Button>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

import { Heart } from 'lucide-react';

export default LiveFollowing;
