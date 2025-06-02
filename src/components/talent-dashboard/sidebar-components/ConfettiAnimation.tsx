
import React from 'react';

interface ConfettiAnimationProps {
  show: boolean;
}

const ConfettiAnimation: React.FC<ConfettiAnimationProps> = ({ show }) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      <div className="absolute inset-0 bg-gradient-to-b from-yellow-400/20 via-transparent to-transparent animate-pulse">
        <div className="text-4xl animate-bounce absolute top-1/4 left-1/4">🎉</div>
        <div className="text-4xl animate-bounce absolute top-1/3 right-1/4">✨</div>
        <div className="text-4xl animate-bounce absolute top-1/2 left-1/3">🎊</div>
        <div className="text-4xl animate-bounce absolute top-2/3 right-1/3">💫</div>
      </div>
    </div>
  );
};

export default ConfettiAnimation;
