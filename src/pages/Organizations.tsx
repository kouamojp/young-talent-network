import React, { useState } from 'react';
import GlassMorphism from '@/components/GlassMorphism';
import { Building, Plus } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import OrganizationMapView from '@/components/organizations/OrganizationMapView';
import OrganizationListView from '@/components/organizations/OrganizationListView';
import OrganizationProfileForm from '@/components/organizations/OrganizationProfileForm';
import OrganizationAuth from '@/components/organization-profiles/OrganizationAuth';
import OrganizationProfileEditor from '@/components/organization-profiles/OrganizationProfileEditor';
import OrganizationDiscovery from '@/components/organization-profiles/OrganizationDiscovery';
import { useLanguage } from '@/i18n/LanguageContext';

const Organizations: React.FC = () => {
  const { t } = useLanguage();
  const [viewMode, setViewMode] = useState<'list' | 'map'>('map');
  const [selectedOrg, setSelectedOrg] = useState<number | null>(null);
  const [editingOrg, setEditingOrg] = useState<any>(null);
  const [isProfileFormOpen, setIsProfileFormOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('discovery');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userType, setUserType] = useState<'talent' | 'organization' | null>(null);

  const [organizations, setOrganizations] = useState([
    { id: 1, name: 'Elite Talent Agency', type: 'Talent Agency', location: 'New York, USA', country: 'USA', city: 'New York', logo: '/placeholder.svg', description: 'Premier talent agency representing actors, musicians, and artists across various industries.', customDescription: 'Specializing in breakthrough talent discovery and career management for entertainment professionals.', rating: 4.8, website: 'www.elitetalent.com', verified: true, phone: '+1 (555) 123-4567', email: 'contact@elitetalent.com' },
    { id: 2, name: 'Creative Arts Studio', type: 'Production Company', location: 'Los Angeles, USA', country: 'USA', city: 'Los Angeles', logo: '/placeholder.svg', description: 'Full-service production company specializing in film, TV, and digital content creation.', customDescription: 'Award-winning production services from concept to completion.', rating: 4.7, website: 'www.creativeartstudio.com', verified: true, phone: '+1 (555) 987-6543', email: 'info@creativeartstudio.com' },
    { id: 3, name: 'Global Music Records', type: 'Record Label', location: 'Nashville, USA', country: 'USA', city: 'Nashville', logo: '/placeholder.svg', description: 'Independent record label focused on discovering and promoting emerging musical talent.', rating: 4.6, website: 'www.globalmusicrecords.com', verified: false, phone: '+1 (555) 456-7890', email: 'artists@globalmusicrecords.com' },
    { id: 4, name: 'Performance Arts Academy', type: 'Educational Institution', location: 'London, UK', country: 'UK', city: 'London', logo: '/placeholder.svg', description: 'Leading performing arts school offering training in acting, dancing, and music.', customDescription: 'Transforming passion into professional excellence through world-class training.', rating: 4.9, website: 'www.performanceartsacademy.edu', verified: true, phone: '+44 20 7123 4567', email: 'admissions@performanceartsacademy.edu' },
    { id: 5, name: 'WebConsult Moscow', type: 'Web Services', location: 'Moscow, Russia', country: 'Russia', city: 'Moscow', logo: '/placeholder.svg', description: 'Professional web development and digital marketing services.', customDescription: 'Я занимаюсь консалтингом в вебе.', rating: 4.5, website: 'www.webconsult.ru', verified: true, phone: '+7 (495) 123-45-67', email: 'info@webconsult.ru' },
  ]);

  const handleLogin = (type: 'talent' | 'organization') => { setIsLoggedIn(true); setUserType(type); setActiveTab('profile'); };
  const handleLogout = () => { setIsLoggedIn(false); setUserType(null); setActiveTab('discovery'); };
  const handleEditOrganization = (org: any) => { setEditingOrg(org); setIsProfileFormOpen(true); };
  const handleCreateNew = () => { setEditingOrg(null); setIsProfileFormOpen(true); };
  const handleSaveOrganization = (formData: any) => {
    if (editingOrg) { setOrganizations(prev => prev.map(org => org.id === editingOrg.id ? { ...org, ...formData } : org)); }
    else { setOrganizations(prev => [...prev, { id: Math.max(...organizations.map(o => o.id)) + 1, ...formData, rating: 4.0, verified: false, logo: '/placeholder.svg' }]); }
    setIsProfileFormOpen(false); setEditingOrg(null);
  };
  const handleCancelEdit = () => { setIsProfileFormOpen(false); setEditingOrg(null); };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-purple-50">
      <main className="container mx-auto px-4 py-12">
        <GlassMorphism className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Building className="h-6 w-6" />
              <h1 className="text-2xl font-bold">{t('orgs.title')}</h1>
            </div>
            <div className="flex gap-2">
              {isLoggedIn && <Button variant="outline" onClick={handleLogout}>{t('orgs.logout')}</Button>}
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="discovery">{t('orgs.discovery')}</TabsTrigger>
              <TabsTrigger value="browse">{t('orgs.browseAll')}</TabsTrigger>
              <TabsTrigger value="auth" disabled={isLoggedIn}>{t('orgs.joinLogin')}</TabsTrigger>
              <TabsTrigger value="profile" disabled={!isLoggedIn}>{t('orgs.myProfile')}</TabsTrigger>
            </TabsList>

            <TabsContent value="discovery"><OrganizationDiscovery /></TabsContent>
            <TabsContent value="browse">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Button variant="outline" onClick={handleCreateNew} className="flex items-center gap-2"><Plus className="h-4 w-4" />{t('orgs.addOrganization')}</Button>
                  <div className="flex gap-2">
                    <Button variant={viewMode === 'list' ? 'default' : 'outline'} onClick={() => setViewMode('list')}>{t('orgs.listView')}</Button>
                    <Button variant={viewMode === 'map' ? 'default' : 'outline'} onClick={() => setViewMode('map')}>{t('orgs.mapView')}</Button>
                  </div>
                </div>
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1"><Input placeholder={t('orgs.searchPlaceholder')} /></div>
                  <Button>{t('orgs.search')}</Button>
                </div>
                {viewMode === 'map' ? <OrganizationMapView organizations={organizations} selectedOrg={selectedOrg} setSelectedOrg={setSelectedOrg} /> : <OrganizationListView organizations={organizations} onEditOrganization={handleEditOrganization} />}
              </div>
            </TabsContent>
            <TabsContent value="auth"><OrganizationAuth onLogin={handleLogin} /></TabsContent>
            <TabsContent value="profile">
              {isLoggedIn && userType === 'organization' && <OrganizationProfileEditor />}
              {isLoggedIn && userType === 'talent' && (
                <div className="text-center py-8">
                  <h3 className="text-lg font-semibold mb-2">{t('orgs.talentProfile')}</h3>
                  <p className="text-muted-foreground">{t('orgs.talentProfileDesc')}</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </GlassMorphism>

        <Dialog open={isProfileFormOpen} onOpenChange={setIsProfileFormOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <OrganizationProfileForm organization={editingOrg} onSave={handleSaveOrganization} onCancel={handleCancelEdit} />
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
};

export default Organizations;
