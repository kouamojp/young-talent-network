
import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AnalyticsDashboard from '@/components/talent-dashboard/AnalyticsDashboard';
import StatusToggle from '@/components/talent-dashboard/StatusToggle';
import WorkSection from '@/components/talent-dashboard/WorkSection';
import LearningsSection from '@/components/talent-dashboard/LearningsSection';
import LiveSection from '@/components/talent-dashboard/LiveSection';
import TVSection from '@/components/talent-dashboard/TVSection';
import EventsSection from '@/components/talent-dashboard/EventsSection';
import OrganizationsSection from '@/components/talent-dashboard/OrganizationsSection';
import OverviewSection from '@/components/talent-dashboard/OverviewSection';

import { useLanguage } from '@/i18n/LanguageContext';

const TalentDashboard: React.FC = () => {
  const [isOpenToWork, setIsOpenToWork] = useState(true);
  const [workStatus, setWorkStatus] = useState('Actively Looking');
  const { t } = useLanguage();


  return (
    <div className="min-h-screen px-4 py-6 md:px-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-semibold mb-2">
            {t('talent.dashboard')}
          </h1>
        </div>

        <StatusToggle
          isOpenToWork={isOpenToWork}
          workStatus={workStatus}
          onToggle={setIsOpenToWork}
          onStatusChange={setWorkStatus}
        />

        <AnalyticsDashboard />

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
            <TabsTrigger value="work">{t('talent.work')}</TabsTrigger>
            <TabsTrigger value="learning">{t('talent.learning')}</TabsTrigger>
            <TabsTrigger value="live">{t('talent.live')}</TabsTrigger>
            <TabsTrigger value="tv">{t('talent.tv')}</TabsTrigger>
            <TabsTrigger value="events">{t('talent.events')}</TabsTrigger>
            <TabsTrigger value="organizations">{t('talent.organizations')}</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <OverviewSection />
          </TabsContent>



          <TabsContent value="work">
            <WorkSection />
          </TabsContent>

          <TabsContent value="learning">
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
      </div>
    </div>
  );
};

export default TalentDashboard;
