
import React, { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

interface AnimatedTextProps {
  text: string;
  className?: string;
  tag?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span';
  highlight?: boolean;
  delay?: number;
}

const AnimatedText: React.FC<AnimatedTextProps> = ({
  text,
  className,
  tag = 'h2',
  highlight = false,
  delay = 0
}) => {
  const elementRef = useRef<HTMLElement>(null);
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setTimeout(() => {
              entry.target.classList.add('animate-fade-in');
            }, delay);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => {
      if (elementRef.current) {
        observer.unobserve(elementRef.current);
      }
    };
  }, [delay]);

  const Tag = tag as keyof JSX.IntrinsicElements;
  
  return (
    <Tag
      ref={elementRef as React.RefObject<HTMLHeadingElement>}
      className={cn(
        'opacity-0 transition-transform duration-700',
        highlight && 'text-highlight',
        className
      )}
    >
      {text}
    </Tag>
  );
};

export default AnimatedText;
