import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, UserPlus, UserCheck, UserX, Users, MessageSquare, Loader2 } from 'lucide-react';
import { useLanguage } from '@/i18n/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/components/ui/use-toast';

const Friends: React.FC = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [connections, setConnections] = useState<any[]>([]);
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  const [allUsers, setAllUsers] = useState<any[]>([]);

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { navigate('/auth'); return; }
      setCurrentUserId(user.id);
      
      const [connectionsRes, allUsersRes] = await Promise.all([
        supabase.from('connections').select('*, requester:profiles!connections_user_id_fkey(id, name, avatar_url, user_type, country, sport_type), receiver:profiles!connections_connected_user_id_fkey(id, name, avatar_url, user_type, country, sport_type)').or(`user_id.eq.${user.id},connected_user_id.eq.${user.id}`),
        supabase.from('profiles').select('id, name, avatar_url, user_type, country, sport_type').neq('id', user.id).limit(50),
      ]);

      if (connectionsRes.data) {
        setConnections(connectionsRes.data.filter(c => c.status === 'accepted'));
        setPendingRequests(connectionsRes.data.filter(c => c.status === 'pending'));
      }
      if (allUsersRes.data) setAllUsers(allUsersRes.data);
      setLoading(false);
    };
    init();
  }, [navigate]);

  const sendFriendRequest = async (userId: string) => {
    if (!currentUserId) return;
    const { error } = await supabase.from('connections').insert({ user_id: currentUserId, connected_user_id: userId });
    if (!error) {
      toast({ title: t('friends.requestSent') });
      setPendingRequests(prev => [...prev, { user_id: currentUserId, connected_user_id: userId, status: 'pending' }]);
    } else {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const acceptRequest = async (req: any) => {
    const { error } = await supabase.from('connections').update({ status: 'accepted' }).eq('id', req.id);
    if (error) { toast({ title: 'Error', description: error.message, variant: 'destructive' }); return; }
    setPendingRequests(prev => prev.filter(p => p.id !== req.id));
    setConnections(prev => [...prev, { ...req, status: 'accepted', profiles: req.requester }]);
    toast({ title: t('friends.accept') });
  };

  const declineRequest = async (req: any) => {
    const { error } = await supabase.from('connections').delete().eq('id', req.id);
    if (error) { toast({ title: 'Error', description: error.message, variant: 'destructive' }); return; }
    setPendingRequests(prev => prev.filter(p => p.id !== req.id));
  };

  const isConnected = (userId: string) => connections.some(c => c.user_id === userId || c.connected_user_id === userId);
  const isPending = (userId: string) => pendingRequests.some(c => c.connected_user_id === userId || c.user_id === userId);

  const filteredUsers = allUsers.filter(u =>
    u.name?.toLowerCase().includes(searchTerm.toLowerCase()) &&
    !isConnected(u.id)
  );

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-3">
        <Users className="h-7 w-7 text-primary" />
        <h1 className="text-2xl font-bold">{t('friends.title')}</h1>
      </div>

      <Tabs defaultValue="friends" className="space-y-4">
        <TabsList>
          <TabsTrigger value="friends">{t('friends.myFriends')} ({connections.length})</TabsTrigger>
          <TabsTrigger value="requests">{t('friends.requests')} ({pendingRequests.length})</TabsTrigger>
          <TabsTrigger value="discover">{t('friends.discover')}</TabsTrigger>
        </TabsList>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder={t('friends.searchFriends')} value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-10" />
        </div>

        <TabsContent value="friends" className="space-y-3">
          {connections.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>{t('friends.noFriends')}</p>
            </div>
          ) : (
            connections.map(conn => {
              const friend = conn.profiles;
              if (!friend) return null;
              return (
                <Card key={conn.id}>
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={friend.avatar_url} />
                        <AvatarFallback>{friend.name?.[0] || 'U'}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{friend.name}</p>
                        <p className="text-sm text-muted-foreground">{friend.country || ''} • {friend.user_type}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => navigate('/messages')}><MessageSquare className="h-4 w-4" /></Button>
                      <Button size="sm" variant="outline" onClick={() => navigate(`/talent/${friend.id}`)}>{t('common.view')}</Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </TabsContent>

        <TabsContent value="requests" className="space-y-3">
          {pendingRequests.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <UserPlus className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>{t('friends.noRequests')}</p>
            </div>
          ) : (
            pendingRequests.map(req => (
              <Card key={req.id}>
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12"><AvatarFallback>U</AvatarFallback></Avatar>
                    <div>
                      <p className="font-medium">{t('friends.pendingRequest')}</p>
                      <Badge variant="secondary">{t('friends.pending')}</Badge>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm"><UserCheck className="h-4 w-4 mr-1" />{t('friends.accept')}</Button>
                    <Button size="sm" variant="outline"><UserX className="h-4 w-4 mr-1" />{t('friends.decline')}</Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="discover" className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filteredUsers.map(user => (
              <Card key={user.id}>
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={user.avatar_url} />
                      <AvatarFallback>{user.name?.[0] || 'U'}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{user.name}</p>
                      <p className="text-xs text-muted-foreground">{user.country || ''} • {user.user_type}</p>
                    </div>
                  </div>
                  <Button size="sm" disabled={isPending(user.id)} onClick={() => sendFriendRequest(user.id)}>
                    <UserPlus className="h-4 w-4 mr-1" />
                    {isPending(user.id) ? t('friends.pending') : t('friends.addFriend')}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Friends;
