import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import SocialSidebar from '@/components/SocialSidebar';
import GlassMorphism from '@/components/GlassMorphism';
import WorkHubEntry from '@/components/work/WorkHubEntry';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Briefcase, 
  Search, 
  MapPin, 
  Clock, 
  Bookmark, 
  ChevronRight, 
  FileText,
  Filter,
  Building,
  Calendar,
  Play,
  Heart,
  ArrowLeft
} from 'lucide-react';

const Work: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const path = searchParams.get('path') || '';
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTab, setSelectedTab] = useState('opportunities');
  
  useEffect(() => {
    if (path === 'talent') {
      setSelectedTab('opportunities');
    } else if (path === 'organization') {
      setSelectedTab('talents');
    }
  }, [path]);

  const handleBack = () => {
    setSearchParams({});
  };
  
  if (!path) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-purple-50">
        <Navbar />
        <div className="container mx-auto flex flex-col md:flex-row">
          <SocialSidebar />
          <main className="flex-1 p-4">
            <WorkHubEntry />
          </main>
        </div>
        <Footer />
      </div>
    );
  }

  const opportunities = [
    {
      id: 1,
      title: "Junior Dancer for Music Video",
      company: "Elite Productions",
      location: "Los Angeles, CA",
      type: "Contract",
      postedDate: "2 days ago",
      description: "Seeking talented dancers aged 16-25 for an upcoming music video shoot. Previous performance experience required.",
      tags: ["Dance", "Performance", "Music Video"],
      isFeatured: true
    },
    {
      id: 2,
      title: "Voice Actor for Animation Series",
      company: "Creative Media Studios",
      location: "Remote",
      type: "Freelance",
      postedDate: "1 week ago",
      description: "Looking for voice actors with diverse vocal ranges for an animated youth series. Recording equipment required.",
      tags: ["Voice Acting", "Animation", "Remote"]
    },
    {
      id: 3,
      title: "Junior Graphic Designer",
      company: "ArtSpace Agency",
      location: "New York, NY",
      type: "Internship",
      postedDate: "3 days ago",
      description: "Design internship opportunity for creative individuals with portfolio showcasing digital art skills.",
      tags: ["Design", "Digital Art", "Internship"]
    },
    {
      id: 4,
      title: "Young Musician for Restaurant Gigs",
      company: "The Grand Restaurant",
      location: "Chicago, IL",
      type: "Part-time",
      postedDate: "5 days ago",
      description: "Weekend performances for talented musicians. Piano, violin, or acoustic guitar preferred.",
      tags: ["Music", "Performance", "Part-time"]
    }
  ];
  
  const scholarships = [
    {
      id: 1,
      title: "Young Artist Development Program",
      organization: "National Arts Foundation",
      amount: "$5,000",
      deadline: "Jun 30, 2023",
      requirements: "Visual artists aged 15-21 with portfolio",
      description: "Annual scholarship supporting emerging visual artists with mentorship and exhibition opportunities."
    },
    {
      id: 2,
      title: "Music Education Scholarship",
      organization: "Harmony Foundation",
      amount: "$3,500",
      deadline: "Jul 15, 2023",
      requirements: "Music students with audition video",
      description: "Supporting young musicians pursuing formal music education or specialized training programs."
    },
    {
      id: 3,
      title: "Digital Media Grant for Teens",
      organization: "Future Creators Initiative",
      amount: "$2,000",
      deadline: "Aug 10, 2023",
      requirements: "Creators aged 13-19 with project proposal",
      description: "Funding for innovative digital media projects including animation, game design, and interactive storytelling."
    }
  ];
  
  const mentorships = [
    {
      id: 1,
      title: "Fashion Industry Mentorship Program",
      mentor: "Lisa Chen, Fashion Designer",
      duration: "3 months",
      commitment: "4 hours/week",
      applicationDeadline: "Jun 20, 2023",
      description: "Personalized guidance from an established fashion designer to help develop your portfolio and industry connections."
    },
    {
      id: 2,
      title: "Music Production Mentorship",
      mentor: "DJ Maximus, Grammy-nominated Producer",
      duration: "6 months",
      commitment: "2 hours/week",
      applicationDeadline: "Jul 5, 2023",
      description: "Learn music production techniques, studio workflow, and industry insights from an experienced producer."
    },
    {
      id: 3,
      title: "Young Writers Program",
      mentor: "Various Published Authors",
      duration: "4 months",
      commitment: "3 hours/week",
      applicationDeadline: "Jul 25, 2023",
      description: "Develop your writing skills through feedback sessions and personalized guidance from published authors."
    }
  ];

  const talents = [
    {
      id: 1,
      name: "Emily Chen",
      avatar: "/placeholder.svg",
      skills: ["Piano", "Composition", "Vocals"],
      experience: "5 years",
      location: "New York, NY",
      availability: "Part-time",
      portfolio: "View Portfolio",
      description: "Classically trained pianist with a passion for contemporary composition and vocal arrangements."
    },
    {
      id: 2,
      name: "Jordan Smith",
      avatar: "/placeholder.svg",
      skills: ["Guitar", "Songwriting", "Production"],
      experience: "3 years",
      location: "Los Angeles, CA",
      availability: "Freelance",
      portfolio: "View Portfolio",
      description: "Self-taught guitarist and songwriter with a unique style blending folk and electronic elements."
    },
    {
      id: 3,
      name: "Maya Johnson",
      avatar: "/placeholder.svg",
      skills: ["Dance", "Choreography", "Teaching"],
      experience: "7 years",
      location: "Chicago, IL",
      availability: "Full-time",
      portfolio: "View Portfolio",
      description: "Contemporary dancer with experience in ballet and hip-hop, passionate about teaching youth."
    }
  ];

  const handleApplyClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    console.log("Apply clicked");
  };
  
  const handleCardClick = (id: number) => {
    console.log("Card clicked, view details for ID:", id);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-purple-50">
      <Navbar />
      <div className="container mx-auto flex flex-col md:flex-row">
        <SocialSidebar />
        <main className="flex-1 p-4">
          <GlassMorphism className="p-6 mb-6">
            <div className="flex items-center gap-2 mb-6">
              <Button variant="ghost" size="icon" onClick={handleBack}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <Briefcase className="h-6 w-6" />
              <h1 className="text-2xl font-bold">
                {path === 'talent' ? "Find Your Dream Stage" : "Find Your Dream Team"}
              </h1>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                <Input 
                  className="pl-10" 
                  placeholder={path === 'talent' ? "Search for jobs, scholarships..." : "Search for talents, skills..."} 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
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
            
            {path === 'talent' ? (
              <Tabs value={selectedTab} onValueChange={setSelectedTab}>
                <TabsList className="mb-6">
                  <TabsTrigger value="opportunities" className="flex items-center gap-2">
                    <Briefcase className="h-4 w-4" />
                    Jobs & Gigs
                  </TabsTrigger>
                  <TabsTrigger value="scholarships" className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Scholarships
                  </TabsTrigger>
                  <TabsTrigger value="mentorships" className="flex items-center gap-2">
                    <Building className="h-4 w-4" />
                    Mentorships
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="opportunities" className="space-y-4">
                  {opportunities.map((job) => (
                    <div 
                      key={job.id}
                      className={`bg-white/40 rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer ${job.isFeatured ? 'border-2 border-primary/30' : ''}`}
                      onClick={() => handleCardClick(job.id)}
                    >
                      <div className="p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="text-lg font-bold">{job.title}</h3>
                              {job.isFeatured && (
                                <Badge className="bg-primary/20 text-primary border-primary hover:bg-primary/30">
                                  Featured
                                </Badge>
                              )}
                            </div>
                            <p className="text-gray-600">{job.company}</p>
                          </div>
                          <Button variant="ghost" size="icon">
                            <Bookmark className="h-5 w-5" />
                          </Button>
                        </div>
                        
                        <div className="flex flex-wrap gap-2 mt-3">
                          <div className="flex items-center text-sm text-gray-500">
                            <MapPin className="h-4 w-4 mr-1" />
                            {job.location}
                          </div>
                          <div className="flex items-center text-sm text-gray-500">
                            <Clock className="h-4 w-4 mr-1" />
                            {job.type}
                          </div>
                          <div className="flex items-center text-sm text-gray-500">
                            <Calendar className="h-4 w-4 mr-1" />
                            {job.postedDate}
                          </div>
                        </div>
                        
                        <p className="mt-3 text-gray-700">{job.description}</p>
                        
                        <div className="mt-4 flex flex-wrap gap-2">
                          {job.tags.map((tag, index) => (
                            <Badge key={index} variant="outline" className="bg-gray-100">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                        
                        <div className="mt-4 flex justify-between items-center">
                          <Button 
                            onClick={(e) => handleApplyClick(e)}
                          >
                            Apply Now
                          </Button>
                          <Button variant="ghost" className="text-primary">
                            View Details
                            <ChevronRight className="h-4 w-4 ml-1" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </TabsContent>
                
                <TabsContent value="scholarships" className="space-y-4">
                  {scholarships.map((scholarship) => (
                    <div 
                      key={scholarship.id}
                      className="bg-white/40 rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => handleCardClick(scholarship.id)}
                    >
                      <div className="p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="text-lg font-bold">{scholarship.title}</h3>
                            <p className="text-gray-600">{scholarship.organization}</p>
                          </div>
                          <div className="text-lg font-bold text-primary">{scholarship.amount}</div>
                        </div>
                        
                        <p className="mt-3 text-gray-700">{scholarship.description}</p>
                        
                        <div className="mt-4 bg-blue-50 p-3 rounded-lg">
                          <div className="font-medium mb-1">Requirements</div>
                          <p className="text-sm text-gray-600">{scholarship.requirements}</p>
                        </div>
                        
                        <div className="mt-4 flex justify-between items-center">
                          <div className="flex items-center text-sm text-gray-500">
                            <Clock className="h-4 w-4 mr-1" />
                            Deadline: {scholarship.deadline}
                          </div>
                          <Button>
                            Apply for Scholarship
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </TabsContent>
                
                <TabsContent value="mentorships" className="space-y-4">
                  {mentorships.map((mentorship) => (
                    <div 
                      key={mentorship.id}
                      className="bg-white/40 rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => handleCardClick(mentorship.id)}
                    >
                      <div className="p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="text-lg font-bold">{mentorship.title}</h3>
                            <p className="text-primary font-medium">{mentorship.mentor}</p>
                          </div>
                          <Button variant="ghost" size="icon">
                            <Bookmark className="h-5 w-5" />
                          </Button>
                        </div>
                        
                        <p className="mt-3 text-gray-700">{mentorship.description}</p>
                        
                        <div className="mt-4 flex flex-wrap gap-4">
                          <div className="bg-gray-100 px-3 py-2 rounded-lg text-sm">
                            <span className="font-medium">Duration:</span> {mentorship.duration}
                          </div>
                          <div className="bg-gray-100 px-3 py-2 rounded-lg text-sm">
                            <span className="font-medium">Time Commitment:</span> {mentorship.commitment}
                          </div>
                        </div>
                        
                        <div className="mt-4 flex justify-between items-center">
                          <div className="flex items-center text-sm text-gray-500">
                            <Calendar className="h-4 w-4 mr-1" />
                            Apply by: {mentorship.applicationDeadline}
                          </div>
                          <Button>
                            Apply for Mentorship
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </TabsContent>
              </Tabs>
            ) : (
              <Tabs value={selectedTab} onValueChange={setSelectedTab}>
                <TabsList className="mb-6">
                  <TabsTrigger value="talents" className="flex items-center gap-2">
                    <Heart className="h-4 w-4" />
                    Find Talents
                  </TabsTrigger>
                  <TabsTrigger value="posted" className="flex items-center gap-2">
                    <Briefcase className="h-4 w-4" />
                    My Postings
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="talents" className="space-y-4">
                  {talents.map((talent) => (
                    <div 
                      key={talent.id}
                      className="bg-white/40 rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => handleCardClick(talent.id)}
                    >
                      <div className="p-4">
                        <div className="flex justify-between items-start">
                          <div className="flex gap-3">
                            <div className="w-16 h-16 bg-gray-200 rounded-full overflow-hidden">
                              <img 
                                src={talent.avatar} 
                                alt={talent.name} 
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div>
                              <h3 className="text-lg font-bold">{talent.name}</h3>
                              <div className="flex items-center text-sm text-gray-500 mt-1">
                                <MapPin className="h-4 w-4 mr-1" />
                                {talent.location}
                              </div>
                            </div>
                          </div>
                          <Button variant="ghost" size="icon">
                            <Bookmark className="h-5 w-5" />
                          </Button>
                        </div>
                        
                        <p className="mt-3 text-gray-700">{talent.description}</p>
                        
                        <div className="mt-4 flex flex-wrap gap-2">
                          {talent.skills.map((skill, index) => (
                            <Badge key={index} variant="outline" className="bg-purple-50">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                        
                        <div className="mt-4 flex flex-wrap gap-2 mt-3">
                          <div className="flex items-center text-sm text-gray-500">
                            <Clock className="h-4 w-4 mr-1" />
                            Experience: {talent.experience}
                          </div>
                          <div className="flex items-center text-sm text-gray-500">
                            <Calendar className="h-4 w-4 mr-1" />
                            {talent.availability}
                          </div>
                        </div>
                        
                        <div className="mt-4 flex justify-between items-center">
                          <Button 
                            onClick={(e) => handleApplyClick(e)}
                          >
                            Contact Talent
                          </Button>
                          <Button variant="ghost" className="text-primary">
                            {talent.portfolio}
                            <ChevronRight className="h-4 w-4 ml-1" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </TabsContent>
                
                <TabsContent value="posted" className="space-y-4">
                  <div className="text-center py-8">
                    <Building className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                    <h3 className="text-xl font-bold mb-2">No Opportunities Posted Yet</h3>
                    <p className="text-gray-600 mb-4">
                      Share your first opportunity to connect with talented individuals!
                    </p>
                    <Button>
                      Post New Opportunity
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>
            )}
          </GlassMorphism>
          
          <GlassMorphism className="p-6">
            <h2 className="text-xl font-bold mb-4">Success Stories</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[1, 2, 3].map((item) => (
                <div key={item} className="bg-white/40 rounded-lg overflow-hidden">
                  <div className="aspect-video bg-gray-200 relative">
                    <img 
                      src="/placeholder.svg" 
                      alt="Success story" 
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                      <Button variant="outline" className="rounded-full bg-white/20 border-white text-white">
                        <Play className="h-6 w-6" />
                      </Button>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold">From Y&T to Broadway</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      How I landed my dream role after connecting with a casting director on the platform.
                    </p>
                    <Button variant="link" className="px-0 mt-2">
                      Read Full Story
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </GlassMorphism>
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default Work;
