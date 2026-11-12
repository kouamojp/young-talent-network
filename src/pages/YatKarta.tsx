import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Briefcase, Users, Calendar, Building } from 'lucide-react';
import WorkMap from '@/components/karta/WorkMap';
import PeopleMap from '@/components/karta/PeopleMap';
import EventsMap from '@/components/karta/EventsMap';
import OrganisationsMap from '@/components/karta/OrganisationsMap';
import { tr } from '@/i18n';

const YatKarta = () => {
  const [activeTab, setActiveTab] = useState('work');

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">YAT KARTA</h1>
          <p className="text-muted-foreground">{tr('yatKarta.yourPersonalMapToConnectionCareer')}</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="work" className="flex items-center gap-2">
              <Briefcase className="h-4 w-4" />
              <span className="hidden sm:inline">{tr('yatKarta.workAroundMe')}</span>
              <span className="sm:hidden">{tr('talent.work')}</span>
            </TabsTrigger>
            <TabsTrigger value="people" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">{tr('yatKarta.peopleAroundMe')}</span>
              <span className="sm:hidden">{tr('yatKarta.people')}</span>
            </TabsTrigger>
            <TabsTrigger value="events" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span className="hidden sm:inline">{tr('yatKarta.eventsAroundMe')}</span>
              <span className="sm:hidden">{tr('landing.events')}</span>
            </TabsTrigger>
            <TabsTrigger value="organisations" className="flex items-center gap-2">
              <Building className="h-4 w-4" />
              <span className="hidden sm:inline">{tr('yatKarta.organisationsAroundMe')}</span>
              <span className="sm:hidden">{tr('yatKarta.orgs')}</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="work" className="mt-0">
            <WorkMap />
          </TabsContent>

          <TabsContent value="people" className="mt-0">
            <PeopleMap />
          </TabsContent>

          <TabsContent value="events" className="mt-0">
            <EventsMap />
          </TabsContent>

          <TabsContent value="organisations" className="mt-0">
            <OrganisationsMap />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default YatKarta;
