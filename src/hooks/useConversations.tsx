import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

export interface Message {
  id: string;
  content: string;
  sender_id: string;
  created_at: string;
  read: boolean;
  media_url?: string | null;
  media_type?: string | null;
  forwarded_from_id?: string | null;
}

export interface Conversation {
  id: string;
  is_group?: boolean;
  name?: string | null;
  participants: {
    user_id: string;
    profiles: {
      name: string;
      avatar_url: string | null;
    };
  }[];
  messages: Message[];
}

export const useConversations = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  useEffect(() => {
    if (currentUserId) {
      fetchConversations();
      const cleanup = subscribeToMessages();
      return cleanup;
    }
  }, [currentUserId]);

  const fetchCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setCurrentUserId(user?.id || null);
  };

  const fetchConversations = async () => {
    if (!currentUserId) return;

    setLoading(true);
    try {
      const { data: participantsData, error: participantsError } = await supabase
        .from('conversation_participants')
        .select(`conversation_id, conversations (id, created_at, is_group, name)`)
        .eq('user_id', currentUserId);

      if (participantsError) throw participantsError;

      const conversationIds = participantsData.map(p => p.conversation_id);

      if (conversationIds.length === 0) {
        setConversations([]);
        setLoading(false);
        return;
      }

      const { data: allParticipants } = await supabase
        .from('conversation_participants')
        .select(`conversation_id, user_id, profiles (name, avatar_url)`)
        .in('conversation_id', conversationIds);

      const { data: messages } = await supabase
        .from('messages')
        .select('*')
        .in('conversation_id', conversationIds)
        .order('created_at', { ascending: false });

      const convMap = new Map<string, Conversation>();
      participantsData.forEach(p => {
        const conv: any = p.conversations;
        convMap.set(p.conversation_id, {
          id: p.conversation_id,
          is_group: conv?.is_group,
          name: conv?.name,
          participants: (allParticipants || [])
            .filter(ap => ap.conversation_id === p.conversation_id && ap.user_id !== currentUserId)
            .map(ap => ({ user_id: ap.user_id, profiles: ap.profiles as any })),
          messages: (messages || []).filter(m => m.conversation_id === p.conversation_id) as any,
        });
      });

      setConversations(Array.from(convMap.values()));
    } catch (error) {
      console.error('Error fetching conversations:', error);
      toast({ title: "Failed to load conversations", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const subscribeToMessages = () => {
    const channel = supabase
      .channel('messages-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'messages' }, () => {
        fetchConversations();
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  };

  const createConversation = async (participantId: string) => {
    if (!currentUserId) return null;
    try {
      const { data, error } = await supabase.rpc('create_conversation_with_participant', { _other_user_id: participantId });
      if (error) throw error;
      await fetchConversations();
      return data as string;
    } catch (error: any) {
      toast({ title: "Failed to create conversation", description: error?.message, variant: "destructive" });
      return null;
    }
  };

  const createGroupConversation = async (name: string, userIds: string[]) => {
    if (!currentUserId) return null;
    try {
      const { data, error } = await (supabase.rpc as any)('create_group_conversation', { _name: name, _user_ids: userIds });
      if (error) throw error;
      await fetchConversations();
      return data as string;
    } catch (error: any) {
      toast({ title: "Failed to create group", description: error?.message, variant: "destructive" });
      return null;
    }
  };

  const sendMessage = async (
    conversationId: string,
    content: string,
    extras?: { media_url?: string; media_type?: string; forwarded_from_id?: string }
  ) => {
    if (!currentUserId) return;
    if (!content.trim() && !extras?.media_url) return;
    try {
      const { error } = await supabase.from('messages').insert({
        conversation_id: conversationId,
        sender_id: currentUserId,
        content: content.trim() || '',
        ...(extras || {}),
      } as any);
      if (error) throw error;
    } catch (error) {
      toast({ title: "Failed to send message", variant: "destructive" });
    }
  };

  const markMessageRead = async (messageId: string, read: boolean) => {
    try {
      await supabase.from('messages').update({ read } as any).eq('id', messageId);
      await fetchConversations();
    } catch (e) {
      console.error(e);
    }
  };

  return {
    conversations,
    loading,
    currentUserId,
    createConversation,
    createGroupConversation,
    sendMessage,
    markMessageRead,
    refreshConversations: fetchConversations,
  };
};
