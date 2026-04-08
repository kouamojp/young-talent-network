
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import GlassMorphism from '@/components/GlassMorphism';
import WorkHubEntry from '@/components/work/WorkHubEntry';
import TalentView from '@/components/work/TalentView';
import OrganizationView from '@/components/work/OrganizationView';
import SearchHeader from '@/components/work/SearchHeader';
import TalentSearchCards from '@/components/TalentSearchCards';
import SuccessStories from '@/components/work/SuccessStories';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, Briefcase } from 'lucide-react';

const Work: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const path = searchParams.get('path') || '';
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTab, setSelectedTab] = useState('opportunities');
  const [viewMode, setViewMode] = useState<'resumes' | 'jobs'>('jobs');
  
  useEffect(() => {
    if (path === 'talent') {
      setSelectedTab('opportunities');
      setViewMode('jobs');
    } else if (path === 'organization') {
      setSelectedTab('talents');
      setViewMode('resumes');
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
        <main className="container mx-auto px-4 py-12">
          <WorkHubEntry />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-purple-50">
      <main className="container mx-auto px-4 py-12">
        <GlassMorphism className="p-6 mb-6">
          <SearchHeader
            path={path}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            onBack={handleBack}
          />
          
          <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as 'jobs' | 'resumes')}>
            <TabsList className="mb-6 w-full md:w-auto">
              <TabsTrigger value="jobs" className="flex items-center gap-2">
                <Briefcase className="h-4 w-4" />
                <span>Job Openings</span>
              </TabsTrigger>
              <TabsTrigger value="resumes" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                <span>Resumes</span>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="jobs">
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
            </TabsContent>
            
            <TabsContent value="resumes">
              <TalentSearchCards />
            </TabsContent>
          </Tabs>
        </GlassMorphism>
        
        <GlassMorphism className="p-6">
          <h2 className="text-xl font-bold mb-4">Success Stories</h2>
          <SuccessStories />
        </GlassMorphism>
      </main>
    </div>
  );
};

export default Work;
