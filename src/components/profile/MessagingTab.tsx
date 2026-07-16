
import React, { useEffect, useMemo, useState } from 'react';
import GlassMorphism from '@/components/GlassMorphism';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MessageSquare, Search, Phone, Video, User, Image, Send, Loader2, Clock } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useConversations, type Conversation } from '@/hooks/useConversations';
import { useNavigate } from 'react-router-dom';

const formatTime = (iso?: string) => {
  if (!iso) return '';
  const d = new Date(iso);
  const now = new Date();
  const sameDay = d.toDateString() === now.toDateString();
  if (sameDay) return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  return d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
};

const MessagingTab: React.FC = () => {
  const navigate = useNavigate();
  const { conversations, loading, currentUserId, sendMessage } = useConversations();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!activeId && conversations.length > 0) {
      setActiveId(conversations[0].id);
    }
  }, [conversations, activeId]);

  const otherParticipant = (conv: Conversation) => conv.participants[0]?.profiles;

  const lastMessage = (conv: Conversation) =>
    conv.messages.length > 0
      ? [...conv.messages].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0]
      : null;

  const unreadCount = (conv: Conversation) =>
    conv.messages.filter(m => m.sender_id !== currentUserId && !m.read).length;

  const filteredConversations = useMemo(() => {
    if (!search.trim()) return conversations;
    const q = search.toLowerCase();
    return conversations.filter(c => {
      const name = c.is_group ? c.name : otherParticipant(c)?.name;
      return (name || '').toLowerCase().includes(q);
    });
  }, [conversations, search]);

  const activeConversation = conversations.find(c => c.id === activeId) || null;

  const activeMessages = useMemo(() => {
    if (!activeConversation) return [];
    return [...activeConversation.messages].sort(
      (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );
  }, [activeConversation]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !activeId) return;
    const content = newMessage;
    setNewMessage('');
    await sendMessage(activeId, content);
  };

  const activeName = activeConversation
    ? (activeConversation.is_group ? activeConversation.name : otherParticipant(activeConversation)?.name) || 'Conversation'
    : '';
  const activeAvatar = activeConversation && !activeConversation.is_group
    ? otherParticipant(activeConversation)?.avatar_url || undefined
    : undefined;

  if (loading) {
    return (
      <GlassMorphism className="p-0 overflow-hidden">
        <div className="flex h-[600px] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </GlassMorphism>
    );
  }

  if (conversations.length === 0) {
    return (
      <GlassMorphism className="p-0 overflow-hidden">
        <div className="flex h-[600px] flex-col items-center justify-center text-center text-gray-500 p-6">
          <MessageSquare className="h-12 w-12 mb-3 text-gray-300" />
          <h3 className="text-lg font-medium mb-2">No conversations yet</h3>
          <p className="mb-4">Start chatting with your connections.</p>
          <Button onClick={() => navigate('/messages')}>Go to Messages</Button>
        </div>
      </GlassMorphism>
    );
  }

  return (
    <GlassMorphism className="p-0 overflow-hidden">
      <div className="flex h-[600px]">
        {/* Conversations List */}
        <div className="w-1/3 border-r border-gray-200 flex flex-col">
          <div className="p-4 border-b border-gray-200">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search conversations"
                className="pl-10"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="overflow-y-auto flex-1">
            {filteredConversations.map(conversation => {
              const other = otherParticipant(conversation);
              const last = lastMessage(conversation);
              const unread = unreadCount(conversation);
              const name = conversation.is_group ? conversation.name : other?.name;
              return (
                <div
                  key={conversation.id}
                  className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${activeId === conversation.id ? 'bg-gray-50' : ''}`}
                  onClick={() => setActiveId(conversation.id)}
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={other?.avatar_url || undefined} />
                      <AvatarFallback>{name?.[0] || 'U'}</AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between">
                        <p className="font-medium truncate">{name || 'Conversation'}</p>
                        <p className="text-xs text-gray-500">{formatTime(last?.created_at)}</p>
                      </div>
                      <p className="text-sm text-gray-600 truncate">
                        {last?.sender_id === currentUserId && 'You: '}
                        {last?.content || (last?.media_url ? '📎 Pièce jointe' : 'Aucun message')}
                      </p>
                    </div>

                    {unread > 0 && (
                      <div className="bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {unread}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Active Conversation */}
        <div className="flex-1 flex flex-col">
          {/* Conversation Header */}
          <div className="p-3 border-b border-gray-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="w-10 h-10">
                <AvatarImage src={activeAvatar} />
                <AvatarFallback>{activeName?.[0] || 'U'}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{activeName}</p>
              </div>
            </div>

            <div className="flex gap-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button size="icon" variant="ghost" onClick={() => navigate('/calls')}>
                    <Phone className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Call</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button size="icon" variant="ghost" onClick={() => navigate('/calls')}>
                    <Video className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Video call</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button size="icon" variant="ghost" onClick={() => navigate('/messages')}>
                    <User className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Open in Messages</TooltipContent>
              </Tooltip>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 p-4 overflow-y-auto">
            <div className="space-y-4">
              {activeMessages.map(message => {
                const isSender = message.sender_id === currentUserId;
                return (
                  <div
                    key={message.id}
                    className={`flex ${isSender ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[70%] rounded-lg px-4 py-2 ${
                        isSender
                          ? 'bg-blue-500 text-white rounded-br-none'
                          : 'bg-gray-100 text-gray-800 rounded-bl-none'
                      } ${message.pending ? 'opacity-70' : ''}`}
                    >
                      {message.media_url && (
                        <img src={message.media_url} alt="" className="rounded mb-1 max-h-48" />
                      )}
                      {message.content && <p>{message.content}</p>}
                      <p className={`text-xs mt-1 flex items-center gap-1 ${isSender ? 'text-blue-100' : 'text-gray-500'}`}>
                        {formatTime(message.created_at)}
                        {message.pending && <Clock className="h-3 w-3" />}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Message Input */}
          <div className="p-3 border-t border-gray-200">
            <div className="flex items-center gap-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button size="icon" variant="ghost" onClick={() => navigate('/messages')}>
                    <Image className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Send image (in Messages)</TooltipContent>
              </Tooltip>

              <Input
                placeholder="Type a message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSendMessage();
                }}
                className="flex-1"
              />

              <Button
                onClick={handleSendMessage}
                disabled={!newMessage.trim()}
                size="icon"
              >
                <Send className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </GlassMorphism>
  );
};

export default MessagingTab;
