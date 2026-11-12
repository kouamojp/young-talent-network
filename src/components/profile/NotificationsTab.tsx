import React, { useEffect, useState } from 'react';
import GlassMorphism from '@/components/GlassMorphism';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bell, MessageSquare, UserPlus, Calendar, Trophy, Heart, Check, MessageCircle, Briefcase, GraduationCap, FileSignature, ShieldCheck, Phone } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { tr } from '@/i18n';
import type { TranslationKey } from '@/i18n/types';
import en from '@/i18n/locales/en.json';
import { dateFnsLocale } from '@/i18n/format';

interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message: string | null;
  link: string | null;
  read: boolean;
  created_at: string;
  data?: { name?: string; title?: string; excerpt?: string } | null;
}

/**
 * Text of a notification in the reader's language. Automatic notifications
 * carry a `type` and `data` (see migration automatic_notifications); older or
 * custom ones only have the stored `title`.
 */
const notificationText = (n: Notification): string => {
  const key = `notif.${n.type}`;
  if (!(key in en)) return n.title;
  return tr(key as TranslationKey, { name: n.data?.name || tr('notif.someone'), title: n.data?.title || '' }).replace(/\s*:\s*$/, '');
};

const getIcon = (type: string) => {
  switch (type) {
    case 'message': return <MessageSquare className="h-5 w-5 text-blue-500" />;
    case 'friend':
    case 'connection':
    case 'connection_accepted': return <UserPlus className="h-5 w-5 text-green-500" />;
    case 'comment': return <MessageCircle className="h-5 w-5 text-sky-500" />;
    case 'application': return <Briefcase className="h-5 w-5 text-orange-500" />;
    case 'enrollment': return <GraduationCap className="h-5 w-5 text-indigo-500" />;
    case 'contract':
    case 'contract_accepted':
    case 'contract_declined': return <FileSignature className="h-5 w-5 text-teal-500" />;
    case 'verification_approved':
    case 'verification_rejected':
    case 'verification_info': return <ShieldCheck className="h-5 w-5 text-emerald-500" />;
    case 'call': return <Phone className="h-5 w-5 text-red-500" />;
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
  const navigate = useNavigate();

  const openNotification = (n: Notification) => {
    if (!n.read) markRead(n.id);
    if (n.link) navigate(n.link);
  };

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
    if (error) { toast.error(tr('settings.error')); return; }
    setItems(prev => prev.map(n => ({ ...n, read: true })));
    toast.success(tr('notificationsTab.allMarkedAsRead'));
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
          <Card key={n.id} className={`${n.read ? 'opacity-70' : 'border-primary/30'} ${n.link ? 'cursor-pointer hover:bg-muted/50 transition-colors' : ''}`} onClick={() => openNotification(n)}>
            <CardContent className="p-3 flex items-start gap-3">
              <div className="mt-0.5">{getIcon(n.type)}</div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm ${n.read ? 'font-normal' : 'font-semibold'}`}>{notificationText(n)}</p>
                {(n.data?.excerpt || n.message) && <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2 break-words">{n.data?.excerpt || n.message}</p>}
                <p className="text-[10px] text-muted-foreground mt-1">
                  {formatDistanceToNow(new Date(n.created_at), { addSuffix: true, locale: dateFnsLocale() })}
                </p>
              </div>
              {!n.read && (
                <Button size="icon" variant="ghost" className="h-7 w-7" onClick={(e) => { e.stopPropagation(); markRead(n.id); }} title={tr('notificationsTab.markAsRead')}>
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
          <h3 className="text-xl font-bold">{tr('nav.notifications')}</h3>
          {unreadCount > 0 && (
            <span className="bg-red-500 text-white text-xs rounded-full px-2 py-0.5">{unreadCount}</span>
          )}
        </div>
        {unreadCount > 0 && (
          <Button size="sm" variant="outline" onClick={markAllRead}>{tr('notificationsTab.markAllAsRead')}</Button>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full" />
        </div>
      ) : (
        <Tabs defaultValue="all">
          <TabsList className="mb-4 flex-wrap h-auto">
            <TabsTrigger value="all">{tr('events.allCategories')}</TabsTrigger>
            <TabsTrigger value="unread">{tr('notificationsTab.unread')}{unreadCount})</TabsTrigger>
            <TabsTrigger value="message">{tr('settings.messagesNotif')}</TabsTrigger>
            <TabsTrigger value="connection">{tr('sidebar.friends')}</TabsTrigger>
            <TabsTrigger value="activity">{tr('notif.tabActivity')}</TabsTrigger>
            <TabsTrigger value="event">{tr('landing.events')}</TabsTrigger>
          </TabsList>

          <TabsContent value="all">{renderList(items, tr('notificationsTab.noNotificationsYet'))}</TabsContent>
          <TabsContent value="unread">{renderList(items.filter(n => !n.read), tr('notificationsTab.allCaughtUp'))}</TabsContent>
          <TabsContent value="message">{renderList(filterByType('message'), tr('notificationsTab.noNotificationsYet'))}</TabsContent>
          <TabsContent value="connection">{renderList(items.filter(n => n.type.startsWith('connection') || n.type === 'friend'), tr('notificationsTab.noFriendRequests'))}</TabsContent>
          <TabsContent value="activity">{renderList(items.filter(n => ['like', 'comment', 'application', 'enrollment'].includes(n.type) || n.type.startsWith('contract') || n.type.startsWith('verification')), tr('notificationsTab.noNotificationsYet'))}</TabsContent>
          <TabsContent value="event">{renderList(filterByType('event'), tr('events.noEvents'))}</TabsContent>
        </Tabs>
      )}
    </GlassMorphism>
  );
};

export default NotificationsTab;
