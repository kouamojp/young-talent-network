
import React, { useEffect, useState } from 'react';
import GlassMorphism from '@/components/GlassMorphism';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Search, UserPlus, Users, Loader2, UserCheck, UserX } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';

interface Profile {
  id: string;
  name: string | null;
  avatar_url: string | null;
  user_type?: string | null;
  country?: string | null;
  sport_type?: string | null;
}

interface Connection {
  id: string;
  user_id: string;
  connected_user_id: string;
  status: string;
  requester?: Profile;
  receiver?: Profile;
}

const FriendsTab: React.FC = () => {
  const navigate = useNavigate();
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [pendingRequests, setPendingRequests] = useState<Connection[]>([]);
  const [suggested, setSuggested] = useState<Profile[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  const goToProfile = (u?: Profile | null) => {
    if (!u?.id) return;
    if (u.user_type === 'organization') navigate(`/organization/${u.id}`);
    else if (u.user_type === 'agent') navigate(`/agent/${u.id}`);
    else navigate(`/talent/${u.id}`);
  };

  const loadData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }
    setCurrentUserId(user.id);

    const [connectionsRes, suggestedRes] = await Promise.all([
      supabase
        .from('connections')
        .select('*, requester:profiles!connections_user_id_fkey(id, name, avatar_url, user_type, country, sport_type), receiver:profiles!connections_connected_user_id_fkey(id, name, avatar_url, user_type, country, sport_type)')
        .or(`user_id.eq.${user.id},connected_user_id.eq.${user.id}`),
      supabase
        .from('profiles')
        .select('id, name, avatar_url, user_type, country, sport_type')
        .neq('id', user.id)
        .limit(50),
    ]);

    const conns = (connectionsRes.data || []) as Connection[];
    setConnections(conns.filter(c => c.status === 'accepted'));
    setPendingRequests(conns.filter(c => c.status === 'pending'));

    const connectedIds = new Set<string>();
    conns.forEach(c => {
      connectedIds.add(c.user_id);
      connectedIds.add(c.connected_user_id);
    });
    setSuggested((suggestedRes.data || []).filter((p: Profile) => !connectedIds.has(p.id)));
    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  const acceptRequest = async (req: Connection) => {
    const { error } = await supabase.from('connections').update({ status: 'accepted' }).eq('id', req.id);
    if (error) { toast({ title: 'Erreur', description: error.message, variant: 'destructive' }); return; }
    setPendingRequests(prev => prev.filter(p => p.id !== req.id));
    setConnections(prev => [...prev, { ...req, status: 'accepted' }]);
    toast({ title: 'Demande acceptée' });
  };

  const declineRequest = async (req: Connection) => {
    const { error } = await supabase.from('connections').delete().eq('id', req.id);
    if (error) { toast({ title: 'Erreur', description: error.message, variant: 'destructive' }); return; }
    setPendingRequests(prev => prev.filter(p => p.id !== req.id));
  };

  const sendFriendRequest = async (userId: string) => {
    if (!currentUserId) return;
    const { error } = await supabase.from('connections').insert({ user_id: currentUserId, connected_user_id: userId });
    if (error) { toast({ title: 'Erreur', description: error.message, variant: 'destructive' }); return; }
    setSuggested(prev => prev.filter(p => p.id !== userId));
    toast({ title: 'Demande envoyée' });
  };

  const acceptedFriends = connections
    .map(conn => (conn.user_id === currentUserId ? conn.receiver : conn.requester))
    .filter((f): f is Profile => !!f);

  const incomingRequests = pendingRequests.filter(r => r.connected_user_id === currentUserId);

  if (loading) {
    return (
      <GlassMorphism className="p-6">
        <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
      </GlassMorphism>
    );
  }

  return (
    <GlassMorphism className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          <h3 className="text-xl font-bold">Friends & Connections</h3>
          <span className="bg-blue-100 text-blue-800 text-xs rounded-full px-2 py-0.5">
            {acceptedFriends.length}
          </span>
        </div>
        <Button onClick={() => navigate('/friends')} className="flex items-center gap-2">
          <UserPlus className="h-4 w-4" />
          Add Friend
        </Button>
      </div>

      <Tabs defaultValue="friends">
        <TabsList className="mb-4">
          <TabsTrigger value="friends">All Friends</TabsTrigger>
          <TabsTrigger value="requests">
            Friend Requests
            {incomingRequests.length > 0 && (
              <span className="ml-2 bg-red-500 text-white text-xs rounded-full px-2 py-0.5">
                {incomingRequests.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="suggested">Suggested</TabsTrigger>
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

          {acceptedFriends.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Users className="h-10 w-10 mx-auto mb-3 text-gray-300" />
              <p>No friends yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {acceptedFriends
                .filter(friend => (friend.name || '').toLowerCase().includes(searchQuery.toLowerCase()))
                .map(friend => (
                  <Card key={friend.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-12 w-12 cursor-pointer" onClick={() => goToProfile(friend)}>
                          <AvatarImage src={friend.avatar_url || undefined} />
                          <AvatarFallback>{friend.name?.[0] || 'U'}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <h4 className="font-medium">{friend.name}</h4>
                          <p className="text-sm text-gray-600">{friend.sport_type || friend.user_type || ''}</p>
                          {friend.country && (
                            <p className="text-xs text-gray-500 mt-1">{friend.country}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex justify-end mt-3 gap-2">
                        <Button size="sm" variant="outline" onClick={() => navigate('/messages')}>Message</Button>
                        <Button size="sm" variant="outline" onClick={() => goToProfile(friend)}>View Profile</Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="requests">
          {incomingRequests.length > 0 ? (
            <div className="space-y-4">
              {incomingRequests.map(request => {
                const other = request.requester;
                return (
                  <Card key={request.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-12 w-12 cursor-pointer" onClick={() => goToProfile(other)}>
                          <AvatarImage src={other?.avatar_url || undefined} />
                          <AvatarFallback>{other?.name?.[0] || 'U'}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <h4 className="font-medium">{other?.name || 'Utilisateur'}</h4>
                          <p className="text-sm text-gray-600">{other?.sport_type || other?.user_type || ''}</p>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" onClick={() => acceptRequest(request)}>
                            <UserCheck className="h-4 w-4 mr-1" />Accept
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => declineRequest(request)}>
                            <UserX className="h-4 w-4 mr-1" />Decline
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Users className="h-10 w-10 mx-auto mb-3 text-gray-300" />
              <p>No pending friend requests</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="suggested">
          {suggested.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <UserPlus className="h-10 w-10 mx-auto mb-3 text-gray-300" />
              <p>No suggestions right now</p>
            </div>
          ) : (
            <div className="space-y-4">
              {suggested.map(person => (
                <Card key={person.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-12 w-12 cursor-pointer" onClick={() => goToProfile(person)}>
                        <AvatarImage src={person.avatar_url || undefined} />
                        <AvatarFallback>{person.name?.[0] || 'U'}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <h4 className="font-medium">{person.name}</h4>
                        <p className="text-sm text-gray-600">{person.sport_type || person.user_type || ''}</p>
                        {person.country && (
                          <p className="text-xs text-gray-500 mt-1">{person.country}</p>
                        )}
                      </div>
                      <Button size="sm" onClick={() => sendFriendRequest(person.id)}>
                        <UserPlus className="h-4 w-4 mr-1" />Add Friend
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </GlassMorphism>
  );
};

export default FriendsTab;
