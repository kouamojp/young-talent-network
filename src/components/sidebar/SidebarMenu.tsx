
import React from 'react';
import MenuSection from './components/MenuSection';
import { menuItems } from './sidebarData';

const SidebarMenu: React.FC = () => {
  return (
    <nav className="flex flex-col gap-3 px-2 py-3">
      <MenuSection items={menuItems} />
    </nav>
  );
};

export default SidebarMenu;
