import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import GlassMorphism from '@/components/GlassMorphism';
import WorkHubEntry from '@/components/work/WorkHubEntry';
import TalentView from '@/components/work/TalentView';
import OrganizationView from '@/components/work/OrganizationView';
import SearchHeader from '@/components/work/SearchHeader';
import SuccessStories from '@/components/work/SuccessStories';

const Work: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const path = searchParams.get('path') || '';
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTab, setSelectedTab] = useState('opportunities');
  
  useEffect(() => {
    if (path === 'talent') {
      setSelectedTab('opportunities');
    } else if (path === 'organization') {
      setSelectedTab('talents');
    }
  }, [path]);

  const handleBack = () => {
    setSearchParams({});
  };

  const handleApplyClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    console.log("Apply clicked");
  };
  
  const handleCardClick = (id: number) => {
    console.log("Card clicked, view details for ID:", id);
  };
  
  if (!path) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-purple-50">
        <Navbar />
        <main className="container mx-auto px-4 py-12">
          <WorkHubEntry />
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-purple-50">
      <Navbar />
      <main className="container mx-auto px-4 py-12">
        <GlassMorphism className="p-6 mb-6">
          <SearchHeader
            path={path}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            onBack={handleBack}
          />
          
          {path === 'talent' ? (
            <TalentView
              selectedTab={selectedTab}
              onTabChange={setSelectedTab}
              handleApplyClick={handleApplyClick}
              handleCardClick={handleCardClick}
            />
          ) : (
            <OrganizationView
              selectedTab={selectedTab}
              onTabChange={setSelectedTab}
              handleApplyClick={handleApplyClick}
              handleCardClick={handleCardClick}
            />
          )}
        </GlassMorphism>
        
        <GlassMorphism className="p-6">
          <h2 className="text-xl font-bold mb-4">Success Stories</h2>
          <SuccessStories />
        </GlassMorphism>
      </main>
      <Footer />
    </div>
  );
};

export default Work;
