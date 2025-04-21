
import React, { useState } from 'react';
import GlassMorphism from '@/components/GlassMorphism';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MessageSquare, Search, Phone, Video, User, Image, Send } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

// Sample conversations data
const conversations = [
  {
    id: 1,
    contact: {
      name: 'Coach Williams',
      avatar: '/placeholder.svg',
      status: 'online'
    },
    lastMessage: {
      content: 'How was your practice today?',
      timestamp: '10:45 AM',
      isRead: true,
      isSender: false
    },
    unread: 0
  },
  {
    id: 2,
    contact: {
      name: 'Sarah Johnson',
      avatar: '/placeholder.svg',
      status: 'offline'
    },
    lastMessage: {
      content: 'See you at the tournament!',
      timestamp: 'Yesterday',
      isRead: true,
      isSender: true
    },
    unread: 0
  },
  {
    id: 3,
    contact: {
      name: 'David Chen',
      avatar: '/placeholder.svg',
      status: 'online'
    },
    lastMessage: {
      content: 'Can you send me the training schedule?',
      timestamp: 'Yesterday',
      isRead: false,
      isSender: false
    },
    unread: 2
  }
];

// Sample messages data for active conversation
const sampleMessages = [
  {
    id: 1,
    content: 'Hey there! How was your practice today?',
    timestamp: '10:30 AM',
    isSender: false
  },
  {
    id: 2,
    content: 'It was great! Coach had us working on defense drills.',
    timestamp: '10:32 AM',
    isSender: true
  },
  {
    id: 3,
    content: 'That\'s excellent. Are you ready for the game tomorrow?',
    timestamp: '10:35 AM',
    isSender: false
  },
  {
    id: 4,
    content: 'Definitely! Our team is in good shape. I think we have a strong chance.',
    timestamp: '10:40 AM',
    isSender: true
  },
  {
    id: 5,
    content: 'I\'ll be there to watch. Looking forward to seeing your performance!',
    timestamp: '10:45 AM',
    isSender: false
  }
];

const MessagingTab: React.FC = () => {
  const [activeConversation, setActiveConversation] = useState(conversations[0]);
  const [messages, setMessages] = useState(sampleMessages);
  const [newMessage, setNewMessage] = useState('');

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      const newMsg = {
        id: messages.length + 1,
        content: newMessage,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isSender: true
      };
      setMessages([...messages, newMsg]);
      setNewMessage('');
    }
  };

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
              />
            </div>
          </div>
          
          <div className="overflow-y-auto flex-1">
            {conversations.map(conversation => (
              <div
                key={conversation.id}
                className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${activeConversation.id === conversation.id ? 'bg-gray-50' : ''}`}
                onClick={() => setActiveConversation(conversation)}
              >
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden">
                      <img src={conversation.contact.avatar} alt="" className="w-full h-full object-cover" />
                    </div>
                    {conversation.contact.status === 'online' && (
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between">
                      <p className="font-medium truncate">{conversation.contact.name}</p>
                      <p className="text-xs text-gray-500">{conversation.lastMessage.timestamp}</p>
                    </div>
                    <p className="text-sm text-gray-600 truncate">
                      {conversation.lastMessage.isSender && 'You: '}
                      {conversation.lastMessage.content}
                    </p>
                  </div>
                  
                  {conversation.unread > 0 && (
                    <div className="bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {conversation.unread}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Active Conversation */}
        <div className="flex-1 flex flex-col">
          {/* Conversation Header */}
          <div className="p-3 border-b border-gray-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden">
                <img src={activeConversation.contact.avatar} alt="" className="w-full h-full object-cover" />
              </div>
              <div>
                <p className="font-medium">{activeConversation.contact.name}</p>
                <p className="text-xs text-gray-500">
                  {activeConversation.contact.status === 'online' ? 'Online' : 'Offline'}
                </p>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button size="icon" variant="ghost">
                    <Phone className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Call</TooltipContent>
              </Tooltip>
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button size="icon" variant="ghost">
                    <Video className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Video call</TooltipContent>
              </Tooltip>
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button size="icon" variant="ghost">
                    <User className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>View profile</TooltipContent>
              </Tooltip>
            </div>
          </div>
          
          {/* Messages */}
          <div className="flex-1 p-4 overflow-y-auto">
            <div className="space-y-4">
              {messages.map(message => (
                <div
                  key={message.id}
                  className={`flex ${message.isSender ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[70%] rounded-lg px-4 py-2 ${
                      message.isSender
                        ? 'bg-blue-500 text-white rounded-br-none'
                        : 'bg-gray-100 text-gray-800 rounded-bl-none'
                    }`}
                  >
                    <p>{message.content}</p>
                    <p className={`text-xs mt-1 ${message.isSender ? 'text-blue-100' : 'text-gray-500'}`}>
                      {message.timestamp}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Message Input */}
          <div className="p-3 border-t border-gray-200">
            <div className="flex items-center gap-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button size="icon" variant="ghost">
                    <Image className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Send image</TooltipContent>
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
