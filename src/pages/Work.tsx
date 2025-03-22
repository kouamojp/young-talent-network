
import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import SocialSidebar from '@/components/SocialSidebar';
import GlassMorphism from '@/components/GlassMorphism';
import { Briefcase, MapPin, Calendar, Banknote, Search, Building, Filter, Clock, Star } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

const Work: React.FC = () => {
  const [filterOpen, setFilterOpen] = useState(false);
  
  // Mock data
  const opportunities = [
    {
      id: 1,
      title: 'Junior Music Producer',
      company: 'Rhythm Studios',
      location: 'Los Angeles, CA',
      type: 'Full-time',
      salary: '$45,000 - $60,000',
      posted: '2 days ago',
      deadline: 'June 30, 2023',
      logo: '/placeholder.svg',
      description: 'Rhythm Studios is seeking a junior music producer to join our team. The ideal candidate will have experience with digital audio workstations, mixing, and production techniques.',
      requirements: [
        'Bachelor\'s degree in Music Production or related field',
        'Proficiency in Pro Tools, Logic Pro, or similar DAWs',
        'Strong ear for music and production quality',
        'Portfolio of previous work'
      ],
      categories: ['Music', 'Production']
    },
    {
      id: 2,
      title: 'Stage Actor for Upcoming Play',
      company: 'City Theatre Company',
      location: 'New York, NY',
      type: 'Contract',
      salary: 'Competitive',
      posted: '3 days ago',
      deadline: 'June 15, 2023',
      logo: '/placeholder.svg',
      description: 'City Theatre Company is casting actors for our upcoming production of "Modern Times." We are looking for talented performers with stage experience.',
      requirements: [
        'Previous stage acting experience',
        'Availability for evening rehearsals and performances',
        'Strong vocal projection and movement skills',
        'Ability to take direction and work collaboratively'
      ],
      categories: ['Acting', 'Theatre']
    },
    {
      id: 3,
      title: 'Digital Artist Internship',
      company: 'Creative Visuals Agency',
      location: 'Remote',
      type: 'Internship',
      salary: '$20/hour',
      posted: '1 week ago',
      deadline: 'Ongoing',
      logo: '/placeholder.svg',
      description: 'Creative Visuals Agency is offering an internship opportunity for aspiring digital artists. Work on real client projects and build your portfolio while learning from industry professionals.',
      requirements: [
        'Strong portfolio showing digital art skills',
        'Proficiency in Adobe Creative Suite',
        'Knowledge of digital illustration techniques',
        'Currently enrolled in or recently graduated from a related program'
      ],
      categories: ['Art & Design', 'Digital']
    },
    {
      id: 4,
      title: 'Content Creator for Social Media',
      company: 'Amplify Media',
      location: 'Chicago, IL',
      type: 'Part-time',
      salary: '$25/hour',
      posted: '5 days ago',
      deadline: 'June 25, 2023',
      logo: '/placeholder.svg',
      description: 'Amplify Media is looking for creative content creators to produce engaging content for various social media platforms. This role combines video production, writing, and social media expertise.',
      requirements: [
        'Experience creating content for social media platforms',
        'Proficiency in video editing software',
        'Strong writing and storytelling skills',
        'Understanding of social media trends and analytics'
      ],
      categories: ['Content Creation', 'Social Media']
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
              <Briefcase className="h-6 w-6" />
              <h1 className="text-2xl font-bold">Work & Opportunities</h1>
            </div>
            
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                <Input className="pl-10" placeholder="Search jobs, gigs, opportunities..." />
              </div>
              <Button variant="outline" onClick={() => setFilterOpen(!filterOpen)}>
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </Button>
              <Button>Post Opportunity</Button>
            </div>
            
            {filterOpen && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 p-4 bg-white/30 rounded-lg">
                <div>
                  <label className="block text-sm font-medium mb-1">Category</label>
                  <select className="w-full p-2 rounded-md border border-gray-300">
                    <option value="">All Categories</option>
                    <option value="music">Music</option>
                    <option value="acting">Acting</option>
                    <option value="art">Art & Design</option>
                    <option value="film">Film & Video</option>
                    <option value="writing">Writing</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Job Type</label>
                  <select className="w-full p-2 rounded-md border border-gray-300">
                    <option value="">All Types</option>
                    <option value="full-time">Full-time</option>
                    <option value="part-time">Part-time</option>
                    <option value="contract">Contract</option>
                    <option value="internship">Internship</option>
                    <option value="gig">Gig/Freelance</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Location</label>
                  <select className="w-full p-2 rounded-md border border-gray-300">
                    <option value="">All Locations</option>
                    <option value="remote">Remote</option>
                    <option value="new-york">New York</option>
                    <option value="los-angeles">Los Angeles</option>
                    <option value="chicago">Chicago</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
            )}
            
            <Tabs defaultValue="all">
              <TabsList className="mb-4">
                <TabsTrigger value="all">All Opportunities</TabsTrigger>
                <TabsTrigger value="jobs">Full-time Jobs</TabsTrigger>
                <TabsTrigger value="gigs">Gigs & Projects</TabsTrigger>
                <TabsTrigger value="internships">Internships</TabsTrigger>
                <TabsTrigger value="saved">Saved</TabsTrigger>
              </TabsList>
              
              <TabsContent value="all" className="space-y-4">
                {opportunities.map(job => (
                  <Dialog key={job.id}>
                    <DialogTrigger asChild>
                      <GlassMorphism className="p-4 hover:shadow-md transition-shadow cursor-pointer">
                        <div className="flex gap-4">
                          <div className="w-16 h-16 rounded-lg overflow-hidden bg-white flex-shrink-0 flex items-center justify-center p-1">
                            <img src={job.logo} alt={job.company} className="max-w-full max-h-full" />
                          </div>
                          <div className="flex-1">
                            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                              <div>
                                <h3 className="font-semibold text-lg">{job.title}</h3>
                                <p className="text-sm text-gray-600">{job.company}</p>
                              </div>
                              <div className="mt-2 md:mt-0">
                                <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                                  {job.type}
                                </Badge>
                              </div>
                            </div>
                            <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2">
                              <div className="flex items-center text-sm text-gray-600">
                                <MapPin className="h-4 w-4 mr-1" />
                                <span>{job.location}</span>
                              </div>
                              <div className="flex items-center text-sm text-gray-600">
                                <Banknote className="h-4 w-4 mr-1" />
                                <span>{job.salary}</span>
                              </div>
                              <div className="flex items-center text-sm text-gray-600">
                                <Clock className="h-4 w-4 mr-1" />
                                <span>Posted {job.posted}</span>
                              </div>
                            </div>
                            <div className="flex flex-wrap gap-1 mt-3">
                              {job.categories.map((category, index) => (
                                <span 
                                  key={index} 
                                  className="text-xs px-2 py-1 bg-primary/5 text-primary/80 rounded-full"
                                >
                                  {category}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </GlassMorphism>
                    </DialogTrigger>
                    <DialogContent className="max-w-3xl">
                      <DialogHeader>
                        <DialogTitle>{job.title}</DialogTitle>
                      </DialogHeader>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="md:col-span-2">
                          <div className="space-y-4">
                            <div>
                              <h3 className="font-semibold text-lg">Job Description</h3>
                              <p className="text-gray-700 mt-2">{job.description}</p>
                            </div>
                            
                            <div>
                              <h3 className="font-semibold text-lg">Requirements</h3>
                              <ul className="list-disc pl-5 mt-2 space-y-1">
                                {job.requirements.map((req, index) => (
                                  <li key={index} className="text-gray-700">{req}</li>
                                ))}
                              </ul>
                            </div>
                            
                            <div className="flex gap-3 pt-4">
                              <Button>Apply Now</Button>
                              <Button variant="outline">Save Job</Button>
                            </div>
                          </div>
                        </div>
                        
                        <div>
                          <GlassMorphism className="p-4">
                            <div className="flex items-center gap-3 mb-4">
                              <div className="w-12 h-12 rounded-lg overflow-hidden bg-white flex items-center justify-center p-1">
                                <img src={job.logo} alt={job.company} className="max-w-full max-h-full" />
                              </div>
                              <div>
                                <h3 className="font-semibold">{job.company}</h3>
                                <div className="flex items-center text-sm">
                                  <Star className="h-3 w-3 text-yellow-500 mr-1" />
                                  <Star className="h-3 w-3 text-yellow-500 mr-1" />
                                  <Star className="h-3 w-3 text-yellow-500 mr-1" />
                                  <Star className="h-3 w-3 text-yellow-500 mr-1" />
                                  <Star className="h-3 w-3 text-gray-300 mr-1" />
                                  <span className="text-gray-600">(4.0)</span>
                                </div>
                              </div>
                            </div>
                            
                            <div className="space-y-3 text-sm">
                              <div className="flex items-center text-gray-600">
                                <Building className="h-4 w-4 mr-2 text-gray-400" />
                                <span>{job.company}</span>
                              </div>
                              <div className="flex items-center text-gray-600">
                                <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                                <span>{job.location}</span>
                              </div>
                              <div className="flex items-center text-gray-600">
                                <Banknote className="h-4 w-4 mr-2 text-gray-400" />
                                <span>{job.salary}</span>
                              </div>
                              <div className="flex items-center text-gray-600">
                                <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                                <span>Apply by: {job.deadline}</span>
                              </div>
                              <div className="flex items-center text-gray-600">
                                <Clock className="h-4 w-4 mr-2 text-gray-400" />
                                <span>Posted: {job.posted}</span>
                              </div>
                            </div>
                            
                            <Button className="w-full mt-4">
                              View Company
                            </Button>
                          </GlassMorphism>
                          
                          <div className="mt-4">
                            <h3 className="font-semibold mb-2">Similar Jobs</h3>
                            <div className="space-y-2">
                              {opportunities
                                .filter(o => o.id !== job.id && o.categories.some(c => job.categories.includes(c)))
                                .slice(0, 2)
                                .map(similarJob => (
                                  <div key={similarJob.id} className="p-3 bg-white/20 rounded-lg hover:bg-white/30 cursor-pointer">
                                    <h4 className="font-medium">{similarJob.title}</h4>
                                    <p className="text-sm text-gray-600">{similarJob.company}</p>
                                    <div className="flex items-center text-xs text-gray-600 mt-1">
                                      <MapPin className="h-3 w-3 mr-1" />
                                      <span>{similarJob.location}</span>
                                    </div>
                                  </div>
                                ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                ))}
              </TabsContent>
              
              <TabsContent value="jobs">
                <div className="space-y-4">
                  {opportunities
                    .filter(job => job.type === 'Full-time')
                    .map(job => (
                      <GlassMorphism key={job.id} className="p-4 hover:shadow-md transition-shadow cursor-pointer">
                        <div className="flex gap-4">
                          <div className="w-16 h-16 rounded-lg overflow-hidden bg-white flex-shrink-0 flex items-center justify-center p-1">
                            <img src={job.logo} alt={job.company} className="max-w-full max-h-full" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold">{job.title}</h3>
                            <p className="text-sm text-gray-600">{job.company}</p>
                            <div className="flex flex-wrap gap-4 mt-2">
                              <div className="flex items-center text-sm text-gray-600">
                                <MapPin className="h-4 w-4 mr-1" />
                                <span>{job.location}</span>
                              </div>
                              <div className="flex items-center text-sm text-gray-600">
                                <Banknote className="h-4 w-4 mr-1" />
                                <span>{job.salary}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </GlassMorphism>
                    ))}
                </div>
              </TabsContent>
              
              <TabsContent value="gigs">
                <div className="space-y-4">
                  {opportunities
                    .filter(job => job.type === 'Contract')
                    .map(job => (
                      <GlassMorphism key={job.id} className="p-4 hover:shadow-md transition-shadow cursor-pointer">
                        <div className="flex gap-4">
                          <div className="w-16 h-16 rounded-lg overflow-hidden bg-white flex-shrink-0 flex items-center justify-center p-1">
                            <img src={job.logo} alt={job.company} className="max-w-full max-h-full" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold">{job.title}</h3>
                            <p className="text-sm text-gray-600">{job.company}</p>
                            <div className="flex flex-wrap gap-4 mt-2">
                              <div className="flex items-center text-sm text-gray-600">
                                <MapPin className="h-4 w-4 mr-1" />
                                <span>{job.location}</span>
                              </div>
                              <div className="flex items-center text-sm text-gray-600">
                                <Calendar className="h-4 w-4 mr-1" />
                                <span>Apply by: {job.deadline}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </GlassMorphism>
                    ))}
                </div>
              </TabsContent>
              
              <TabsContent value="internships">
                <div className="space-y-4">
                  {opportunities
                    .filter(job => job.type === 'Internship')
                    .map(job => (
                      <GlassMorphism key={job.id} className="p-4 hover:shadow-md transition-shadow cursor-pointer">
                        <div className="flex gap-4">
                          <div className="w-16 h-16 rounded-lg overflow-hidden bg-white flex-shrink-0 flex items-center justify-center p-1">
                            <img src={job.logo} alt={job.company} className="max-w-full max-h-full" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold">{job.title}</h3>
                            <p className="text-sm text-gray-600">{job.company}</p>
                            <div className="flex flex-wrap gap-4 mt-2">
                              <div className="flex items-center text-sm text-gray-600">
                                <MapPin className="h-4 w-4 mr-1" />
                                <span>{job.location}</span>
                              </div>
                              <div className="flex items-center text-sm text-gray-600">
                                <Banknote className="h-4 w-4 mr-1" />
                                <span>{job.salary}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </GlassMorphism>
                    ))}
                </div>
              </TabsContent>
              
              <TabsContent value="saved">
                <div className="text-center py-6">
                  <Briefcase className="h-12 w-12 mx-auto text-gray-400 mb-3" />
                  <h3 className="text-xl font-medium mb-2">No Saved Jobs</h3>
                  <p className="text-gray-600 mb-4">You haven't saved any jobs or opportunities yet</p>
                  <Button onClick={() => document.querySelector('[data-value="all"]')?.click()}>
                    Browse Opportunities
                  </Button>
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

export default Work;
