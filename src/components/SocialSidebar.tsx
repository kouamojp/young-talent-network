
import React from 'react';
import SidebarMain from './sidebar/SidebarMain';

const SocialSidebar: React.FC = () => {
  return (
    <aside className="w-full h-full bg-card border-r border-border">
      <SidebarMain />
    </aside>
  );
};

export default SocialSidebar;
