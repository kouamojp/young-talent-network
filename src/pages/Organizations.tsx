
import React, { useState } from 'react';
import GlassMorphism from '@/components/GlassMorphism';
import { Building, MapPin, Star, Globe, Users, Award, Plus } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import OrganizationMapView from '@/components/organizations/OrganizationMapView';
import OrganizationListView from '@/components/organizations/OrganizationListView';
import OrganizationProfileForm from '@/components/organizations/OrganizationProfileForm';
import OrganizationAuth from '@/components/organization-profiles/OrganizationAuth';
import OrganizationProfileEditor from '@/components/organization-profiles/OrganizationProfileEditor';
import OrganizationDiscovery from '@/components/organization-profiles/OrganizationDiscovery';

const Organizations: React.FC = () => {
  const [viewMode, setViewMode] = useState<'list' | 'map'>('map');
  const [selectedOrg, setSelectedOrg] = useState<number | null>(null);
  const [editingOrg, setEditingOrg] = useState<any>(null);
  const [isProfileFormOpen, setIsProfileFormOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('discovery');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userType, setUserType] = useState<'talent' | 'organization' | null>(null);

  const [organizations, setOrganizations] = useState([
    { 
      id: 1, 
      name: 'Elite Talent Agency', 
      type: 'Talent Agency',
      location: 'New York, USA',
      country: 'USA',
      city: 'New York',
      logo: '/placeholder.svg',
      description: 'Premier talent agency representing actors, musicians, and artists across various industries.',
      customDescription: 'Specializing in breakthrough talent discovery and career management for entertainment professionals.',
      rating: 4.8,
      website: 'www.elitetalent.com',
      verified: true,
      phone: '+1 (555) 123-4567',
      email: 'contact@elitetalent.com'
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
      customDescription: 'Award-winning production services from concept to completion.',
      rating: 4.7,
      website: 'www.creativeartstudio.com',
      verified: true,
      phone: '+1 (555) 987-6543',
      email: 'info@creativeartstudio.com'
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
      verified: false,
      phone: '+1 (555) 456-7890',
      email: 'artists@globalmusicrecords.com'
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
      customDescription: 'Transforming passion into professional excellence through world-class training.',
      rating: 4.9,
      website: 'www.performanceartsacademy.edu',
      verified: true,
      phone: '+44 20 7123 4567',
      email: 'admissions@performanceartsacademy.edu'
    },
    {
      id: 5,
      name: 'WebConsult Moscow',
      type: 'Web Services',
      location: 'Moscow, Russia',
      country: 'Russia',
      city: 'Moscow',
      logo: '/placeholder.svg',
      description: 'Professional web development and digital marketing services.',
      customDescription: 'Я занимаюсь консалтингом в вебе. Создание и продвижение сайтов в Москве.',
      rating: 4.5,
      website: 'www.webconsult.ru',
      verified: true,
      phone: '+7 (495) 123-45-67',
      email: 'info@webconsult.ru'
    }
  ]);

  const handleLogin = (type: 'talent' | 'organization') => {
    setIsLoggedIn(true);
    setUserType(type);
    setActiveTab('profile');
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserType(null);
    setActiveTab('discovery');
  };

  const handleEditOrganization = (org: any) => {
    setEditingOrg(org);
    setIsProfileFormOpen(true);
  };

  const handleCreateNew = () => {
    setEditingOrg(null);
    setIsProfileFormOpen(true);
  };

  const handleSaveOrganization = (formData: any) => {
    if (editingOrg) {
      setOrganizations(prev => prev.map(org => 
        org.id === editingOrg.id ? { ...org, ...formData } : org
      ));
    } else {
      const newOrg = {
        id: Math.max(...organizations.map(o => o.id)) + 1,
        ...formData,
        rating: 4.0,
        verified: false,
        logo: '/placeholder.svg'
      };
      setOrganizations(prev => [...prev, newOrg]);
    }
    setIsProfileFormOpen(false);
    setEditingOrg(null);
  };

  const handleCancelEdit = () => {
    setIsProfileFormOpen(false);
    setEditingOrg(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-purple-50">
      <main className="container mx-auto px-4 py-12">
        <GlassMorphism className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Building className="h-6 w-6" />
              <h1 className="text-2xl font-bold">YAT Organizations</h1>
            </div>
            <div className="flex gap-2">
              {isLoggedIn && (
                <Button variant="outline" onClick={handleLogout}>
                  Logout
                </Button>
              )}
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="discovery">
                Discovery
              </TabsTrigger>
              <TabsTrigger value="browse">
                Browse All
              </TabsTrigger>
              <TabsTrigger value="auth" disabled={isLoggedIn}>
                Join/Login
              </TabsTrigger>
              <TabsTrigger value="profile" disabled={!isLoggedIn}>
                My Profile
              </TabsTrigger>
            </TabsList>

            <TabsContent value="discovery">
              <OrganizationDiscovery />
            </TabsContent>

            <TabsContent value="browse">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={handleCreateNew}
                      className="flex items-center gap-2"
                    >
                      <Plus className="h-4 w-4" />
                      Add Organization
                    </Button>
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

                <div className="flex flex-col md:flex-row gap-4">
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
                  <OrganizationListView 
                    organizations={organizations} 
                    onEditOrganization={handleEditOrganization}
                  />
                )}
              </div>
            </TabsContent>

            <TabsContent value="auth">
              <OrganizationAuth onLogin={handleLogin} />
            </TabsContent>

            <TabsContent value="profile">
              {isLoggedIn && userType === 'organization' && (
                <OrganizationProfileEditor />
              )}
              {isLoggedIn && userType === 'talent' && (
                <div className="text-center py-8">
                  <h3 className="text-lg font-semibold mb-2">Talent Profile</h3>
                  <p className="text-muted-foreground">
                    This section is for talents to manage their profiles and connect with organizations.
                  </p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </GlassMorphism>

        {/* Profile Form Dialog */}
        <Dialog open={isProfileFormOpen} onOpenChange={setIsProfileFormOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <OrganizationProfileForm
              organization={editingOrg}
              onSave={handleSaveOrganization}
              onCancel={handleCancelEdit}
            />
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
};

export default Organizations;
