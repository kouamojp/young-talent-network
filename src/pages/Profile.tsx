
import React, { useState } from 'react';
import { TooltipProvider } from '@/components/ui/tooltip';
import { useIsMobile } from '@/hooks/use-mobile';
import Navbar from '@/components/Navbar';
import ProfileHeader from '@/components/profile/ProfileHeader';
import ProfileSidebar from '@/components/profile/ProfileSidebar';
import ProfileMainContent from '@/components/profile/ProfileMainContent';

const Profile: React.FC = () => {
  const isMobile = useIsMobile();

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-[#E7E8EC]">
        {/* Mobile navbar */}
        <div className="md:hidden">
          <Navbar />
          <div className="h-14"></div>
        </div>
        
        {/* Header */}
        <ProfileHeader />

        <main className="max-w-6xl mx-auto px-4 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Sidebar - Main Menu */}
            <div className="lg:col-span-1">
              <ProfileSidebar />
            </div>

            {/* Main Content */}
            <ProfileMainContent />
          </div>
        </main>
      </div>
    </TooltipProvider>
  );
};

export default Profile;
