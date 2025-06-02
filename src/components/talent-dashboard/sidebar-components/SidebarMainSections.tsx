
import React from 'react';
import TalentLaunchpad from './TalentLaunchpad';
import TalentValue from './TalentValue';
import CreatorStudio from './CreatorStudio';
import WorkFlirts from './WorkFlirts';
import TalentCarnival from './TalentCarnival';

interface SidebarMainSectionsProps {
  tokenPrice: number;
  priceChange: number;
  viewerCount: number;
  onToast: (title: string, description: string) => void;
}

const SidebarMainSections: React.FC<SidebarMainSectionsProps> = ({
  tokenPrice,
  priceChange,
  viewerCount,
  onToast,
}) => {
  return (
    <div className="space-y-4">
      <TalentLaunchpad onToast={onToast} />
      
      <TalentValue
        tokenPrice={tokenPrice}
        priceChange={priceChange}
      />

      <CreatorStudio
        viewerCount={viewerCount}
        onToast={onToast}
      />

      <WorkFlirts onToast={onToast} />

      <TalentCarnival />
    </div>
  );
};

export default SidebarMainSections;
