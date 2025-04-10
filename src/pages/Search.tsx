
import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import SocialSidebar from '@/components/SocialSidebar';
import GlassMorphism from '@/components/GlassMorphism';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search as SearchIcon, Filter, Users, Building, Calendar, HighFive } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const Search: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  
  return (
    <TooltipProvider>
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
                    placeholder="Find someone who makes your talent heart beat faster..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Button>
                  Search
                </Button>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline">
                      <Filter className="h-4 w-4 mr-2" />
                      Filters
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Fine-tune your talent discovery!</p>
                  </TooltipContent>
                </Tooltip>
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
                  
                  {searchQuery && searchQuery.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {[1, 2, 3, 4, 5, 6].map((item) => (
                        <GlassMorphism key={item} className="p-4">
                          <div className="flex flex-col gap-3">
                            <div className="flex items-center gap-3">
                              <Avatar className="h-12 w-12">
                                <AvatarImage src="/placeholder.svg" alt={`Talent ${item}`} />
                                <AvatarFallback>T{item}</AvatarFallback>
                              </Avatar>
                              <div>
                                <h3 className="font-medium">Talent Name {item}</h3>
                                <p className="text-sm text-gray-600">Musician, Singer</p>
                              </div>
                            </div>
                            <p className="text-sm">is mastering piano just 5km from you!</p>
                            <div className="flex justify-end">
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button size="sm">
                                    Send a talent high-five ✋
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Start a connection that could change both your futures!</p>
                                </TooltipContent>
                              </Tooltip>
                            </div>
                          </div>
                        </GlassMorphism>
                      ))}
                    </div>
                  ) : (
                    <GlassMorphism className="p-8 text-center">
                      <p className="text-gray-600 italic">
                        Hmm... no matches yet. Try whispering the skill name softer? (Or broaden filters!)
                      </p>
                    </GlassMorphism>
                  )}
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
    </TooltipProvider>
  );
};

export default Search;
