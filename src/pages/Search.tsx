import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import GlassMorphism from '@/components/GlassMorphism';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Search as SearchIcon, Users, Building2, Briefcase, Newspaper, Calendar, Video } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger } from '@/components/ui/navigation-menu';

const Search: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  
  // Mock search results
  const mockResults = {
    people: [
      { id: 1, name: 'Sarah Johnson', avatar: '/placeholder.svg', title: 'Vocalist & Songwriter', location: 'New York, USA' },
      { id: 2, name: 'Michael Chen', avatar: '/placeholder.svg', title: 'Visual Artist', location: 'San Francisco, USA' },
      { id: 3, name: 'Emma Williams', avatar: '/placeholder.svg', title: 'Dancer', location: 'London, UK' },
    ],
    organizations: [
      { id: 1, name: 'Creative Arts Studio', logo: '/placeholder.svg', type: 'Art Gallery', location: 'Paris, France' },
      { id: 2, name: 'Harmony Music Academy', logo: '/placeholder.svg', type: 'Music School', location: 'Berlin, Germany' },
    ],
    jobs: [
      { id: 1, title: 'Lead Guitarist Needed', company: 'The Melodics', location: 'Remote', type: 'Contract' },
      { id: 2, title: 'Dance Instructor', company: 'Elite Dance Academy', location: 'Chicago, USA', type: 'Full-time' },
    ],
    events: [
      { id: 1, title: 'International Art Festival', date: 'June 15-20, 2023', location: 'Tokyo, Japan' },
      { id: 2, title: 'Music Industry Conference', date: 'August 5-7, 2023', location: 'Nashville, USA' },
    ],
    news: [
      { id: 1, title: 'Rising Stars in Contemporary Dance', source: 'Arts Weekly', date: '2 days ago' },
      { id: 2, title: 'New Funding Program for Young Musicians Announced', source: 'Music News', date: '1 week ago' },
    ],
    videos: [
      { id: 1, title: 'Behind the Scenes: Symphony Orchestra', thumbnail: '/placeholder.svg', duration: '15:24', views: '12K' },
      { id: 2, title: 'Masterclass: Portrait Photography', thumbnail: '/placeholder.svg', duration: '42:10', views: '8.5K' },
    ]
  };
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      setHasSearched(true);
    }, 800);
  };
  
  const getResultCount = () => {
    let count = 0;
    Object.values(mockResults).forEach(category => {
      count += category.length;
    });
    return count;
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-purple-50">
      <Navbar />
      <div className="container mx-auto flex flex-col md:flex-row">
        <main className="flex-1 p-4">
          <GlassMorphism className="p-6 mb-6">
            <div className="flex items-center gap-3 mb-6">
              <SearchIcon className="h-6 w-6 text-primary" />
              <h1 className="text-2xl font-bold">Search Y&T</h1>
            </div>
            
            <form onSubmit={handleSearch} className="mb-6">
              <div className="flex gap-2">
                <Input
                  type="text"
                  placeholder="Search for talents, organizations, events..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1"
                />
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? 'Searching...' : 'Search'}
                </Button>
              </div>
            </form>
            
            {hasSearched && (
              <>
                <div className="mb-4">
                  <p className="text-sm text-gray-500">
                    Found {getResultCount()} results for "{searchQuery}"
                  </p>
                </div>
                
                <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="grid grid-cols-3 md:grid-cols-7 gap-2 mb-6">
                    <TabsTrigger value="all">All</TabsTrigger>
                    <TabsTrigger value="people" className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      <span>People</span>
                    </TabsTrigger>
                    <TabsTrigger value="organizations" className="flex items-center gap-1">
                      <Building2 className="h-4 w-4" />
                      <span>Orgs</span>
                    </TabsTrigger>
                    <TabsTrigger value="jobs" className="flex items-center gap-1">
                      <Briefcase className="h-4 w-4" />
                      <span>Jobs</span>
                    </TabsTrigger>
                    <TabsTrigger value="events" className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>Events</span>
                    </TabsTrigger>
                    <TabsTrigger value="news" className="flex items-center gap-1">
                      <Newspaper className="h-4 w-4" />
                      <span>News</span>
                    </TabsTrigger>
                    <TabsTrigger value="videos" className="flex items-center gap-1">
                      <Video className="h-4 w-4" />
                      <span>Videos</span>
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="all" className="space-y-6">
                    {/* People */}
                    {mockResults.people.length > 0 && (
                      <div>
                        <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
                          <Users className="h-5 w-5" />
                          People
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {mockResults.people.map(person => (
                            <Card key={person.id}>
                              <CardHeader className="flex flex-row items-center gap-3">
                                <Avatar className="h-12 w-12">
                                  <AvatarImage src={person.avatar} alt={person.name} />
                                  <AvatarFallback>{person.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div>
                                  <CardTitle className="text-base">{person.name}</CardTitle>
                                  <CardDescription>{person.title}</CardDescription>
                                </div>
                              </CardHeader>
                              <CardFooter>
                                <Button variant="outline" size="sm" className="w-full">View Profile</Button>
                              </CardFooter>
                            </Card>
                          ))}
                        </div>
                        <div className="mt-2 text-right">
                          <Button variant="link" size="sm" onClick={() => setActiveTab('people')}>
                            See all people
                          </Button>
                        </div>
                      </div>
                    )}
                    
                    {/* Organizations */}
                    {mockResults.organizations.length > 0 && (
                      <div>
                        <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
                          <Building2 className="h-5 w-5" />
                          Organizations
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {mockResults.organizations.map(org => (
                            <Card key={org.id}>
                              <CardHeader className="flex flex-row items-center gap-3">
                                <Avatar className="h-12 w-12">
                                  <AvatarImage src={org.logo} alt={org.name} />
                                  <AvatarFallback>{org.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div>
                                  <CardTitle className="text-base">{org.name}</CardTitle>
                                  <CardDescription>{org.type} • {org.location}</CardDescription>
                                </div>
                              </CardHeader>
                              <CardFooter>
                                <Button variant="outline" size="sm" className="w-full">View Organization</Button>
                              </CardFooter>
                            </Card>
                          ))}
                        </div>
                        <div className="mt-2 text-right">
                          <Button variant="link" size="sm" onClick={() => setActiveTab('organizations')}>
                            See all organizations
                          </Button>
                        </div>
                      </div>
                    )}
                    
                    {/* Jobs */}
                    {mockResults.jobs.length > 0 && (
                      <div>
                        <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
                          <Briefcase className="h-5 w-5" />
                          Jobs & Opportunities
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {mockResults.jobs.map(job => (
                            <Card key={job.id}>
                              <CardHeader>
                                <CardTitle className="text-base">{job.title}</CardTitle>
                                <CardDescription>{job.company}</CardDescription>
                              </CardHeader>
                              <CardContent className="pt-0">
                                <div className="flex gap-2">
                                  <Badge variant="outline">{job.location}</Badge>
                                  <Badge variant="outline">{job.type}</Badge>
                                </div>
                              </CardContent>
                              <CardFooter>
                                <Button variant="outline" size="sm" className="w-full">View Job</Button>
                              </CardFooter>
                            </Card>
                          ))}
                        </div>
                        <div className="mt-2 text-right">
                          <Button variant="link" size="sm" onClick={() => setActiveTab('jobs')}>
                            See all jobs
                          </Button>
                        </div>
                      </div>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="people">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {mockResults.people.map(person => (
                        <Card key={person.id}>
                          <CardHeader className="flex flex-row items-center gap-3">
                            <Avatar className="h-12 w-12">
                              <AvatarImage src={person.avatar} alt={person.name} />
                              <AvatarFallback>{person.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div>
                              <CardTitle className="text-base">{person.name}</CardTitle>
                              <CardDescription>{person.title}</CardDescription>
                            </div>
                          </CardHeader>
                          <CardContent className="pt-0">
                            <p className="text-sm text-gray-500">{person.location}</p>
                          </CardContent>
                          <CardFooter>
                            <Button variant="outline" size="sm" className="w-full">View Profile</Button>
                          </CardFooter>
                        </Card>
                      ))}
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="organizations">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {mockResults.organizations.map(org => (
                        <Card key={org.id}>
                          <CardHeader className="flex flex-row items-center gap-3">
                            <Avatar className="h-12 w-12">
                              <AvatarImage src={org.logo} alt={org.name} />
                              <AvatarFallback>{org.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div>
                              <CardTitle className="text-base">{org.name}</CardTitle>
                              <CardDescription>{org.type}</CardDescription>
                            </div>
                          </CardHeader>
                          <CardContent className="pt-0">
                            <p className="text-sm text-gray-500">{org.location}</p>
                          </CardContent>
                          <CardFooter>
                            <Button variant="outline" size="sm" className="w-full">View Organization</Button>
                          </CardFooter>
                        </Card>
                      ))}
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="jobs">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {mockResults.jobs.map(job => (
                        <Card key={job.id}>
                          <CardHeader>
                            <CardTitle className="text-base">{job.title}</CardTitle>
                            <CardDescription>{job.company}</CardDescription>
                          </CardHeader>
                          <CardContent className="pt-0">
                            <div className="flex gap-2">
                              <Badge variant="outline">{job.location}</Badge>
                              <Badge variant="outline">{job.type}</Badge>
                            </div>
                          </CardContent>
                          <CardFooter>
                            <Button variant="outline" size="sm" className="w-full">View Job</Button>
                          </CardFooter>
                        </Card>
                      ))}
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="events">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {mockResults.events.map(event => (
                        <Card key={event.id}>
                          <CardHeader>
                            <CardTitle className="text-base">{event.title}</CardTitle>
                            <CardDescription>{event.date}</CardDescription>
                          </CardHeader>
                          <CardContent className="pt-0">
                            <p className="text-sm text-gray-500">{event.location}</p>
                          </CardContent>
                          <CardFooter>
                            <Button variant="outline" size="sm" className="w-full">View Event</Button>
                          </CardFooter>
                        </Card>
                      ))}
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="news">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {mockResults.news.map(item => (
                        <Card key={item.id}>
                          <CardHeader>
                            <CardTitle className="text-base">{item.title}</CardTitle>
                            <CardDescription>{item.source} • {item.date}</CardDescription>
                          </CardHeader>
                          <CardFooter>
                            <Button variant="outline" size="sm" className="w-full">Read Article</Button>
                          </CardFooter>
                        </Card>
                      ))}
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="videos">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {mockResults.videos.map(video => (
                        <Card key={video.id}>
                          <div className="relative">
                            <img 
                              src={video.thumbnail} 
                              alt={video.title}
                              className="w-full h-40 object-cover"
                            />
                            <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                              {video.duration}
                            </div>
                          </div>
                          <CardHeader>
                            <CardTitle className="text-base">{video.title}</CardTitle>
                            <CardDescription>{video.views} views</CardDescription>
                          </CardHeader>
                          <CardFooter>
                            <Button variant="outline" size="sm" className="w-full">Watch Video</Button>
                          </CardFooter>
                        </Card>
                      ))}
                    </div>
                  </TabsContent>
                </Tabs>
              </>
            )}
            
            {!hasSearched && (
              <div className="text-center py-12">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                  <SearchIcon className="h-8 w-8 text-primary" />
                </div>
                <h2 className="text-xl font-semibold mb-2">Search for Talents & Opportunities</h2>
                <p className="text-gray-500 max-w-md mx-auto">
                  Discover talented individuals, organizations, job opportunities, events, and more.
                </p>
              </div>
            )}
          </GlassMorphism>
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default Search;
