
import React from 'react';
import MenuSection from './components/MenuSection';
import { menuItems } from './sidebarData';

const SidebarMenu: React.FC = () => {
  return (
    <nav className="flex flex-col gap-2">
      <MenuSection items={menuItems} />
    </nav>
  );
};

export default SidebarMenu;
