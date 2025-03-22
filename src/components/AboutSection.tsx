
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
            text="What is Young & Talented?" 
            tag="h2" 
            highlight={true}
            className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6"
          />
          
          <p className="text-lg text-black/70">
            Y&T (I AM A TALENT) is a platform where talented individuals can showcase themselves 
            to the world. We believe in breaking down barriers that limit the development of talent, 
            whether they're financial, geographical, or social.
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
              Y&T provides comprehensive profiles that include CVs, application forms, photos, 
              videos, and statistics - everything needed to showcase your talents effectively.
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
              Whether you're from a bustling city or a small town, Y&T gives you the opportunity 
              to be discovered on the international stage regardless of your location.
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
              Y&T is a service for both emerging talents who have just started their careers and 
              established professionals who are seeking fresh new talent to work with.
            </p>
          </GlassMorphism>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
