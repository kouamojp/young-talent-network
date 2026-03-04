import { 
  Home,
  Star,
  MessageSquare,
  Phone,
  Users,
  Users2,
  Radio,
  Image,
  Gamepad2,
  ShoppingBag,
  Settings,
  FileText,
  Images,
  UserCircle,
  Globe,
  LucideIcon
} from 'lucide-react';

import { MenuSectionItem } from './types';

export interface MenuSection {
  title: string;
  items: MenuSectionItem[];
}

// Main section
export const mainNavigationItems: MenuSectionItem[] = [
  {
    label: 'Profile',
    description: 'Your digital talent hub',
    icon: UserCircle,
    path: '/profile'
  },
  {
    label: 'Feed',
    description: 'Talent & opportunity stream',
    icon: Star,
    path: '/'
  },
  {
    label: 'Messenger',
    description: 'Secure chats & connections',
    icon: MessageSquare,
    path: '/messages'
  },
  {
    label: 'Calls',
    description: 'Voice/video meetings',
    icon: Phone,
    path: '/messages'
  },
  {
    label: 'Friends',
    description: 'Your talent network',
    icon: Users,
    path: '/participants'
  }
];

// Communities & Content
export const servicesItems: MenuSectionItem[] = [
  {
    label: 'Communities',
    description: 'Groups by interest',
    icon: Users2,
    path: '/communities'
  },
  {
    label: 'Live',
    description: 'Real-time talent streams',
    icon: Radio,
    path: '/live'
  },
  {
    label: 'Media Hub',
    description: 'Photos, music & videos',
    icon: Image,
    path: '/media'
  },
  {
    label: 'Games',
    description: 'Skill-based challenges',
    icon: Gamepad2,
    path: '/test'
  },
  {
    label: 'Market',
    description: 'Talent economy',
    icon: ShoppingBag,
    path: '/yat-coin'
  }
];

// Your Talent Profile
export const profileItems: MenuSectionItem[] = [
  {
    label: 'Settings',
    description: 'Customize your experience',
    icon: Settings,
    path: '/profile'
  },
  {
    label: 'Posts',
    description: 'Your talent stories',
    icon: FileText,
    path: '/news'
  },
  {
    label: 'Media',
    description: 'Photos & videos',
    icon: Images,
    path: '/media'
  },
  {
    label: 'About',
    description: 'Your talent journey',
    icon: UserCircle,
    path: '/profile'
  },
  {
    label: 'Social Universe',
    description: 'Your online talent network',
    icon: Globe,
    path: '/talents-around-me'
  }
];

// Connect (social links)
export const connectItems: MenuSectionItem[] = [
  {
    label: 'Facebook',
    description: 'Connect on Facebook',
    icon: Globe,
    path: '#',
    url: 'https://facebook.com'
  },
  {
    label: 'Instagram',
    description: 'Follow on Instagram',
    icon: Globe,
    path: '#',
    url: 'https://instagram.com'
  },
  {
    label: 'X (Twitter)',
    description: 'Follow on X',
    icon: Globe,
    path: '#',
    url: 'https://x.com'
  },
  {
    label: 'TikTok',
    description: 'Follow on TikTok',
    icon: Globe,
    path: '#',
    url: 'https://tiktok.com'
  }
];

export const allSections: MenuSection[] = [
  { title: 'Main', items: mainNavigationItems },
  { title: 'Communities & Content', items: servicesItems },
  { title: 'Your Talent Profile', items: profileItems },
  { title: 'Connect', items: connectItems },
];
