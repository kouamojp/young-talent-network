
import React, { useState } from 'react';
import Footer from '@/components/Footer';
import GlassMorphism from '@/components/GlassMorphism';
import { Building, MapPin, Star, Globe, Users, Award } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import OrganizationMapView from '@/components/organizations/OrganizationMapView';
import OrganizationListView from '@/components/organizations/OrganizationListView';

const Organizations: React.FC = () => {
  const [viewMode, setViewMode] = useState<'list' | 'map'>('map');
  const [selectedOrg, setSelectedOrg] = useState<number | null>(null);

  const organizations = [
    { 
      id: 1, 
      name: 'Elite Talent Agency', 
      type: 'Talent Agency',
      location: 'New York, USA',
      country: 'USA',
      city: 'New York',
      logo: '/placeholder.svg',
      description: 'Premier talent agency representing actors, musicians, and artists across various industries.',
      rating: 4.8,
      website: 'www.elitetalent.com',
      verified: true
    },
    { 
      id: 2, 
      name: 'Creative Arts Studio', 
      type: 'Production Company',
      location: 'Los Angeles, USA',
      country: 'USA',
      city: 'Los Angeles',
      logo: '/placeholder.svg',
      description: 'Full-service production company specializing in film, TV, and digital content creation.',
      rating: 4.7,
      website: 'www.creativeartstudio.com',
      verified: true
    },
    { 
      id: 3, 
      name: 'Global Music Records', 
      type: 'Record Label',
      location: 'Nashville, USA',
      country: 'USA',
      city: 'Nashville',
      logo: '/placeholder.svg',
      description: 'Independent record label focused on discovering and promoting emerging musical talent.',
      rating: 4.6,
      website: 'www.globalmusicrecords.com',
      verified: false
    },
    { 
      id: 4, 
      name: 'Performance Arts Academy', 
      type: 'Educational Institution',
      location: 'London, UK',
      country: 'UK',
      city: 'London',
      logo: '/placeholder.svg',
      description: 'Leading performing arts school offering training in acting, dancing, and music.',
      rating: 4.9,
      website: 'www.performanceartsacademy.edu',
      verified: true
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-purple-50">
      <main className="container mx-auto px-4 py-12">
        <GlassMorphism className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Building className="h-6 w-6" />
              <h1 className="text-2xl font-bold">Organizations & Agencies</h1>
            </div>
            <div className="flex gap-2">
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                onClick={() => setViewMode('list')}
              >
                List View
              </Button>
              <Button
                variant={viewMode === 'map' ? 'default' : 'outline'}
                onClick={() => setViewMode('map')}
              >
                Map View
              </Button>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <Input placeholder="Search organizations, agencies, institutions..." />
            </div>
            <Button>
              Search
            </Button>
          </div>

          {viewMode === 'map' ? (
            <OrganizationMapView
              organizations={organizations}
              selectedOrg={selectedOrg}
              setSelectedOrg={setSelectedOrg}
            />
          ) : (
            <OrganizationListView organizations={organizations} />
          )}
        </GlassMorphism>
      </main>
      <Footer />
    </div>
  );
};

export default Organizations;
