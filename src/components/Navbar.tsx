
import React, { useState } from 'react';
import { Search, MessageSquare, Bell, User } from 'lucide-react';
import { Link } from 'react-router-dom';

const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 h-14 bg-white shadow-sm z-50">
      <div className="max-w-screen-2xl mx-auto px-4 flex items-center justify-between h-full">
        {/* Logo and Search */}
        <div className="flex items-center gap-3">
          <Link to="/" className="flex items-center">
            <img 
              src="/lovable-uploads/b56312bb-24e8-4289-a96d-8651af4ddd7f.png" 
              alt="Logo" 
              className="h-8 w-8"
            />
          </Link>
          <div className="relative hidden md:flex items-center">
            <div className="relative flex items-center bg-gray-100 rounded-full">
              <Search className="absolute left-3 h-4 w-4 text-gray-400" />
              <input 
                type="text"
                placeholder="Search Y&T"
                className="h-9 w-64 bg-gray-100 pl-10 pr-4 rounded-full text-sm focus:outline-none focus:ring-1 focus:ring-blue-400"
              />
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-4">
          <Link to="/" className="text-sm font-medium hover:text-blue-500">Home</Link>
          <Link to="/categories" className="text-sm font-medium hover:text-blue-500">Categories</Link>
          <Link to="/sports-categories" className="text-sm font-medium hover:text-blue-500">Sports</Link>
          <Link to="/work" className="text-sm font-medium hover:text-blue-500">Work</Link>
        </nav>

        {/* Right side icons */}
        <div className="flex items-center gap-4">
          <Link to="/messages" className="hidden sm:flex items-center justify-center h-9 w-9 hover:bg-gray-100 rounded-full">
            <MessageSquare className="h-5 w-5 text-gray-600" />
          </Link>
          <Link to="/notifications" className="hidden sm:flex items-center justify-center h-9 w-9 hover:bg-gray-100 rounded-full">
            <Bell className="h-5 w-5 text-gray-600" />
          </Link>
          <Link to="/profile" className="flex items-center justify-center h-9 w-9 hover:bg-gray-100 rounded-full">
            <User className="h-5 w-5 text-gray-600" />
          </Link>
        </div>
      </div>
      
      {/* Mobile Search - Only visible on mobile */}
      <div className="md:hidden px-4 pb-2">
        <div className="relative flex items-center bg-gray-100 rounded-full">
          <Search className="absolute left-3 h-4 w-4 text-gray-400" />
          <input 
            type="text"
            placeholder="Search Y&T"
            className="h-9 w-full bg-gray-100 pl-10 pr-4 rounded-full text-sm focus:outline-none focus:ring-1 focus:ring-blue-400"
          />
        </div>
      </div>
      
      {/* Mobile Menu (Hidden for now, will only appear when isMenuOpen is true) */}
      <div className={`md:hidden fixed inset-0 bg-white z-40 transform transition-transform duration-300 ${
        isMenuOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        {/* Mobile menu content would go here */}
      </div>
    </header>
  );
};

export default Navbar;
