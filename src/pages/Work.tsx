
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Footer from '@/components/Footer';
import GlassMorphism from '@/components/GlassMorphism';
import WorkHubEntry from '@/components/work/WorkHubEntry';
import TalentView from '@/components/work/TalentView';
import OrganizationView from '@/components/work/OrganizationView';
import SearchHeader from '@/components/work/SearchHeader';
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
        <Footer />
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
              <div className="space-y-4">
                <div className="bg-white/40 rounded-lg shadow-sm p-4">
                  <h2 className="text-xl font-bold mb-3">Resume Search Filters</h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Skill Category</label>
                      <select className="w-full p-2 border rounded">
                        <option value="">All Categories</option>
                        <option>Sports & Athletics</option>
                        <option>Performing Arts</option>
                        <option>Visual Arts</option>
                        <option>Music</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Experience Level</label>
                      <select className="w-full p-2 border rounded">
                        <option value="">Any Experience</option>
                        <option>Beginner (0-2 years)</option>
                        <option>Intermediate (3-5 years)</option>
                        <option>Advanced (6+ years)</option>
                        <option>Professional</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Location</label>
                      <select className="w-full p-2 border rounded">
                        <option value="">Any Location</option>
                        <option>New York</option>
                        <option>Los Angeles</option>
                        <option>London</option>
                        <option>Remote Only</option>
                      </select>
                    </div>
                  </div>
                </div>
                
                {path === 'talent' ? (
                  <div className="text-center py-8">
                    <FileText className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                    <h3 className="text-xl font-bold mb-2">Your Resume Search</h3>
                    <p className="text-gray-600 mb-4">
                      As a talent, you can search for resumes to find collaborators or mentors
                    </p>
                    {/* Resume search results would go here */}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <FileText className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                    <h3 className="text-xl font-bold mb-2">Find Top Talent</h3>
                    <p className="text-gray-600 mb-4">
                      As an organization, you can browse resumes to find the perfect talent for your needs
                    </p>
                    {/* Resume search results would go here */}
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
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
