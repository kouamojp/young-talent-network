import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Search, Newspaper, MessageSquare, User } from 'lucide-react';

const navItems = [
  { path: '/', icon: Home, label: 'Accueil' },
  { path: '/search', icon: Search, label: 'Recherche' },
  { path: '/news', icon: Newspaper, label: 'Actualités' },
  { path: '/messages', icon: MessageSquare, label: 'Messages' },
  { path: '/profile', icon: User, label: 'Profil' },
];

const MobileBottomNav: React.FC = () => {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border md:hidden safe-area-bottom">
      <div className="flex items-center justify-around h-14">
        {navItems.map(({ path, icon: Icon, label }) => {
          const isActive = location.pathname === path;
          return (
            <Link
              key={path}
              to={path}
              className={`flex flex-col items-center justify-center flex-1 h-full gap-0.5 transition-colors ${
                isActive
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon className="h-5 w-5" strokeWidth={isActive ? 2.5 : 2} />
              <span className="text-[10px] font-medium leading-none">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileBottomNav;
