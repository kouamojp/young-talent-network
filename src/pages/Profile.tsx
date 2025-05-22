
import React, { useState } from 'react';
import Footer from '@/components/Footer';
import { TooltipProvider } from '@/components/ui/tooltip';
import ProfileHeader from '@/components/profile/ProfileHeader';
import ProfileInfo from '@/components/profile/ProfileInfo';
import { ProfileTabs } from '@/components/profile/ProfileTabs';
import { user, userPosts } from '@/components/profile/ProfileData';
import { History, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';
import Navbar from '@/components/Navbar';

const Profile: React.FC = () => {
  const [isEditMode, setIsEditMode] = useState(false);
  const [statusText, setStatusText] = useState(user.status);
  const [isEditingStatus, setIsEditingStatus] = useState(false);
  const isMobile = useIsMobile();

  const handleStatusChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setStatusText(e.target.value);
  };

  const saveStatus = () => {
    setIsEditingStatus(false);
  };

  const handleCreateHistory = () => {
    // This would handle the creation of a new history item
    console.log('Create new history entry');
  };

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-[#F0F2F5]">
        {/* Attached header for mobile */}
        <div className="md:hidden">
          <Navbar />
          <div className="h-14"></div> {/* Spacer for fixed navbar */}
        </div>
        
        <main>
          <div className="max-w-[940px] mx-auto">
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
            
            {/* Create History Button */}
            <div className="mb-4">
              <Button 
                onClick={handleCreateHistory}
                className="w-full md:w-auto flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600"
              >
                <History className="h-4 w-4" />
                <span>Create History</span>
              </Button>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
              <ProfileInfo user={user} />
            </div>
            
            <div className="bg-white rounded-lg shadow-sm">
              <ProfileTabs userPosts={userPosts} />
            </div>
          </div>
        </main>
      </div>
    </TooltipProvider>
  );
};

export default Profile;
