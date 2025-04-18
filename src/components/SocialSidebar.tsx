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
  Citrus,
  Image,
  Music,
  Video,
  Zap,
  Gamepad,
  ShoppingBag,
  Facebook,
  Instagram,
  Twitter,
  FileText,
  Image as ImageIcon,
  Link as LinkIcon
} from 'lucide-react';
import GlassMorphism from './GlassMorphism';

type IconComponent = React.ComponentType<{ className?: string }>;
type IconRenderer = () => JSX.Element;
type IconType = IconComponent | IconRenderer;

interface SocialLink {
  icon: IconType;
  label: string;
  url: string;
}

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
      icon: Citrus, 
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
    { 
      icon: FileText, 
      label: 'Posts', 
      path: '/profile?tab=posts',
      description: 'Your talent stories' 
    },
    { 
      icon: ImageIcon, 
      label: 'Media', 
      path: '/profile?tab=media',
      description: 'Photos & videos' 
    },
    { 
      icon: User, 
      label: 'About', 
      path: '/profile?tab=about',
      description: 'Your talent journey' 
    },
    { 
      icon: LinkIcon, 
      label: 'Social Universe', 
      path: '/profile?tab=social',
      description: 'Your online talent network' 
    },
  ];

  const socialLinks: SocialLink[] = [
    { icon: Facebook, label: 'Facebook', url: 'https://facebook.com' },
    { icon: Instagram, label: 'Instagram', url: 'https://instagram.com' },
    { 
      icon: () => (
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          width="24" 
          height="24" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          className="lucide lucide-x"
        >
          <path d="M18 6 6 18" />
          <path d="m6 6 12 12" />
        </svg>
      ), 
      label: 'X (Twitter)', 
      url: 'https://x.com' 
    },
    { 
      icon: () => (
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          width="24" 
          height="24" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
          className="lucide"
        >
          <path d="M17 5H7a4 4 0 0 0-4 4v6a4 4 0 0 0 4 4h10a4 4 0 0 0 4-4V9a4 4 0 0 0-4-4Z" />
          <path d="M12 12a2 2 0 1 0 0 4 2 2 0 1 0 0-4z" />
          <path d="M17 9a1 1 0 1 0 0-2 1 1 0 0 0 0 2z" />
          <path d="m14.5 16.5-2.5-4-3 3" />
        </svg>
      ), 
      label: 'TikTok', 
      url: 'https://tiktok.com' 
    }
  ];

  const renderIcon = (icon: IconType) => {
    if (typeof icon === 'function') {
      if ((icon as IconRenderer).length === 0) {
        return (icon as IconRenderer)();
      }
      const IconComponent = icon as IconComponent;
      return <IconComponent className="h-5 w-5 text-blue-600" />;
    }
    return null;
  };

  return (
    <GlassMorphism className="w-64 p-4 h-screen sticky top-0 hidden md:block">
      <div className="mb-6">
        <Link to="/" className="flex items-center gap-2">
          <img 
            src="/lovable-uploads/b56312bb-24e8-4289-a96d-8651af4ddd7f.png" 
            alt="Y&T Network Logo" 
            className="h-8 w-8"
          />
          <h2 className="text-xl font-bold">Y&T Network</h2>
        </Link>
        <div className="relative mt-4">
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
                {renderIcon(item.icon)}
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
