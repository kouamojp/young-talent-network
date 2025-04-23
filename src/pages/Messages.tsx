
import React, { useState } from 'react';
import Footer from '@/components/Footer';
import GlassMorphism from '@/components/GlassMorphism';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MessageCircle, Send, Phone, Video, Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

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

  const quickReplies = [
    "You had me at 'hello'! When can we chat?",
    "I'd love to – send details! 🎯",
    "Thanks for reaching out!",
    "Looking forward to collaborating!"
  ];

  const handleSendMessage = () => {
    if (messageText.trim()) {
      // Send message logic would go here
      setMessageText('');
    }
  };

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-purple-50">
        <main className="pt-14 flex-1 p-4">
          <div className="flex h-[calc(100vh-200px)] overflow-hidden">
            {/* Contacts sidebar */}
            <GlassMorphism className="hidden md:flex w-80 flex-col mr-4 p-4">
              <div className="flex items-center gap-2 mb-4">
                <MessageCircle className="h-5 w-5" />
                <h2 className="text-xl font-semibold">Messages</h2>
              </div>
              
              <Input 
                placeholder="Search conversations..." 
                className="mb-4"
              />
              
              <div className="flex-1 overflow-y-auto space-y-2">
                {contacts.map(contact => (
                  <div 
                    key={contact.id}
                    className={`p-3 rounded-lg cursor-pointer transition-colors flex items-center gap-3 ${contact.id === 1 ? 'bg-primary/10' : 'hover:bg-white/30'}`}
                  >
                    <div className="relative">
                      <Avatar>
                        <AvatarImage src={contact.avatar} alt={contact.name} />
                        <AvatarFallback>{contact.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      {contact.unread > 0 && (
                        <span className="absolute -top-1 -right-1 bg-primary text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                          {contact.unread}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-baseline">
                        <h3 className="font-medium truncate">{contact.name}</h3>
                        <span className="text-xs text-gray-500">{contact.time}</span>
                      </div>
                      <p className="text-sm text-gray-600 truncate">{contact.lastMessage}</p>
                    </div>
                  </div>
                ))}
              </div>
            </GlassMorphism>
            
            {/* Chat area */}
            <GlassMorphism className="flex-1 flex flex-col">
              {/* Chat header */}
              <div className="p-4 border-b flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src="/placeholder.svg" alt="Sarah Johnson" />
                    <AvatarFallback>SJ</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-medium">Sarah Johnson</h3>
                    <p className="text-xs text-gray-500">Agent • Online</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <Phone className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Voice connects talents faster than text!</p>
                    </TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <Video className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Show your talent in action!</p>
                    </TooltipContent>
                  </Tooltip>
                  <Button variant="ghost" size="icon">
                    <Info className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map(message => (
                  <div 
                    key={message.id} 
                    className={`flex ${message.sender === 'me' ? 'justify-end' : 'justify-start'}`}
                  >
                    {message.sender === 'them' && (
                      <Avatar className="mr-2">
                        <AvatarImage src="/placeholder.svg" alt="Sarah Johnson" />
                        <AvatarFallback>SJ</AvatarFallback>
                      </Avatar>
                    )}
                    <div 
                      className={`max-w-[70%] rounded-lg p-3 ${
                        message.sender === 'me' 
                          ? 'bg-primary text-white rounded-tr-none' 
                          : 'bg-white/70 rounded-tl-none'
                      }`}
                    >
                      <p>{message.text}</p>
                      <div className="flex justify-between items-center mt-1">
                        <span className={`text-xs ${message.sender === 'me' ? 'text-white/70' : 'text-gray-500'}`}>
                          {message.time}
                        </span>
                        {message.sender === 'me' && (
                          <Tooltip>
                            <TooltipTrigger>
                              <span className="text-xs text-white/70">
                                {message.status === 'seen' ? '✓✓' : '✓'}
                              </span>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>
                                {message.status === 'seen' 
                                  ? "Seen! They're probably smiling right now." 
                                  : "Delivered. (Heart pounding? Ours too!)"}
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Quick replies */}
              <div className="px-4 py-2 border-t">
                <div className="flex flex-wrap gap-2">
                  {quickReplies.map((reply, index) => (
                    <Button 
                      key={index} 
                      variant="outline" 
                      size="sm" 
                      className="text-xs"
                      onClick={() => setMessageText(reply)}
                    >
                      {reply}
                    </Button>
                  ))}
                </div>
              </div>
              
              {/* Message input */}
              <div className="p-4 border-t">
                <div className="flex gap-2">
                  <Input 
                    placeholder="Type your first 'hello'... the beginning of every legendary duo!" 
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                  />
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button onClick={handleSendMessage}>
                        <Send className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Launch your message into their world!</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </div>
            </GlassMorphism>
          </div>
        </main>
        <Footer />
      </div>
    </TooltipProvider>
  );
};

export default Messages;
