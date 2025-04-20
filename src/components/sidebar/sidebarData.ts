
import { 
  User, 
  Star, 
  MessageCircle, 
  PhoneCall,
  Users, 
  Citrus,
  Video,
  Image,
  Gamepad,
  ShoppingBag,
  Settings,
  FileText,
  Image as ImageIcon,
  Link as LinkIcon
} from 'lucide-react';

export const menuItems = [
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
    icon: Video, 
    label: 'Live', 
    path: '/live',
    description: 'Real-time talent streams' 
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

export const socialLinks = [
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
        className="lucide lucide-facebook"
      >
        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
      </svg>
    ),
    label: 'Facebook', 
    url: 'https://facebook.com' 
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
        className="lucide lucide-instagram"
      >
        <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
        <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
      </svg>
    ),
    label: 'Instagram', 
    url: 'https://instagram.com' 
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
        className="lucide lucide-x"
      >
        <path d="M18 6 6 18"/>
        <path d="m6 6 12 12"/>
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
