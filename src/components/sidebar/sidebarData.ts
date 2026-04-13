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
  Briefcase,
  CalendarDays,
  GraduationCap,
  Building2,
  Map,
  Tv,
  Database,
  Download,
  Shield,
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
    path: '/profile',
    iconColor: 'text-blue-500',
  },
  {
    label: 'What is YAT?',
    description: 'Discover the platform',
    icon: Star,
    path: '/',
    iconColor: 'text-amber-500',
  },
  {
    label: 'My Feed',
    description: 'Your personalized stream',
    icon: Home,
    path: '/feed',
    iconColor: 'text-emerald-500',
  },
  {
    label: 'Messenger',
    description: 'Secure chats & connections',
    icon: MessageSquare,
    path: '/messages',
    iconColor: 'text-sky-500',
    badge: '3',
    badgeColor: 'bg-red-500 text-white',
  },
  {
    label: 'Calls',
    description: 'Voice/video meetings',
    icon: Phone,
    path: '/calls',
    iconColor: 'text-green-500',
  },
  {
    label: 'Friends',
    description: 'Your talent network',
    icon: Users,
    path: '/friends',
    iconColor: 'text-indigo-500',
    badge: '12',
    badgeColor: 'bg-blue-500 text-white',
  },
  {
    label: 'Settings',
    description: 'Customize your experience',
    icon: Settings,
    path: '/settings',
    iconColor: 'text-gray-500',
  },
  {
    label: 'Media Hub',
    description: 'Photos, music & videos',
    icon: Image,
    path: '/media',
    iconColor: 'text-pink-500',
  },
  {
    label: 'Communities',
    description: 'Groups by interest',
    icon: Users2,
    path: '/communities',
    iconColor: 'text-purple-500',
  },
];

// Services YAT
export const yatServicesItems: MenuSectionItem[] = [
  {
    label: 'YAT Work',
    description: 'Jobs & opportunities',
    icon: Briefcase,
    path: '/work',
    iconColor: 'text-orange-500',
    badge: 'New',
    badgeColor: 'bg-emerald-500 text-white',
  },
  {
    label: 'YAT Events',
    description: 'Sports & talent events',
    icon: CalendarDays,
    path: '/events',
    iconColor: 'text-rose-500',
    badge: '5',
    badgeColor: 'bg-rose-500 text-white',
  },
  {
    label: 'YAT Learning',
    description: 'Courses & training',
    icon: GraduationCap,
    path: '/learning',
    iconColor: 'text-violet-500',
  },
  {
    label: 'Organizations',
    description: 'Clubs & companies',
    icon: Building2,
    path: '/organizations',
    iconColor: 'text-teal-500',
  },
  {
    label: 'YAT Karta',
    description: 'Global talent map',
    icon: Map,
    path: '/karta',
    iconColor: 'text-cyan-500',
  },
  {
    label: 'YAT Database',
    description: 'Search all participants',
    icon: Database,
    path: '/yat-database',
    iconColor: 'text-amber-600',
    badge: 'New',
    badgeColor: 'bg-amber-500 text-white',
  },
];

// Communities & Content
export const servicesItems: MenuSectionItem[] = [
  {
    label: 'Live',
    description: 'Real-time talent streams',
    icon: Radio,
    path: '/live',
    iconColor: 'text-red-500',
    badge: 'LIVE',
    badgeColor: 'bg-red-500 text-white',
  },
  {
    label: 'Online TV',
    description: 'Talent TV channels',
    icon: Tv,
    path: '/tv',
    iconColor: 'text-fuchsia-500',
  },
  {
    label: 'Games',
    description: 'Skill-based challenges',
    icon: Gamepad2,
    path: '/test',
    iconColor: 'text-lime-500',
  },
  {
    label: 'YAT COIN',
    description: 'Talent economy',
    icon: ShoppingBag,
    path: '/yat-coin',
    iconColor: 'text-yellow-500',
  },
  {
    label: 'YAT Marketplace',
    description: 'Buy & sell products/services',
    icon: ShoppingBag,
    path: '/marketplace',
    iconColor: 'text-orange-600',
    badge: 'New',
    badgeColor: 'bg-orange-500 text-white',
  },
  {
    label: 'YAT Social',
    description: 'Your social networks hub',
    icon: Globe,
    path: '/social',
    iconColor: 'text-blue-500',
  },
  {
    label: 'Posts',
    description: 'Your talent stories',
    icon: FileText,
    path: '/news',
    iconColor: 'text-blue-400',
  },
  {
    label: 'Social Universe',
    description: 'Your online talent network',
    icon: Globe,
    path: '/talents-around-me',
    iconColor: 'text-emerald-500',
  }
];

// Connect (social links)
export const connectItems: MenuSectionItem[] = [
  {
    label: 'Facebook',
    description: 'Connect on Facebook',
    icon: Globe,
    path: '#',
    url: 'https://facebook.com',
    iconColor: 'text-blue-600',
  },
  {
    label: 'Instagram',
    description: 'Follow on Instagram',
    icon: Globe,
    path: '#',
    url: 'https://instagram.com',
    iconColor: 'text-pink-600',
  },
  {
    label: 'X (Twitter)',
    description: 'Follow on X',
    icon: Globe,
    path: '#',
    url: 'https://x.com',
    iconColor: 'text-gray-700',
  },
  {
    label: 'TikTok',
    description: 'Follow on TikTok',
    icon: Globe,
    path: '#',
    url: 'https://tiktok.com',
    iconColor: 'text-black',
  }
];

const installItem: MenuSectionItem[] = [
  {
    label: 'Installer YAT',
    description: 'Ajouter à l\'écran d\'accueil',
    icon: Download,
    path: '/install',
    iconColor: 'text-primary',
    badge: 'App',
    badgeColor: 'bg-primary text-white',
  }
];

const adminItems: MenuSectionItem[] = [
  {
    label: 'Admin Panel',
    description: 'Platform administration',
    icon: Shield,
    path: '/admin',
    iconColor: 'text-red-600',
    badge: 'Admin',
    badgeColor: 'bg-red-100 text-red-800',
  }
];

export const allSections: MenuSection[] = [
  { title: 'Your Profile', items: mainNavigationItems },
  { title: 'Services YAT', items: yatServicesItems },
  { title: 'Communities & Content', items: servicesItems },
  { title: 'Connect', items: connectItems },
  { title: 'Application', items: installItem },
  { title: 'Administration', items: adminItems },
];
