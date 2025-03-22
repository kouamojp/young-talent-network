
import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import SocialSidebar from '@/components/SocialSidebar';
import GlassMorphism from '@/components/GlassMorphism';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search as SearchIcon, Filter, Users, Building, Calendar } from 'lucide-react';

const Search: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-purple-50">
      <Navbar />
      <div className="container mx-auto flex flex-col md:flex-row">
        <SocialSidebar />
        <main className="flex-1 p-4">
          <GlassMorphism className="p-6 mb-6">
            <h1 className="text-2xl font-bold mb-4">Y&T Search & Database</h1>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                <Input 
                  className="pl-10" 
                  placeholder="Search for talents, agents, organizations, events..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button>
                Search
              </Button>
              <Button variant="outline">
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </Button>
            </div>
            
            <Tabs defaultValue="talents" className="mt-6">
              <TabsList className="grid grid-cols-4 mb-4">
                <TabsTrigger value="talents">Talents</TabsTrigger>
                <TabsTrigger value="agents">Agents</TabsTrigger>
                <TabsTrigger value="organizations">Organizations</TabsTrigger>
                <TabsTrigger value="events">Events</TabsTrigger>
              </TabsList>
              
              <TabsContent value="talents" className="space-y-4">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  <h2 className="text-lg font-medium">Talent Search</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Talent results would be mapped here */}
                  {[1, 2, 3, 4, 5, 6].map((item) => (
                    <GlassMorphism key={item} className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-gray-200"></div>
                        <div>
                          <h3 className="font-medium">Talent Name {item}</h3>
                          <p className="text-sm text-gray-600">Musician, Singer</p>
                        </div>
                      </div>
                    </GlassMorphism>
                  ))}
                </div>
              </TabsContent>
              
              <TabsContent value="agents" className="space-y-4">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  <h2 className="text-lg font-medium">Agent Search</h2>
                </div>
                <p>Search for agents and mentors here...</p>
              </TabsContent>
              
              <TabsContent value="organizations" className="space-y-4">
                <div className="flex items-center gap-2">
                  <Building className="h-5 w-5" />
                  <h2 className="text-lg font-medium">Organization Search</h2>
                </div>
                <p>Search for organizations and agencies here...</p>
              </TabsContent>
              
              <TabsContent value="events" className="space-y-4">
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  <h2 className="text-lg font-medium">Event Search</h2>
                </div>
                <p>Search for events and activities here...</p>
              </TabsContent>
            </Tabs>
          </GlassMorphism>
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default Search;
