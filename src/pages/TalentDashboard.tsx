
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { 
  User, 
  Briefcase, 
  GraduationCap, 
  Radio, 
  Tv, 
  Calendar, 
  Building,
  Settings,
  Eye,
  TrendingUp
} from 'lucide-react';
import Footer from '@/components/Footer';
import GlassMorphism from '@/components/GlassMorphism';
import StatusToggle from '@/components/talent-dashboard/StatusToggle';
import WorkSection from '@/components/talent-dashboard/WorkSection';
import LearningsSection from '@/components/talent-dashboard/LearningsSection';
import LiveSection from '@/components/talent-dashboard/LiveSection';
import TVSection from '@/components/talent-dashboard/TVSection';
import EventsSection from '@/components/talent-dashboard/EventsSection';
import OrganizationsSection from '@/components/talent-dashboard/OrganizationsSection';
import AnalyticsDashboard from '@/components/talent-dashboard/AnalyticsDashboard';

const TalentDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('work');
  const [isOpenToWork, setIsOpenToWork] = useState(true);
  const [workStatus, setWorkStatus] = useState('Actively Looking');

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-purple-50 to-pink-50">
      <main className="container mx-auto px-4 py-12">
        <GlassMorphism className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <User className="h-8 w-8 text-purple-600" />
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Talent Dashboard
                </h1>
                <p className="text-gray-600">Manage your professional presence</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Eye className="h-4 w-4 mr-2" />
                Preview Profile
              </Button>
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
            </div>
          </div>

          {/* Status Toggle Banner */}
          <StatusToggle 
            isOpenToWork={isOpenToWork}
            workStatus={workStatus}
            onToggle={setIsOpenToWork}
            onStatusChange={setWorkStatus}
          />

          {/* Analytics Overview */}
          <AnalyticsDashboard />

          {/* Main Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6">
            <TabsList className="grid grid-cols-3 md:grid-cols-6 gap-2 mb-8">
              <TabsTrigger value="work" className="flex items-center gap-2">
                <Briefcase className="h-4 w-4" />
                <span className="hidden sm:inline">Work</span>
              </TabsTrigger>
              <TabsTrigger value="learnings" className="flex items-center gap-2">
                <GraduationCap className="h-4 w-4" />
                <span className="hidden sm:inline">Learning</span>
              </TabsTrigger>
              <TabsTrigger value="live" className="flex items-center gap-2">
                <Radio className="h-4 w-4" />
                <span className="hidden sm:inline">Live</span>
              </TabsTrigger>
              <TabsTrigger value="tv" className="flex items-center gap-2">
                <Tv className="h-4 w-4" />
                <span className="hidden sm:inline">TV</span>
              </TabsTrigger>
              <TabsTrigger value="events" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span className="hidden sm:inline">Events</span>
              </TabsTrigger>
              <TabsTrigger value="organizations" className="flex items-center gap-2">
                <Building className="h-4 w-4" />
                <span className="hidden sm:inline">Orgs</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="work">
              <WorkSection />
            </TabsContent>

            <TabsContent value="learnings">
              <LearningsSection />
            </TabsContent>

            <TabsContent value="live">
              <LiveSection />
            </TabsContent>

            <TabsContent value="tv">
              <TVSection />
            </TabsContent>

            <TabsContent value="events">
              <EventsSection />
            </TabsContent>

            <TabsContent value="organizations">
              <OrganizationsSection />
            </TabsContent>
          </Tabs>
        </GlassMorphism>
      </main>
      <Footer />
    </div>
  );
};

export default TalentDashboard;
