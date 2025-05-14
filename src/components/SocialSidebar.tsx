
import React from 'react';
import { Link } from 'react-router-dom';
import SidebarMenu from './sidebar/SidebarMenu';
import SidebarSocial from './sidebar/SidebarSocial';
import SidebarSearch from './sidebar/SidebarSearch';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';

const SocialSidebar: React.FC = () => {
  return (
    <aside className="w-[290px] h-[calc(100vh-56px)] overflow-y-auto fixed top-14 left-0 p-4 bg-white shadow-md z-30 md:relative md:top-0 md:h-auto
      animate-fade-in animate-scale-in
      hidden md:block md:animate-none"
    >
      <div className="space-y-1">
        <Link to="/profile" className="flex items-center p-2 rounded-lg hover:bg-[#F0F2F5] transition-colors">
          <Avatar className="h-9 w-9">
            <AvatarImage src="/placeholder.svg" />
            <AvatarFallback>U</AvatarFallback>
          </Avatar>
          <span className="ml-3 font-medium">Votre Profil</span>
        </Link>
        <SidebarSearch />
        <SidebarMenu />
        <div className="border-t border-gray-200 my-2" />
        <SidebarSocial />
      </div>
    </aside>
  );
};

export default SocialSidebar;
