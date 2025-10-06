
import React, { useState } from 'react';
import { Search, MessageSquare, Bell, User, ChevronDown } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { useIsMobile } from '@/hooks/use-mobile';
import { Button } from './ui/button';

const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const isMobile = useIsMobile();

  return (
    <header className="fixed top-0 left-0 right-0 h-14 bg-white border-b border-gray-200 shadow-sm z-50">
      <div className="max-w-screen-2xl mx-auto px-4 flex items-center justify-between h-full">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <Link to="/" className="flex items-center">
            <img 
              src="/lovable-uploads/b56312bb-24e8-4289-a96d-8651af4ddd7f.png" 
              alt="Logo" 
              className="h-9 w-9"
            />
          </Link>
        </div>

        {/* Center Search */}
        <div className="flex-1 max-w-2xl mx-4 hidden md:block">
          <div className="relative flex items-center bg-gray-100 rounded-full">
            <Search className="absolute left-3 h-4 w-4 text-gray-500" />
            <input 
              type="text"
              placeholder="Search Y&T"
              className="h-10 w-full bg-gray-100 pl-10 pr-4 rounded-full text-sm focus:outline-none focus:ring-1 focus:ring-blue-400"
            />
          </div>
        </div>

        {/* Right side icons */}
        <div className="flex items-center gap-2">
          <Link to="/profile" className="hidden sm:flex items-center gap-2 rounded-full hover:bg-gray-100 p-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src="/placeholder.svg" />
              <AvatarFallback>U</AvatarFallback>
            </Avatar>
            <span className="text-sm font-medium hidden md:inline">Your Profile</span>
          </Link>
          
          {/* Facebook-style circular buttons */}
          <div className="flex items-center space-x-2">
            <Button 
              variant="ghost" 
              size="icon"
              className="rounded-full bg-gray-200 hover:bg-gray-300"
              asChild
            >
              <Link to="/messages">
                <MessageSquare className="h-5 w-5 text-black" />
              </Link>
            </Button>
            <Button 
              variant="ghost" 
              size="icon"
              className="rounded-full bg-gray-200 hover:bg-gray-300"
            >
              <Bell className="h-5 w-5 text-black" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon"
              className="rounded-full bg-gray-200 hover:bg-gray-300"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <ChevronDown className="h-5 w-5 text-black" />
            </Button>
          </div>
        </div>
      </div>
      
      {/* Mobile Search - Only visible on mobile */}
      <div className="md:hidden px-4 pb-2">
        <div className="relative flex items-center bg-gray-100 rounded-full">
          <Search className="absolute left-3 h-4 w-4 text-gray-500" />
          <input 
            type="text"
            placeholder="Search Y&T"
            className="h-9 w-full bg-gray-100 pl-10 pr-4 rounded-full text-sm focus:outline-none focus:ring-1 focus:ring-blue-400"
          />
        </div>
      </div>
    </header>
  );
};

export default Navbar;
