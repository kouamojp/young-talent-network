
import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import HeroSection from '@/components/HeroSection';
import CategorySection from '@/components/CategorySection';
import SocialSidebar from '@/components/SocialSidebar';
import Feed from '@/components/Feed';
import RightSidebar from '@/components/RightSidebar';
import { useIsMobile } from '@/hooks/use-mobile';

const Index: React.FC = () => {
  const isMobile = useIsMobile();
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="pt-14 md:pt-14">
        <div className="container mx-auto px-4 py-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Left sidebar - desktop only */}
            <div className="hidden md:block md:col-span-3">
              <div className="sticky top-20">
                <SocialSidebar />
              </div>
            </div>
            
            {/* Main content area */}
            <div className="col-span-1 md:col-span-6">
              {isMobile && <HeroSection />}
              <Feed />
            </div>
            
            {/* Right sidebar - desktop only */}
            <div className="hidden md:block md:col-span-3">
              <div className="sticky top-20">
                <RightSidebar />
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Index;
