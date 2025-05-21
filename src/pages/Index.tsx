
import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Feed from '@/components/Feed';
import SocialSidebar from '@/components/SocialSidebar';
import RightSidebar from '@/components/RightSidebar';
import { useIsMobile } from '@/hooks/use-mobile';

const Index: React.FC = () => {
  const isMobile = useIsMobile();
  
  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <main className="pt-14">
        <div className="flex">
          {/* Left sidebar */}
          <div className="hidden lg:block w-[300px] flex-shrink-0">
            <SocialSidebar />
          </div>
          
          {/* Main feed */}
          <div className="flex-grow max-w-2xl w-full mx-auto px-4">
            <div className="py-4">
              <Feed />
            </div>
          </div>
          
          {/* Right sidebar */}
          <div className="hidden lg:block w-[280px] flex-shrink-0">
            <RightSidebar />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Index;
