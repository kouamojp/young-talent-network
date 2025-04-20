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
  Link as LinkIcon,
  Facebook,
  Instagram,
  X,
  CircleUser
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
    icon: Facebook,
    label: 'Facebook', 
    url: 'https://facebook.com' 
  },
  { 
    icon: Instagram,
    label: 'Instagram', 
    url: 'https://instagram.com' 
  },
  { 
    icon: X,
    label: 'X (Twitter)', 
    url: 'https://x.com' 
  },
  { 
    icon: CircleUser,
    label: 'TikTok', 
    url: 'https://tiktok.com' 
  }
];
