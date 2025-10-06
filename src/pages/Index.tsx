
import React from 'react';
import { Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import Feed from '@/components/Feed';
import RightSidebar from '@/components/RightSidebar';

const Index: React.FC = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* VK-style Header */}
      <header className="bg-primary text-white py-3 shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <Link to="/" className="text-xl font-bold">Y&T</Link>
              <nav className="hidden md:flex items-center gap-4 text-sm">
                <Link to="/" className="hover:text-white/80 transition-colors">News Feed</Link>
                <Link to="/messages" className="hover:text-white/80 transition-colors">Messages</Link>
                <Link to="/communities" className="hover:text-white/80 transition-colors">Communities</Link>
                <Link to="/work" className="hover:text-white/80 transition-colors">Work</Link>
              </nav>
            </div>
            <div className="flex items-center gap-4">
              <div className="relative">
                <input 
                  type="text" 
                  placeholder="Search"
                  className="bg-white/20 text-white placeholder-white/70 px-4 py-1.5 pl-10 rounded-md border border-white/30 focus:outline-none focus:border-white focus:bg-white/30 w-64 transition-colors"
                />
                <Search className="absolute left-3 top-2 h-4 w-4 text-white/70" />
              </div>
              <Link to="/profile" className="text-sm hover:text-white/80 transition-colors">Profile</Link>
            </div>
          </div>
        </div>
      </header>

      {/* Two-column layout */}
      <div className="max-w-7xl mx-auto">
        <div className="flex gap-4">
          {/* Main Feed */}
          <main className="flex-1 min-w-0">
            <Feed />
          </main>

          {/* Right Sidebar */}
          <aside className="hidden xl:block w-72 flex-shrink-0">
            <div className="sticky top-20">
              <RightSidebar />
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default Index;
