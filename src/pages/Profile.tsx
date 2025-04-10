
import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import SocialSidebar from '@/components/SocialSidebar';
import GlassMorphism from '@/components/GlassMorphism';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UserPlus, Mail, Calendar, MapPin, Link as LinkIcon, Edit, Sparkles, BookOpen, Briefcase } from 'lucide-react';
import PostCard from '@/components/PostCard';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

// Sample user data
const user = {
  name: 'Alex Johnson',
  nickname: 'Piano Virtuoso',
  username: 'alexj',
  avatar: '/placeholder.svg',
  coverPhoto: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?q=80&w=2070',
  bio: 'Professional pianist | Music teacher | Looking for opportunities to perform internationally',
  location: 'New York, USA',
  website: 'alexjohnson.music',
  joined: 'January 2023',
  birthday: 'May 15',
  education: 'Juilliard School of Music',
  work: 'Piano Teacher at NYC Music Academy',
  hobbies: ['Photography 📸', 'Hiking in nature 🌲', 'Cooking Italian cuisine 🍝'],
  followers: 1240,
  following: 350,
  mentors: 3,
  status: 'Carnegie Hall, here I come!'
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
  const [isEditMode, setIsEditMode] = useState(false);
  const [statusText, setStatusText] = useState(user.status);
  const [isEditingStatus, setIsEditingStatus] = useState(false);

  const handleStatusChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setStatusText(e.target.value);
  };

  const saveStatus = () => {
    // Here you would save the status to your backend
    setIsEditingStatus(false);
  };

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-purple-50">
        <Navbar />
        
        <div className="container mx-auto max-w-5xl pb-10">
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
                  <h1 className="text-2xl font-bold">
                    Meet {user.name.split(' ')[0]} "{user.nickname}" {user.name.split(' ')[1]} – the future of music!
                  </h1>
                  
                  {isEditingStatus ? (
                    <div className="flex mt-2 items-center">
                      <input 
                        type="text" 
                        value={statusText} 
                        onChange={handleStatusChange} 
                        placeholder="Tell us your dream in 5 words..." 
                        className="border rounded px-2 py-1 text-sm flex-1"
                        maxLength={50}
                      />
                      <Button size="sm" onClick={saveStatus} className="ml-2">Save</Button>
                    </div>
                  ) : (
                    <p 
                      className="text-gray-600 cursor-pointer hover:text-gray-800" 
                      onClick={() => setIsEditingStatus(true)}
                    >
                      "{statusText}" <span className="text-xs">(click to edit)</span>
                    </p>
                  )}
                  
                  <p className="mt-2 max-w-md">{user.bio}</p>
                </div>
                
                <div className="flex gap-2">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button className="gap-2">
                        <UserPlus size={16} />
                        Follow
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Join Alex's cheerleaders!</p>
                    </TooltipContent>
                  </Tooltip>
                  
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="outline" className="gap-2">
                        <Mail size={16} />
                        Message
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Start your legendary duo journey!</p>
                    </TooltipContent>
                  </Tooltip>
                  
                  {!isEditMode && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="outline" className="gap-2" onClick={() => setIsEditMode(true)}>
                          <Edit size={16} />
                          <Sparkles className="h-3 w-3" />
                          Polish your sparkle
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Make your profile shine brighter!</p>
                      </TooltipContent>
                    </Tooltip>
                  )}
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                {/* Left Column */}
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="flex items-center gap-1">
                          <MapPin size={16} />
                          <span>🌍 Talent spotted near {user.location.split(',')[0]}! Send a wave 👋</span>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>The world should know where this talent shines from!</p>
                      </TooltipContent>
                    </Tooltip>
                    
                    <div className="flex items-center gap-1">
                      <LinkIcon size={16} />
                      <a href={`https://${user.website}`} className="hover:underline">{user.website}</a>
                    </div>
                    
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="flex items-center gap-1">
                          <Calendar size={16} />
                          <span>🎉 Born to shine on {user.birthday}!</span>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Mark your calendar for celebration time!</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  
                  <Card>
                    <CardContent className="p-4">
                      <h3 className="font-medium flex items-center gap-2 mb-2">
                        <span>When I'm not being amazing at piano, I love...</span>
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {user.hobbies.map((hobby, index) => (
                          <span 
                            key={index} 
                            className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm"
                          >
                            {hobby}
                          </span>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                {/* Right Column */}
                <div className="space-y-4">
                  <Card>
                    <CardContent className="p-4">
                      <h3 className="font-medium flex items-center gap-2 mb-2">
                        <BookOpen size={16} className="text-purple-600" />
                        <span>📚 Learning the secrets of music at {user.education}</span>
                      </h3>
                      <h3 className="font-medium flex items-center gap-2 mt-3">
                        <Briefcase size={16} className="text-purple-600" />
                        <span>💡 Currently: {user.work}. (But destined for bigger stages!)</span>
                      </h3>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex justify-between">
                        <div>
                          <span className="font-bold">{user.followers.toLocaleString()}</span> 
                          <span className="text-gray-600 ml-1">👥 cheerleaders in your fan club</span>
                        </div>
                        <div>
                          <span className="font-bold">{user.mentors}</span> 
                          <span className="text-gray-600 ml-1">🎓 wise mentors guiding your journey</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
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
          </div>
        </div>
        
        <Footer />
      </div>
    </TooltipProvider>
  );
};

export default Profile;
