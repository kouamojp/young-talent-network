
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
    // Here you would save the status to your backend
    setIsEditingStatus(false);
  };

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-purple-50">
        <Navbar />
        
        <div className="container mx-auto max-w-5xl pb-10">
          {/* Cover Photo & Profile Info */}
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
          
          <GlassMorphism className="mx-4 p-6">
            <ProfileInfo user={user} />
          </GlassMorphism>
          
          {/* Tabs */}
          <div className="px-4">
            <ProfileTabs userPosts={userPosts} />
          </div>
        </div>
        
        <Footer />
      </div>
    </TooltipProvider>
  );
};

export default Profile;
