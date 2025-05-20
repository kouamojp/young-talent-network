
import React from 'react';
import GlassMorphism from './GlassMorphism';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Button } from './ui/button';

// Sample data
const contacts = [
  { id: '1', name: 'Sarah Johnson', avatar: '/placeholder.svg', status: 'online' },
  { id: '2', name: 'Mike Peterson', avatar: '/placeholder.svg', status: 'online' },
  { id: '3', name: 'Emma Williams', avatar: '/placeholder.svg', status: 'offline' },
  { id: '4', name: 'David Lee', avatar: '/placeholder.svg', status: 'online' },
];

const suggestions = [
  { id: '1', name: 'James Wilson', avatar: '/placeholder.svg', talent: 'Musician' },
  { id: '2', name: 'Olivia Martinez', avatar: '/placeholder.svg', talent: 'Dancer' },
  { id: '3', name: 'Robert Brown', avatar: '/placeholder.svg', talent: 'Athlete' },
];

const RightSidebar: React.FC = () => {
  return (
    <div className="w-full max-w-xs mx-auto space-y-6 animate-fade-in animate-scale-in">
      <GlassMorphism className="p-4 mb-6">
        <h3 className="font-medium mb-3">Contacts</h3>
        <ul className="space-y-3">
          {contacts.map(contact => (
            <li key={contact.id} className="flex items-center gap-3">
              <div className="relative">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={contact.avatar} alt={contact.name} />
                  <AvatarFallback>{contact.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <span 
                  className={`absolute bottom-0 right-0 h-2 w-2 rounded-full ${
                    contact.status === 'online' ? 'bg-green-500' : 'bg-gray-300'
                  }`}
                />
              </div>
              <span className="text-sm">{contact.name}</span>
            </li>
          ))}
        </ul>
      </GlassMorphism>
      
      <GlassMorphism className="p-4">
        <h3 className="font-medium mb-3">Talented People You May Know</h3>
        <ul className="space-y-4">
          {suggestions.map(person => (
            <li key={person.id} className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={person.avatar} alt={person.name} />
                <AvatarFallback>{person.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="text-sm font-medium">{person.name}</p>
                <p className="text-xs text-gray-500">{person.talent}</p>
              </div>
              <Button variant="outline" size="sm" className="text-xs h-7">
                Connect
              </Button>
            </li>
          ))}
        </ul>
      </GlassMorphism>
    </div>
  );
};

export default RightSidebar;
