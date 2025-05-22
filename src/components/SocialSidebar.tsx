
import React from 'react';
import { SidebarProvider } from './ui/sidebar';
import SidebarMain from './sidebar/SidebarMain';

const SocialSidebar: React.FC = () => {
  return (
    <SidebarProvider>
      <aside className="w-[280px] h-[calc(100vh)] overflow-y-auto fixed top-0 left-0 bg-gray-50 z-30 md:relative md:top-0 md:h-auto
        hidden md:block"
      >
        <SidebarMain />
      </aside>
    </SidebarProvider>
  );
};

export default SocialSidebar;
