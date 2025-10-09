import { 
  GraduationCap,
  Building,
  Users,
  PanelRight,
  Radio,
  Newspaper,
  LayoutDashboard,
  MapPin,
  MessagesSquare,
  Bell,
  LucideIcon
} from 'lucide-react';

import { MenuSectionItem } from './types';

// Main navigation items
export const mainNavigationItems: MenuSectionItem[] = [
  {
    label: 'YAT LEARNING',
    description: 'Educational content',
    icon: GraduationCap,
    path: '/learning'
  },
  {
    label: 'Organizations',
    description: 'Browse agencies & companies',
    icon: Building,
    path: '/organizations'
  },
  {
    label: 'Talent Community',
    description: 'Connect with other talents',
    icon: Users,
    path: '/participants'
  },
  {
    label: 'YAT TV',
    description: 'Watch talent showcases',
    icon: PanelRight,
    path: '/tv'
  },
  {
    label: 'YAT LIVE',
    description: 'Streams & broadcasts',
    icon: Radio,
    path: '/live'
  },
  {
    label: 'News & Updates',
    description: 'Latest in sports & arts',
    icon: Newspaper,
    path: '/news'
  }
];

// Your Talent Profile section
export const profileItems: MenuSectionItem[] = [
  {
    label: 'Talent Dashboard',
    description: 'Your talent dashboard',
    icon: LayoutDashboard,
    path: '/talent-dashboard'
  },
  {
    label: 'Talents Around Me',
    description: 'Discover nearby talent',
    icon: MapPin,
    path: '/talents-around-me'
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
  }
];
