
import React, { useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import SocialSidebar from '@/components/SocialSidebar';
import Feed from '@/components/Feed';
import RightSidebar from '@/components/RightSidebar';

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
    <div className="min-h-screen overflow-x-hidden bg-gradient-to-b from-blue-50 to-purple-50">
      <Navbar />
      <div className="container mx-auto flex">
        <SocialSidebar />
        <main className="flex-1 min-h-screen">
          <Feed />
        </main>
        <RightSidebar />
      </div>
      <Footer />
    </div>
  );
};

export default Index;
