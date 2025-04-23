import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import GlassMorphism from '@/components/GlassMorphism';
import LiveDiscovery from '@/components/live/LiveDiscovery';
import LivePopular from '@/components/live/LivePopular';
import LiveFollowing from '@/components/live/LiveFollowing';
import LiveSearch from '@/components/live/LiveSearch';
import LiveBroadcast from '@/components/live/LiveBroadcast';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Globe, Zap, Heart, Search, Video } from 'lucide-react';

const Live: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('discover');
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-purple-50">
      <Navbar />
      <div className="container mx-auto flex flex-col md:flex-row">
        <main className="flex-1 p-4 mb-16">
          <GlassMorphism className="p-6">
            <div className="flex items-center gap-2 mb-6">
              <Video className="h-6 w-6 text-purple-600" />
              <h1 className="text-2xl font-bold">Y&T LIVE: Where Talent Shines in Real-Time</h1>
            </div>
            
            <Tabs 
              defaultValue="discover" 
              value={activeTab} 
              onValueChange={setActiveTab}
              className="w-full"
            >
              <TabsList className="grid grid-cols-2 md:grid-cols-5 gap-2 mb-8">
                <TabsTrigger value="discover" className="flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  <span>Discover</span>
                </TabsTrigger>
                <TabsTrigger value="popular" className="flex items-center gap-2">
                  <Zap className="h-4 w-4" />
                  <span>Popular NOW</span>
                </TabsTrigger>
                <TabsTrigger value="following" className="flex items-center gap-2">
                  <Heart className="h-4 w-4" />
                  <span>Following</span>
                </TabsTrigger>
                <TabsTrigger value="search" className="flex items-center gap-2">
                  <Search className="h-4 w-4" />
                  <span>Search</span>
                </TabsTrigger>
                <TabsTrigger value="golive" className="flex items-center gap-2 bg-purple-100 hover:bg-purple-200">
                  <Video className="h-4 w-4" />
                  <span>Go LIVE!</span>
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="discover">
                <LiveDiscovery />
              </TabsContent>
              
              <TabsContent value="popular">
                <LivePopular />
              </TabsContent>
              
              <TabsContent value="following">
                <LiveFollowing />
              </TabsContent>
              
              <TabsContent value="search">
                <LiveSearch />
              </TabsContent>
              
              <TabsContent value="golive">
                <LiveBroadcast />
              </TabsContent>
            </Tabs>
          </GlassMorphism>
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default Live;
