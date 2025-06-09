
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

const ProfileMenu: React.FC = () => {
  const location = useLocation();
  const currentPath = location.pathname;

  const menuItems = [
    { icon: Home, label: 'Новости', path: '/' },
    { icon: MessageSquare, label: 'Сообщения', path: '/messages' },
    { icon: Users, label: 'Сообщества', path: '/communities' },
    { icon: Briefcase, label: 'Работа', path: '/work' },
    { icon: Calendar, label: 'События', path: '/events' },
    { icon: Search, label: 'Поиск', path: '/search' },
    { icon: Bell, label: 'Уведомления', path: '/notifications' },
    { icon: User, label: 'Профиль', path: '/profile' },
    { icon: Settings, label: 'Настройки', path: '/settings' },
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
          <span className="hidden lg:inline">{item.label}</span>
        </Link>
      ))}
    </nav>
  );
};

export default ProfileMenu;
