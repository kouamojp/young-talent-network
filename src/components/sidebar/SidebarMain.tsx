
import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { 
  Sidebar, 
  SidebarHeader,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';
import { 
  mainNavigationItems, 
  profileItems
} from './sidebarData';
import { MenuSectionItem } from './types';

const SidebarMain: React.FC = () => {
  const location = useLocation();
  const currentPath = location.pathname;

  const isActive = (path: string) => {
    if (path.includes('?')) {
      const basePath = path.split('?')[0];
      const queryParam = path.split('?')[1];
      return currentPath === path || (currentPath.startsWith(basePath) && currentPath.includes(queryParam));
    }
    return currentPath === path;
  };

  const renderMenuItems = (items: MenuSectionItem[]) => (
    <SidebarMenu>
      {items.map((item) => (
        <SidebarMenuItem key={item.label}>
          <SidebarMenuButton isActive={isActive(item.path)} asChild tooltip={item.description}>
            {item.url ? (
              <a href={item.url} target="_blank" rel="noopener noreferrer">
                <item.icon className="h-5 w-5 shrink-0" />
                <span className="ml-2 truncate">{item.label}</span>
              </a>
            ) : (
              <Link to={item.path}>
                <item.icon className="h-5 w-5 shrink-0" />
                <span className="ml-2 truncate">{item.label}</span>
              </Link>
            )}
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );

  return (
    <Sidebar className="px-2 py-4">
      <SidebarHeader>
        {/* Main Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-gray-500 font-medium text-sm px-2 mb-1">Main</SidebarGroupLabel>
          <SidebarGroupContent>
            {renderMenuItems(mainNavigationItems)}
          </SidebarGroupContent>
        </SidebarGroup>
        
        {/* Your Talent Profile */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-gray-500 font-medium text-sm px-2 mt-4 mb-1">Your Talent Profile</SidebarGroupLabel>
          <SidebarGroupContent>
            {renderMenuItems(profileItems)}
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarHeader>
    </Sidebar>
  );
};

export default SidebarMain;
