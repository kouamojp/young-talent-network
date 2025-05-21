
import React from 'react';
import { Link } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { SidebarProvider } from './ui/sidebar';
import SidebarMain from './sidebar/SidebarMain';
import { Users, Bookmark, Star, Video, Clock, Calendar, Flag } from 'lucide-react';

const SocialSidebar: React.FC = () => {
  return (
    <SidebarProvider>
      <aside className="w-[300px] h-[calc(100vh-56px)] overflow-y-auto fixed top-14 left-0 bg-white z-30 md:relative md:top-0 md:h-auto
        animate-fade-in animate-scale-in
        hidden md:block md:animate-none"
      >
        <div className="space-y-1 py-2 px-2">
          {/* User Profile */}
          <Link to="/profile" className="flex items-center p-2 rounded-lg hover:bg-gray-100 transition-colors">
            <Avatar className="h-9 w-9">
              <AvatarImage src="/placeholder.svg" />
              <AvatarFallback>U</AvatarFallback>
            </Avatar>
            <span className="ml-3 font-medium">Your Profile</span>
          </Link>
          
          {/* Facebook-style shortcuts */}
          <Link to="/friends" className="flex items-center p-2 rounded-lg hover:bg-gray-100 transition-colors">
            <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
              <Users className="h-5 w-5" />
            </div>
            <span className="ml-3">Friends</span>
          </Link>
          
          <Link to="/saved" className="flex items-center p-2 rounded-lg hover:bg-gray-100 transition-colors">
            <div className="w-9 h-9 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">
              <Bookmark className="h-5 w-5" />
            </div>
            <span className="ml-3">Saved</span>
          </Link>
          
          <Link to="/communities" className="flex items-center p-2 rounded-lg hover:bg-gray-100 transition-colors">
            <div className="w-9 h-9 rounded-full bg-green-100 flex items-center justify-center text-green-600">
              <Star className="h-5 w-5" />
            </div>
            <span className="ml-3">Communities</span>
          </Link>
          
          <Link to="/watch" className="flex items-center p-2 rounded-lg hover:bg-gray-100 transition-colors">
            <div className="w-9 h-9 rounded-full bg-red-100 flex items-center justify-center text-red-600">
              <Video className="h-5 w-5" />
            </div>
            <span className="ml-3">Watch</span>
          </Link>
          
          <Link to="/memories" className="flex items-center p-2 rounded-lg hover:bg-gray-100 transition-colors">
            <div className="w-9 h-9 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-600">
              <Clock className="h-5 w-5" />
            </div>
            <span className="ml-3">Memories</span>
          </Link>
          
          <Link to="/events" className="flex items-center p-2 rounded-lg hover:bg-gray-100 transition-colors">
            <div className="w-9 h-9 rounded-full bg-pink-100 flex items-center justify-center text-pink-600">
              <Calendar className="h-5 w-5" />
            </div>
            <span className="ml-3">Events</span>
          </Link>
          
          <Link to="/pages" className="flex items-center p-2 rounded-lg hover:bg-gray-100 transition-colors">
            <div className="w-9 h-9 rounded-full bg-orange-100 flex items-center justify-center text-orange-600">
              <Flag className="h-5 w-5" />
            </div>
            <span className="ml-3">Pages</span>
          </Link>
          
          {/* See More button */}
          <button className="flex items-center p-2 rounded-lg hover:bg-gray-100 transition-colors w-full text-left">
            <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center text-gray-700">
              <span className="font-bold">•••</span>
            </div>
            <span className="ml-3">See More</span>
          </button>
          
          <hr className="my-2 border-gray-200" />
          
          <div className="pt-2 px-2">
            <h3 className="text-gray-500 font-medium text-sm mb-2">Your shortcuts</h3>
            {/* Shortcuts would go here - simplified for now */}
            <p className="text-sm text-gray-500 p-2">No shortcuts available</p>
          </div>
        </div>
      </aside>
    </SidebarProvider>
  );
};

export default SocialSidebar;
