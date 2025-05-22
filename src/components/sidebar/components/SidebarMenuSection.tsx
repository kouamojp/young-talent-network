
import React from 'react';
import { useLocation } from 'react-router-dom';
import { 
  SidebarMenu, 
  SidebarMenuItem, 
  SidebarMenuButton 
} from '@/components/ui/sidebar';
import { MenuSectionItem } from '../types';
import SidebarMenuLink from './SidebarMenuLink';

interface SidebarMenuSectionProps {
  items: MenuSectionItem[];
  currentPath: string;
}

const SidebarMenuSection: React.FC<SidebarMenuSectionProps> = ({ items, currentPath }) => {
  // Helper function to check if an item should be marked as active
  const isActive = (path: string) => {
    if (path.includes('?')) {
      // For paths with query params like /profile?tab=posts
      const basePath = path.split('?')[0];
      const queryParam = path.split('?')[1];
      
      return currentPath === path || 
             (currentPath.startsWith(basePath) && currentPath.includes(queryParam));
    }
    return currentPath === path;
  };

  return (
    <SidebarMenu>
      {items.map((item) => (
        <SidebarMenuItem key={item.label}>
          <SidebarMenuButton 
            isActive={isActive(item.path)}
            asChild
            tooltip={item.description}
          >
            <SidebarMenuLink
              icon={item.icon}
              label={item.label}
              path={item.path}
              description={item.description}
              url={item.url}
              badge={item.badge}
              badgeColor={item.badgeColor}
            />
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );
};

export default SidebarMenuSection;
