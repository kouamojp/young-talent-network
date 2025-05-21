
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Button } from './ui/button';
import { Search, Plus } from 'lucide-react';

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
    <div className="w-full max-w-xs mx-auto space-y-6 p-4">
      {/* Sponsored */}
      <div className="mb-4">
        <h3 className="font-medium text-gray-500 mb-3">Sponsored</h3>
        <div className="rounded-md overflow-hidden mb-3">
          <img 
            src="/placeholder.svg" 
            alt="Advertisement" 
            className="w-full h-32 object-cover"
          />
          <div className="p-2">
            <h4 className="text-sm">Music lessons for beginners</h4>
            <p className="text-xs text-gray-500">musiclessons.com</p>
          </div>
        </div>
      </div>
      
      {/* Birthdays */}
      <div className="mb-4">
        <h3 className="font-medium text-gray-500 mb-3">Birthdays</h3>
        {birthdays.map(person => (
          <div key={person.id} className="flex items-center gap-3 py-2">
            <div className="flex-shrink-0 h-8 w-8 flex items-center justify-center text-blue-500">
              🎂
            </div>
            <p className="text-sm">
              <span className="font-medium">{person.name}</span>
              <span className="text-gray-500">'s birthday is {person.date}</span>
            </p>
          </div>
        ))}
      </div>
      
      {/* Contacts - Facebook Style */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-medium text-gray-500">Contacts</h3>
          <div className="flex space-x-2">
            <button className="text-gray-500 hover:bg-gray-100 rounded-full p-1">
              <Search className="h-4 w-4" />
            </button>
            <button className="text-gray-500 hover:bg-gray-100 rounded-full p-1">
              <Plus className="h-4 w-4" />
            </button>
          </div>
        </div>
        <ul className="space-y-1">
          {contacts.map(contact => (
            <li key={contact.id} className="flex items-center gap-3 py-1 px-2 rounded-md hover:bg-gray-100 cursor-pointer">
              <div className="relative">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={contact.avatar} alt={contact.name} />
                  <AvatarFallback>{contact.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <span 
                  className={`absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full ${
                    contact.status === 'online' ? 'bg-green-500' : 'bg-gray-300'
                  } border-2 border-white`}
                />
              </div>
              <span className="text-sm font-medium">{contact.name}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default RightSidebar;
