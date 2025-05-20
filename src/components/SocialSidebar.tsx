
import React from 'react';
import { Link } from 'react-router-dom';
import { User, Star, MessageSquare, Phone, Users } from 'lucide-react';

const mainMenuItems = [
  { 
    icon: User, 
    label: 'Profile', 
    description: 'Your digital talent hub', 
    to: '/profile' 
  },
  { 
    icon: Star, 
    label: 'Feed', 
    description: 'Talent & opportunity stream', 
    to: '/' 
  },
  { 
    icon: MessageSquare, 
    label: 'Messenger', 
    description: 'Secure chats & connections', 
    to: '/messages' 
  },
  { 
    icon: Phone, 
    label: 'Calls', 
    description: 'Voice/video meetings', 
    to: '/calls' 
  },
  { 
    icon: Users, 
    label: 'Friends', 
    description: 'Your talent network', 
    to: '/friends' 
  }
];

const SocialSidebar: React.FC = () => {
  return (
    <aside className="bg-white rounded-xl shadow-sm p-4">
      <div>
        <h3 className="text-sm font-medium text-gray-500 mb-2">Main</h3>
        <nav className="space-y-1">
          {mainMenuItems.map((item, index) => (
            <Link 
              key={index}
              to={item.to} 
              className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="bg-gray-100 p-2 rounded-full">
                <item.icon className="h-5 w-5 text-gray-600" />
              </div>
              <div>
                <div className="font-medium">{item.label}</div>
                <div className="text-xs text-gray-500">{item.description}</div>
              </div>
            </Link>
          ))}
        </nav>
      </div>

      <div className="mt-6 pt-4 border-t border-gray-100">
        <h3 className="text-sm font-medium text-gray-500 mb-2">Communities & Content</h3>
        {/* Additional menu items would go here */}
      </div>
    </aside>
  );
};

export default SocialSidebar;
