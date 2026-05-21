import React, { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Search, Send, Loader2, Plus, Phone, Video, MoreVertical, Smile, Paperclip, ArrowLeft, MessageSquare } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useConversations } from '@/hooks/useConversations';
import { useLanguage } from '@/i18n/LanguageContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from '@/components/ui/use-toast';

const Messages: React.FC = () => {
  const { t } = useLanguage();
  const isMobile = useIsMobile();
  const [searchQuery, setSearchQuery] = useState('');
  const [messageInput, setMessageInput] = useState('');
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [showChat, setShowChat] = useState(false);
  const [newChatOpen, setNewChatOpen] = useState(false);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [userSearch, setUserSearch] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const { conversations, loading, currentUserId, sendMessage, createConversation } = useConversations();
  const activeConversation = conversations.find(c => c.id === activeConversationId);

  useEffect(() => {
    if (conversations.length > 0 && !activeConversationId) {
      setActiveConversationId(conversations[0].id);
    }
  }, [conversations]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeConversation?.messages]);

  const fetchUsers = async () => {
    const { data } = await supabase.from('profiles').select('id, name, avatar_url').limit(50);
    if (data) setAllUsers(data.filter(u => u.id !== currentUserId));
  };

  const handleStartConversation = async (userId: string) => {
    const convId = await createConversation(userId);
    if (convId) {
      setActiveConversationId(convId);
      setShowChat(true);
      setNewChatOpen(false);
    }
  };

  const handleSendMessage = async () => {
    if (messageInput.trim() && activeConversationId) {
      await sendMessage(activeConversationId, messageInput);
      setMessageInput('');
    }
  };

  const selectConversation = (id: string) => {
    setActiveConversationId(id);
    if (isMobile) setShowChat(true);
  };

  const filteredConversations = conversations.filter(conv =>
    conv.participants[0]?.profiles.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredUsers = allUsers.filter(u =>
    u.name?.toLowerCase().includes(userSearch.toLowerCase())
  );

  if (loading) return <div className="flex items-center justify-center h-[calc(100vh-3.5rem)]"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  // Not logged in state
  if (!currentUserId) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-3.5rem)]">
        <div className="text-center space-y-4">
          <h2 className="text-xl font-semibold">{t('messages.loginRequired')}</h2>
          <p className="text-muted-foreground">{t('messages.loginToChat')}</p>
          <Button onClick={() => window.location.href = '/auth'}>{t('auth.login')}</Button>
        </div>
      </div>
    );
  }

  const conversationsList = (
    <div className={`${isMobile ? 'w-full' : 'w-80'} border-r border-border bg-card flex flex-col h-full`}>
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-xl font-bold">{t('messages.chats')}</h1>
          <Dialog open={newChatOpen} onOpenChange={(open) => { setNewChatOpen(open); if (open) fetchUsers(); }}>
            <DialogTrigger asChild>
              <Button size="icon" variant="ghost" className="rounded-full"><Plus className="h-5 w-5" /></Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>{t('messages.newConversation')}</DialogTitle></DialogHeader>
              <Input placeholder={t('admin.searchUsers')} value={userSearch} onChange={e => setUserSearch(e.target.value)} className="mb-4" />
              <ScrollArea className="h-64">
                {filteredUsers.map(user => (
                  <button key={user.id} onClick={() => handleStartConversation(user.id)} className="flex items-center gap-3 p-3 w-full hover:bg-muted rounded-lg transition-colors">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={user.avatar_url} />
                      <AvatarFallback>{user.name?.[0] || 'U'}</AvatarFallback>
                    </Avatar>
                    <span className="font-medium">{user.name}</span>
                  </button>
                ))}
                {filteredUsers.length === 0 && <p className="text-center text-muted-foreground py-4">{t('messages.noUsers')}</p>}
              </ScrollArea>
            </DialogContent>
          </Dialog>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder={t('messages.searchConversations')} className="pl-10 bg-muted border-0" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
        </div>
      </div>
      <ScrollArea className="flex-1">
        {filteredConversations.length === 0 ? (
          <div className="p-6 text-center text-muted-foreground">
            <p className="mb-2">{t('messages.noConversations')}</p>
            <Button variant="outline" size="sm" onClick={() => { setNewChatOpen(true); fetchUsers(); }}>
              <Plus className="h-4 w-4 mr-2" />{t('messages.startChat')}
            </Button>
          </div>
        ) : (
          filteredConversations.map(conversation => {
            const participant = conversation.participants[0];
            const lastMessage = conversation.messages[0];
            return (
              <div key={conversation.id} onClick={() => selectConversation(conversation.id)} className={`p-3 cursor-pointer transition-colors flex items-center gap-3 ${activeConversationId === conversation.id ? 'bg-muted' : 'hover:bg-muted/50'}`}>
                <div className="relative">
                  <Avatar className="h-12 w-12"><AvatarImage src={participant?.profiles.avatar_url || '/placeholder.svg'} /><AvatarFallback>{participant?.profiles.name?.[0] || 'U'}</AvatarFallback></Avatar>
                  <div className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 rounded-full border-2 border-card" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline mb-0.5">
                    <h3 className="font-semibold text-sm truncate">{participant?.profiles.name || 'Unknown'}</h3>
                    <span className="text-[10px] text-muted-foreground">{lastMessage ? new Date(lastMessage.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}</span>
                  </div>
                  <p className="text-xs truncate text-muted-foreground">{lastMessage?.content || t('messages.noMessages')}</p>
                </div>
              </div>
            );
          })
        )}
      </ScrollArea>
    </div>
  );

  const chatView = (
    <div className="flex-1 flex flex-col h-full">
      {activeConversation ? (
        <>
          <div className="p-3 border-b border-border bg-card flex items-center justify-between">
            <div className="flex items-center gap-3">
              {isMobile && <Button variant="ghost" size="icon" onClick={() => setShowChat(false)}><ArrowLeft className="h-5 w-5" /></Button>}
              <Avatar className="h-10 w-10"><AvatarImage src={activeConversation.participants[0]?.profiles.avatar_url || '/placeholder.svg'} /><AvatarFallback>{activeConversation.participants[0]?.profiles.name?.[0] || 'U'}</AvatarFallback></Avatar>
              <div>
                <h3 className="font-semibold text-sm">{activeConversation.participants[0]?.profiles.name || 'Unknown'}</h3>
                <p className="text-[10px] text-green-500">{t('messages.activeNow')}</p>
              </div>
            </div>
            <div className="flex gap-1">
              <Button variant="ghost" size="icon"><Phone className="h-4 w-4" /></Button>
              <Button variant="ghost" size="icon"><Video className="h-4 w-4" /></Button>
              <Button variant="ghost" size="icon"><MoreVertical className="h-4 w-4" /></Button>
            </div>
          </div>
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-3">
              {activeConversation.messages.slice().reverse().map((message) => {
                const isOwn = message.sender_id === currentUserId;
                return (
                  <div key={message.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[75%] rounded-2xl px-4 py-2 ${isOwn ? 'bg-primary text-primary-foreground rounded-br-md' : 'bg-muted rounded-bl-md'}`}>
                      <p className="text-sm">{message.content}</p>
                      <p className={`text-[10px] mt-1 ${isOwn ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>{new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>
          <div className="p-3 border-t border-border bg-card">
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="shrink-0"><Paperclip className="h-4 w-4" /></Button>
              <Input placeholder={t('messages.typeMessage')} value={messageInput} onChange={(e) => setMessageInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()} className="flex-1 rounded-full" />
              <Button variant="ghost" size="icon" className="shrink-0"><Smile className="h-4 w-4" /></Button>
              <Button onClick={handleSendMessage} disabled={!messageInput.trim()} size="icon" className="rounded-full shrink-0"><Send className="h-4 w-4" /></Button>
            </div>
          </div>
        </>
      ) : (
        <div className="flex items-center justify-center h-full text-muted-foreground flex-col gap-3">
          <MessageSquare className="h-12 w-12 text-muted-foreground/50" />
          <p>{t('messages.selectConversation')}</p>
        </div>
      )}
    </div>
  );

  return (
    <div className="h-[calc(100vh-3.5rem)] bg-background flex overflow-hidden">
      {isMobile ? (
        showChat ? chatView : conversationsList
      ) : (
        <>
          {conversationsList}
          {chatView}
        </>
      )}
    </div>
  );
};

export default Messages;
