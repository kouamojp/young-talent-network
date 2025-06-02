
import { useState, useEffect } from 'react';

export const useTalentHubState = () => {
  const [isOpenToWork, setIsOpenToWork] = useState(true);
  const [levelProgress, setLevelProgress] = useState(75);
  const [tokenPrice, setTokenPrice] = useState(24.50);
  const [priceChange, setPriceChange] = useState(+2.3);
  const [viewerCount, setViewerCount] = useState(1247);
  const [showConfetti, setShowConfetti] = useState(false);

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

  return {
    isOpenToWork,
    setIsOpenToWork,
    levelProgress,
    tokenPrice,
    priceChange,
    viewerCount,
    showConfetti,
  };
};
