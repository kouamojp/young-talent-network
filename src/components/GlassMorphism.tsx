
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
    light: 'bg-card/60',
    medium: 'bg-card/85',
    heavy: 'bg-card'
  };

  return (
    <div
      className={cn(
        intensityMap[intensity],
        border && 'border border-border',
        hover && 'transition-all duration-300 hover:shadow-hover',
        'rounded-xl text-card-foreground',
        className
      )}
    >
      {children}
    </div>
  );
};

export default GlassMorphism;
