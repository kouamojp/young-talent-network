
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Filter, ArrowLeft, Brain, GraduationCap, Palette, BookOpen, MapPin, Calendar, Clock, Users, Info } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { learningTypes } from './data/learningTypes';
import { categories } from './data/categories';

interface LearningExploreProps {
  onBack: () => void;
}

const LearningExplore: React.FC<LearningExploreProps> = ({ onBack }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTab, setSelectedTab] = useState('all');
  
  const getIconForType = (type: string) => {
    switch (type) {
      case 'training':
        return <Brain className="h-5 w-5" />;
      case 'seminar':
        return <GraduationCap className="h-5 w-5" />;
      case 'masterclass':
        return <Palette className="h-5 w-5" />;
      case 'lecture':
        return <BookOpen className="h-5 w-5" />;
      default:
        return <Info className="h-5 w-5" />;
    }
  };
  
  const getLocationBadge = (locationType: string) => {
    switch (locationType) {
      case 'remote':
        return <Badge variant="outline" className="bg-blue-50">Remote</Badge>;
      case 'in-person':
        return <Badge variant="outline" className="bg-green-50">In-Person</Badge>;
      case 'hybrid':
        return <Badge variant="outline" className="bg-purple-50">Hybrid</Badge>;
      default:
        return null;
    }
  };
  
  const filteredLearningTypes = learningTypes.filter(item => {
    if (selectedTab !== 'all' && item.type !== selectedTab) {
      return false;
    }
    
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        item.title.toLowerCase().includes(searchLower) ||
        item.category.toLowerCase().includes(searchLower) ||
        item.subcategory.toLowerCase().includes(searchLower) ||
        item.description.toLowerCase().includes(searchLower)
      );
    }
    
    return true;
  });
  
  return (
    <div>
      <div className="flex items-center gap-2 mb-6">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <GraduationCap className="h-6 w-6" />
        <h1 className="text-2xl font-bold">
          Explore Learning Adventures
        </h1>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
          <Input 
            className="pl-10" 
            placeholder="Search for courses, skills, teachers..." 
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
      
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-3">Categories</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
          {categories.map((category) => (
            <div 
              key={category.id}
              className={`${category.color} p-2 rounded-lg text-center hover:shadow-sm transition-all cursor-pointer text-sm`}
            >
              <span className="mr-1">{category.icon}</span>
              {category.name}
            </div>
          ))}
        </div>
      </div>
      
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="mb-6">
        <TabsList>
          <TabsTrigger value="all">All Types</TabsTrigger>
          <TabsTrigger value="training">Trainings</TabsTrigger>
          <TabsTrigger value="seminar">Seminars</TabsTrigger>
          <TabsTrigger value="masterclass">Masterclasses</TabsTrigger>
          <TabsTrigger value="lecture">Lectures</TabsTrigger>
        </TabsList>
      </Tabs>
      
      <div className="space-y-4">
        {filteredLearningTypes.length > 0 ? (
          filteredLearningTypes.map((item) => (
            <div 
              key={item.id}
              className="bg-white/40 rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer"
            >
              <div className="md:flex">
                <div className="md:w-1/4 h-40 md:h-auto bg-gray-200 relative">
                  <img 
                    src={item.imageUrl} 
                    alt={item.title} 
                    className="w-full h-full object-cover rounded-t-lg md:rounded-l-lg md:rounded-t-none"
                  />
                </div>
                <div className="p-4 md:w-3/4">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2">
                        <div className={`p-1 rounded-full ${item.type === 'training' ? 'bg-purple-100' : item.type === 'seminar' ? 'bg-blue-100' : item.type === 'masterclass' ? 'bg-pink-100' : 'bg-green-100'}`}>
                          {getIconForType(item.type)}
                        </div>
                        <h3 className="text-lg font-bold">{item.title}</h3>
                      </div>
                      <p className="text-gray-600">by {item.instructor}</p>
                    </div>
                    <div className="text-lg font-bold text-primary">{item.price}</div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mt-3">
                    {getLocationBadge(item.location.type)}
                    <Badge variant="outline" className="bg-orange-50">{item.category}</Badge>
                    <Badge variant="outline" className="bg-yellow-50">{item.level}</Badge>
                  </div>
                  
                  <p className="mt-3 text-gray-700 line-clamp-2">{item.description}</p>
                  
                  <div className="mt-3 flex flex-wrap gap-3 text-sm text-gray-600">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      Starts: {item.startDate}
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      Duration: {item.duration}
                    </div>
                    <div className="flex items-center">
                      <Users className="h-4 w-4 mr-1" />
                      {item.currentParticipants}/{item.maxParticipants} enrolled
                    </div>
                    {item.location.address && (
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-1" />
                        {item.location.address}
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-4">
                    <Button>
                      Learn More
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-10">
            <BookOpen className="mx-auto h-12 w-12 text-gray-400 mb-3" />
            <h3 className="text-xl font-bold mb-2">No Learning Adventures Found</h3>
            <p className="text-gray-600 mb-4">
              Try adjusting your search or filters to find the perfect course.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LearningExplore;
