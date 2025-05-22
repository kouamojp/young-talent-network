
import React from 'react';
import { useLocation } from 'react-router-dom';
import { 
  Sidebar, 
  SidebarHeader,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
} from '@/components/ui/sidebar';
import { menuItems, socialLinks } from './sidebarData';
import SidebarMenuSection from './components/SidebarMenuSection';

const SidebarMain: React.FC = () => {
  const location = useLocation();
  const currentPath = location.pathname;

  // Group menu items by section for better organization
  const mainMenuItems = menuItems.slice(0, 5);
  const communityItems = menuItems.slice(5, 10); 
  const profileItems = menuItems.slice(10, 15);

  return (
    <Sidebar className="px-2 py-4">
      <SidebarHeader>
        {/* Main Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-gray-500 font-medium text-sm px-2 mb-1">Main</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenuSection items={mainMenuItems} currentPath={currentPath} />
          </SidebarGroupContent>
        </SidebarGroup>
        
        {/* Communities & Content */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-gray-500 font-medium text-sm px-2 mt-4 mb-1">Communities & Content</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenuSection items={communityItems} currentPath={currentPath} />
          </SidebarGroupContent>
        </SidebarGroup>
        
        {/* Profile */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-gray-500 font-medium text-sm px-2 mt-4 mb-1">Your Talent Profile</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenuSection items={profileItems} currentPath={currentPath} />
          </SidebarGroupContent>
        </SidebarGroup>
        
        {/* Social Links */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-gray-500 font-medium text-sm px-2 mt-4 mb-1">Connect</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenuSection items={socialLinks} currentPath={currentPath} />
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarHeader>
    </Sidebar>
  );
};

export default SidebarMain;
