
import React, { useState } from 'react';
import { Menu, Search, MessageSquare, Bell, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-red-500 text-white shadow-md z-50">
      <div className="max-w-screen-2xl mx-auto px-4 flex items-center justify-between h-full">
        <div className="flex items-center gap-2">
          <Link to="/" className="flex items-center">
            <div className="text-2xl font-bold">W</div>
          </Link>
          <div className="relative hidden md:flex items-center">
            <Search className="absolute left-3 h-4 w-4 text-gray-400" />
            <Input 
              type="text"
              placeholder="Search..."
              className="h-10 w-60 bg-white pl-10 pr-4 rounded-md text-gray-800 focus:outline-none focus:ring-2 focus:ring-white/30"
            />
          </div>
        </div>

        <nav className="hidden md:flex items-center space-x-8">
          <Link to="/" className="flex flex-col items-center">
            <span className="text-sm">Home</span>
          </Link>
          <Link to="/organizations" className="flex flex-col items-center">
            <span className="text-sm">Companies</span>
          </Link>
          <Link to="/work" className="flex flex-col items-center">
            <span className="text-sm">Projects</span>
          </Link>
          <Link to="/participants" className="flex flex-col items-center">
            <span className="text-sm">Profiles</span>
          </Link>
          <Link to="/jobs" className="flex flex-col items-center">
            <span className="text-sm">Jobs</span>
          </Link>
          <Link to="/messages" className="flex flex-col items-center">
            <span className="text-sm">Messages</span>
          </Link>
        </nav>

        <div className="flex items-center gap-4">
          <button className="md:hidden p-2.5 hover:bg-red-600 rounded-full">
            <Menu className="h-5 w-5" onClick={() => setIsMenuOpen(!isMenuOpen)} />
          </button>
          <button className="hidden md:block p-2.5 hover:bg-red-600 rounded-full">
            <Bell className="h-5 w-5" />
          </button>
          <div className="hidden md:flex items-center">
            <Avatar className="h-9 w-9 border-2 border-white">
              <AvatarImage src="/placeholder.svg" alt="User" />
              <AvatarFallback>JD</AvatarFallback>
            </Avatar>
            <span className="ml-2">John</span>
          </div>
        </div>
      </div>
      
      {/* Mobile Menu */}
      <div className={`md:hidden fixed inset-0 bg-white z-40 transform transition-transform duration-300 ${
        isMenuOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="p-4 bg-red-500 text-white flex justify-between items-center">
          <span className="text-xl font-bold">Menu</span>
          <button onClick={() => setIsMenuOpen(false)}>
            <Menu className="h-6 w-6" />
          </button>
        </div>
        <nav className="p-4">
          <Link to="/" className="block py-3 border-b" onClick={() => setIsMenuOpen(false)}>Home</Link>
          <Link to="/organizations" className="block py-3 border-b" onClick={() => setIsMenuOpen(false)}>Companies</Link>
          <Link to="/work" className="block py-3 border-b" onClick={() => setIsMenuOpen(false)}>Projects</Link>
          <Link to="/participants" className="block py-3 border-b" onClick={() => setIsMenuOpen(false)}>Profiles</Link>
          <Link to="/jobs" className="block py-3 border-b" onClick={() => setIsMenuOpen(false)}>Jobs</Link>
          <Link to="/messages" className="block py-3 border-b" onClick={() => setIsMenuOpen(false)}>Messages</Link>
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
