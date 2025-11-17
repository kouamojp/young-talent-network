import { 
  Home,
  User,
  Users,
  MessagesSquare,
  Bell,
  Briefcase,
  GraduationCap,
  Radio,
  Calendar,
  Map,
  Building,
  Newspaper,
  LucideIcon
} from 'lucide-react';

import { MenuSectionItem } from './types';

// Main navigation items - VK style organization
export const mainNavigationItems: MenuSectionItem[] = [
  {
    label: 'My Page',
    description: 'Your profile',
    icon: Home,
    path: '/'
  },
  {
    label: 'Profile',
    description: 'Your talent profile',
    icon: User,
    path: '/profile'
  },
  {
    label: 'Messages',
    description: 'Your conversations',
    icon: MessagesSquare,
    path: '/messages'
  },
  {
    label: 'Notifications',
    description: 'Stay updated',
    icon: Bell,
    path: '/notifications'
  },
  {
    label: 'Friends',
    description: 'Your connections',
    icon: Users,
    path: '/participants'
  }
];

// Secondary navigation - Services
export const servicesItems: MenuSectionItem[] = [
  {
    label: 'Work',
    description: 'Job opportunities',
    icon: Briefcase,
    path: '/work'
  },
  {
    label: 'Organizations',
    description: 'Browse companies',
    icon: Building,
    path: '/organizations'
  },
  {
    label: 'Learning',
    description: 'Educational content',
    icon: GraduationCap,
    path: '/learning'
  },
  {
    label: 'Live',
    description: 'Streams & broadcasts',
    icon: Radio,
    path: '/live'
  },
  {
    label: 'Events',
    description: 'Sports events',
    icon: Calendar,
    path: '/events'
  },
  {
    label: 'Map',
    description: 'Explore locations',
    icon: Map,
    path: '/karta'
  },
  {
    label: 'News',
    description: 'Latest updates',
    icon: Newspaper,
    path: '/news'
  }
];
