import React, { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Search, Send, Loader2, Plus, Phone, Video, MoreVertical, Smile, Paperclip, ArrowLeft, MessageSquare, Check, CheckCheck, Clock, Forward, Users } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useConversations, type Message } from '@/hooks/useConversations';
import { useCall } from '@/contexts/CallContext';
import { useLanguage } from '@/i18n/LanguageContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from '@/components/ui/use-toast';
import TranslatableText from '@/components/TranslatableText';
import { useSearchParams } from 'react-router-dom';
import { useBlocks } from '@/hooks/useBlocks';
import MessageMedia from '@/components/messages/MessageMedia';
import { copyMessageFile, uploadMessageFile } from '@/lib/messageFiles';
import { Ban } from 'lucide-react';
import { tr } from '@/i18n';
import { localeTag } from '@/i18n/format';

const Messages: React.FC = () => {
  const { t } = useLanguage();
  const isMobile = useIsMobile();
  const [searchQuery, setSearchQuery] = useState('');
  const [messageInput, setMessageInput] = useState('');
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [showChat, setShowChat] = useState(false);
  const [newChatOpen, setNewChatOpen] = useState(false);
  const [groupMode, setGroupMode] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [userSearch, setUserSearch] = useState('');
  const [uploading, setUploading] = useState(false);
  const [forwardMessage, setForwardMessage] = useState<Message | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { conversations, loading, currentUserId, sendMessage, createConversation, createGroupConversation, markMessageRead, markConversationRead } = useConversations();
  const { startCall } = useCall();
  const activeConversation = conversations.find(c => c.id === activeConversationId);

  const handleCall = (video: boolean) => {
    if (!activeConversation || activeConversation.is_group) {
      toast({ title: tr('messages.groupCallsAreNotAvailableYet'), variant: 'destructive' });
      return;
    }
    const p = activeConversation.participants[0];
    if (!p) return;
    startCall({ id: p.user_id, name: p.profiles?.name || 'Contact', avatar_url: p.profiles?.avatar_url }, video);
  };

  useEffect(() => {
    if (conversations.length > 0 && !activeConversationId) setActiveConversationId(conversations[0].id);
  }, [conversations]);

  // Mark received messages as read when a conversation is open on screen,
  // and again whenever a new incoming message lands in it.
  const chatVisible = !isMobile || showChat;
  // Messages que l'utilisateur a remis en « non lu » à la main : on ne les
  // relit pas automatiquement tant qu'aucun nouveau message n'arrive.
  const [manualUnread, setManualUnread] = useState<Set<string>>(new Set());
  const latestIncomingUnreadId = activeConversation?.messages.find(m => m.sender_id !== currentUserId && !m.read && !m.pending)?.id;
  useEffect(() => {
    if (!activeConversationId || !chatVisible || !latestIncomingUnreadId) return;
    if (manualUnread.has(latestIncomingUnreadId)) return;
    markConversationRead(activeConversationId);
  }, [activeConversationId, chatVisible, latestIncomingUnreadId]); // eslint-disable-line react-hooks/exhaustive-deps

  const toggleMessageRead = (messageId: string, read: boolean) => {
    setManualUnread(prev => {
      const next = new Set(prev);
      if (read) next.delete(messageId); else next.add(messageId);
      return next;
    });
    markMessageRead(messageId, read);
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeConversation?.messages]);

  const fetchUsers = async () => {
    const { data } = await supabase.from('profiles').select('id, name, avatar_url').limit(100);
    if (data) setAllUsers(data.filter(u => u.id !== currentUserId));
  };

  const { isBlocked, block, unblock } = useBlocks();

  // Lien « Contacter » des profils : /messages?to=<id>
  const [searchParams, setSearchParams] = useSearchParams();
  const toParam = searchParams.get('to');
  useEffect(() => {
    if (!toParam || !currentUserId || toParam === currentUserId) return;
    setSearchParams({}, { replace: true });
    handleStartConversation(toParam);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [toParam, currentUserId]);

  const handleStartConversation = async (userId: string) => {
    const convId = await createConversation(userId);
    if (convId) {
      setActiveConversationId(convId);
      setShowChat(true);
      setNewChatOpen(false);
    }
  };

  const handleCreateGroup = async () => {
    if (!groupName.trim() || selectedUsers.length < 2) {
      toast({ title: tr('messages.nameAnd2MembersRequired'), variant: 'destructive' });
      return;
    }
    const convId = await createGroupConversation(groupName.trim(), selectedUsers);
    if (convId) {
      setActiveConversationId(convId);
      setShowChat(true);
      setNewChatOpen(false);
      setGroupMode(false);
      setGroupName('');
      setSelectedUsers([]);
    }
  };

  const handleSendMessage = async () => {
    if (messageInput.trim() && activeConversationId) {
      await sendMessage(activeConversationId, messageInput);
      setMessageInput('');
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !currentUserId || !activeConversationId) return;
    if (file.size > 20 * 1024 * 1024) {
      toast({ title: tr('messages.fileTooLargeMax20mb'), variant: 'destructive' });
      return;
    }
    setUploading(true);
    try {
      // Private bucket: only the members of this conversation can open the file.
      const mediaRef = await uploadMessageFile(activeConversationId, currentUserId, file);
      const mediaType = file.type.startsWith('image/') ? 'image' : file.type.startsWith('video/') ? 'video' : file.type.startsWith('audio/') ? 'audio' : 'file';
      await sendMessage(activeConversationId, file.name, { media_url: mediaRef, media_type: mediaType });
    } catch (err: any) {
      toast({ title: tr('messages.uploadError'), description: err?.message, variant: 'destructive' });
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleForward = async (targetConvId: string) => {
    if (!forwardMessage || !currentUserId) return;
    let mediaUrl = forwardMessage.media_url || undefined;
    try {
      // A private attachment must be copied into the target conversation to be readable there.
      if (mediaUrl) mediaUrl = await copyMessageFile(mediaUrl, targetConvId, currentUserId);
    } catch (err: any) {
      toast({ title: tr('messages.uploadError'), description: err?.message, variant: 'destructive' });
      return;
    }
    await sendMessage(targetConvId, forwardMessage.content, {
      media_url: mediaUrl,
      media_type: forwardMessage.media_type || undefined,
      forwarded_from_id: forwardMessage.id,
    });
    toast({ title: tr('messages.messageForwarded') });
    setForwardMessage(null);
  };

  const selectConversation = (id: string) => {
    setActiveConversationId(id);
    if (isMobile) setShowChat(true);
  };

  const getConvDisplay = (conv: typeof conversations[0]) => {
    if (conv.is_group) return { name: conv.name || 'Groupe', avatar: null };
    const p = conv.participants[0];
    return { name: p?.profiles?.name || 'Unknown', avatar: p?.profiles?.avatar_url };
  };

  const filteredConversations = conversations.filter(conv =>
    getConvDisplay(conv).name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredUsers = allUsers.filter(u => u.name?.toLowerCase().includes(userSearch.toLowerCase()));

  if (loading) return <div className="flex items-center justify-center h-[calc(100vh-3.5rem)]"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

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
          <Dialog open={newChatOpen} onOpenChange={(open) => { setNewChatOpen(open); if (open) fetchUsers(); else { setGroupMode(false); setSelectedUsers([]); setGroupName(''); } }}>
            <DialogTrigger asChild>
              <Button size="icon" variant="ghost" className="rounded-full"><Plus className="h-5 w-5" /></Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{groupMode ? tr('messages.newGroup') : t('messages.newConversation')}</DialogTitle>
              </DialogHeader>
              <div className="flex gap-2 mb-3">
                <Button size="sm" variant={!groupMode ? 'default' : 'outline'} onClick={() => setGroupMode(false)}>{tr('create.live')}</Button>
                <Button size="sm" variant={groupMode ? 'default' : 'outline'} onClick={() => setGroupMode(true)}><Users className="h-4 w-4 mr-1" /> {tr('messages.group')}</Button>
              </div>
              {groupMode && (
                <Input placeholder={tr('messages.groupName')} value={groupName} onChange={e => setGroupName(e.target.value)} className="mb-2" />
              )}
              <Input placeholder={t('admin.searchUsers')} value={userSearch} onChange={e => setUserSearch(e.target.value)} className="mb-3" />
              <ScrollArea className="h-64">
                {filteredUsers.map(user => (
                  <div key={user.id} className="flex items-center gap-3 p-2 hover:bg-muted rounded-lg">
                    {groupMode && (
                      <Checkbox
                        checked={selectedUsers.includes(user.id)}
                        onCheckedChange={(c) => setSelectedUsers(prev => c ? [...prev, user.id] : prev.filter(id => id !== user.id))}
                      />
                    )}
                    <button onClick={() => !groupMode && handleStartConversation(user.id)} className="flex items-center gap-3 flex-1 text-left" disabled={groupMode}>
                      <Avatar className="h-10 w-10"><AvatarImage src={user.avatar_url} /><AvatarFallback>{user.name?.[0] || 'U'}</AvatarFallback></Avatar>
                      <span className="font-medium">{user.name}</span>
                    </button>
                  </div>
                ))}
                {filteredUsers.length === 0 && <p className="text-center text-muted-foreground py-4">{t('messages.noUsers')}</p>}
              </ScrollArea>
              {groupMode && (
                <Button onClick={handleCreateGroup} className="w-full mt-3" disabled={!groupName.trim() || selectedUsers.length < 2}>
                  {tr('messages.createGroup')}{selectedUsers.length})
                </Button>
              )}
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
            const display = getConvDisplay(conversation);
            const lastMessage = conversation.messages[0];
            const unreadCount = conversation.messages.filter(m => !m.read && m.sender_id !== currentUserId).length;
            return (
              <div key={conversation.id} onClick={() => selectConversation(conversation.id)} className={`p-3 cursor-pointer transition-colors flex items-center gap-3 ${activeConversationId === conversation.id ? 'bg-accent' : 'hover:bg-muted'}`}>
                <div className="relative">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={display.avatar || '/placeholder.svg'} />
                    <AvatarFallback>{conversation.is_group ? <Users className="h-5 w-5" /> : display.name[0]}</AvatarFallback>
                  </Avatar>
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-[10px] rounded-full min-w-5 h-5 px-1 flex items-center justify-center font-bold tabular-nums ring-2 ring-card">{unreadCount}</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline mb-0.5">
                    <h3 className="font-semibold text-sm truncate flex items-center gap-1">
                      {conversation.is_group && <Users className="h-3 w-3" />}
                      {display.name}
                    </h3>
                    <span className="text-[10px] text-muted-foreground">{lastMessage ? new Date(lastMessage.created_at).toLocaleTimeString(localeTag(), { hour: '2-digit', minute: '2-digit' }) : ''}</span>
                  </div>
                  <p className={`text-xs truncate ${unreadCount > 0 ? 'text-primary font-semibold' : 'text-muted-foreground'}`}>
                    {lastMessage?.media_url ? '📎 ' : ''}{lastMessage?.content || t('messages.noMessages')}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </ScrollArea>
    </div>
  );

  const renderMedia = (m: Message) => (
    <MessageMedia mediaUrl={m.media_url} mediaType={m.media_type} fileName={m.content} />
  );

  const chatView = (
    <div className="flex-1 flex flex-col h-full">
      {activeConversation ? (
        <>
          <div className="p-3 border-b border-border bg-card flex items-center justify-between">
            <div className="flex items-center gap-3">
              {isMobile && <Button variant="ghost" size="icon" onClick={() => setShowChat(false)}><ArrowLeft className="h-5 w-5" /></Button>}
              <Avatar className="h-10 w-10">
                <AvatarImage src={getConvDisplay(activeConversation).avatar || '/placeholder.svg'} />
                <AvatarFallback>{activeConversation.is_group ? <Users className="h-5 w-5" /> : getConvDisplay(activeConversation).name[0]}</AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-semibold text-sm flex items-center gap-1">
                  {activeConversation.is_group && <Users className="h-3 w-3" />}
                  {getConvDisplay(activeConversation).name}
                </h3>
                <p className="text-[10px] text-muted-foreground">
                  {activeConversation.is_group ? tr('messages.members', { p0: activeConversation.participants.length + 1 }) : t('messages.activeNow')}
                </p>
              </div>
            </div>
            <div className="flex gap-1">
              <Button variant="ghost" size="icon" onClick={() => handleCall(false)} disabled={activeConversation.is_group}><Phone className="h-4 w-4" /></Button>
              <Button variant="ghost" size="icon" onClick={() => handleCall(true)} disabled={activeConversation.is_group}><Video className="h-4 w-4" /></Button>
              {!activeConversation.is_group && activeConversation.participants[0] ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" aria-label={tr('messages.moreOptions')}><MoreVertical className="h-4 w-4" /></Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {(() => {
                      const other = activeConversation.participants[0];
                      const otherName = other.profiles?.name;
                      return isBlocked(other.user_id) ? (
                        <DropdownMenuItem onClick={() => unblock(other.user_id, otherName)}>
                          <Ban className="h-4 w-4 mr-2" /> {tr('common.unblock')} {otherName}
                        </DropdownMenuItem>
                      ) : (
                        <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => block(other.user_id, otherName)}>
                          <Ban className="h-4 w-4 mr-2" /> {tr('common.block')} {otherName}
                        </DropdownMenuItem>
                      );
                    })()}
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button variant="ghost" size="icon" disabled aria-label={tr('messages.moreOptions')}><MoreVertical className="h-4 w-4" /></Button>
              )}
            </div>
          </div>
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-3">
              {activeConversation.messages.slice().reverse().map((message) => {
                const isOwn = message.sender_id === currentUserId;
                const bubbleColor = isOwn
                  ? 'bg-primary text-primary-foreground'
                  // Reçu non lu : teinte bleutée ; une fois lu, bulle neutre
                  : (message.read ? 'bg-muted text-foreground' : 'bg-accent text-foreground ring-1 ring-primary/25');
                return (
                  <div key={message.id} className={`flex group ${isOwn ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[75%] rounded-2xl px-4 py-2 ${bubbleColor} ${isOwn ? 'rounded-br-md' : 'rounded-bl-md'} ${message.pending ? 'opacity-70' : ''}`}>
                      {message.forwarded_from_id && <p className="text-[10px] italic opacity-70 mb-1">{tr('messages.forwarded')}</p>}
                      {message.content && (
                        <TranslatableText text={message.content} className="text-sm whitespace-pre-wrap break-words" />
                      )}
                      {renderMedia(message)}
                      <div className="flex items-center justify-between gap-2 mt-1">
                        <span className="text-[10px] opacity-70">{new Date(message.created_at).toLocaleTimeString(localeTag(), { hour: '2-digit', minute: '2-digit' })}</span>
                        <div className="flex items-center gap-1">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <button className="opacity-0 group-hover:opacity-100 transition-opacity"><MoreVertical className="h-3 w-3" /></button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                              <DropdownMenuItem onClick={() => setForwardMessage(message)}>
                                <Forward className="h-4 w-4 mr-2" /> {tr('messages.forward')}
                              </DropdownMenuItem>
                              {!isOwn && (
                                <DropdownMenuItem onClick={() => toggleMessageRead(message.id, !message.read)}>
                                  {message.read ? <Check className="h-4 w-4 mr-2" /> : <CheckCheck className="h-4 w-4 mr-2" />}
                                  {tr('messages.markAs')} {message.read ? tr('messages.unread') : 'lu'}
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                          {isOwn && (message.pending ? <Clock className="h-3 w-3" /> : message.read ? <CheckCheck className="h-3 w-3" /> : <Check className="h-3 w-3" />)}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>
          <div className="p-3 border-t border-border bg-card">
            <div className="flex items-center gap-2">
              <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileSelect} accept="image/*,video/*,audio/*,application/pdf" />
              <Button variant="ghost" size="icon" className="shrink-0" onClick={() => fileInputRef.current?.click()} disabled={uploading}>
                {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Paperclip className="h-4 w-4" />}
              </Button>
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
    <>
      <div className="h-[calc(100vh-3.5rem)] bg-background flex overflow-hidden">
        {isMobile ? (showChat ? chatView : conversationsList) : (<>{conversationsList}{chatView}</>)}
      </div>

      <Dialog open={!!forwardMessage} onOpenChange={(o) => !o && setForwardMessage(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>{tr('messages.forwardTo')}</DialogTitle></DialogHeader>
          <ScrollArea className="h-72">
            {conversations.filter(c => c.id !== activeConversationId).map(conv => {
              const d = getConvDisplay(conv);
              return (
                <button key={conv.id} onClick={() => handleForward(conv.id)} className="flex items-center gap-3 p-2 w-full hover:bg-muted rounded-lg text-left">
                  <Avatar className="h-10 w-10"><AvatarImage src={d.avatar || '/placeholder.svg'} /><AvatarFallback>{d.name[0]}</AvatarFallback></Avatar>
                  <span className="font-medium">{d.name}</span>
                </button>
              );
            })}
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Messages;
