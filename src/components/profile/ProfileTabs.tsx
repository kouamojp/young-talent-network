
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import GlassMorphism from '@/components/GlassMorphism';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import PostCard from '@/components/PostCard';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import SocialUniverse from './SocialUniverse';
import { MapPin, MessageSquare, Bell, Calendar, Users, FileText, Image } from 'lucide-react';
import ResumesTab from './ResumesTab';
import GeolocationTab from './GeolocationTab';
import NotificationsTab from './NotificationsTab';
import MessagingTab from './MessagingTab';
import FriendsTab from './FriendsTab';

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
    <Tabs defaultValue="feed">
      <TabsList className="w-full justify-start mb-6 flex-wrap">
        <TabsTrigger value="feed" className="flex items-center gap-1">
          <FileText className="h-4 w-4" />
          Feed
        </TabsTrigger>
        <TabsTrigger value="resumes" className="flex items-center gap-1">
          <FileText className="h-4 w-4" />
          Resumes
        </TabsTrigger>
        <TabsTrigger value="geolocation" className="flex items-center gap-1">
          <MapPin className="h-4 w-4" />
          Geolocation
        </TabsTrigger>
        <TabsTrigger value="notifications" className="flex items-center gap-1">
          <Bell className="h-4 w-4" />
          Notifications
        </TabsTrigger>
        <TabsTrigger value="messaging" className="flex items-center gap-1">
          <MessageSquare className="h-4 w-4" />
          Messaging
        </TabsTrigger>
        <TabsTrigger value="friends" className="flex items-center gap-1">
          <Users className="h-4 w-4" />
          Friends
        </TabsTrigger>
        <TabsTrigger value="media" className="flex items-center gap-1">
          <Image className="h-4 w-4" />
          Media
        </TabsTrigger>
        <TabsTrigger value="events" className="flex items-center gap-1">
          <Calendar className="h-4 w-4" />
          Events
        </TabsTrigger>
        <TabsTrigger value="social">Social Universe</TabsTrigger>
        <TabsTrigger value="about">About</TabsTrigger>
      </TabsList>
      
      <TabsContent value="feed" className="space-y-6">
        <div className="mb-4">
          <GlassMorphism className="p-4">
            <textarea 
              className="w-full p-3 rounded bg-white/50 resize-none"
              placeholder="What is your talent heart singing today? Share it with your future fans!"
              rows={3}
            ></textarea>
            <div className="flex justify-end mt-2">
              <Button>Share your brilliance</Button>
            </div>
          </GlassMorphism>
        </div>
        
        {/* Birthday reminders section */}
        <GlassMorphism className="p-4 mb-4">
          <h3 className="font-medium text-lg mb-3">🎂 Birthday Reminders</h3>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex-shrink-0 bg-purple-50 rounded-lg p-3 w-64">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-purple-200 flex items-center justify-center">
                    🎉
                  </div>
                  <div>
                    <p className="font-medium">Michael Jordan</p>
                    <p className="text-sm text-gray-600">Turns 24 today!</p>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="w-full mt-2">Send wishes</Button>
              </div>
            ))}
          </div>
        </GlassMorphism>
        
        {/* Transfer Market section */}
        <GlassMorphism className="p-4 mb-4">
          <h3 className="font-medium text-lg mb-3">💼 From Y&T to Transfer Market</h3>
          <div className="space-y-3">
            {[1, 2].map(i => (
              <Card key={i}>
                <CardContent className="p-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                      🏆
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">James Williams</p>
                      <p className="text-sm text-gray-600">Signed with LA Lakers basketball team!</p>
                    </div>
                    <Button variant="outline" size="sm">Congratulate</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </GlassMorphism>
        
        {userPosts.map(post => (
          <PostCard key={post.id} post={post} />
        ))}
      </TabsContent>
      
      <TabsContent value="resumes">
        <ResumesTab />
      </TabsContent>
      
      <TabsContent value="geolocation">
        <GeolocationTab />
      </TabsContent>
      
      <TabsContent value="notifications">
        <NotificationsTab />
      </TabsContent>
      
      <TabsContent value="messaging">
        <MessagingTab />
      </TabsContent>
      
      <TabsContent value="friends">
        <FriendsTab />
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
      
      <TabsContent value="events">
        <GlassMorphism className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">My Events Calendar</h3>
            <Button size="sm">+ Add Event</Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              {
                title: "Regional Basketball Tournament",
                date: "May 15-17, 2025",
                location: "Chicago Sports Center",
                type: "Competition"
              },
              {
                title: "Summer Training Camp",
                date: "July 10-24, 2025",
                location: "Athletic Performance Institute",
                type: "Training"
              }
            ].map((event, i) => (
              <Card key={i}>
                <CardContent className="p-4">
                  <div className="flex justify-between">
                    <h4 className="font-medium">{event.title}</h4>
                    <span className="text-sm bg-purple-100 text-purple-800 px-2 py-0.5 rounded">
                      {event.type}
                    </span>
                  </div>
                  <div className="mt-2 text-sm text-gray-600">
                    <div className="flex items-center gap-1 mb-1">
                      <Calendar className="h-4 w-4" />
                      <span>{event.date}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      <span>{event.location}</span>
                    </div>
                  </div>
                  <div className="mt-3 flex gap-2">
                    <Button size="sm" variant="outline">Details</Button>
                    <Button size="sm" variant="outline">Share</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </GlassMorphism>
      </TabsContent>
      
      <TabsContent value="social">
        <GlassMorphism className="p-6">
          <SocialUniverse initialLinks={[
            {
              platform: 'instagram',
              url: 'instagram.com/alexjohnson_piano',
              verified: true,
              lastActivity: {
                type: 'post',
                value: '328 likes'
              }
            },
            {
              platform: 'youtube',
              url: 'youtube.com/c/alexjohnsonpiano',
              verified: true
            },
            {
              platform: 'facebook',
              url: 'facebook.com/alexjohnsonpiano',
              verified: true
            }
          ]} />
          
          <div className="mt-6">
            <h3 className="font-medium text-lg mb-3">🌟 My Idols</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {[
                { name: "Michael Jordan", role: "Basketball Legend" },
                { name: "Serena Williams", role: "Tennis Champion" },
                { name: "Simone Biles", role: "Gymnastics Star" }
              ].map((idol, i) => (
                <Card key={i}>
                  <CardContent className="p-3 flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-400 to-pink-500 flex items-center justify-center text-white">
                      {idol.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium">{idol.name}</p>
                      <p className="text-xs text-gray-500">{idol.role}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
              <Card className="flex items-center justify-center p-3 border-dashed">
                <Button variant="ghost" size="sm">+ Add Idol</Button>
              </Card>
            </div>
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
