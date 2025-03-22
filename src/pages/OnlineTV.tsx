
import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import SocialSidebar from '@/components/SocialSidebar';
import GlassMorphism from '@/components/GlassMorphism';
import { Tv, Play, Clock, Eye, ThumbsUp, Calendar, Film, Radio, Bookmark, List } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { AspectRatio } from '@/components/ui/aspect-ratio';

const OnlineTV: React.FC = () => {
  const [selectedStream, setSelectedStream] = useState<number | null>(null);
  
  // Mock data
  const liveStreams = [
    {
      id: 1,
      title: 'Dance Workshop with Emma Chen',
      host: 'Emma Chen',
      viewers: 234,
      category: 'Dance',
      thumbnail: '/placeholder.svg',
      live: true
    },
    {
      id: 2,
      title: 'Music Production Masterclass',
      host: 'David Rodriguez',
      viewers: 158,
      category: 'Music',
      thumbnail: '/placeholder.svg',
      live: true
    },
    {
      id: 3,
      title: 'Portfolio Review Session',
      host: 'Sarah Williams',
      viewers: 86,
      category: 'Art & Design',
      thumbnail: '/placeholder.svg',
      live: false,
      starting: '15 minutes'
    },
  ];
  
  const recordings = [
    {
      id: 1,
      title: 'Acting Techniques for Camera',
      host: 'Michael Turner',
      views: 1245,
      likes: 87,
      duration: '1:23:45',
      date: 'May 15, 2023',
      category: 'Acting',
      thumbnail: '/placeholder.svg',
    },
    {
      id: 2,
      title: 'Vocal Training Fundamentals',
      host: 'Jessica Lee',
      views: 876,
      likes: 62,
      duration: '48:32',
      date: 'May 8, 2023',
      category: 'Music',
      thumbnail: '/placeholder.svg',
    },
    {
      id: 3,
      title: 'Screenplay Writing Basics',
      host: 'Robert Johnson',
      views: 632,
      likes: 41,
      duration: '1:05:20',
      date: 'April 29, 2023',
      category: 'Writing',
      thumbnail: '/placeholder.svg',
    },
    {
      id: 4,
      title: 'Digital Photography Tips & Tricks',
      host: 'Sophia Garcia',
      views: 954,
      likes: 73,
      duration: '56:18',
      date: 'April 22, 2023',
      category: 'Photography',
      thumbnail: '/placeholder.svg',
    },
  ];
  
  const scheduledEvents = [
    {
      id: 1,
      title: 'Live Q&A with Industry Professionals',
      date: 'June 15, 2023',
      time: '7:00 PM',
      host: 'Y&T Team',
      category: 'Career',
      thumbnail: '/placeholder.svg',
    },
    {
      id: 2,
      title: 'Young Talents Showcase - Live Performances',
      date: 'June 18, 2023',
      time: '6:00 PM',
      host: 'Various Artists',
      category: 'Performance',
      thumbnail: '/placeholder.svg',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-purple-50">
      <Navbar />
      <div className="container mx-auto flex flex-col md:flex-row">
        <SocialSidebar />
        <main className="flex-1 p-4">
          {selectedStream ? (
            <GlassMorphism className="p-6 mb-6">
              <div className="mb-4">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setSelectedStream(null)}
                  className="mb-4"
                >
                  <List className="h-4 w-4 mr-2" />
                  Back to Streams
                </Button>
                <AspectRatio ratio={16/9} className="bg-black rounded-lg overflow-hidden">
                  <div className="w-full h-full flex items-center justify-center">
                    <Play className="h-12 w-12 text-white opacity-70" />
                  </div>
                </AspectRatio>
              </div>
              
              <div className="mb-6">
                <h2 className="text-2xl font-bold mb-1">
                  {liveStreams.find(s => s.id === selectedStream)?.title || 'Live Stream'}
                </h2>
                <div className="flex items-center text-sm text-gray-600 mb-4">
                  <span className="mr-4">Hosted by: {liveStreams.find(s => s.id === selectedStream)?.host}</span>
                  <div className="flex items-center">
                    <Eye className="h-4 w-4 mr-1" />
                    <span>{liveStreams.find(s => s.id === selectedStream)?.viewers} watching</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button>
                    <ThumbsUp className="h-4 w-4 mr-2" />
                    Like
                  </Button>
                  <Button variant="outline">
                    <Bookmark className="h-4 w-4 mr-2" />
                    Save
                  </Button>
                  <Button variant="outline">
                    Share
                  </Button>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2">
                  <h3 className="font-semibold mb-2">Live Chat</h3>
                  <div className="h-64 bg-white/30 rounded-lg p-3 overflow-y-auto">
                    <div className="space-y-3">
                      <div className="flex gap-2">
                        <div className="w-8 h-8 rounded-full bg-gray-200"></div>
                        <div>
                          <p className="text-sm font-medium">User123</p>
                          <p className="text-xs text-gray-600">Great tips, thanks for sharing!</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <div className="w-8 h-8 rounded-full bg-gray-200"></div>
                        <div>
                          <p className="text-sm font-medium">TalentScout</p>
                          <p className="text-xs text-gray-600">How long have you been practicing this technique?</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <div className="w-8 h-8 rounded-full bg-gray-200"></div>
                        <div>
                          <p className="text-sm font-medium">CreativeMinds</p>
                          <p className="text-xs text-gray-600">Just joined, what did I miss?</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <input 
                      type="text" 
                      placeholder="Type your message..." 
                      className="flex-1 px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                    <Button>Send</Button>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-2">Recommended</h3>
                  <div className="space-y-3">
                    {liveStreams
                      .filter(stream => stream.id !== selectedStream)
                      .map(stream => (
                        <div 
                          key={stream.id}
                          onClick={() => setSelectedStream(stream.id)}
                          className="flex gap-2 cursor-pointer hover:bg-white/20 p-2 rounded-lg"
                        >
                          <div className="w-20 h-12 bg-gray-200 rounded overflow-hidden flex-shrink-0">
                            <img src={stream.thumbnail} alt={stream.title} className="w-full h-full object-cover" />
                          </div>
                          <div>
                            <h4 className="text-sm font-medium line-clamp-1">{stream.title}</h4>
                            <p className="text-xs text-gray-600">{stream.host}</p>
                            <div className="flex items-center text-xs">
                              <Eye className="h-3 w-3 mr-1" />
                              <span>{stream.viewers}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </GlassMorphism>
          ) : (
            <GlassMorphism className="p-6 mb-6">
              <div className="flex items-center gap-3 mb-6">
                <Tv className="h-6 w-6" />
                <h1 className="text-2xl font-bold">Y&T Online TV & Broadcasts</h1>
              </div>
              
              <Tabs defaultValue="live">
                <TabsList className="mb-4">
                  <TabsTrigger value="live">Live Now</TabsTrigger>
                  <TabsTrigger value="recordings">Recordings</TabsTrigger>
                  <TabsTrigger value="scheduled">Scheduled</TabsTrigger>
                  <TabsTrigger value="my-content">My Content</TabsTrigger>
                </TabsList>
                
                <TabsContent value="live" className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {liveStreams.map(stream => (
                      <GlassMorphism 
                        key={stream.id} 
                        className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                        onClick={() => setSelectedStream(stream.id)}
                      >
                        <div className="relative">
                          <AspectRatio ratio={16/9}>
                            <img 
                              src={stream.thumbnail} 
                              alt={stream.title} 
                              className="w-full h-full object-cover"
                            />
                          </AspectRatio>
                          {stream.live ? (
                            <div className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full flex items-center">
                              <span className="w-2 h-2 bg-white rounded-full mr-1"></span>
                              LIVE
                            </div>
                          ) : (
                            <div className="absolute top-2 left-2 bg-gray-800/80 text-white text-xs px-2 py-1 rounded-full flex items-center">
                              <Clock className="h-3 w-3 mr-1" />
                              Starting in {stream.starting}
                            </div>
                          )}
                        </div>
                        <div className="p-3">
                          <h3 className="font-semibold">{stream.title}</h3>
                          <p className="text-sm text-gray-600">{stream.host}</p>
                          <div className="flex items-center justify-between text-sm mt-1">
                            <span className="text-primary">{stream.category}</span>
                            <div className="flex items-center">
                              <Eye className="h-4 w-4 mr-1" />
                              <span>{stream.viewers}</span>
                            </div>
                          </div>
                        </div>
                      </GlassMorphism>
                    ))}
                  </div>
                  
                  <Button variant="outline" className="w-full">
                    <Radio className="h-4 w-4 mr-2" />
                    Start Broadcasting
                  </Button>
                </TabsContent>
                
                <TabsContent value="recordings" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {recordings.map(recording => (
                      <GlassMorphism key={recording.id} className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer">
                        <div className="relative">
                          <AspectRatio ratio={16/9}>
                            <img 
                              src={recording.thumbnail} 
                              alt={recording.title} 
                              className="w-full h-full object-cover"
                            />
                          </AspectRatio>
                          <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-1.5 py-0.5 rounded">
                            {recording.duration}
                          </div>
                        </div>
                        <div className="p-3">
                          <h3 className="font-semibold text-sm line-clamp-2">{recording.title}</h3>
                          <p className="text-xs text-gray-600">{recording.host}</p>
                          <div className="flex items-center justify-between text-xs mt-1">
                            <div className="flex items-center">
                              <Eye className="h-3 w-3 mr-1" />
                              <span>{recording.views}</span>
                              <span className="mx-1">•</span>
                              <ThumbsUp className="h-3 w-3 mr-1" />
                              <span>{recording.likes}</span>
                            </div>
                            <span className="text-gray-500">{recording.date}</span>
                          </div>
                        </div>
                      </GlassMorphism>
                    ))}
                  </div>
                </TabsContent>
                
                <TabsContent value="scheduled" className="space-y-4">
                  <div className="flex items-center gap-2 mb-4">
                    <Calendar className="h-5 w-5" />
                    <h2 className="text-lg font-medium">Upcoming Broadcasts</h2>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {scheduledEvents.map(event => (
                      <GlassMorphism key={event.id} className="p-4 hover:shadow-md transition-shadow">
                        <div className="flex gap-4">
                          <div className="w-24 h-16 rounded overflow-hidden bg-gray-200 flex-shrink-0">
                            <img src={event.thumbnail} alt={event.title} className="w-full h-full object-cover" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold">{event.title}</h3>
                            <div className="flex items-center text-sm text-gray-600 mt-1">
                              <Calendar className="h-3 w-3 mr-1" />
                              <span>{event.date}</span>
                              <span className="mx-1">•</span>
                              <Clock className="h-3 w-3 mr-1" />
                              <span>{event.time}</span>
                            </div>
                            <p className="text-sm mt-1">{event.host}</p>
                            <Button size="sm" variant="outline" className="mt-2">
                              Set Reminder
                            </Button>
                          </div>
                        </div>
                      </GlassMorphism>
                    ))}
                  </div>
                </TabsContent>
                
                <TabsContent value="my-content">
                  <div className="text-center py-6">
                    <Film className="h-12 w-12 mx-auto text-gray-400 mb-3" />
                    <h3 className="text-xl font-medium mb-2">No Content Yet</h3>
                    <p className="text-gray-600 mb-4">Start creating and sharing your own broadcasts</p>
                    <Button>
                      <Radio className="h-4 w-4 mr-2" />
                      Start Broadcasting
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>
            </GlassMorphism>
          )}
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default OnlineTV;
