
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Building, Users, MapPin, Plus } from 'lucide-react';
import GlassMorphism from '@/components/GlassMorphism';
import OrganizationAuth from '@/components/organization-profiles/OrganizationAuth';
import OrganizationProfileEditor from '@/components/organization-profiles/OrganizationProfileEditor';
import OrganizationDiscovery from '@/components/organization-profiles/OrganizationDiscovery';

const OrganizationProfiles: React.FC = () => {
  const [activeTab, setActiveTab] = useState('auth');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userType, setUserType] = useState<'talent' | 'organization' | null>(null);

  const handleLogin = (type: 'talent' | 'organization') => {
    setIsLoggedIn(true);
    setUserType(type);
    setActiveTab('profile');
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserType(null);
    setActiveTab('auth');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-purple-50">
      <main className="container mx-auto px-4 py-12">
        <GlassMorphism className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Building className="h-6 w-6" />
              <h1 className="text-2xl font-bold">YAT Organization Profiles</h1>
            </div>
            {isLoggedIn && (
              <Button variant="outline" onClick={handleLogout}>
                Logout
              </Button>
            )}
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="auth" disabled={isLoggedIn}>
                Authentication
              </TabsTrigger>
              <TabsTrigger value="profile" disabled={!isLoggedIn}>
                Profile Management
              </TabsTrigger>
              <TabsTrigger value="discovery">
                Discovery
              </TabsTrigger>
            </TabsList>

            <TabsContent value="auth">
              <OrganizationAuth onLogin={handleLogin} />
            </TabsContent>

            <TabsContent value="profile">
              {isLoggedIn && userType === 'organization' && (
                <OrganizationProfileEditor />
              )}
              {isLoggedIn && userType === 'talent' && (
                <Card>
                  <CardContent className="p-6 text-center">
                    <h3 className="text-lg font-semibold mb-2">Talent Profile</h3>
                    <p className="text-muted-foreground">
                      This section is for talents to manage their profiles and connect with organizations.
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="discovery">
              <OrganizationDiscovery />
            </TabsContent>
          </Tabs>
        </GlassMorphism>
      </main>
    </div>
  );
};

export default OrganizationProfiles;
