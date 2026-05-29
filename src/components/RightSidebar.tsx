
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Button } from './ui/button';
import { Search, Plus } from 'lucide-react';
import TopTalentsWidget from './TopTalentsWidget';
import AdBanner from './AdBanner';

// Sample data
const contacts = [
  { id: '1', name: 'Sarah Johnson', avatar: '/placeholder.svg', status: 'online' },
  { id: '2', name: 'Mike Peterson', avatar: '/placeholder.svg', status: 'online' },
  { id: '3', name: 'Emma Williams', avatar: '/placeholder.svg', status: 'offline' },
  { id: '4', name: 'David Lee', avatar: '/placeholder.svg', status: 'online' },
  { id: '5', name: 'Lisa Brown', avatar: '/placeholder.svg', status: 'online' },
  { id: '6', name: 'Alex Richards', avatar: '/placeholder.svg', status: 'offline' },
];

const birthdays = [
  { id: '1', name: 'James Wilson', date: 'Today' },
];

const RightSidebar: React.FC = () => {
  return (
    <div className="w-full space-y-4 p-4">
      {/* Top Talents */}
      <TopTalentsWidget />

      {/* Sponsored */}
      <div className="bg-card rounded-lg shadow-sm p-4 border border-border">
        <h3 className="font-semibold text-sm text-muted-foreground mb-3">Sponsored</h3>
        <div className="rounded-md overflow-hidden">
          <img 
            src="/placeholder.svg" 
            alt="Advertisement" 
            className="w-full h-32 object-cover"
          />
          <div className="p-2 bg-muted/50">
            <h4 className="text-sm font-medium">Music lessons for beginners</h4>
            <p className="text-xs text-muted-foreground">musiclessons.com</p>
          </div>
        </div>
      </div>
      
      {/* Birthdays */}
      <div className="bg-card rounded-lg shadow-sm p-4 border border-border">
        <h3 className="font-semibold text-sm text-muted-foreground mb-3">Birthdays</h3>
        {birthdays.map(person => (
          <div key={person.id} className="flex items-center gap-3 py-2">
            <div className="flex-shrink-0 h-8 w-8 flex items-center justify-center">
              🎂
            </div>
            <p className="text-sm">
              <span className="font-medium">{person.name}</span>
              <span className="text-muted-foreground">'s birthday is {person.date}</span>
            </p>
          </div>
        ))}
      </div>
      
      {/* Contacts */}
      <div className="bg-card rounded-lg shadow-sm p-4 border border-border">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-sm text-muted-foreground">Contacts</h3>
          <div className="flex space-x-2">
            <a href="/friends" className="text-muted-foreground hover:bg-muted rounded-full p-1 transition-colors" title="Rechercher">
              <Search className="h-4 w-4" />
            </a>
            <a href="/friends" className="text-muted-foreground hover:bg-muted rounded-full p-1 transition-colors" title="Ajouter">
              <Plus className="h-4 w-4" />
            </a>
          </div>
        </div>
        <ul className="space-y-1">
          {contacts.map(contact => (
            <li key={contact.id} className="flex items-center gap-3 py-2 px-2 rounded-md hover:bg-muted cursor-pointer transition-colors">
              <div className="relative">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={contact.avatar} alt={contact.name} />
                  <AvatarFallback>{contact.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <span 
                  className={`absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full ${
                    contact.status === 'online' ? 'bg-green-500' : 'bg-muted-foreground'
                  } border-2 border-card`}
                />
              </div>
              <span className="text-sm font-medium">{contact.name}</span>
            </li>
          ))}
        </ul>
      </div>
      <AdBanner placement="sidebar" className="mt-4" />
    </div>
  );
};

export default RightSidebar;
