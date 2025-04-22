
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { MessageSquare, MapPin, Bell, FileText, Users } from 'lucide-react';
import ResumesTab from './ResumesTab';
import GeolocationTab from './GeolocationTab';
import NotificationsTab from './NotificationsTab';
import MessagingTab from './MessagingTab';
import FriendsTab from './FriendsTab';
import { userPosts } from './ProfileData';

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

export function ProfileTabs({ userPosts }: ProfileTabsProps) {
  const [activeTab, setActiveTab] = useState("resumes");

  return (
    <Tabs 
      defaultValue="resumes" 
      className="w-full" 
      onValueChange={setActiveTab}
    >
      <TabsList className="w-full grid grid-cols-5 h-auto p-1 bg-[#2a303c]/50">
        <TabsTrigger 
          value="resumes" 
          className="flex items-center gap-2 py-4 text-gray-400 data-[state=active]:text-white data-[state=active]:bg-[#2a303c]"
        >
          <FileText className="h-4 w-4" />
          <span className="hidden sm:inline">Resumes</span>
        </TabsTrigger>
        <TabsTrigger 
          value="location" 
          className="flex items-center gap-2 py-4 text-gray-400 data-[state=active]:text-white data-[state=active]:bg-[#2a303c]"
        >
          <MapPin className="h-4 w-4" />
          <span className="hidden sm:inline">Location</span>
        </TabsTrigger>
        <TabsTrigger 
          value="notifications" 
          className="flex items-center gap-2 py-4 text-gray-400 data-[state=active]:text-white data-[state=active]:bg-[#2a303c]"
        >
          <Bell className="h-4 w-4" />
          <span className="hidden sm:inline">Notifications</span>
        </TabsTrigger>
        <TabsTrigger 
          value="messages" 
          className="flex items-center gap-2 py-4 text-gray-400 data-[state=active]:text-white data-[state=active]:bg-[#2a303c]"
        >
          <MessageSquare className="h-4 w-4" />
          <span className="hidden sm:inline">Messages</span>
        </TabsTrigger>
        <TabsTrigger 
          value="friends" 
          className="flex items-center gap-2 py-4 text-gray-400 data-[state=active]:text-white data-[state=active]:bg-[#2a303c]"
        >
          <Users className="h-4 w-4" />
          <span className="hidden sm:inline">Friends</span>
        </TabsTrigger>
      </TabsList>

      <div className="mt-6 px-4">
        <TabsContent value="resumes">
          <Card className="bg-[#242938] border-none">
            <CardContent className="p-4">
              <ResumesTab />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="location">
          <Card className="bg-[#242938] border-none">
            <CardContent className="p-4">
              <GeolocationTab />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card className="bg-[#242938] border-none">
            <CardContent className="p-4">
              <NotificationsTab />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="messages">
          <Card className="bg-[#242938] border-none">
            <CardContent className="p-4">
              <MessagingTab />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="friends">
          <Card className="bg-[#242938] border-none">
            <CardContent className="p-4">
              <FriendsTab />
            </CardContent>
          </Card>
        </TabsContent>
      </div>
    </Tabs>
  );
}
