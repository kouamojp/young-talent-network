
import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Search as SearchIcon, UserPlus, MapPin, HandMetal, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

// Mock data for users
const users = [
  {
    id: 1,
    name: 'Emma Watson',
    username: 'emmaw',
    avatar: '/placeholder.svg',
    skill: 'Acting',
    distance: 5,
    location: 'Los Angeles'
  },
  {
    id: 2,
    name: 'John Smith',
    username: 'johnsmith',
    avatar: '/placeholder.svg',
    skill: 'Photography',
    distance: 12,
    location: 'New York'
  },
  {
    id: 3,
    name: 'Sophie Chen',
    username: 'sophiec',
    avatar: '/placeholder.svg',
    skill: 'Dance',
    distance: 8,
    location: 'Chicago'
  },
  {
    id: 4,
    name: 'Miguel Rodriguez',
    username: 'miguelr',
    avatar: '/placeholder.svg',
    skill: 'Music Production',
    distance: 15,
    location: 'Miami'
  }
];

const Search: React.FC = () => {
  const [query, setQuery] = React.useState('');
  const [results, setResults] = React.useState(users);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Filter users based on query (simple implementation)
    const filteredResults = users.filter(user => 
      user.name.toLowerCase().includes(query.toLowerCase()) || 
      user.skill.toLowerCase().includes(query.toLowerCase()) ||
      user.location.toLowerCase().includes(query.toLowerCase())
    );
    setResults(filteredResults);
  };

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-purple-50">
        <Navbar />
        
        <div className="container mx-auto py-8 px-4">
          <h1 className="text-3xl font-bold mb-6 text-center">Find Your Tribe</h1>
          
          <div className="max-w-2xl mx-auto mb-8">
            <form onSubmit={handleSearch} className="flex gap-2 mb-6">
              <Input 
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Find someone who makes your talent heart beat faster..."
                className="flex-1"
              />
              <Button type="submit">
                <SearchIcon className="mr-2 h-4 w-4" /> Search
              </Button>
            </form>
            
            <Card className="bg-gradient-to-r from-purple-100 to-blue-100 mb-6 overflow-hidden">
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className="bg-white/80 p-3 rounded-full">
                    <Sparkles className="h-6 w-6 text-purple-500" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-lg">Discover Talents Around You</h3>
                    <p className="text-sm mb-3">Find amazing talents right in your neighborhood!</p>
                    <Link to="/talents-around-me">
                      <Button size="sm" variant="default" className="rounded-full">
                        Explore Nearby Talents
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {results.length === 0 && (
              <div className="text-center p-8 bg-white rounded-lg shadow-sm">
                <div className="text-5xl mb-4">🔍</div>
                <h3 className="text-xl font-medium mb-2">Hmm... no matches yet.</h3>
                <p className="text-gray-600">Try whispering the skill name softer? (Or broaden filters!)</p>
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {results.map(user => (
                <Card key={user.id} className="overflow-hidden hover:shadow-md transition-shadow">
                  <CardContent className="p-0">
                    <div className="p-4 flex gap-4">
                      <Avatar className="h-14 w-14">
                        <AvatarImage src={user.avatar} alt={user.name} />
                        <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1">
                        <h3 className="font-medium">{user.name}</h3>
                        <p className="text-sm text-purple-700 font-medium">{user.skill}</p>
                        
                        <div className="flex items-center mt-1 text-xs text-gray-600">
                          <MapPin className="h-3 w-3 mr-1" />
                          <span>{user.location} ({user.distance} km away)</span>
                        </div>
                        
                        <p className="mt-2 text-sm">
                          {user.name.split(' ')[0]} is mastering {user.skill} just {user.distance} km from you!
                        </p>
                      </div>
                    </div>
                    
                    <div className="border-t p-3 flex justify-end bg-gray-50">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button size="sm" variant="outline" className="gap-1">
                            <HandMetal className="h-4 w-4" />
                            <span>Send a talent high-five</span>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Make the first move toward collaboration!</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
        
        <Footer />
      </div>
    </TooltipProvider>
  );
};

export default Search;
