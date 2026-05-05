
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  MessageSquare, 
  Users, 
  Briefcase,
  Calendar,
  Settings,
  Heart,
  Search,
  Bell,
  User
} from 'lucide-react';
import { useLanguage } from '@/i18n/LanguageContext';

const ProfileMenu: React.FC = () => {
  const location = useLocation();
  const currentPath = location.pathname;
  const { t } = useLanguage();

  const menuItems = [
    { icon: Home, labelKey: 'sidebar.myFeed', path: '/' },
    { icon: MessageSquare, labelKey: 'sidebar.messenger', path: '/messages' },
    { icon: Users, labelKey: 'sidebar.communities', path: '/communities' },
    { icon: Briefcase, labelKey: 'sidebar.yatWork', path: '/work' },
    { icon: Calendar, labelKey: 'sidebar.yatEvents', path: '/events' },
    { icon: Search, labelKey: 'common.search', path: '/search' },
    { icon: Bell, labelKey: 'nav.notifications', path: '/notifications' },
    { icon: User, labelKey: 'sidebar.profile', path: '/profile' },
    { icon: Settings, labelKey: 'sidebar.settings', path: '/settings' },
  ];

  const isActive = (path: string) => currentPath === path;

  return (
    <nav className="flex items-center gap-6">
      {menuItems.map((item) => (
        <Link
          key={item.path}
          to={item.path}
          className={`flex items-center gap-2 px-2 py-1 rounded text-sm transition-colors ${
            isActive(item.path)
              ? 'text-blue-200 font-medium'
              : 'text-white hover:text-blue-200'
          }`}
        >
          <item.icon className="h-4 w-4" />
          <span className="hidden lg:inline">{t(item.labelKey)}</span>
        </Link>
      ))}
    </nav>
  );
};

export default ProfileMenu;
