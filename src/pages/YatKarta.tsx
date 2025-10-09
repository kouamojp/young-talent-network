import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Briefcase, Users, Calendar, Building } from 'lucide-react';
import WorkMap from '@/components/karta/WorkMap';
import PeopleMap from '@/components/karta/PeopleMap';
import EventsMap from '@/components/karta/EventsMap';
import OrganisationsMap from '@/components/karta/OrganisationsMap';

const YatKarta = () => {
  const [activeTab, setActiveTab] = useState('work');

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">YAT KARTA</h1>
          <p className="text-muted-foreground">Your personal map to connection, career, and community</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="work" className="flex items-center gap-2">
              <Briefcase className="h-4 w-4" />
              <span className="hidden sm:inline">Work Around Me</span>
              <span className="sm:hidden">Work</span>
            </TabsTrigger>
            <TabsTrigger value="people" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">People Around Me</span>
              <span className="sm:hidden">People</span>
            </TabsTrigger>
            <TabsTrigger value="events" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span className="hidden sm:inline">Events Around Me</span>
              <span className="sm:hidden">Events</span>
            </TabsTrigger>
            <TabsTrigger value="organisations" className="flex items-center gap-2">
              <Building className="h-4 w-4" />
              <span className="hidden sm:inline">Organisations Around Me</span>
              <span className="sm:hidden">Orgs</span>
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
