
import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import SocialSidebar from '@/components/SocialSidebar';
import GlassMorphism from '@/components/GlassMorphism';
import { TooltipProvider } from '@/components/ui/tooltip';
import ProfileHeader from '@/components/profile/ProfileHeader';
import ProfileInfo from '@/components/profile/ProfileInfo';
import { ProfileTabs } from '@/components/profile/ProfileTabs';
import { user, userPosts } from '@/components/profile/ProfileData';

const Profile: React.FC = () => {
  const [isEditMode, setIsEditMode] = useState(false);
  const [statusText, setStatusText] = useState(user.status);
  const [isEditingStatus, setIsEditingStatus] = useState(false);

  const handleStatusChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setStatusText(e.target.value);
  };

  const saveStatus = () => {
    setIsEditingStatus(false);
  };

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-[#1a1f2c] text-white">
        <Navbar />
        
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          <div className="flex gap-6">
            <aside className="w-64 hidden lg:block">
              <SocialSidebar />
            </aside>
            
            <main className="flex-1">
              <GlassMorphism className="rounded-xl bg-[#242938]/50">
                <ProfileHeader 
                  user={user}
                  statusText={statusText}
                  isEditingStatus={isEditingStatus}
                  isEditMode={isEditMode}
                  handleStatusChange={handleStatusChange}
                  saveStatus={saveStatus}
                  setIsEditingStatus={setIsEditingStatus}
                  setIsEditMode={setIsEditMode}
                />
                
                <ProfileInfo user={user} />
                
                <div className="mt-6">
                  <ProfileTabs userPosts={userPosts} />
                </div>
              </GlassMorphism>
            </main>
          </div>
        </div>
        
        <Footer />
      </div>
    </TooltipProvider>
  );
};

export default Profile;
