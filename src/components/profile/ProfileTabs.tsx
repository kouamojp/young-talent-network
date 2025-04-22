
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

// Define the Post interface here since it's not exported from ProfileData
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
    <Tabs defaultValue="resumes" className="my-6" onValueChange={setActiveTab}>
      <TabsList className="grid grid-cols-5 h-auto p-1 mb-8">
        <TabsTrigger value="resumes" className="flex items-center gap-2 py-3">
          <FileText className="h-4 w-4" />
          <span className="hidden sm:inline">Resumes</span>
        </TabsTrigger>
        <TabsTrigger value="location" className="flex items-center gap-2 py-3">
          <MapPin className="h-4 w-4" />
          <span className="hidden sm:inline">Location</span>
        </TabsTrigger>
        <TabsTrigger value="notifications" className="flex items-center gap-2 py-3">
          <Bell className="h-4 w-4" />
          <span className="hidden sm:inline">Notifications</span>
        </TabsTrigger>
        <TabsTrigger value="messages" className="flex items-center gap-2 py-3">
          <MessageSquare className="h-4 w-4" />
          <span className="hidden sm:inline">Messages</span>
        </TabsTrigger>
        <TabsTrigger value="friends" className="flex items-center gap-2 py-3">
          <Users className="h-4 w-4" />
          <span className="hidden sm:inline">Friends</span>
        </TabsTrigger>
      </TabsList>

      <TabsContent value="resumes">
        <Card>
          <CardContent className="p-4 sm:p-6">
            <ResumesTab />
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="location">
        <Card>
          <CardContent className="p-4 sm:p-6">
            <GeolocationTab />
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="notifications">
        <Card>
          <CardContent className="p-4 sm:p-6">
            <NotificationsTab />
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="messages">
        <Card>
          <CardContent className="p-4 sm:p-6">
            <MessagingTab />
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="friends">
        <Card>
          <CardContent className="p-4 sm:p-6">
            <FriendsTab />
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
