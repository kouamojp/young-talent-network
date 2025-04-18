
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Briefcase, 
  FileText, 
  Building, 
  MapPin, 
  Clock, 
  Calendar, 
  ChevronRight, 
  Bookmark
} from 'lucide-react';
import { opportunities } from './data/opportunities';
import { scholarships } from './data/scholarships';
import { mentorships } from './data/mentorships';

interface TalentViewProps {
  selectedTab: string;
  onTabChange: (value: string) => void;
  handleApplyClick: (event: React.MouseEvent) => void;
  handleCardClick: (id: number) => void;
}

const TalentView: React.FC<TalentViewProps> = ({
  selectedTab,
  onTabChange,
  handleApplyClick,
  handleCardClick
}) => {
  return (
    <Tabs value={selectedTab} onValueChange={onTabChange}>
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
                <Button onClick={(e) => handleApplyClick(e)}>
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
  );
};

export default TalentView;
