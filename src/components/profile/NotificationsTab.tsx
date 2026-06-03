import React, { useEffect, useState } from 'react';
import GlassMorphism from '@/components/GlassMorphism';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bell, MessageSquare, UserPlus, Calendar, Trophy, Heart, Check } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { toast } from 'sonner';

interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message: string | null;
  link: string | null;
  read: boolean;
  created_at: string;
}

const getIcon = (type: string) => {
  switch (type) {
    case 'message': return <MessageSquare className="h-5 w-5 text-blue-500" />;
    case 'friend':
    case 'connection': return <UserPlus className="h-5 w-5 text-green-500" />;
    case 'event': return <Calendar className="h-5 w-5 text-purple-500" />;
    case 'achievement':
    case 'badge': return <Trophy className="h-5 w-5 text-amber-500" />;
    case 'like': return <Heart className="h-5 w-5 text-pink-500" />;
    default: return <Bell className="h-5 w-5 text-muted-foreground" />;
  }
};

const NotificationsTab: React.FC = () => {
  const [items, setItems] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  const fetchNotifications = async (uid: string) => {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', uid)
      .order('created_at', { ascending: false })
      .limit(100);
    if (!error && data) setItems(data as Notification[]);
    setLoading(false);
  };

  useEffect(() => {
    let channel: any;
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }
      setUserId(user.id);
      await fetchNotifications(user.id);
      channel = supabase
        .channel(`notifications-${user.id}`)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'notifications', filter: `user_id=eq.${user.id}` }, () => fetchNotifications(user.id))
        .subscribe();
    })();
    return () => { if (channel) supabase.removeChannel(channel); };
  }, []);

  const markAllRead = async () => {
    if (!userId) return;
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('user_id', userId)
      .eq('read', false);
    if (error) { toast.error('Erreur'); return; }
    setItems(prev => prev.map(n => ({ ...n, read: true })));
    toast.success('Toutes marquées comme lues');
  };

  const markRead = async (id: string) => {
    await supabase.from('notifications').update({ read: true }).eq('id', id);
    setItems(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const filterByType = (type?: string) =>
    type ? items.filter(n => n.type === type) : items;

  const unreadCount = items.filter(n => !n.read).length;

  const renderList = (list: Notification[], emptyLabel: string) => {
    if (list.length === 0) {
      return (
        <div className="text-center py-12 text-muted-foreground">
          <Bell className="h-10 w-10 mx-auto mb-3 opacity-30" />
          <p>{emptyLabel}</p>
        </div>
      );
    }
    return (
      <div className="space-y-2">
        {list.map(n => (
          <Card key={n.id} className={n.read ? 'opacity-70' : 'border-primary/30'}>
            <CardContent className="p-3 flex items-start gap-3">
              <div className="mt-0.5">{getIcon(n.type)}</div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm ${n.read ? 'font-normal' : 'font-semibold'}`}>{n.title}</p>
                {n.message && <p className="text-xs text-muted-foreground mt-0.5">{n.message}</p>}
                <p className="text-[10px] text-muted-foreground mt-1">
                  {formatDistanceToNow(new Date(n.created_at), { addSuffix: true, locale: fr })}
                </p>
              </div>
              {!n.read && (
                <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => markRead(n.id)} title="Marquer comme lu">
                  <Check className="h-4 w-4" />
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  return (
    <GlassMorphism className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          <h3 className="text-xl font-bold">Notifications</h3>
          {unreadCount > 0 && (
            <span className="bg-red-500 text-white text-xs rounded-full px-2 py-0.5">{unreadCount}</span>
          )}
        </div>
        {unreadCount > 0 && (
          <Button size="sm" variant="outline" onClick={markAllRead}>Tout marquer lu</Button>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full" />
        </div>
      ) : (
        <Tabs defaultValue="all">
          <TabsList className="mb-4 flex-wrap h-auto">
            <TabsTrigger value="all">Toutes</TabsTrigger>
            <TabsTrigger value="unread">Non lues ({unreadCount})</TabsTrigger>
            <TabsTrigger value="message">Messages</TabsTrigger>
            <TabsTrigger value="connection">Amis</TabsTrigger>
            <TabsTrigger value="event">Événements</TabsTrigger>
          </TabsList>

          <TabsContent value="all">{renderList(items, 'Aucune notification pour le moment')}</TabsContent>
          <TabsContent value="unread">{renderList(items.filter(n => !n.read), 'Tout est à jour')}</TabsContent>
          <TabsContent value="message">{renderList(filterByType('message'), 'Aucun message')}</TabsContent>
          <TabsContent value="connection">{renderList(filterByType('connection'), "Aucune demande d'ami")}</TabsContent>
          <TabsContent value="event">{renderList(filterByType('event'), 'Aucun événement')}</TabsContent>
        </Tabs>
      )}
    </GlassMorphism>
  );
};

export default NotificationsTab;
