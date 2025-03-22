
import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import SocialSidebar from '@/components/SocialSidebar';
import GlassMorphism from '@/components/GlassMorphism';
import { Users, Globe, Settings, Plus, MessageSquare, UserPlus, Clock } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const Communities: React.FC = () => {
  // Mock data
  const communities = [
    { 
      id: 1, 
      name: 'Music Producers Network', 
      members: 1245, 
      category: 'Music',
      image: '/placeholder.svg',
      description: 'A community for music producers to share tips, collaborate, and grow together.',
      isJoined: true
    },
    { 
      id: 2, 
      name: 'Young Actors Guild', 
      members: 873, 
      category: 'Acting',
      image: '/placeholder.svg',
      description: 'Support network for young actors pursuing their dreams in film, TV, and theater.',
      isJoined: false
    },
    { 
      id: 3, 
      name: 'Digital Art Collective', 
      members: 621, 
      category: 'Art & Design',
      image: '/placeholder.svg',
      description: 'A space for digital artists to showcase work, get feedback, and find opportunities.',
      isJoined: true
    },
    { 
      id: 4, 
      name: 'Writers Workshop', 
      members: 435, 
      category: 'Writing',
      image: '/placeholder.svg',
      description: 'For writers of all genres to workshop ideas, get feedback, and improve their craft.',
      isJoined: false
    },
  ];
  
  const posts = [
    {
      id: 1,
      author: { name: 'Jane Smith', avatar: '/placeholder.svg' },
      community: 'Music Producers Network',
      content: 'Just released my new track "Ambient Dreams" - created entirely using analog synths. Would love your feedback!',
      time: '2 hours ago',
      likes: 24,
      comments: 8,
    },
    {
      id: 2,
      author: { name: 'Alex Chen', avatar: '/placeholder.svg' },
      community: 'Digital Art Collective',
      content: 'Sharing my latest digital painting inspired by cyberpunk aesthetics. Created in Procreate using a custom brush set.',
      time: '5 hours ago',
      likes: 47,
      comments: 12,
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-purple-50">
      <Navbar />
      <div className="container mx-auto flex flex-col md:flex-row">
        <SocialSidebar />
        <main className="flex-1 p-4">
          <GlassMorphism className="p-6 mb-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Users className="h-6 w-6" />
                <h1 className="text-2xl font-bold">Communities</h1>
              </div>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Community
              </Button>
            </div>
            
            <Tabs defaultValue="discover">
              <TabsList className="mb-4">
                <TabsTrigger value="discover">Discover</TabsTrigger>
                <TabsTrigger value="my-communities">My Communities</TabsTrigger>
                <TabsTrigger value="recommended">Recommended</TabsTrigger>
              </TabsList>
              
              <TabsContent value="discover" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {communities.map(community => (
                    <GlassMorphism key={community.id} className="p-4 hover:shadow-md transition-shadow">
                      <div className="flex gap-4">
                        <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-200">
                          <img src={community.image} alt={community.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold">{community.name}</h3>
                          <div className="flex items-center text-sm text-gray-600 mt-1">
                            <Users className="h-3 w-3 mr-1" />
                            <span>{community.members} members</span>
                            <span className="mx-2">•</span>
                            <span>{community.category}</span>
                          </div>
                          <p className="text-sm mt-1 text-gray-600 line-clamp-2">{community.description}</p>
                          <Button 
                            variant={community.isJoined ? "outline" : "default"} 
                            size="sm" 
                            className="mt-2"
                          >
                            {community.isJoined ? 'Joined' : 'Join'}
                          </Button>
                        </div>
                      </div>
                    </GlassMorphism>
                  ))}
                </div>
              </TabsContent>
              
              <TabsContent value="my-communities">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {communities
                    .filter(c => c.isJoined)
                    .map(community => (
                      <GlassMorphism key={community.id} className="p-4 hover:shadow-md transition-shadow">
                        <div className="flex gap-4">
                          <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-200">
                            <img src={community.image} alt={community.name} className="w-full h-full object-cover" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold">{community.name}</h3>
                            <div className="flex items-center text-sm text-gray-600 mt-1">
                              <Users className="h-3 w-3 mr-1" />
                              <span>{community.members} members</span>
                            </div>
                            <div className="flex gap-2 mt-2">
                              <Button size="sm" variant="outline">
                                <MessageSquare className="h-3 w-3 mr-1" />
                                View
                              </Button>
                              <Button size="sm" variant="outline">
                                <Settings className="h-3 w-3 mr-1" />
                                Settings
                              </Button>
                            </div>
                          </div>
                        </div>
                      </GlassMorphism>
                    ))}
                </div>
              </TabsContent>
              
              <TabsContent value="recommended">
                <p>Communities recommended based on your interests and activities.</p>
              </TabsContent>
            </Tabs>
          </GlassMorphism>
          
          <GlassMorphism className="p-6">
            <h2 className="text-xl font-semibold mb-4">Community Posts</h2>
            
            <div className="space-y-4">
              {posts.map(post => (
                <GlassMorphism key={post.id} className="p-4">
                  <div className="mb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Avatar>
                          <AvatarImage src={post.author.avatar} alt={post.author.name} />
                          <AvatarFallback>{post.author.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <h4 className="font-medium">{post.author.name}</h4>
                          <div className="flex items-center text-xs text-gray-500">
                            <Globe className="h-3 w-3 mr-1" />
                            <span>{post.community}</span>
                            <span className="mx-1">•</span>
                            <Clock className="h-3 w-3 mr-1" />
                            <span>{post.time}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-gray-700 mb-3">{post.content}</p>
                  
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex gap-4">
                      <button className="flex items-center gap-1 text-gray-600 hover:text-primary">
                        <span>👍</span> {post.likes}
                      </button>
                      <button className="flex items-center gap-1 text-gray-600 hover:text-primary">
                        <MessageSquare className="h-4 w-4" /> {post.comments}
                      </button>
                    </div>
                    <button className="text-gray-600 hover:text-primary">Share</button>
                  </div>
                </GlassMorphism>
              ))}
            </div>
          </GlassMorphism>
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default Communities;
