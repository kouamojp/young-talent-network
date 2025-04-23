import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Hero from '@/components/index/Hero';
import CategoriesSection from '@/components/index/CategoriesSection';
import TalentsSection from '@/components/index/TalentsSection';
import OpportunitiesSection from '@/components/index/OpportunitiesSection';
import EventsSection from '@/components/index/EventsSection';
import NewsSection from '@/components/index/NewsSection';

const Index: React.FC = () => {
  return (
    <div>
      <Navbar />
      <main>
        <Hero />
        <CategoriesSection />
        <TalentsSection />
        <OpportunitiesSection />
        <EventsSection />
        <NewsSection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
