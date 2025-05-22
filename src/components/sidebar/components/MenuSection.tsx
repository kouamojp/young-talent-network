
import React from 'react';
import { MenuSectionItem } from '@/components/sidebar/types';
import { cn } from '@/lib/utils';
import SidebarMenuLink from './SidebarMenuLink';

interface MenuSectionProps {
  items: MenuSectionItem[];
  isCollapsed?: boolean;
  className?: string;
}

const MenuSection: React.FC<MenuSectionProps> = ({
  items,
  isCollapsed = false,
  className
}) => {
  return (
    <div className={cn("space-y-1", className)}>
      {items.map((item, index) => (
        <SidebarMenuLink
          key={`${item.label}-${index}`}
          item={item}
          isCollapsed={isCollapsed}
        />
      ))}
    </div>
  );
};

export default MenuSection;
