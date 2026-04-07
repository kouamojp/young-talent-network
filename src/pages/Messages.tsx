import React, { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Search, Send, Loader2 } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useConversations } from '@/hooks/useConversations';
import { useLanguage } from '@/i18n/LanguageContext';

const Messages: React.FC = () => {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [messageInput, setMessageInput] = useState('');
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const { conversations, loading, currentUserId, sendMessage } = useConversations();
  const activeConversation = conversations.find(c => c.id === activeConversationId);

  useEffect(() => {
    if (conversations.length > 0 && !activeConversationId) {
      setActiveConversationId(conversations[0].id);
    }
  }, [conversations]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeConversation?.messages]);

  const handleSendMessage = async () => {
    if (messageInput.trim() && activeConversationId) {
      await sendMessage(activeConversationId, messageInput);
      setMessageInput('');
    }
  };

  const filteredConversations = conversations.filter(conv =>
    conv.participants[0]?.profiles.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) return <div className="flex items-center justify-center min-h-screen"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  return (
    <div className="h-screen bg-background flex">
      <div className="w-80 border-r border-border bg-card flex flex-col">
        <div className="p-4 border-b border-border">
          <h1 className="text-2xl font-bold mb-3">{t('messages.chats')}</h1>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder={t('messages.searchConversations')} className="pl-10 bg-muted border-0" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          </div>
        </div>
        <ScrollArea className="flex-1">
          {filteredConversations.map(conversation => {
            const participant = conversation.participants[0];
            const lastMessage = conversation.messages[0];
            return (
              <div key={conversation.id} onClick={() => setActiveConversationId(conversation.id)} className={`p-3 cursor-pointer transition-colors flex items-center gap-3 ${activeConversationId === conversation.id ? 'bg-muted' : 'hover:bg-muted/50'}`}>
                <Avatar className="h-14 w-14"><AvatarImage src={participant?.profiles.avatar_url || '/placeholder.svg'} /><AvatarFallback>{participant?.profiles.name?.[0] || 'U'}</AvatarFallback></Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline mb-1">
                    <h3 className="font-semibold text-sm truncate">{participant?.profiles.name || 'Unknown'}</h3>
                    <span className="text-xs text-muted-foreground">{lastMessage ? new Date(lastMessage.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}</span>
                  </div>
                  <p className="text-sm truncate text-muted-foreground">{lastMessage?.content || t('messages.noMessages')}</p>
                </div>
              </div>
            );
          })}
        </ScrollArea>
      </div>
      <div className="flex-1 flex flex-col">
        {activeConversation ? (
          <>
            <div className="p-4 border-b border-border bg-card">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10"><AvatarImage src={activeConversation.participants[0]?.profiles.avatar_url || '/placeholder.svg'} /><AvatarFallback>{activeConversation.participants[0]?.profiles.name?.[0] || 'U'}</AvatarFallback></Avatar>
                <div><h3 className="font-semibold">{activeConversation.participants[0]?.profiles.name || 'Unknown'}</h3><p className="text-xs text-muted-foreground">{t('messages.activeNow')}</p></div>
              </div>
            </div>
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {activeConversation.messages.slice().reverse().map((message) => {
                  const isOwn = message.sender_id === currentUserId;
                  return (
                    <div key={message.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[70%] rounded-lg p-3 ${isOwn ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                        <p className="text-sm">{message.content}</p>
                        <p className="text-xs mt-1 opacity-70">{new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>
            <div className="p-4 border-t border-border bg-card">
              <div className="flex items-center gap-2">
                <Input placeholder={t('messages.typeMessage')} value={messageInput} onChange={(e) => setMessageInput(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()} className="flex-1" />
                <Button onClick={handleSendMessage} disabled={!messageInput.trim()}><Send className="h-5 w-5" /></Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground">{t('messages.selectConversation')}</div>
        )}
      </div>
    </div>
  );
};

export default Messages;
