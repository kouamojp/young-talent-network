import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

export interface Message {
  id: string;
  content: string;
  sender_id: string;
  created_at: string;
  read: boolean;
}

export interface Conversation {
  id: string;
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
      subscribeToMessages();
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
        .select(`
          conversation_id,
          conversations (
            id,
            created_at
          )
        `)
        .eq('user_id', currentUserId);

      if (participantsError) throw participantsError;

      const conversationIds = participantsData.map(p => p.conversation_id);

      if (conversationIds.length === 0) {
        setConversations([]);
        setLoading(false);
        return;
      }

      const { data: allParticipants, error: allParticipantsError } = await supabase
        .from('conversation_participants')
        .select(`
          conversation_id,
          user_id,
          profiles (
            name,
            avatar_url
          )
        `)
        .in('conversation_id', conversationIds);

      if (allParticipantsError) throw allParticipantsError;

      const { data: messages, error: messagesError } = await supabase
        .from('messages')
        .select('*')
        .in('conversation_id', conversationIds)
        .order('created_at', { ascending: false });

      if (messagesError) throw messagesError;

      const conversationsMap = new Map<string, Conversation>();

      conversationIds.forEach(convId => {
        conversationsMap.set(convId, {
          id: convId,
          participants: allParticipants
            .filter(p => p.conversation_id === convId && p.user_id !== currentUserId)
            .map(p => ({
              user_id: p.user_id,
              profiles: p.profiles
            })),
          messages: messages.filter(m => m.conversation_id === convId)
        });
      });

      setConversations(Array.from(conversationsMap.values()));
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
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages'
        },
        () => {
          fetchConversations();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const createConversation = async (participantId: string) => {
    if (!currentUserId) return null;

    try {
      const { data, error } = await supabase.rpc('create_conversation_with_participant', {
        _other_user_id: participantId,
      });

      if (error) throw error;

      await fetchConversations();
      return data as string;
    } catch (error: any) {
      console.error('Error creating conversation:', error);
      toast({
        title: "Failed to create conversation",
        description: error?.message,
        variant: "destructive",
      });
      return null;
    }
  };

  const sendMessage = async (conversationId: string, content: string) => {
    if (!currentUserId || !content.trim()) return;

    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          sender_id: currentUserId,
          content: content.trim()
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error sending message:', error);
      toast({ title: "Failed to send message", variant: "destructive" });
    }
  };

  return {
    conversations,
    loading,
    currentUserId,
    createConversation,
    sendMessage,
    refreshConversations: fetchConversations
  };
};
