
import React from 'react';
import ProfileInfoCard from './ProfileInfoCard';
import StatusInput from './StatusInput';
import FeaturedPost from './FeaturedPost';
import WelcomePost from './WelcomePost';

const ProfileMainContent: React.FC = () => {
  return (
    <div className="lg:col-span-2 space-y-6">
      <ProfileInfoCard />
      <StatusInput />
      <FeaturedPost />
      <WelcomePost />
    </div>
  );
};

export default ProfileMainContent;
