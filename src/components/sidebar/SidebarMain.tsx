
import React from 'react';
import { useLocation } from 'react-router-dom';
import { 
  Sidebar, 
  SidebarHeader,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
} from '@/components/ui/sidebar';
import { 
  mainNavigationItems, 
  contentItems, 
  profileItems,
  connectItems 
} from './sidebarData';
import SidebarMenuSection from './components/SidebarMenuSection';

const SidebarMain: React.FC = () => {
  const location = useLocation();
  const currentPath = location.pathname;

  return (
    <Sidebar className="px-2 py-4">
      <SidebarHeader>
        {/* Main Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-gray-500 font-medium text-sm px-2 mb-1">Main</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenuSection items={mainNavigationItems} currentPath={currentPath} />
          </SidebarGroupContent>
        </SidebarGroup>
        
        {/* Communities & Content */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-gray-500 font-medium text-sm px-2 mt-4 mb-1">Communities & Content</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenuSection items={contentItems} currentPath={currentPath} />
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
            <SidebarMenuSection items={connectItems} currentPath={currentPath} />
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarHeader>
    </Sidebar>
  );
};

export default SidebarMain;
