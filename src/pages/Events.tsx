import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import SocialSidebar from '@/components/SocialSidebar';
import GlassMorphism from '@/components/GlassMorphism';
import { Calendar, MapPin, Clock, Users, Filter, Search, Ticket, PartyPopper, MessageCircle } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

const Events: React.FC = () => {
  const [filterOpen, setFilterOpen] = useState(false);
  
  const events = [
    {
      id: 1,
      title: 'Young Innovators Fair',
      date: 'June 15, 2023',
      time: '10:00 AM - 6:00 PM',
      location: 'Online & Central Park, New York',
      category: 'Innovation',
      attendees: 250,
      image: '/placeholder.svg',
      perks: 'Free cotton candy for all participants!',
      description: "Join us for a day of creativity and innovation! Whether you're a beginner or experienced creator, this is your chance to shine. PS. Come even if your project isn't perfect - we love works in progress! 🌟",
      tags: ['beginner-friendly', 'free-snacks', 'hybrid-event']
    },
    {
      id: 2,
      title: 'Digital Art Exhibition',
      date: 'June 23-25, 2023',
      time: '10:00 AM - 6:00 PM',
      location: 'Modern Gallery, Chicago',
      category: 'Art & Design',
      attendees: 85,
      image: '/placeholder.svg',
      description: 'Exhibition featuring works from emerging digital artists, with interactive installations and artist talks throughout the weekend.'
    },
    {
      id: 3,
      title: 'Film Festival: New Voices',
      date: 'July 5-10, 2023',
      time: 'Various Times',
      location: 'Cinema Center, Los Angeles',
      category: 'Film',
      attendees: 450,
      image: '/placeholder.svg',
      description: 'Annual film festival showcasing short films, documentaries, and feature films from emerging filmmakers and student directors.'
    },
    {
      id: 4,
      title: 'Theatre Workshop with Broadway Actors',
      date: 'July 15, 2023',
      time: '1:00 PM - 5:00 PM',
      location: 'Community Theatre, Boston',
      category: 'Acting',
      attendees: 40,
      image: '/placeholder.svg',
      description: 'Intensive workshop led by Broadway actors covering performance techniques, auditioning skills, and industry insights.'
    },
  ];
  
  const upcomingEvents = events.slice(0, 3);
  const pastEvents = [
    {
      id: 5,
      title: 'Dance Competition Finals',
      date: 'May 28, 2023',
      location: 'Grand Hall, Miami',
      category: 'Dance',
      attendees: 320,
      image: '/placeholder.svg'
    },
    {
      id: 6,
      title: 'Songwriting Masterclass',
      date: 'May 15, 2023',
      location: 'Music Studio, Nashville',
      category: 'Music',
      attendees: 60,
      image: '/placeholder.svg'
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-purple-50">
      <Navbar />
      <div className="container mx-auto flex flex-col md:flex-row">
        <SocialSidebar />
        <main className="flex-1 p-4">
          <GlassMorphism className="p-6 mb-6">
            <div className="flex items-center gap-3 mb-6">
              <PartyPopper className="h-6 w-6 text-purple-500" />
              <div>
                <h1 className="text-2xl font-bold">Events & Activities</h1>
                <p className="text-gray-600 mt-1">Where stars are born and friendships spark! ✨</p>
              </div>
            </div>
            
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                <Input className="pl-10" placeholder="Search events..." />
              </div>
              <Button variant="outline" onClick={() => setFilterOpen(!filterOpen)}>
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </Button>
              <Button>Create Event</Button>
            </div>
            
            {filterOpen && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 p-4 bg-white/30 rounded-lg">
                <div>
                  <label className="block text-sm font-medium mb-1">Category</label>
                  <select className="w-full p-2 rounded-md border border-gray-300">
                    <option value="">All Categories</option>
                    <option value="music">Music</option>
                    <option value="art">Art & Design</option>
                    <option value="film">Film</option>
                    <option value="acting">Acting</option>
                    <option value="dance">Dance</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Location</label>
                  <select className="w-full p-2 rounded-md border border-gray-300">
                    <option value="">All Locations</option>
                    <option value="new-york">New York</option>
                    <option value="los-angeles">Los Angeles</option>
                    <option value="chicago">Chicago</option>
                    <option value="boston">Boston</option>
                    <option value="miami">Miami</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Date Range</label>
                  <select className="w-full p-2 rounded-md border border-gray-300">
                    <option value="">Any Date</option>
                    <option value="today">Today</option>
                    <option value="this-week">This Week</option>
                    <option value="this-month">This Month</option>
                    <option value="next-month">Next Month</option>
                  </select>
                </div>
              </div>
            )}
            
            <Tabs defaultValue="upcoming">
              <TabsList className="mb-4">
                <TabsTrigger value="upcoming">Upcoming Events</TabsTrigger>
                <TabsTrigger value="featured">Featured Events</TabsTrigger>
                <TabsTrigger value="my-events">My Events</TabsTrigger>
                <TabsTrigger value="past">Past Events</TabsTrigger>
              </TabsList>
              
              <TabsContent value="upcoming" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {upcomingEvents.map(event => (
                    <Dialog key={event.id}>
                      <DialogTrigger asChild>
                        <div className="cursor-pointer transform hover:scale-105 transition-transform duration-200">
                          <GlassMorphism className="overflow-hidden hover:shadow-lg border border-purple-100">
                            <div className="h-48 overflow-hidden relative">
                              <img 
                                src={event.image} 
                                alt={event.title} 
                                className="w-full h-full object-cover"
                              />
                              {event.perks && (
                                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-purple-500/90 to-purple-500/0 p-3">
                                  <div className="flex items-center text-white">
                                    <Ticket className="h-4 w-4 mr-2" />
                                    <p className="text-sm">{event.perks}</p>
                                  </div>
                                </div>
                              )}
                            </div>
                            <div className="p-4">
                              <span className="inline-block px-2 py-1 text-xs bg-purple-100 text-purple-600 rounded-full mb-2">
                                {event.category}
                              </span>
                              <h3 className="font-semibold text-lg mb-2 text-purple-900">{event.title}</h3>
                              <div className="space-y-2 text-gray-600">
                                <div className="flex items-center text-sm">
                                  <Calendar className="h-4 w-4 mr-1 text-purple-400" />
                                  <span>{event.date}</span>
                                </div>
                                <div className="flex items-center text-sm">
                                  <Clock className="h-4 w-4 mr-1 text-purple-400" />
                                  <span>{event.time}</span>
                                </div>
                                <div className="flex items-center text-sm">
                                  <MapPin className="h-4 w-4 mr-1 text-purple-400" />
                                  <span>{event.location}</span>
                                </div>
                                <div className="flex items-center text-sm">
                                  <Users className="h-4 w-4 mr-1 text-purple-400" />
                                  <span>{event.attendees} attending</span>
                                </div>
                              </div>
                              {event.tags && (
                                <div className="mt-3 flex flex-wrap gap-2">
                                  {event.tags.map(tag => (
                                    <span key={tag} className="text-xs px-2 py-1 bg-purple-50 text-purple-600 rounded-full">
                                      #{tag}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          </GlassMorphism>
                        </div>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle className="text-2xl text-purple-900">{event.title}</DialogTitle>
                        </DialogHeader>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          <div className="md:col-span-1">
                            <img 
                              src={event.image} 
                              alt={event.title} 
                              className="w-full rounded-lg"
                            />
                          </div>
                          <div className="md:col-span-2">
                            <div className="space-y-4">
                              <p className="text-gray-700">{event.description}</p>
                              
                              <div className="space-y-3">
                                <div className="flex items-center text-gray-600">
                                  <Calendar className="h-4 w-4 mr-2 text-purple-400" />
                                  <span>{event.date}</span>
                                </div>
                                <div className="flex items-center text-gray-600">
                                  <Clock className="h-4 w-4 mr-2 text-purple-400" />
                                  <span>{event.time}</span>
                                </div>
                                <div className="flex items-center text-gray-600">
                                  <MapPin className="h-4 w-4 mr-2 text-purple-400" />
                                  <span>{event.location}</span>
                                </div>
                                <div className="flex items-center text-gray-600">
                                  <Users className="h-4 w-4 mr-2 text-purple-400" />
                                  <span>{event.attendees} amazing talents attending</span>
                                </div>
                                {event.perks && (
                                  <div className="flex items-center text-purple-600">
                                    <Ticket className="h-4 w-4 mr-2" />
                                    <span>{event.perks}</span>
                                  </div>
                                )}
                              </div>
                              
                              <div className="flex gap-3 pt-4">
                                <Button className="bg-purple-600 hover:bg-purple-700">
                                  Join the Fun!
                                </Button>
                                <Button variant="outline" className="border-purple-200 text-purple-600">
                                  <MessageCircle className="h-4 w-4 mr-2" />
                                  Ask Questions
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  ))}
                </div>
              </TabsContent>
              
              <TabsContent value="featured">
                <p>Featured events selected by Y&T staff based on significance and relevance to the community.</p>
              </TabsContent>
              
              <TabsContent value="my-events">
                <p>Events you've registered for or shown interest in attending.</p>
              </TabsContent>
              
              <TabsContent value="past" className="space-y-4">
                <h2 className="text-lg font-medium mb-4">Past Events</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {pastEvents.map(event => (
                    <GlassMorphism key={event.id} className="overflow-hidden hover:shadow-md transition-shadow opacity-75">
                      <div className="h-32 overflow-hidden">
                        <img 
                          src={event.image} 
                          alt={event.title} 
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="p-3">
                        <h3 className="font-semibold mb-1">{event.title}</h3>
                        <div className="flex items-center text-xs text-gray-600 mb-1">
                          <Calendar className="h-3 w-3 mr-1" />
                          <span>{event.date}</span>
                        </div>
                        <div className="flex items-center text-xs text-gray-600">
                          <MapPin className="h-3 w-3 mr-1" />
                          <span>{event.location}</span>
                        </div>
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

export default Events;
