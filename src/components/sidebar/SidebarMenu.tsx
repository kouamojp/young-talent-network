
import React from 'react';
import MenuSection from './components/MenuSection';
import { mainNavigationItems } from './sidebarData';
import { useIsMobile } from '@/hooks/use-mobile';

const SidebarMenu: React.FC = () => {
  const isMobile = useIsMobile();
  
  return (
    <nav className={`flex flex-col gap-3 px-2 py-3 ${isMobile ? 'text-sm' : ''}`}>
      <MenuSection items={mainNavigationItems} />
    </nav>
  );
};

export default SidebarMenu;
