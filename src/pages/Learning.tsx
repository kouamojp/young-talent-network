
import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
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
        <main className="container mx-auto px-4 py-12">
          <LearningHubEntry />
        </main>
        <Footer />
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-purple-50">
      <main className="container mx-auto px-4 py-12">
        <GlassMorphism className="p-6">
          {path === 'explore' ? (
            <LearningExplore onBack={handleBack} />
          ) : (
            <LearningCreate onBack={handleBack} />
          )}
        </GlassMorphism>
      </main>
      <Footer />
    </div>
  );
};

export default Learning;
