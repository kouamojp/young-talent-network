
import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import GlassMorphism from '@/components/GlassMorphism';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UserPlus, Mail, Calendar, MapPin, Link as LinkIcon } from 'lucide-react';
import PostCard from '@/components/PostCard';

// Sample user data
const user = {
  name: 'Alex Johnson',
  username: 'alexj',
  avatar: '/placeholder.svg',
  coverPhoto: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?q=80&w=2070',
  bio: 'Professional pianist | Music teacher | Looking for opportunities to perform internationally',
  location: 'New York, USA',
  website: 'alexjohnson.music',
  joined: 'January 2023',
  followers: 1240,
  following: 350
};

// Sample posts
const userPosts = [
  {
    id: '1',
    author: {
      name: user.name,
      avatar: user.avatar
    },
    content: 'Excited to share that I\'ll be performing at Carnegie Hall next month! It\'s been a dream come true.',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
    likes: 89,
    comments: 24,
    shares: 12
  },
  {
    id: '2',
    author: {
      name: user.name,
      avatar: user.avatar
    },
    content: 'Just finished my latest piano composition. Can\'t wait to share it with all of you soon!',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
    likes: 65,
    comments: 18,
    shares: 5
  }
];

const Profile: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-purple-50">
      <Navbar />
      
      <div className="container mx-auto max-w-4xl pb-10">
        {/* Cover Photo & Profile Info */}
        <div className="relative mb-6">
          <div className="h-64 w-full overflow-hidden rounded-b-xl">
            <img 
              src={user.coverPhoto} 
              alt="Cover" 
              className="w-full h-full object-cover"
            />
          </div>
          
          <GlassMorphism className="relative mx-4 -mt-20 p-6">
            <div className="flex flex-col md:flex-row items-center md:items-end gap-4">
              <Avatar className="w-32 h-32 border-4 border-white">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
              </Avatar>
              
              <div className="flex-1 text-center md:text-left">
                <h1 className="text-2xl font-bold">{user.name}</h1>
                <p className="text-gray-600">@{user.username}</p>
                <p className="mt-2 max-w-md">{user.bio}</p>
              </div>
              
              <div className="flex gap-2">
                <Button className="gap-2">
                  <UserPlus size={16} />
                  Follow
                </Button>
                <Button variant="outline" className="gap-2">
                  <Mail size={16} />
                  Message
                </Button>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-4 mt-6 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <MapPin size={16} />
                <span>{user.location}</span>
              </div>
              <div className="flex items-center gap-1">
                <LinkIcon size={16} />
                <a href={`https://${user.website}`} className="hover:underline">{user.website}</a>
              </div>
              <div className="flex items-center gap-1">
                <Calendar size={16} />
                <span>Joined {user.joined}</span>
              </div>
            </div>
            
            <div className="flex gap-6 mt-6">
              <div>
                <span className="font-bold">{user.followers.toLocaleString()}</span> 
                <span className="text-gray-600 ml-1">Followers</span>
              </div>
              <div>
                <span className="font-bold">{user.following.toLocaleString()}</span> 
                <span className="text-gray-600 ml-1">Following</span>
              </div>
            </div>
          </GlassMorphism>
        </div>
        
        {/* Tabs */}
        <div className="px-4">
          <Tabs defaultValue="posts">
            <TabsList className="w-full justify-start mb-6">
              <TabsTrigger value="posts">Posts</TabsTrigger>
              <TabsTrigger value="media">Media</TabsTrigger>
              <TabsTrigger value="about">About</TabsTrigger>
            </TabsList>
            
            <TabsContent value="posts" className="space-y-6">
              {userPosts.map(post => (
                <PostCard key={post.id} post={post} />
              ))}
            </TabsContent>
            
            <TabsContent value="media">
              <GlassMorphism className="p-6">
                <h3 className="text-lg font-medium mb-4">Media</h3>
                <div className="grid grid-cols-3 gap-2">
                  {[1, 2, 3, 4, 5, 6].map(i => (
                    <div key={i} className="aspect-square bg-gray-200 rounded-md overflow-hidden">
                      <img src="/placeholder.svg" alt="" className="w-full h-full object-cover" />
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
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Profile;
