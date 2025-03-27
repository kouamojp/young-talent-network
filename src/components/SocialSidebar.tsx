
import React from 'react';
import { Link } from 'react-router-dom';
import { 
  User, 
  Users, 
  MessageCircle, 
  Bell, 
  Settings, 
  Search,
  Star,
  PhoneCall,
  Circus,
  Image,
  Music,
  Video,
  Zap,
  Gamepad,
  ShoppingBag,
  Facebook
} from 'lucide-react';
import GlassMorphism from './GlassMorphism';

const SocialSidebar: React.FC = () => {
  const menuItems = [
    { 
      icon: User, 
      label: 'Profile', 
      path: '/profile',
      description: 'Your digital talent hub' 
    },
    { 
      icon: Star, 
      label: 'Feed', 
      path: '/',
      description: 'Talent & opportunity stream' 
    },
    { 
      icon: MessageCircle, 
      label: 'Messenger', 
      path: '/messages',
      description: 'Secure chats & connections' 
    },
    { 
      icon: PhoneCall, 
      label: 'Calls', 
      path: '/calls',
      description: 'Voice/video meetings' 
    },
    { 
      icon: Users, 
      label: 'Friends', 
      path: '/friends',
      description: 'Your talent network' 
    },
    { 
      icon: Circus, 
      label: 'Communities', 
      path: '/communities',
      description: 'Groups by interest' 
    },
    { 
      icon: Image, 
      label: 'Media Hub', 
      path: '/media',
      description: 'Photos, music & videos' 
    },
    { 
      icon: Gamepad, 
      label: 'Games', 
      path: '/games',
      description: 'Skill-based challenges' 
    },
    { 
      icon: ShoppingBag, 
      label: 'Market', 
      path: '/market',
      description: 'Talent economy' 
    },
    { 
      icon: Settings, 
      label: 'Settings', 
      path: '/settings',
      description: 'Customize your experience' 
    },
  ];

  const socialLinks = [
    { icon: Facebook, label: 'Facebook', url: 'https://facebook.com' }
  ];

  return (
    <GlassMorphism className="w-64 p-4 h-screen sticky top-0 hidden md:block">
      <div className="mb-6">
        <h2 className="text-xl font-bold mb-2">Y&T Network</h2>
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
          <input 
            type="text" 
            placeholder="Search Y&T"
            className="w-full pl-8 pr-3 py-2 bg-white/50 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
      </div>
      
      <nav>
        <ul className="space-y-2">
          {menuItems.map((item) => (
            <li key={item.label}>
              <Link 
                to={item.path}
                className="flex flex-col gap-1 p-3 rounded-lg hover:bg-white/30 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <item.icon className="h-5 w-5" />
                  <span className="font-medium">{item.label}</span>
                </div>
                <span className="text-xs text-gray-600 pl-8">{item.description}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      
      <div className="mt-6 pt-4 border-t border-white/20">
        <h3 className="font-medium mb-2">Connect</h3>
        <ul className="space-y-1">
          {socialLinks.map((item) => (
            <li key={item.label}>
              <a 
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/30 transition-colors"
              >
                <item.icon className="h-5 w-5 text-blue-600" />
                <span>{item.label}</span>
              </a>
            </li>
          ))}
        </ul>
      </div>
      
      <div className="mt-auto pt-4 border-t border-white/20 mt-8">
        <h3 className="font-medium mb-2">Trending Talents</h3>
        <ul className="space-y-2 text-sm">
          {['Music', 'Sports', 'Art', 'Dance', 'Technology'].map(category => (
            <li key={category} className="hover:underline cursor-pointer">
              #{category}
            </li>
          ))}
        </ul>
      </div>
    </GlassMorphism>
  );
};

export default SocialSidebar;
