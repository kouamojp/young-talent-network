
import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import TalentHeader from './sidebar-components/TalentHeader';
import TalentLaunchpad from './sidebar-components/TalentLaunchpad';
import TalentValue from './sidebar-components/TalentValue';
import CreatorStudio from './sidebar-components/CreatorStudio';
import WorkFlirts from './sidebar-components/WorkFlirts';
import TalentCarnival from './sidebar-components/TalentCarnival';
import TalentToolbox from './sidebar-components/TalentToolbox';
import ConfettiAnimation from './sidebar-components/ConfettiAnimation';

interface TalentHubSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const TalentHubSidebar: React.FC<TalentHubSidebarProps> = ({ isOpen, onClose }) => {
  const [isOpenToWork, setIsOpenToWork] = useState(true);
  const [levelProgress, setLevelProgress] = useState(75);
  const [tokenPrice, setTokenPrice] = useState(24.50);
  const [priceChange, setPriceChange] = useState(+2.3);
  const [viewerCount, setViewerCount] = useState(1247);
  const [showConfetti, setShowConfetti] = useState(false);
  const { toast } = useToast();

  // Simulate token price updates
  useEffect(() => {
    const interval = setInterval(() => {
      const change = (Math.random() - 0.5) * 2;
      setTokenPrice(prev => Math.max(0, prev + change));
      setPriceChange(change);
      
      if (change > 1) {
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 2000);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const handleToast = (title: string, description: string) => {
    toast({ title, description });
  };

  return (
    <div className={`fixed inset-0 z-50 ${isOpen ? 'block' : 'hidden'} md:hidden`}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      
      {/* Sidebar */}
      <div className={`absolute left-0 top-0 h-full w-80 bg-gradient-to-b from-purple-600 via-blue-600 to-pink-600 transform transition-transform duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="h-full overflow-y-auto p-4 text-white">
          
          <TalentHeader
            isOpenToWork={isOpenToWork}
            levelProgress={levelProgress}
            onToggleWork={setIsOpenToWork}
          />

          {/* Main Sections */}
          <div className="space-y-4">
            <TalentLaunchpad onToast={handleToast} />
            
            <TalentValue
              tokenPrice={tokenPrice}
              priceChange={priceChange}
            />

            <CreatorStudio
              viewerCount={viewerCount}
              onToast={handleToast}
            />

            <WorkFlirts onToast={handleToast} />

            <TalentCarnival />
          </div>

          <TalentToolbox onToast={handleToast} />

          {/* Tagline */}
          <div className="mt-4 text-center">
            <p className="text-xs text-white/60 italic">
              "You're not a profile – you're a 🌟 universe."
            </p>
          </div>

          <ConfettiAnimation show={showConfetti} />
        </div>
      </div>
    </div>
  );
};

export default TalentHubSidebar;
