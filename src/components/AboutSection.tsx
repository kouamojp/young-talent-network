
import React, { useEffect, useRef } from 'react';
import AnimatedText from './AnimatedText';
import GlassMorphism from './GlassMorphism';

const AboutSection: React.FC = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

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

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    if (cardsRef.current) {
      observer.observe(cardsRef.current);
    }

    return () => {
      if (sectionRef.current) observer.unobserve(sectionRef.current);
      if (cardsRef.current) observer.unobserve(cardsRef.current);
    };
  }, []);

  return (
    <section id="about" className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_bottom_left,_#f0f0f0,_transparent_70%)]"></div>
      
      <div className="container px-4 mx-auto">
        <div ref={sectionRef} className="max-w-3xl mx-auto text-center mb-16 stagger-animation">
          <div className="inline-block px-3 py-1 mb-4 bg-black/5 rounded-full">
            <span className="text-xs tracking-wide font-medium">About Y&T</span>
          </div>
          
          <AnimatedText 
            text="The best way to find talented people all over the world" 
            tag="h2" 
            highlight={true}
            className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6"
          />
          
          <p className="text-lg text-black/70 mb-6">
            Thousands of young talented sportsmen, musicians, vocalists, inventors, dancers search 
            for their place in the world. The resources they find for their development are no longer enough.
          </p>
          
          <p className="text-lg text-black/70">
            There are no limits for self-improvement, but there are boundaries for the development of talents—they 
            can depend on money, time, and human nature. Y&T breaks down these boundaries.
          </p>
        </div>
        
        <div className="max-w-4xl mx-auto bg-white/30 backdrop-blur-sm p-8 rounded-xl mb-16 shadow-sm">
          <h3 className="text-2xl font-semibold mb-4 text-center">About the Project</h3>
          <p className="mb-4">
            YAT (I AM A TALENT) is a platform where you can find all information about young talented people. 
            There are so many talents in many countries, parts of the world and all over the world. Some talented 
            people have no chance to show themselves on an international level, not even in their country, city, 
            town, or neighborhood.
          </p>
          <p className="mb-4">
            YAT is a development, a baby of a sportsman, a showman, a coach, a programmer, and an agent, 
            an entrepreneur, an undertaker, who has passed that way with no global services and is ready 
            to give it to you, friends.
          </p>
          <p>
            YAT is a service for those talented persons who have just started their careers and those 
            who search for young new talents.
          </p>
        </div>
        
        <div ref={cardsRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 stagger-animation">
          <GlassMorphism 
            className="p-8 transition-transform duration-500 hover:translate-y-[-8px]"
            intensity="light"
            hover={true}
          >
            <div className="h-12 w-12 bg-black/5 rounded-full flex items-center justify-center mb-6">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-4">Complete Information</h3>
            <p className="text-black/70">
              YAT is all information about a person who wants to achieve something in their field—a CV, 
              an application form, photos, videos, and statistics.
            </p>
          </GlassMorphism>
          
          <GlassMorphism 
            className="p-8 transition-transform duration-500 hover:translate-y-[-8px]"
            intensity="light"
            hover={true}
          >
            <div className="h-12 w-12 bg-black/5 rounded-full flex items-center justify-center mb-6">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-4">Global Reach</h3>
            <p className="text-black/70">
              YAT is a platform where talented people from any corner of the world can showcase 
              themselves, regardless of geographical or financial limitations.
            </p>
          </GlassMorphism>
          
          <GlassMorphism 
            className="p-8 transition-transform duration-500 hover:translate-y-[-8px]"
            intensity="light"
            hover={true}
          >
            <div className="h-12 w-12 bg-black/5 rounded-full flex items-center justify-center mb-6">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-4">Career Development</h3>
            <p className="text-black/70">
              YAT bridges the gap between emerging talents who have just started their careers and 
              established professionals who are seeking fresh new talent to collaborate with.
            </p>
          </GlassMorphism>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
