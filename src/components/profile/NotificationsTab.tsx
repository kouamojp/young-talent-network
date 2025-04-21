
import React from 'react';
import GlassMorphism from '@/components/GlassMorphism';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bell, MessageSquare, UserPlus, Calendar, Trophy, Settings } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Sample notification data
const notifications = [
  {
    id: 1,
    type: 'message',
    content: 'Coach Williams sent you a message',
    timestamp: '10 minutes ago',
    read: false
  },
  {
    id: 2,
    type: 'friend',
    content: 'Maria Garcia sent you a friend request',
    timestamp: '1 hour ago',
    read: false
  },
  {
    id: 3,
    type: 'event',
    content: 'Regional Basketball Tournament starts tomorrow',
    timestamp: '3 hours ago',
    read: true
  },
  {
    id: 4,
    type: 'achievement',
    content: 'Congratulations! You were featured in "Rising Stars to Watch"',
    timestamp: '1 day ago',
    read: true
  },
  {
    id: 5,
    type: 'message',
    content: 'David Chen replied to your comment',
    timestamp: '2 days ago',
    read: true
  }
];

const getNotificationIcon = (type: string) => {
  switch (type) {
    case 'message':
      return <MessageSquare className="h-5 w-5 text-blue-500" />;
    case 'friend':
      return <UserPlus className="h-5 w-5 text-green-500" />;
    case 'event':
      return <Calendar className="h-5 w-5 text-purple-500" />;
    case 'achievement':
      return <Trophy className="h-5 w-5 text-amber-500" />;
    default:
      return <Bell className="h-5 w-5 text-gray-500" />;
  }
};

const NotificationsTab: React.FC = () => {
  return (
    <GlassMorphism className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          <h3 className="text-xl font-bold">Notifications</h3>
          <span className="bg-red-500 text-white text-xs rounded-full px-2 py-0.5">
            {notifications.filter(n => !n.read).length}
          </span>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline">
            Mark All Read
          </Button>
          <Button size="sm" variant="ghost">
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Tabs defaultValue="all">
        <TabsList className="mb-4">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="unread">Unread</TabsTrigger>
          <TabsTrigger value="messages">Messages</TabsTrigger>
          <TabsTrigger value="friends">Friends</TabsTrigger>
          <TabsTrigger value="events">Events</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <div className="space-y-3">
            {notifications.map(notification => (
              <Card key={notification.id} className={notification.read ? 'opacity-75' : ''}>
                <CardContent className="p-4 flex items-start gap-3">
                  <div className="mt-1">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1">
                    <p className={`${notification.read ? 'font-normal' : 'font-medium'}`}>
                      {notification.content}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">{notification.timestamp}</p>
                  </div>
                  {!notification.read && (
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="unread">
          <div className="space-y-3">
            {notifications.filter(n => !n.read).map(notification => (
              <Card key={notification.id}>
                <CardContent className="p-4 flex items-start gap-3">
                  <div className="mt-1">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{notification.content}</p>
                    <p className="text-xs text-gray-500 mt-1">{notification.timestamp}</p>
                  </div>
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                </CardContent>
              </Card>
            ))}
            
            {notifications.filter(n => !n.read).length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Bell className="h-10 w-10 mx-auto mb-3 text-gray-300" />
                <p>You have no unread notifications</p>
              </div>
            )}
          </div>
        </TabsContent>

        {['messages', 'friends', 'events'].map(tab => (
          <TabsContent key={tab} value={tab}>
            <div className="space-y-3">
              {notifications.filter(n => n.type === tab.slice(0, -1)).map(notification => (
                <Card key={notification.id} className={notification.read ? 'opacity-75' : ''}>
                  <CardContent className="p-4 flex items-start gap-3">
                    <div className="mt-1">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1">
                      <p className={`${notification.read ? 'font-normal' : 'font-medium'}`}>
                        {notification.content}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">{notification.timestamp}</p>
                    </div>
                    {!notification.read && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                    )}
                  </CardContent>
                </Card>
              ))}
              
              {notifications.filter(n => n.type === tab.slice(0, -1)).length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <p>No {tab} notifications</p>
                </div>
              )}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </GlassMorphism>
  );
};

export default NotificationsTab;
