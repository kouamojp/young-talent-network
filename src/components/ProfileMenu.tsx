
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
    <nav className="bg-white rounded-lg shadow-sm">
      <div className="p-2">
        <ul className="space-y-1">
          {menuItems.map((item) => (
            <li key={item.path}>
              <Link
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                  isActive(item.path)
                    ? 'bg-[#5181B8] text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <item.icon className="h-4 w-4" />
                <span>{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
};

export default ProfileMenu;
