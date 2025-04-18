
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart, Briefcase, Building, MapPin, Clock, Calendar, ChevronRight, Bookmark } from 'lucide-react';
import { talents } from './data/talents';

interface OrganizationViewProps {
  selectedTab: string;
  onTabChange: (value: string) => void;
  handleApplyClick: (event: React.MouseEvent) => void;
  handleCardClick: (id: number) => void;
}

const OrganizationView: React.FC<OrganizationViewProps> = ({
  selectedTab,
  onTabChange,
  handleApplyClick,
  handleCardClick
}) => {
  return (
    <Tabs value={selectedTab} onValueChange={onTabChange}>
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
              
              <div className="mt-4 flex flex-wrap gap-2">
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
                <Button onClick={(e) => handleApplyClick(e)}>
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
  );
};

export default OrganizationView;
