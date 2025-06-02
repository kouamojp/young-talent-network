
import React from 'react';
import TalentHeader from './TalentHeader';
import SidebarMainSections from './SidebarMainSections';
import TalentToolbox from './TalentToolbox';
import TalentTagline from './TalentTagline';
import ConfettiAnimation from './ConfettiAnimation';

interface SidebarContentProps {
  isOpen: boolean;
  isOpenToWork: boolean;
  levelProgress: number;
  tokenPrice: number;
  priceChange: number;
  viewerCount: number;
  showConfetti: boolean;
  onToggleWork: (value: boolean) => void;
  onToast: (title: string, description: string) => void;
}

const SidebarContent: React.FC<SidebarContentProps> = ({
  isOpen,
  isOpenToWork,
  levelProgress,
  tokenPrice,
  priceChange,
  viewerCount,
  showConfetti,
  onToggleWork,
  onToast,
}) => {
  return (
    <div className={`absolute left-0 top-0 h-full w-80 bg-gradient-to-b from-purple-600 via-blue-600 to-pink-600 transform transition-transform duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
      <div className="h-full overflow-y-auto p-4 text-white">
        <TalentHeader
          isOpenToWork={isOpenToWork}
          levelProgress={levelProgress}
          onToggleWork={onToggleWork}
        />

        <SidebarMainSections
          tokenPrice={tokenPrice}
          priceChange={priceChange}
          viewerCount={viewerCount}
          onToast={onToast}
        />

        <TalentToolbox onToast={onToast} />

        <TalentTagline />

        <ConfettiAnimation show={showConfetti} />
      </div>
    </div>
  );
};

export default SidebarContent;
