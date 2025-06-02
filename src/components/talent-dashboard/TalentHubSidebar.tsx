
import React from 'react';
import { useToast } from '@/hooks/use-toast';
import { useTalentHubState } from './hooks/useTalentHubState';
import SidebarBackdrop from './sidebar-components/SidebarBackdrop';
import SidebarContent from './sidebar-components/SidebarContent';

interface TalentHubSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const TalentHubSidebar: React.FC<TalentHubSidebarProps> = ({ isOpen, onClose }) => {
  const {
    isOpenToWork,
    setIsOpenToWork,
    levelProgress,
    tokenPrice,
    priceChange,
    viewerCount,
    showConfetti,
  } = useTalentHubState();

  const { toast } = useToast();

  const handleToast = (title: string, description: string) => {
    toast({ title, description });
  };

  return (
    <>
      <SidebarBackdrop isOpen={isOpen} onClose={onClose} />
      
      <SidebarContent
        isOpen={isOpen}
        isOpenToWork={isOpenToWork}
        levelProgress={levelProgress}
        tokenPrice={tokenPrice}
        priceChange={priceChange}
        viewerCount={viewerCount}
        showConfetti={showConfetti}
        onToggleWork={setIsOpenToWork}
        onToast={handleToast}
      />
    </>
  );
};

export default TalentHubSidebar;
