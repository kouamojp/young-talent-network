
import React from 'react';
import MenuItem from './MenuItem';
import { MenuSectionItem } from '../types';

interface MenuSectionProps {
  items: MenuSectionItem[];
  title?: string;
}

const MenuSection: React.FC<MenuSectionProps> = ({ items, title }) => {
  return (
    <div className="mb-2">
      {title && (
        <h3 className="px-4 text-[#65676B] font-medium text-sm mb-1">{title}</h3>
      )}
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
    </div>
  );
};

export default MenuSection;
