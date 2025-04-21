
import React, { useState } from 'react';
import GlassMorphism from '@/components/GlassMorphism';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, UserPlus, Users, Phone, Link as LinkIcon, Instagram, Facebook } from 'lucide-react';

// Sample friends data
const sampleFriends = [
  {
    id: 1,
    name: 'Maria Garcia',
    avatar: '/placeholder.svg',
    sport: 'Swimming',
    mutualFriends: 5,
    isMentorOrCoach: false
  },
  {
    id: 2,
    name: 'David Chen',
    avatar: '/placeholder.svg',
    sport: 'Soccer',
    mutualFriends: 12,
    isMentorOrCoach: false
  },
  {
    id: 3,
    name: 'Coach Williams',
    avatar: '/placeholder.svg',
    sport: 'Basketball',
    mutualFriends: 0,
    isMentorOrCoach: true
  },
  {
    id: 4,
    name: 'Sarah Johnson',
    avatar: '/placeholder.svg',
    sport: 'Tennis',
    mutualFriends: 3,
    isMentorOrCoach: false
  }
];

// Sample friend requests data
const sampleFriendRequests = [
  {
    id: 101,
    name: 'Michael Jordan',
    avatar: '/placeholder.svg',
    sport: 'Basketball',
    mutualFriends: 2
  },
  {
    id: 102,
    name: 'Emma Davis',
    avatar: '/placeholder.svg',
    sport: 'Volleyball',
    mutualFriends: 8
  }
];

// Sample suggested friends data
const suggestedFriends = [
  {
    id: 201,
    name: 'Carlos Rodriguez',
    avatar: '/placeholder.svg',
    sport: 'Football',
    mutualFriends: 15
  },
  {
    id: 202,
    name: 'Sophia Kim',
    avatar: '/placeholder.svg',
    sport: 'Gymnastics',
    mutualFriends: 4
  },
  {
    id: 203,
    name: 'James Wilson',
    avatar: '/placeholder.svg',
    sport: 'Track & Field',
    mutualFriends: 7
  }
];

const FriendsTab: React.FC = () => {
  const [friends, setFriends] = useState(sampleFriends);
  const [friendRequests, setFriendRequests] = useState(sampleFriendRequests);
  const [searchQuery, setSearchQuery] = useState('');
  
  const handleAcceptFriendRequest = (id: number) => {
    const acceptedRequest = friendRequests.find(request => request.id === id);
    if (acceptedRequest) {
      setFriends([...friends, { ...acceptedRequest, isMentorOrCoach: false }]);
      setFriendRequests(friendRequests.filter(request => request.id !== id));
    }
  };
  
  const handleRejectFriendRequest = (id: number) => {
    setFriendRequests(friendRequests.filter(request => request.id !== id));
  };
  
  const handleAddFriend = () => {
    // This would open a dialog to add a friend
    console.log('Add friend');
  };

  return (
    <GlassMorphism className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          <h3 className="text-xl font-bold">Friends & Connections</h3>
          <span className="bg-blue-100 text-blue-800 text-xs rounded-full px-2 py-0.5">
            {friends.length}
          </span>
        </div>
        <Button onClick={handleAddFriend} className="flex items-center gap-2">
          <UserPlus className="h-4 w-4" />
          Add Friend
        </Button>
      </div>

      <Tabs defaultValue="friends">
        <TabsList className="mb-4">
          <TabsTrigger value="friends">All Friends</TabsTrigger>
          <TabsTrigger value="requests">
            Friend Requests
            {friendRequests.length > 0 && (
              <span className="ml-2 bg-red-500 text-white text-xs rounded-full px-2 py-0.5">
                {friendRequests.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="suggested">Suggested</TabsTrigger>
          <TabsTrigger value="discover">Discover</TabsTrigger>
        </TabsList>

        <TabsContent value="friends">
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search friends..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {friends
              .filter(friend => friend.name.toLowerCase().includes(searchQuery.toLowerCase()))
              .map(friend => (
                <Card key={friend.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className="w-12 h-12 rounded-full bg-gray-200 overflow-hidden">
                          <img src={friend.avatar} alt="" className="w-full h-full object-cover" />
                        </div>
                        {friend.isMentorOrCoach && (
                          <div className="absolute -bottom-1 -right-1 bg-yellow-400 text-white text-xs rounded-full p-1">
                            👨‍🏫
                          </div>
                        )}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium">{friend.name}</h4>
                          {friend.isMentorOrCoach && (
                            <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded">
                              Mentor
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">{friend.sport}</p>
                        {friend.mutualFriends > 0 && (
                          <p className="text-xs text-gray-500 mt-1">
                            {friend.mutualFriends} mutual connections
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex justify-end mt-3 gap-2">
                      <Button size="sm" variant="outline">Message</Button>
                      <Button size="sm" variant="outline">View Profile</Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </TabsContent>

        <TabsContent value="requests">
          {friendRequests.length > 0 ? (
            <div className="space-y-4">
              {friendRequests.map(request => (
                <Card key={request.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-gray-200 overflow-hidden">
                        <img src={request.avatar} alt="" className="w-full h-full object-cover" />
                      </div>
                      
                      <div className="flex-1">
                        <h4 className="font-medium">{request.name}</h4>
                        <p className="text-sm text-gray-600">{request.sport}</p>
                        {request.mutualFriends > 0 && (
                          <p className="text-xs text-gray-500 mt-1">
                            {request.mutualFriends} mutual connections
                          </p>
                        )}
                      </div>
                      
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          onClick={() => handleAcceptFriendRequest(request.id)}
                        >
                          Accept
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleRejectFriendRequest(request.id)}
                        >
                          Decline
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Users className="h-10 w-10 mx-auto mb-3 text-gray-300" />
              <p>No pending friend requests</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="suggested">
          <div className="space-y-4">
            {suggestedFriends.map(suggested => (
              <Card key={suggested.id}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gray-200 overflow-hidden">
                      <img src={suggested.avatar} alt="" className="w-full h-full object-cover" />
                    </div>
                    
                    <div className="flex-1">
                      <h4 className="font-medium">{suggested.name}</h4>
                      <p className="text-sm text-gray-600">{suggested.sport}</p>
                      {suggested.mutualFriends > 0 && (
                        <p className="text-xs text-gray-500 mt-1">
                          {suggested.mutualFriends} mutual connections
                        </p>
                      )}
                    </div>
                    
                    <Button size="sm">Add Friend</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="discover">
          <div className="space-y-6">
            <Card>
              <CardContent className="p-4">
                <h4 className="font-medium mb-3">Find Friends</h4>
                <div className="space-y-3">
                  <Button className="w-full justify-start" variant="outline">
                    <Phone className="h-4 w-4 mr-2" />
                    Find Friends from Contacts
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <Instagram className="h-4 w-4 mr-2" />
                    Connect with Instagram
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <Facebook className="h-4 w-4 mr-2" />
                    Connect with Facebook
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <h4 className="font-medium mb-3">Add Friend by Username</h4>
                <div className="flex gap-2">
                  <Input placeholder="Enter username or Y&T ID" className="flex-1" />
                  <Button>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Add
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <h4 className="font-medium mb-3">Invite via Link</h4>
                <div className="flex gap-2">
                  <Input 
                    value="https://young-talented.com/invite/alexj" 
                    readOnly 
                    className="flex-1 bg-gray-50"
                  />
                  <Button variant="outline">
                    <LinkIcon className="h-4 w-4 mr-2" />
                    Copy
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </GlassMorphism>
  );
};

export default FriendsTab;
