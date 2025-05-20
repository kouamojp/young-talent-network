import React, { useState } from 'react';
import { Menu, Search, MessageSquare, Bell, User } from 'lucide-react';
import { Link } from 'react-router-dom';

const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 h-14 bg-white shadow-sm z-50">
      <div className="max-w-screen-2xl mx-auto px-4 flex items-center justify-between h-full">
        <div className="flex items-center gap-2">
          <Link to="/" className="flex items-center">
            <img 
              src="/lovable-uploads/b56312bb-24e8-4289-a96d-8651af4ddd7f.png" 
              alt="Logo" 
              className="h-9 w-9"
            />
          </Link>
          <div className="relative hidden md:flex items-center">
            <Search className="absolute left-3 h-4 w-4 text-gray-400" />
            <input 
              type="text"
              placeholder="Search Y&T"
              className="h-10 w-60 bg-[#F0F2F5] pl-10 pr-4 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-[#1877F2]"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button className="p-2.5 hover:bg-[#F0F2F5] rounded-full">
            <MessageSquare className="h-5 w-5 text-[#65676B]" />
          </button>
          <button className="p-2.5 hover:bg-[#F0F2F5] rounded-full">
            <Bell className="h-5 w-5 text-[#65676B]" />
          </button>
          <button className="p-2.5 hover:bg-[#F0F2F5] rounded-full">
            <User className="h-5 w-5 text-[#65676B]" />
          </button>
        </div>
      </div>
      
      {/* Mobile Menu */}
      <div className={`md:hidden fixed inset-0 bg-white z-40 transform transition-transform duration-300 ${
        isMenuOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        {/* Mobile menu content */}
      </div>
    </header>
  );
};

export default Navbar;
