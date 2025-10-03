
import React from 'react';
import { Link } from 'react-router-dom';
import { mainNavigationItems } from './sidebarData';
import { useIsMobile } from '@/hooks/use-mobile';

const SidebarMenu: React.FC = () => {
  const isMobile = useIsMobile();
  
  return (
    <nav className={`flex flex-col gap-3 px-2 py-3 ${isMobile ? 'text-sm' : ''}`}>
      <div className="space-y-1">
        {mainNavigationItems.map((item, index) => (
          <Link
            key={`${item.label}-${index}`}
            to={item.path}
            className="flex h-9 items-center rounded-md px-3 text-sm font-medium hover:bg-gray-100"
          >
            <item.icon className="h-5 w-5 shrink-0" />
            <span className="ml-2 truncate">{item.label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
};

export default SidebarMenu;
