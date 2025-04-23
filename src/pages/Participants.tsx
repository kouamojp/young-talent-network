import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import GlassMorphism from '@/components/GlassMorphism';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Users, Award, Star, Filter, MapPin } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const Participants: React.FC = () => {
  // Mock data
  const participants = [
    { id: 1, name: 'Emma Thompson', location: 'New York, USA', type: 'Musician', avatar: '/placeholder.svg', rating: 4.8, featured: true },
    { id: 2, name: 'Daniel Lee', location: 'Los Angeles, USA', type: 'Actor', avatar: '/placeholder.svg', rating: 4.7, featured: false },
    { id: 3, name: 'Sofia Garcia', location: 'Miami, USA', type: 'Dancer', avatar: '/placeholder.svg', rating: 4.9, featured: true },
    { id: 4, name: 'Alex Kim', location: 'Chicago, USA', type: 'Visual Artist', avatar: '/placeholder.svg', rating: 4.6, featured: false },
    { id: 5, name: 'Jessica Wu', location: 'Boston, USA', type: 'Writer', avatar: '/placeholder.svg', rating: 4.5, featured: false },
    { id: 6, name: 'Michael Johnson', location: 'Austin, USA', type: 'Filmmaker', avatar: '/placeholder.svg', rating: 4.8, featured: true },
  ];
  
  const mentors = [
    { id: 1, name: 'Dr. Robert Williams', specialization: 'Music Production', avatar: '/placeholder.svg', rating: 4.9, experience: '15+ years' },
    { id: 2, name: 'Sarah Chen', specialization: 'Acting Coach', avatar: '/placeholder.svg', rating: 4.8, experience: '12+ years' },
    { id: 3, name: 'James Taylor', specialization: 'Dance Instructor', avatar: '/placeholder.svg', rating: 4.7, experience: '10+ years' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-purple-50">
      <Navbar />
      <div className="container mx-auto flex flex-col md:flex-row">
        <main className="flex-1 p-4">
          <GlassMorphism className="p-6 mb-6">
            <div className="flex items-center gap-3 mb-6">
              <Users className="h-6 w-6" />
              <h1 className="text-2xl font-bold">Participants & Mentors</h1>
            </div>
            
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="flex-1">
                <Input placeholder="Search participants or mentors..." />
              </div>
              <div className="flex gap-2">
                <Button variant="outline">
                  <Filter className="h-4 w-4 mr-2" />
                  Filters
                </Button>
                <Button variant="outline">
                  <MapPin className="h-4 w-4 mr-2" />
                  Location
                </Button>
              </div>
            </div>
            
            <Tabs defaultValue="participants">
              <TabsList className="mb-4">
                <TabsTrigger value="participants">Participants</TabsTrigger>
                <TabsTrigger value="mentors">Mentors</TabsTrigger>
                <TabsTrigger value="featured">Featured Talents</TabsTrigger>
              </TabsList>
              
              <TabsContent value="participants" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {participants.map(participant => (
                    <GlassMorphism key={participant.id} className="p-4 hover:shadow-md transition-shadow cursor-pointer">
                      <div className="flex items-start gap-3">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={participant.avatar} alt={participant.name} />
                          <AvatarFallback>{participant.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-semibold">{participant.name}</h3>
                          <p className="text-sm text-gray-600">{participant.type}</p>
                          <div className="flex items-center text-xs mt-1">
                            <MapPin className="h-3 w-3 mr-1" />
                            <span>{participant.location}</span>
                          </div>
                          <div className="flex items-center mt-2">
                            <Star className="h-4 w-4 text-yellow-500 mr-1" />
                            <span className="text-sm">{participant.rating}</span>
                          </div>
                        </div>
                      </div>
                    </GlassMorphism>
                  ))}
                </div>
              </TabsContent>
              
              <TabsContent value="mentors" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {mentors.map(mentor => (
                    <GlassMorphism key={mentor.id} className="p-4 hover:shadow-md transition-shadow cursor-pointer">
                      <div className="flex flex-col items-center text-center p-2">
                        <Avatar className="h-20 w-20 mb-3">
                          <AvatarImage src={mentor.avatar} alt={mentor.name} />
                          <AvatarFallback>{mentor.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <h3 className="font-semibold text-lg">{mentor.name}</h3>
                        <p className="text-primary font-medium">{mentor.specialization}</p>
                        <div className="flex items-center mt-2 mb-1">
                          <Star className="h-4 w-4 text-yellow-500 mr-1" />
                          <span>{mentor.rating}</span>
                        </div>
                        <p className="text-sm text-gray-600">{mentor.experience}</p>
                        <Button className="mt-3" size="sm">View Profile</Button>
                      </div>
                    </GlassMorphism>
                  ))}
                </div>
              </TabsContent>
              
              <TabsContent value="featured" className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <Award className="h-5 w-5 text-primary" />
                  <h2 className="text-lg font-medium">Featured Talents</h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {participants
                    .filter(p => p.featured)
                    .map(participant => (
                      <GlassMorphism key={participant.id} className="p-4 hover:shadow-md transition-shadow cursor-pointer border border-primary/20">
                        <div className="flex flex-col items-center text-center p-2">
                          <div className="absolute -top-2 -right-2">
                            <div className="bg-primary text-white text-xs px-2 py-1 rounded-full">Featured</div>
                          </div>
                          <Avatar className="h-20 w-20 mb-3">
                            <AvatarImage src={participant.avatar} alt={participant.name} />
                            <AvatarFallback>{participant.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <h3 className="font-semibold text-lg">{participant.name}</h3>
                          <p className="text-primary font-medium">{participant.type}</p>
                          <div className="flex items-center mt-2 mb-1">
                            <Star className="h-4 w-4 text-yellow-500 mr-1" />
                            <span>{participant.rating}</span>
                          </div>
                          <p className="text-sm text-gray-600">{participant.location}</p>
                          <Button className="mt-3" size="sm">View Profile</Button>
                        </div>
                      </GlassMorphism>
                    ))}
                </div>
              </TabsContent>
            </Tabs>
          </GlassMorphism>
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default Participants;
