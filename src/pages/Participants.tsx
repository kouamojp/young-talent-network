
import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import GlassMorphism from '@/components/GlassMorphism';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Users, Award, Star, Filter, MapPin } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const Participants: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  
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
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-purple-50 to-blue-50">
      <Navbar />
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">Discover Talented People</h1>
          
          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="flex-1">
                <Input 
                  placeholder="Search by name, skill or location..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-white border-gray-200"
                />
              </div>
              <div className="flex gap-2">
                <Button variant="outline" className="bg-white hover:bg-gray-50">
                  <Filter className="h-4 w-4 mr-2" />
                  Filters
                </Button>
                <Button variant="outline" className="bg-white hover:bg-gray-50">
                  <MapPin className="h-4 w-4 mr-2" />
                  Location
                </Button>
              </div>
            </div>
            
            <Tabs defaultValue="participants" className="w-full">
              <TabsList className="mb-6 w-full bg-gray-100/50 p-1 rounded-lg">
                <TabsTrigger value="participants" className="flex-1 data-[state=active]:bg-white rounded-md">
                  <Users className="h-4 w-4 mr-2" />
                  Participants
                </TabsTrigger>
                <TabsTrigger value="mentors" className="flex-1 data-[state=active]:bg-white rounded-md">
                  <Award className="h-4 w-4 mr-2" />
                  Mentors
                </TabsTrigger>
                <TabsTrigger value="featured" className="flex-1 data-[state=active]:bg-white rounded-md">
                  <Star className="h-4 w-4 mr-2" />
                  Featured
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="participants" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {participants.map(participant => (
                    <div 
                      key={participant.id} 
                      className="bg-white rounded-lg p-5 shadow-sm hover:shadow-md transition-shadow border border-gray-100"
                    >
                      <div className="flex items-start gap-4">
                        <Avatar className="h-16 w-16 border-2 border-white shadow-sm">
                          <AvatarImage src={participant.avatar} alt={participant.name} />
                          <AvatarFallback>{participant.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-semibold text-lg">{participant.name}</h3>
                          <p className="text-sm text-primary/80 font-medium">{participant.type}</p>
                          <div className="flex items-center text-xs mt-1 text-gray-600">
                            <MapPin className="h-3 w-3 mr-1" />
                            <span>{participant.location}</span>
                          </div>
                          <div className="flex items-center mt-2">
                            <Star className="h-4 w-4 text-yellow-500 mr-1" />
                            <span className="text-sm">{participant.rating}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>
              
              <TabsContent value="mentors" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {mentors.map(mentor => (
                    <div 
                      key={mentor.id} 
                      className="bg-white rounded-lg p-6 hover:shadow-md transition-shadow text-center border border-gray-100 shadow-sm"
                    >
                      <Avatar className="h-20 w-20 mx-auto mb-4 border-4 border-white shadow">
                        <AvatarImage src={mentor.avatar} alt={mentor.name} />
                        <AvatarFallback>{mentor.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <h3 className="font-semibold text-lg">{mentor.name}</h3>
                      <p className="text-primary font-medium text-sm">{mentor.specialization}</p>
                      <div className="flex items-center justify-center mt-2 mb-1">
                        <Star className="h-4 w-4 text-yellow-500 mr-1" />
                        <span>{mentor.rating}</span>
                      </div>
                      <p className="text-sm text-gray-600 mb-4">{mentor.experience}</p>
                      <Button className="w-full" size="sm">View Profile</Button>
                    </div>
                  ))}
                </div>
              </TabsContent>
              
              <TabsContent value="featured" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {participants
                    .filter(p => p.featured)
                    .map(participant => (
                      <div 
                        key={participant.id} 
                        className="bg-gradient-to-br from-white to-blue-50 rounded-lg p-6 hover:shadow-lg transition-shadow text-center relative overflow-hidden border border-blue-100 shadow-sm"
                      >
                        <div className="absolute top-3 right-3">
                          <span className="bg-primary/10 text-primary text-xs px-3 py-1 rounded-full font-medium">Featured</span>
                        </div>
                        <Avatar className="h-24 w-24 mx-auto mb-4 border-4 border-white shadow">
                          <AvatarImage src={participant.avatar} alt={participant.name} />
                          <AvatarFallback>{participant.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <h3 className="font-semibold text-lg">{participant.name}</h3>
                        <p className="text-primary font-medium">{participant.type}</p>
                        <div className="flex items-center justify-center mt-2 mb-1">
                          <Star className="h-4 w-4 text-yellow-500 mr-1" />
                          <span>{participant.rating}</span>
                        </div>
                        <p className="text-sm text-gray-600 mb-4">{participant.location}</p>
                        <Button className="w-full bg-primary/90 hover:bg-primary" size="sm">View Profile</Button>
                      </div>
                    ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Participants;
