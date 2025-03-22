
import React from 'react';
import { cn } from '@/lib/utils';

interface GlassMorphismProps {
  children: React.ReactNode;
  className?: string;
  intensity?: 'light' | 'medium' | 'heavy';
  border?: boolean;
  hover?: boolean;
}

const GlassMorphism: React.FC<GlassMorphismProps> = ({
  children,
  className,
  intensity = 'medium',
  border = true,
  hover = false
}) => {
  const intensityMap = {
    light: 'backdrop-blur-sm bg-white/30',
    medium: 'backdrop-blur-md bg-white/50',
    heavy: 'backdrop-blur-xl bg-white/70'
  };

  return (
    <div
      className={cn(
        intensityMap[intensity],
        border && 'border border-white/20',
        hover && 'transition-all duration-300 hover:shadow-hover',
        'rounded-xl shadow-glass',
        className
      )}
    >
      {children}
    </div>
  );
};

export default GlassMorphism;
