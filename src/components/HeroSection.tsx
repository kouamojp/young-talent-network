
import React, { useEffect, useRef } from 'react';
import AnimatedText from './AnimatedText';

const HeroSection: React.FC = () => {
  const heroRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );

    if (heroRef.current) {
      observer.observe(heroRef.current);
    }

    if (imageRef.current) {
      observer.observe(imageRef.current);
    }

    return () => {
      if (heroRef.current) observer.unobserve(heroRef.current);
      if (imageRef.current) observer.unobserve(imageRef.current);
    };
  }, []);

  return (
    <section className="relative min-h-screen pt-24 flex items-center overflow-hidden">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_right,_#f0f0f0,_transparent_70%)]"></div>
      
      <div className="container mx-auto px-4 py-12 md:py-24 flex flex-col lg:flex-row items-center">
        <div ref={heroRef} className="w-full lg:w-1/2 mb-12 lg:mb-0 stagger-animation">
          <div className="inline-block px-3 py-1 mb-4 bg-black/5 rounded-full">
            <span className="text-xs tracking-wide font-medium">Young & Talented Network</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
            The best way to find 
            <span className="text-highlight"> talented people </span>
            all over the world
          </h1>
          
          <p className="text-lg text-black/70 mb-8 max-w-xl">
            Connecting thousands of young talented sportsmen, musicians, vocalists, 
            inventors, and dancers with the opportunities they deserve.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <a
              href="#join"
              className="px-8 py-3 bg-black text-white rounded-full transition-transform hover:scale-105 text-center"
            >
              Join the Platform
            </a>
            <a
              href="#learn"
              className="px-8 py-3 border border-black/20 rounded-full hover:bg-black/5 transition-colors text-center"
            >
              Learn More
            </a>
          </div>
        </div>
        
        <div ref={imageRef} className="w-full lg:w-1/2 relative image-reveal">
          <div className="aspect-[4/3] rounded-2xl overflow-hidden shadow-glass">
            <img 
              src="https://images.unsplash.com/photo-1605810230434-7631ac76ec81" 
              alt="Young talents collaborating" 
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
          
          <div className="absolute -bottom-6 -left-6 bg-white rounded-xl p-4 shadow-soft max-w-xs animate-fade-in opacity-0" style={{ animationDelay: '0.8s' }}>
            <div className="flex items-center gap-3 mb-2">
              <div className="h-2 w-2 rounded-full bg-green-500"></div>
              <p className="text-sm font-medium">Discover Opportunities</p>
            </div>
            <p className="text-xs text-black/60">
              Connect with mentors and sponsors looking for the next generation of talent
            </p>
          </div>
          
          <div className="absolute -top-6 -right-6 bg-white rounded-xl p-4 shadow-soft max-w-xs animate-fade-in opacity-0" style={{ animationDelay: '1s' }}>
            <div className="flex items-center gap-3 mb-2">
              <div className="h-2 w-2 rounded-full bg-blue-500"></div>
              <p className="text-sm font-medium">Global Visibility</p>
            </div>
            <p className="text-xs text-black/60">
              Showcase your talents to a worldwide audience without borders
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
