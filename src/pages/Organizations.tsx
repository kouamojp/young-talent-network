import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import SocialSidebar from '@/components/SocialSidebar';
import GlassMorphism from '@/components/GlassMorphism';
import { Building, MapPin, Star, Globe, Users, Award } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import OrganizationMapView from '@/components/organizations/OrganizationMapView';

const Organizations: React.FC = () => {
  const [viewMode, setViewMode] = useState<'list' | 'map'>('map');
  const [selectedOrg, setSelectedOrg] = useState<number | null>(null);

  // Mock data
  const organizations = [
    { 
      id: 1, 
      name: 'Elite Talent Agency', 
      type: 'Talent Agency',
      location: 'New York, USA',
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
      location: 'Chicago, USA',
      logo: '/placeholder.svg',
      description: 'Leading performing arts school offering training in acting, dancing, and music.',
      rating: 4.9,
      website: 'www.performanceartsacademy.edu',
      verified: true
    },
  ];
  
  const featuredOrg = organizations[0];

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-purple-50">
      <Navbar />
      <div className="container mx-auto flex flex-col md:flex-row">
        <SocialSidebar />
        <main className="flex-1 p-4">
          <GlassMorphism className="p-6 mb-6">
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
              <Tabs defaultValue="all">
                <TabsList className="mb-4">
                  <TabsTrigger value="all">All Organizations</TabsTrigger>
                  <TabsTrigger value="agencies">Talent Agencies</TabsTrigger>
                  <TabsTrigger value="production">Production Companies</TabsTrigger>
                  <TabsTrigger value="educational">Educational Institutions</TabsTrigger>
                </TabsList>
                
                <TabsContent value="all" className="space-y-4">
                  <GlassMorphism className="p-6 border border-primary/20 mb-6">
                    <div className="flex flex-col md:flex-row gap-6">
                      <div className="w-full md:w-40 h-40 flex-shrink-0">
                        <div className="w-full h-full rounded-lg overflow-hidden bg-gray-200">
                          <img src={featuredOrg.logo} alt={featuredOrg.name} className="w-full h-full object-cover" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center">
                          <h2 className="text-xl font-bold">{featuredOrg.name}</h2>
                          {featuredOrg.verified && (
                            <div className="ml-2 text-xs bg-blue-500 text-white px-2 py-0.5 rounded-full flex items-center">
                              <Award className="h-3 w-3 mr-1" />
                              Verified
                            </div>
                          )}
                        </div>
                        <p className="text-primary font-medium">{featuredOrg.type}</p>
                        <div className="flex items-center text-sm text-gray-600 mt-1">
                          <MapPin className="h-4 w-4 mr-1" />
                          <span>{featuredOrg.location}</span>
                        </div>
                        <div className="flex items-center mt-2">
                          <Star className="h-4 w-4 text-yellow-500 mr-1" />
                          <span>{featuredOrg.rating}</span>
                        </div>
                        <p className="text-gray-600 mt-3">{featuredOrg.description}</p>
                        <div className="flex items-center mt-3 text-sm">
                          <Globe className="h-4 w-4 mr-1 text-gray-600" />
                          <a href={`https://${featuredOrg.website}`} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                            {featuredOrg.website}
                          </a>
                        </div>
                        <div className="flex gap-3 mt-4">
                          <Button>Contact</Button>
                          <Button variant="outline">
                            <Users className="h-4 w-4 mr-2" />
                            View Talents
                          </Button>
                        </div>
                      </div>
                    </div>
                  </GlassMorphism>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {organizations.slice(1).map(org => (
                      <GlassMorphism key={org.id} className="p-4 hover:shadow-md transition-shadow">
                        <div className="flex gap-4">
                          <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-200 flex-shrink-0">
                            <img src={org.logo} alt={org.name} className="w-full h-full object-cover" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center">
                              <h3 className="font-semibold">{org.name}</h3>
                              {org.verified && (
                                <div className="ml-2 text-xs bg-blue-500 text-white px-1.5 py-0.5 rounded-full flex items-center">
                                  <Award className="h-2 w-2 mr-0.5" />
                                  Verified
                                </div>
                              )}
                            </div>
                            <p className="text-sm text-primary">{org.type}</p>
                            <div className="flex items-center text-xs text-gray-600 mt-1">
                              <MapPin className="h-3 w-3 mr-1" />
                              <span>{org.location}</span>
                              <span className="mx-1">•</span>
                              <Star className="h-3 w-3 text-yellow-500 mr-1" />
                              <span>{org.rating}</span>
                            </div>
                            <Button size="sm" className="mt-2">View</Button>
                          </div>
                        </div>
                      </GlassMorphism>
                    ))}
                  </div>
                </TabsContent>
                
                <TabsContent value="agencies">
                  <div className="flex items-center gap-2 mb-4">
                    <Building className="h-5 w-5" />
                    <h2 className="text-lg font-medium">Talent Agencies</h2>
                  </div>
                  <p>List of talent agencies that represent artists, performers, and creative professionals.</p>
                </TabsContent>
                
                <TabsContent value="production">
                  <div className="flex items-center gap-2 mb-4">
                    <Building className="h-5 w-5" />
                    <h2 className="text-lg font-medium">Production Companies</h2>
                  </div>
                  <p>Production companies that create content and provide opportunities for talents.</p>
                </TabsContent>
                
                <TabsContent value="educational">
                  <div className="flex items-center gap-2 mb-4">
                    <Building className="h-5 w-5" />
                    <h2 className="text-lg font-medium">Educational Institutions</h2>
                  </div>
                  <p>Schools, academies, and educational institutions focused on developing talent.</p>
                </TabsContent>
              </Tabs>
            )}
          </GlassMorphism>
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default Organizations;
