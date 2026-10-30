import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Search, Play, MessageSquare, User } from 'lucide-react';
import { useLanguage } from '@/i18n/LanguageContext';

const MobileBottomNav: React.FC = () => {
  const location = useLocation();
  const { t } = useLanguage();

  // Hide bottom nav on the fullscreen Shorts experience
  if (location.pathname.startsWith('/shorts')) return null;



  const navItems = [
    { path: '/', icon: Home, label: t('bottomNav.home') },
    { path: '/search', icon: Search, label: t('bottomNav.search') },
    { path: '/shorts', icon: Play, label: 'Shorts' },
    { path: '/messages', icon: MessageSquare, label: t('bottomNav.messages') },
    { path: '/profile', icon: User, label: t('bottomNav.profile') },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border md:hidden safe-area-bottom">
      <div className="flex items-center justify-around h-14">
        {navItems.map(({ path, icon: Icon, label }) => {
          const isActive = location.pathname === path;
          return (
            <Link
              key={path}
              to={path}
              aria-current={isActive ? 'page' : undefined}
              className={`relative flex flex-col items-center justify-center flex-1 h-full gap-1 transition-colors ${
                isActive
                  ? 'text-primary before:absolute before:top-0 before:h-[3px] before:w-8 before:rounded-b-full before:bg-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon className="h-5 w-5" strokeWidth={isActive ? 2.25 : 1.75} />
              <span className={`text-[10.5px] leading-none ${isActive ? 'font-semibold' : 'font-medium'}`}>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileBottomNav;
