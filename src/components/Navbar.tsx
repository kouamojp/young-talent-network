
import React, { useState } from 'react';
import { Search, MessageSquare, Bell, User, ChevronDown, Menu, Home, Compass, MessagesSquare, MapPin, Users, GraduationCap, Radio, Newspaper, Calendar, FileText, Building, Briefcase, PanelRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { useIsMobile } from '@/hooks/use-mobile';
import { Button } from './ui/button';
import { Sheet, SheetContent, SheetTrigger } from './ui/sheet';

const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const isMobile = useIsMobile();

  return (
    <header className="fixed top-0 left-0 right-0 h-14 bg-white border-b border-gray-200 shadow-sm z-50">
      <div className="max-w-screen-2xl mx-auto px-4 flex items-center justify-between h-full">
        {/* Logo with Burger Menu */}
        <div className="flex items-center gap-3">
          <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
            <SheetTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon"
                className="rounded-full hover:bg-gray-100"
              >
                <Menu className="h-5 w-5 text-black" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] sm:w-[400px] overflow-y-auto">
              <div className="py-6 space-y-6">
                {/* Main Section */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-500 text-sm uppercase tracking-wider">Main</h3>
                  <div className="space-y-3">
                    <Link to="/" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 text-gray-700 hover:text-[#5181B8] transition-colors">
                      <Home className="h-5 w-5" />
                      <span>Home</span>
                    </Link>
                    <Link to="/categories" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 text-gray-700 hover:text-[#5181B8] transition-colors">
                      <Compass className="h-5 w-5" />
                      <span>Discover</span>
                    </Link>
                    <Link to="/messages" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 text-gray-700 hover:text-[#5181B8] transition-colors">
                      <MessagesSquare className="h-5 w-5" />
                      <span>Messages</span>
                    </Link>
                    <Link to="/notifications" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 text-gray-700 hover:text-[#5181B8] transition-colors">
                      <Bell className="h-5 w-5" />
                      <span>Notifications</span>
                    </Link>
                  </div>
                </div>

                {/* Communities & Content Section */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-500 text-sm uppercase tracking-wider">Communities & Content</h3>
                  <div className="space-y-3">
                    <Link to="/talents-around-me" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 text-gray-700 hover:text-[#5181B8] transition-colors">
                      <MapPin className="h-5 w-5" />
                      <span>Talents Around Me</span>
                    </Link>
                    <Link to="/sports-categories" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 text-gray-700 hover:text-[#5181B8] transition-colors">
                      <Users className="h-5 w-5" />
                      <span>Sports Categories</span>
                    </Link>
                    <Link to="/learning" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 text-gray-700 hover:text-[#5181B8] transition-colors">
                      <GraduationCap className="h-5 w-5" />
                      <span>YAT LEARNING</span>
                    </Link>
                    <Link to="/live" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 text-gray-700 hover:text-[#5181B8] transition-colors">
                      <Radio className="h-5 w-5" />
                      <span>YAT LIVE</span>
                    </Link>
                    <Link to="/news" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 text-gray-700 hover:text-[#5181B8] transition-colors">
                      <Newspaper className="h-5 w-5" />
                      <span>News & Updates</span>
                    </Link>
                    <Link to="/events" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 text-gray-700 hover:text-[#5181B8] transition-colors">
                      <Calendar className="h-5 w-5" />
                      <span>YAT EVENTS</span>
                    </Link>
                  </div>
                </div>

                {/* Your Talent Profile Section */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-500 text-sm uppercase tracking-wider">Your Talent Profile</h3>
                  <div className="space-y-3">
                    <Link to="/profile" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 text-gray-700 hover:text-[#5181B8] transition-colors">
                      <User className="h-5 w-5" />
                      <span>My Profile</span>
                    </Link>
                    <Link to="/profile?tab=resumes" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 text-gray-700 hover:text-[#5181B8] transition-colors">
                      <FileText className="h-5 w-5" />
                      <span className="flex items-center gap-2">
                        My Resumes
                        <span className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full">New</span>
                      </span>
                    </Link>
                    <Link to="/organizations" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 text-gray-700 hover:text-[#5181B8] transition-colors">
                      <Building className="h-5 w-5" />
                      <span>Organizations</span>
                    </Link>
                    <Link to="/communities" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 text-gray-700 hover:text-[#5181B8] transition-colors">
                      <Users className="h-5 w-5" />
                      <span>Communities</span>
                    </Link>
                  </div>
                </div>

                {/* Connect Section */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-500 text-sm uppercase tracking-wider">Connect</h3>
                  <div className="space-y-3">
                    <Link to="/participants" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 text-gray-700 hover:text-[#5181B8] transition-colors">
                      <Users className="h-5 w-5" />
                      <span>Talent Community</span>
                    </Link>
                    <Link to="/work" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 text-gray-700 hover:text-[#5181B8] transition-colors">
                      <Briefcase className="h-5 w-5" />
                      <span className="flex items-center gap-2">
                        Work Opportunities
                        <span className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full">New</span>
                      </span>
                    </Link>
                    <Link to="/online-tv" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 text-gray-700 hover:text-[#5181B8] transition-colors">
                      <PanelRight className="h-5 w-5" />
                      <span>YAT TV</span>
                    </Link>
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>
          
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
