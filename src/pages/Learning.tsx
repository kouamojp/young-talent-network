import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import GlassMorphism from '@/components/GlassMorphism';
import LearningHubEntry from '@/components/learning/LearningHubEntry';
import LearningExplore from '@/components/learning/LearningExplore';
import LearningCreate from '@/components/learning/LearningCreate';

const Learning: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const path = searchParams.get('path') || '';
  
  const handleBack = () => {
    setSearchParams({});
  };
  
  if (!path) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-purple-50">
        <Navbar />
        <div className="container mx-auto flex flex-col md:flex-row">
          <main className="flex-1 p-4">
            <LearningHubEntry />
          </main>
        </div>
        <Footer />
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-purple-50">
      <Navbar />
      <div className="container mx-auto flex flex-col md:flex-row">
        <main className="flex-1 p-4">
          <GlassMorphism className="p-6">
            {path === 'explore' ? (
              <LearningExplore onBack={handleBack} />
            ) : (
              <LearningCreate onBack={handleBack} />
            )}
          </GlassMorphism>
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default Learning;
