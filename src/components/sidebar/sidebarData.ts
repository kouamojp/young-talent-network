import { 
  Home, 
  Compass, 
  MessagesSquare, 
  Bell, 
  Users,
  User,
  Briefcase,
  LucideIcon,
  PanelRight,
  GraduationCap,
  Radio,
  Newspaper,
  Calendar,
  Building,
  FileText,
  MapPin
} from 'lucide-react';

import { MenuSectionItem } from './types';

// Main navigation items
export const mainNavigationItems: MenuSectionItem[] = [
  {
    label: 'Home',
    description: 'Your personalized feed',
    icon: Home,
    path: '/'
  },
  {
    label: 'Discover',
    description: 'Explore new content',
    icon: Compass,
    path: '/categories'
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
    path: '/notifications',
  }
];

// Content and communities section
export const contentItems: MenuSectionItem[] = [
  {
    label: 'Talents Around Me',
    description: 'Discover nearby talent',
    icon: MapPin,
    path: '/talents-around-me'
  },
  {
    label: 'Sports Categories',
    description: 'Explore sports',
    icon: Users,
    path: '/sports-categories'
  },
  {
    label: 'Learning Hub',
    description: 'Educational content',
    icon: GraduationCap,
    path: '/learning'
  },
  {
    label: 'Live Events',
    description: 'Streams & broadcasts',
    icon: Radio,
    path: '/live'
  },
  {
    label: 'News & Updates',
    description: 'Latest in sports & arts',
    icon: Newspaper,
    path: '/news'
  },
  {
    label: 'Upcoming Events',
    description: 'Calendar of activities',
    icon: Calendar,
    path: '/events'
  }
];

// Talent profile section
export const profileItems: MenuSectionItem[] = [
  {
    label: 'My Profile',
    description: 'Manage your presence',
    icon: User,
    path: '/profile'
  },
  {
    label: 'My Resumes',
    description: 'Your talent portfolios',
    icon: FileText,
    path: '/profile?tab=resumes',
    badge: "New"
  },
  {
    label: 'Organizations',
    description: 'Browse agencies & companies',
    icon: Building,
    path: '/organizations'
  },
  {
    label: 'Communities',
    description: 'Your groups & activities',
    icon: Users,
    path: '/communities'
  }
];

// Connect section
export const connectItems: MenuSectionItem[] = [
  {
    label: 'Talent Community',
    description: 'Connect with other talents',
    icon: Users,
    path: '/participants'
  },
  {
    label: 'Work Opportunities',
    description: 'Jobs & collaborations',
    icon: Briefcase,
    path: '/work',
    badge: "New"
  },
  {
    label: 'YAT TV',
    description: 'Watch talent showcases',
    icon: PanelRight,
    path: '/online-tv'
  }
];
