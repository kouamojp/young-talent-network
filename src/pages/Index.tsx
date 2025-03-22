
import React, { useEffect } from 'react';
import Navbar from '@/components/Navbar';
import HeroSection from '@/components/HeroSection';
import AboutSection from '@/components/AboutSection';
import CategorySection from '@/components/CategorySection';
import Footer from '@/components/Footer';

const Index: React.FC = () => {
  useEffect(() => {
    // Intersection Observer for animations
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      },
      { threshold: 0.1 }
    );

    // Observe all elements with animate-section class
    document.querySelectorAll('.animate-section').forEach((element) => {
      observer.observe(element);
    });

    return () => {
      // Cleanup observer
      document.querySelectorAll('.animate-section').forEach((element) => {
        observer.unobserve(element);
      });
    };
  }, []);

  return (
    <div className="min-h-screen overflow-x-hidden">
      <Navbar />
      <HeroSection />
      <AboutSection />
      <CategorySection />
      <Footer />
    </div>
  );
};

export default Index;
