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
  Sparkles,
  LucideIcon
} from 'lucide-react';

import { MenuSectionItem } from './types';

export interface MenuSection {
  titleKey: string;
  items: MenuSectionItem[];
}

// Main section
export const mainNavigationItems: MenuSectionItem[] = [
  {
    label: 'sidebar.profile',
    description: 'sidebar.profile.desc',
    icon: UserCircle,
    path: '/profile',
    iconColor: 'text-blue-500',
  },
  {
    label: 'sidebar.whatIsYat',
    description: 'sidebar.whatIsYat.desc',
    icon: Star,
    path: '/',
    iconColor: 'text-amber-500',
  },
  {
    label: 'sidebar.myFeed',
    description: 'sidebar.myFeed.desc',
    icon: Home,
    path: '/feed',
    iconColor: 'text-emerald-500',
  },
  {
    label: 'sidebar.messenger',
    description: 'sidebar.messenger.desc',
    icon: MessageSquare,
    path: '/messages',
    iconColor: 'text-sky-500',
  },
  {
    label: 'sidebar.calls',
    description: 'sidebar.calls.desc',
    icon: Phone,
    path: '/calls',
    iconColor: 'text-green-500',
  },
  {
    label: 'sidebar.friends',
    description: 'sidebar.friends.desc',
    icon: Users,
    path: '/friends',
    iconColor: 'text-indigo-500',
  },
  {
    label: 'sidebar.settings',
    description: 'sidebar.settings.desc',
    icon: Settings,
    path: '/settings',
    iconColor: 'text-gray-500',
  },
  {
    label: 'sidebar.assistant',
    description: 'sidebar.assistant.desc',
    icon: Sparkles,
    path: '/assistant',
    iconColor: 'text-violet-500',
  },
  {
    label: 'sidebar.mediaHub',
    description: 'sidebar.mediaHub.desc',
    icon: Image,
    path: '/media',
    iconColor: 'text-pink-500',
  },
  {
    label: 'sidebar.communities',
    description: 'sidebar.communities.desc',
    icon: Users2,
    path: '/communities',
    iconColor: 'text-purple-500',
  },
];

// Services YAT
export const yatServicesItems: MenuSectionItem[] = [
  {
    label: 'sidebar.yatWork',
    description: 'sidebar.yatWork.desc',
    icon: Briefcase,
    path: '/work',
    iconColor: 'text-orange-500',
    badge: 'New',
    badgeColor: 'bg-emerald-500 text-white',
  },
  {
    label: 'sidebar.yatEvents',
    description: 'sidebar.yatEvents.desc',
    icon: CalendarDays,
    path: '/events',
    iconColor: 'text-rose-500',
  },
  {
    label: 'sidebar.yatLearning',
    description: 'sidebar.yatLearning.desc',
    icon: GraduationCap,
    path: '/learning',
    iconColor: 'text-violet-500',
  },
  {
    label: 'sidebar.organizations',
    description: 'sidebar.organizations.desc',
    icon: Building2,
    path: '/organizations',
    iconColor: 'text-teal-500',
  },
  {
    label: 'sidebar.yatKarta',
    description: 'sidebar.yatKarta.desc',
    icon: Map,
    path: '/karta',
    iconColor: 'text-cyan-500',
  },
  {
    label: 'sidebar.yatDatabase',
    description: 'sidebar.yatDatabase.desc',
    icon: Database,
    path: '/yat-database',
    iconColor: 'text-amber-600',
    badge: 'New',
    badgeColor: 'bg-amber-500 text-white',
  },
  {
    label: 'Recherche avancée',
    description: 'Filtres détaillés : type, pays, niveau, compétences...',
    icon: Sparkles,
    path: '/advanced-search',
    iconColor: 'text-pink-500',
    badge: 'New',
    badgeColor: 'bg-pink-500 text-white',
  },
];

// Communities & Content
export const servicesItems: MenuSectionItem[] = [
  {
    label: 'sidebar.live',
    description: 'sidebar.live.desc',
    icon: Radio,
    path: '/live',
    iconColor: 'text-red-500',
    badge: 'LIVE',
    badgeColor: 'bg-red-500 text-white',
  },
  {
    label: 'sidebar.onlineTV',
    description: 'sidebar.onlineTV.desc',
    icon: Tv,
    path: '/tv',
    iconColor: 'text-fuchsia-500',
  },
  {
    label: 'sidebar.games',
    description: 'sidebar.games.desc',
    icon: Gamepad2,
    path: '/test',
    iconColor: 'text-lime-500',
  },
  {
    label: 'sidebar.yatCoin',
    description: 'sidebar.yatCoin.desc',
    icon: ShoppingBag,
    path: '/yat-coin',
    iconColor: 'text-yellow-500',
  },
  {
    label: 'sidebar.yatMarketplace',
    description: 'sidebar.yatMarketplace.desc',
    icon: ShoppingBag,
    path: '/marketplace',
    iconColor: 'text-orange-600',
    badge: 'New',
    badgeColor: 'bg-orange-500 text-white',
  },
  {
    label: 'sidebar.yatSocial',
    description: 'sidebar.yatSocial.desc',
    icon: Globe,
    path: '/social',
    iconColor: 'text-blue-500',
  },
  {
    label: 'sidebar.posts',
    description: 'sidebar.posts.desc',
    icon: FileText,
    path: '/news',
    iconColor: 'text-blue-400',
  },
  {
    label: 'sidebar.socialUniverse',
    description: 'sidebar.socialUniverse.desc',
    icon: Globe,
    path: '/talents-around-me',
    iconColor: 'text-emerald-500',
  }
];

// Connect (social links)
export const connectItems: MenuSectionItem[] = [
  {
    label: 'Facebook',
    description: 'sidebar.connectFacebook',
    icon: Globe,
    path: '#',
    url: 'https://facebook.com',
    iconColor: 'text-blue-600',
  },
  {
    label: 'Instagram',
    description: 'sidebar.connectInstagram',
    icon: Globe,
    path: '#',
    url: 'https://instagram.com',
    iconColor: 'text-pink-600',
  },
  {
    label: 'X (Twitter)',
    description: 'sidebar.connectX',
    icon: Globe,
    path: '#',
    url: 'https://x.com',
    iconColor: 'text-gray-700',
  },
  {
    label: 'TikTok',
    description: 'sidebar.connectTikTok',
    icon: Globe,
    path: '#',
    url: 'https://tiktok.com',
    iconColor: 'text-black',
  }
];

const installItem: MenuSectionItem[] = [
  {
    label: 'sidebar.installYat',
    description: 'sidebar.installYat.desc',
    icon: Download,
    path: '/install',
    iconColor: 'text-primary',
    badge: 'App',
    badgeColor: 'bg-primary text-white',
  }
];

const adminItems: MenuSectionItem[] = [
  {
    label: 'sidebar.adminPanel',
    description: 'sidebar.adminPanel.desc',
    icon: Shield,
    path: '/admin',
    iconColor: 'text-red-600',
    badge: 'Admin',
    badgeColor: 'bg-red-100 text-red-800',
  }
];

export const allSections: MenuSection[] = [
  { titleKey: 'sidebar.yourProfile', items: mainNavigationItems },
  { titleKey: 'sidebar.servicesYat', items: yatServicesItems },
  { titleKey: 'sidebar.communitiesContent', items: servicesItems },
  { titleKey: 'sidebar.connect', items: connectItems },
  { titleKey: 'sidebar.application', items: installItem },
  { titleKey: 'sidebar.administration', items: adminItems },
];
