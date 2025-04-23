import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
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
      <div className="min-h-screen bg-[#F0F2F5]">
        <Navbar />
        <div className="flex">
          <main className="flex-1 pt-16">
            <div className="max-w-[940px] mx-auto">
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
              
              <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
                <ProfileInfo user={user} />
              </div>
              
              {/* Tabs */}
              <div className="bg-white rounded-lg shadow-sm">
                <ProfileTabs userPosts={userPosts} />
              </div>
            </div>
          </main>
        </div>
      </div>
    </TooltipProvider>
  );
};

export default Profile;
