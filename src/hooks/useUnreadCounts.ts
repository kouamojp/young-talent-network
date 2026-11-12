import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

/**
 * Live counts of unread received messages and unread notifications for the
 * signed-in user. RLS on `messages` already limits rows to the user's own
 * conversations, so a simple filtered count is enough.
 */
export const useUnreadCounts = () => {
  const [messages, setMessages] = useState(0);
  const [notifications, setNotifications] = useState(0);

  useEffect(() => {
    let channel: ReturnType<typeof supabase.channel> | null = null;
    let cancelled = false;

    const refresh = async (uid: string) => {
      const [msg, notif] = await Promise.all([
        supabase.from('messages').select('id', { count: 'exact', head: true }).eq('read', false).neq('sender_id', uid),
        supabase.from('notifications').select('id', { count: 'exact', head: true }).eq('user_id', uid).eq('read', false),
      ]);
      if (cancelled) return;
      setMessages(msg.count ?? 0);
      setNotifications(notif.count ?? 0);
    };

    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || cancelled) return;
      await refresh(user.id);
      channel = supabase
        .channel(`unread-counts-${user.id}-${Math.random().toString(36).slice(2)}`)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'messages' }, () => refresh(user.id))
        .on('postgres_changes', { event: '*', schema: 'public', table: 'notifications', filter: `user_id=eq.${user.id}` }, () => refresh(user.id))
        .subscribe();
    })();

    return () => {
      cancelled = true;
      if (channel) supabase.removeChannel(channel);
    };
  }, []);

  return { messages, notifications };
};

export const formatBadge = (n: number) => (n > 99 ? '99+' : String(n));
