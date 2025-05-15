
import React from 'react';
import { useLocation } from 'react-router-dom';
import { Search } from 'lucide-react';
import { 
  Sidebar, 
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarInput,
  SidebarSeparator
} from '@/components/ui/sidebar';
import { menuItems, socialLinks } from './sidebarData';
import SidebarMenuSection from './components/SidebarMenuSection';

const SidebarMain: React.FC = () => {
  const location = useLocation();
  const currentPath = location.pathname;

  // Check if we're on a profile related route or subpath
  const isProfileSection = currentPath === '/profile' || 
                          currentPath.startsWith('/profile?');
  
  // Check if we're on main feed related routes
  const isFeedSection = currentPath === '/' || 
                      currentPath.includes('/messages') || 
                      currentPath.includes('/calls');

  // Group menu items by section for better organization
  const mainMenuItems = menuItems.slice(0, 5);
  const communityItems = menuItems.slice(5, 10); 
  const profileItems = menuItems.slice(10, 15);

  return (
    <Sidebar>
      <SidebarContent>
        {/* Search */}
        <div className="relative w-full px-2 py-3">
          <Search className="absolute left-4 top-5 h-4 w-4 text-gray-500" />
          <SidebarInput 
            placeholder="Search Y&T"
            className="pl-8 bg-gray-100 border-gray-200"
          />
        </div>
        
        {/* Main Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel>Main</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenuSection items={mainMenuItems} currentPath={currentPath} />
          </SidebarGroupContent>
        </SidebarGroup>
        
        <SidebarSeparator />
        
        {/* Communities & Content */}
        <SidebarGroup>
          <SidebarGroupLabel>Communities & Content</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenuSection items={communityItems} currentPath={currentPath} />
          </SidebarGroupContent>
        </SidebarGroup>
        
        <SidebarSeparator />
        
        {/* Profile */}
        <SidebarGroup>
          <SidebarGroupLabel>Your Talent Profile</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenuSection items={profileItems} currentPath={currentPath} />
          </SidebarGroupContent>
        </SidebarGroup>
        
        <SidebarSeparator />
        
        {/* Social Links */}
        <SidebarGroup>
          <SidebarGroupLabel>Connect</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenuSection items={socialLinks} currentPath={currentPath} />
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};

export default SidebarMain;
