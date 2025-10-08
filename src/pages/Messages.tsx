
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Search, Send, Phone, Video, Info, Paperclip, Smile, ThumbsUp } from 'lucide-react';

const Messages: React.FC = () => {
  const [messageText, setMessageText] = useState('');
  
  // Mock data
  const contacts = [
    { id: 1, name: 'Sarah Johnson', avatar: '/placeholder.svg', lastMessage: 'Are you available for the audition next week?', time: '10:30 AM', unread: 2 },
    { id: 2, name: 'Michael Chen', avatar: '/placeholder.svg', lastMessage: 'Thanks for the feedback on my portfolio!', time: 'Yesterday', unread: 0 },
    { id: 3, name: 'Emma Williams', avatar: '/placeholder.svg', lastMessage: 'Just sent you the details for the workshop', time: 'Yesterday', unread: 0 },
    { id: 4, name: 'James Taylor', avatar: '/placeholder.svg', lastMessage: 'Looking forward to our mentoring session', time: 'Monday', unread: 0 },
  ];
  
  const messages = [
    { id: 1, text: 'Hi there! I saw your portfolio and I was really impressed with your work.', sender: 'them', time: '10:05 AM', status: 'read' },
    { id: 2, text: "Thank you! I appreciate that. I've been working hard on improving my skills.", sender: 'me', time: '10:07 AM', status: 'delivered' },
    { id: 3, text: "Are you available for the audition next week? We're looking for someone with your talents.", sender: 'them', time: '10:10 AM', status: 'read' },
    { id: 4, text: "Yes, I'm interested! Can you share more details about it?", sender: 'me', time: '10:30 AM', status: 'seen' },
  ];


  const handleSendMessage = () => {
    if (messageText.trim()) {
      // Send message logic would go here
      setMessageText('');
    }
  };

  return (
    <div className="h-screen bg-background flex">
      {/* Contacts sidebar */}
      <div className="w-80 border-r border-border bg-card flex flex-col">
        {/* Sidebar Header */}
        <div className="p-4 border-b border-border">
          <h1 className="text-2xl font-bold mb-3">Chats</h1>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search Messenger" 
              className="pl-10 bg-muted border-0"
            />
          </div>
        </div>
        
        {/* Contacts List */}
        <div className="flex-1 overflow-y-auto">
          {contacts.map(contact => (
            <div 
              key={contact.id}
              className={`p-3 cursor-pointer transition-colors flex items-center gap-3 ${
                contact.id === 1 ? 'bg-muted' : 'hover:bg-muted/50'
              }`}
            >
              <div className="relative">
                <Avatar className="h-14 w-14">
                  <AvatarImage src={contact.avatar} alt={contact.name} />
                  <AvatarFallback>{contact.name.charAt(0)}</AvatarFallback>
                </Avatar>
                {/* Online indicator */}
                <span className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 border-2 border-card rounded-full"></span>
                {contact.unread > 0 && (
                  <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center font-semibold">
                    {contact.unread}
                  </span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline mb-1">
                  <h3 className="font-semibold text-sm truncate">{contact.name}</h3>
                  <span className="text-xs text-muted-foreground">{contact.time}</span>
                </div>
                <p className={`text-sm truncate ${contact.unread > 0 ? 'font-semibold text-foreground' : 'text-muted-foreground'}`}>
                  {contact.lastMessage}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Chat area */}
      <div className="flex-1 flex flex-col bg-background">
        {/* Chat header */}
        <div className="p-3 border-b border-border flex justify-between items-center bg-card">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Avatar className="h-10 w-10">
                <AvatarImage src="/placeholder.svg" alt="Sarah Johnson" />
                <AvatarFallback>SJ</AvatarFallback>
              </Avatar>
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-card rounded-full"></span>
            </div>
            <div>
              <h3 className="font-semibold text-sm">Sarah Johnson</h3>
              <p className="text-xs text-muted-foreground">Active now</p>
            </div>
          </div>
          <div className="flex gap-1">
            <Button variant="ghost" size="icon" className="h-9 w-9 text-primary">
              <Phone className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="h-9 w-9 text-primary">
              <Video className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="h-9 w-9 text-primary">
              <Info className="h-5 w-5" />
            </Button>
          </div>
        </div>
        
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {messages.map((message, index) => {
            const showAvatar = index === messages.length - 1 || messages[index + 1]?.sender !== message.sender;
            
            return (
              <div 
                key={message.id} 
                className={`flex items-end gap-2 ${message.sender === 'me' ? 'justify-end' : 'justify-start'}`}
              >
                {message.sender === 'them' && (
                  <Avatar className={`h-7 w-7 ${showAvatar ? 'visible' : 'invisible'}`}>
                    <AvatarImage src="/placeholder.svg" alt="Sarah Johnson" />
                    <AvatarFallback>SJ</AvatarFallback>
                  </Avatar>
                )}
                <div 
                  className={`max-w-[60%] rounded-2xl px-4 py-2 ${
                    message.sender === 'me' 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-muted text-foreground'
                  }`}
                >
                  <p className="text-sm leading-relaxed">{message.text}</p>
                </div>
              </div>
            );
          })}
          <div className="text-xs text-muted-foreground text-center mt-2">
            {messages[messages.length - 1]?.time}
          </div>
        </div>
        
        {/* Message input */}
        <div className="p-3 border-t border-border bg-card">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="h-9 w-9 text-primary rounded-full">
              <Paperclip className="h-5 w-5" />
            </Button>
            <div className="flex-1 flex items-center gap-2 bg-muted rounded-full px-4 py-2">
              <Input 
                placeholder="Aa" 
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                className="border-0 bg-transparent p-0 focus-visible:ring-0 focus-visible:ring-offset-0"
              />
              <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full">
                <Smile className="h-5 w-5 text-primary" />
              </Button>
            </div>
            {messageText.trim() ? (
              <Button onClick={handleSendMessage} size="icon" className="h-9 w-9 rounded-full">
                <Send className="h-4 w-4" />
              </Button>
            ) : (
              <Button variant="ghost" size="icon" className="h-9 w-9 text-primary rounded-full">
                <ThumbsUp className="h-5 w-5" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Messages;
