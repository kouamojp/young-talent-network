
import React from 'react';
import MenuItem from './MenuItem';
import { MenuSectionItem } from '../types';

interface MenuSectionProps {
  items: MenuSectionItem[];
}

const MenuSection: React.FC<MenuSectionProps> = ({ items }) => {
  return (
    <ul className="space-y-1">
      {items.map((item) => (
        <MenuItem
          key={item.label}
          icon={item.icon}
          label={item.label}
          description={item.description}
          path={item.path}
        />
      ))}
    </ul>
  );
};

export default MenuSection;
