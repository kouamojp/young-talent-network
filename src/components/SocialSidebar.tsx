
import React from 'react';
import { Link } from 'react-router-dom';
import GlassMorphism from './GlassMorphism';
import SidebarSearch from './sidebar/SidebarSearch';
import SidebarMenu from './sidebar/SidebarMenu';
import SidebarSocial from './sidebar/SidebarSocial';
import SidebarTrending from './sidebar/SidebarTrending';

const SocialSidebar: React.FC = () => {
  return (
    <GlassMorphism className="w-64 p-4 h-screen sticky top-0 hidden md:block">
      <div className="mb-6">
        <Link to="/" className="flex items-center gap-2">
          <img 
            src="/lovable-uploads/b56312bb-24e8-4289-a96d-8651af4ddd7f.png" 
            alt="Y&T Network Logo" 
            className="h-8 w-8"
          />
          <h2 className="text-xl font-bold">Y&T Network</h2>
        </Link>
        <SidebarSearch />
      </div>
      
      <SidebarMenu />
      <SidebarSocial />
      <SidebarTrending />
    </GlassMorphism>
  );
};

export default SocialSidebar;
