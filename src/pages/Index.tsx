
import React from 'react';
import { Link } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Search, MoreVertical } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';

const Index: React.FC = () => {
  const topProfiles = [
    { id: 1, name: 'Jessica William', title: 'Graphic Designer', avatar: '/placeholder.svg' },
    { id: 2, name: 'John Doe', title: 'PHP Developer', avatar: '/placeholder.svg' },
    { id: 3, name: 'Emma Thompson', title: 'UI/UX Designer', avatar: '/placeholder.svg' },
  ];

  const topJobs = [
    { id: 1, title: 'Senior Product Designer', rate: '$25/hr', description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.' },
    { id: 2, title: 'Senior UI / UX Designer', rate: '$25/hr', description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.' },
    { id: 3, title: 'Junior SEO Designer', rate: '$25/hr', description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.' },
    { id: 4, title: 'Senior PHP Designer', rate: '$25/hr', description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.' },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Custom Navbar */}
      <header className="bg-red-500 text-white shadow-md">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center">
            <Link to="/" className="text-2xl font-bold">
              W
            </Link>
            <div className="ml-4 relative">
              <Input 
                placeholder="Search..." 
                className="w-64 h-10 pl-10 pr-4 rounded-md text-gray-800"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            </div>
          </div>
          
          <nav className="flex items-center space-x-8">
            <Link to="/" className="flex flex-col items-center">
              <span className="text-sm">Home</span>
            </Link>
            <Link to="/organizations" className="flex flex-col items-center">
              <span className="text-sm">Companies</span>
            </Link>
            <Link to="/work" className="flex flex-col items-center">
              <span className="text-sm">Projects</span>
            </Link>
            <Link to="/participants" className="flex flex-col items-center">
              <span className="text-sm">Profiles</span>
            </Link>
            <Link to="/jobs" className="flex flex-col items-center">
              <span className="text-sm">Jobs</span>
            </Link>
            <Link to="/messages" className="flex flex-col items-center">
              <span className="text-sm">Messages</span>
            </Link>
          </nav>
          
          <div className="flex items-center">
            <div className="relative">
              <Avatar className="h-10 w-10 cursor-pointer">
                <AvatarImage src="/placeholder.svg" alt="John" />
                <AvatarFallback>JD</AvatarFallback>
              </Avatar>
              <span className="ml-2">John</span>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 grid grid-cols-12 gap-6">
        {/* Left Sidebar - Profile Card */}
        <div className="col-span-12 md:col-span-3">
          <Card className="overflow-hidden mb-6">
            <div className="h-24 bg-red-500"></div>
            <div className="flex flex-col items-center -mt-12 px-4 pb-6">
              <Avatar className="h-24 w-24 border-4 border-white">
                <AvatarImage src="/placeholder.svg" alt="John Doe" />
                <AvatarFallback>JD</AvatarFallback>
              </Avatar>
              <h2 className="text-xl font-semibold mt-2">John Doe</h2>
              <p className="text-gray-500 text-sm">Graphic Designer at Self Employed</p>
              
              <div className="w-full border-t my-4"></div>
              
              <div className="grid grid-cols-2 w-full text-center border-b pb-4">
                <div className="p-2">
                  <h3 className="text-gray-500">Following</h3>
                  <p className="font-semibold">34</p>
                </div>
                <div className="p-2 border-l">
                  <h3 className="text-gray-500">Followers</h3>
                  <p className="font-semibold">155</p>
                </div>
              </div>
              
              <Button variant="outline" className="w-full mt-4">
                View Profile
              </Button>
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Suggestions</h2>
              <Button variant="ghost" size="icon">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="space-y-4">
              {topProfiles.map(profile => (
                <div key={profile.id} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Avatar className="h-10 w-10 mr-3">
                      <AvatarImage src={profile.avatar} alt={profile.name} />
                      <AvatarFallback>{profile.name[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-medium text-sm">{profile.name}</h3>
                      <p className="text-gray-500 text-xs">{profile.title}</p>
                    </div>
                  </div>
                  <Button size="icon" variant="ghost" className="h-8 w-8">
                    <span className="text-lg">+</span>
                  </Button>
                </div>
              ))}
            </div>
          </Card>
        </div>
        
        {/* Main Content */}
        <div className="col-span-12 md:col-span-6 space-y-6">
          <Card className="p-6">
            <div className="flex items-center gap-4 mb-6">
              <Avatar className="h-12 w-12">
                <AvatarImage src="/placeholder.svg" alt="User Avatar" />
                <AvatarFallback>U</AvatarFallback>
              </Avatar>
              <div className="flex gap-2">
                <Button variant="outline">Post a Project</Button>
                <Button className="bg-red-500 hover:bg-red-600">Post a Job</Button>
              </div>
            </div>
          </Card>
          
          <Card className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarImage src="/placeholder.svg" alt="John Doe" />
                  <AvatarFallback>JD</AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="font-semibold">John Doe</h2>
                  <p className="text-gray-500 text-sm">3 min ago</p>
                </div>
              </div>
              <Button variant="ghost" size="icon">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="flex items-center gap-2 mb-2">
              <Badge className="bg-blue-100 text-blue-700">Epic Coder</Badge>
              <Badge className="bg-green-100 text-green-700">India</Badge>
            </div>
            
            <h3 className="font-semibold text-lg mb-1">Senior Wordpress Developer</h3>
            <div className="flex items-center gap-4 mb-4">
              <Badge className="bg-blue-500 text-white">Full Time</Badge>
              <span className="font-semibold">$30 / hr</span>
            </div>
            
            <p className="text-gray-600 mb-4">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam luctus 
              hendrerit metus, ut ullamcorper quam finibus at. Etiam id magna sit amet...
              <a href="#" className="text-red-500 block mt-1">view more</a>
            </p>
            
            <div className="flex flex-wrap gap-2 mb-6">
              <Badge variant="outline" className="bg-gray-100">HTML</Badge>
              <Badge variant="outline" className="bg-gray-100">PHP</Badge>
              <Badge variant="outline" className="bg-gray-100">CSS</Badge>
              <Badge variant="outline" className="bg-gray-100">Javascript</Badge>
              <Badge variant="outline" className="bg-gray-100">Wordpress</Badge>
            </div>
            
            <div className="flex items-center justify-between pt-4 border-t">
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" className="text-red-500">
                  Like 25
                </Button>
                <Button variant="ghost" size="sm">
                  Comment 15
                </Button>
              </div>
              <div className="text-gray-500 text-sm">
                Views 50
              </div>
            </div>
          </Card>
          
          <Card className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Top Profiles</h2>
              <Button variant="ghost" size="icon">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              {/* Placeholder for profile cards */}
              {[1, 2, 3].map(i => (
                <div key={i} className="h-36 bg-gray-100 rounded-lg"></div>
              ))}
            </div>
          </Card>
        </div>
        
        {/* Right Sidebar */}
        <div className="col-span-12 md:col-span-3 space-y-6">
          <Card className="p-6 text-center">
            <div className="flex justify-center mb-4">
              <div className="text-2xl font-bold text-red-500">W</div>
            </div>
            <h2 className="text-lg font-semibold mb-1">Track Time on Workwise</h2>
            <p className="text-gray-500 text-sm mb-6">Pay only for the Hours worked</p>
            
            <div className="text-center">
              <h3 className="font-bold mb-1">SIGN UP</h3>
              <a href="#" className="text-red-500 text-sm">Learn More</a>
            </div>
          </Card>
          
          <Card className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold">Top Jobs</h2>
              <Button variant="ghost" size="icon">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="space-y-6">
              {topJobs.map(job => (
                <div key={job.id} className="border-b pb-4 last:border-b-0 last:pb-0">
                  <div className="flex justify-between items-center mb-1">
                    <h3 className="font-semibold">{job.title}</h3>
                    <span className="text-gray-700">{job.rate}</span>
                  </div>
                  <p className="text-gray-500 text-sm">{job.description}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Index;
