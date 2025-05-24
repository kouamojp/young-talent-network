
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Briefcase, Plus, Eye, Edit, X, DollarSign, MapPin, Clock } from 'lucide-react';

interface JobPosting {
  id: number;
  title: string;
  type: 'full-time' | 'part-time' | 'contract' | 'internship';
  location: string;
  salary?: string;
  description: string;
  postedDate: string;
  applications: number;
}

const JobPostingsManager: React.FC = () => {
  const [jobPostings, setJobPostings] = useState<JobPosting[]>([
    {
      id: 1,
      title: 'Senior Talent Agent',
      type: 'full-time',
      location: 'New York, NY',
      salary: '$70,000 - $90,000',
      description: 'Seeking experienced talent agent to represent our roster of actors and musicians.',
      postedDate: '2024-01-15',
      applications: 12
    },
    {
      id: 2,
      title: 'Casting Assistant',
      type: 'part-time',
      location: 'Remote',
      description: 'Support casting directors with audition coordination and talent database management.',
      postedDate: '2024-01-10',
      applications: 8
    }
  ]);

  const [showAll, setShowAll] = useState(false);

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'full-time': return 'bg-green-100 text-green-800';
      case 'part-time': return 'bg-blue-100 text-blue-800';
      case 'contract': return 'bg-purple-100 text-purple-800';
      case 'internship': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const displayedJobs = showAll ? jobPostings : jobPostings.slice(0, 3);

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="h-5 w-5" />
            Job Postings & Vacancies
          </CardTitle>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Post Job
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {jobPostings.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Briefcase className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>No job postings yet</p>
            <p className="text-sm">Create your first vacancy to attract talent</p>
          </div>
        ) : (
          <div className="space-y-4">
            {displayedJobs.map(job => (
              <div key={job.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold">{job.title}</h4>
                      <Badge className={getTypeColor(job.type)}>
                        {job.type.replace('-', ' ')}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {job.location}
                      </span>
                      {job.salary && (
                        <span className="flex items-center gap-1">
                          <DollarSign className="h-3 w-3" />
                          {job.salary}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        Posted {job.postedDate}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button size="sm" variant="ghost">
                      <Eye className="h-3 w-3" />
                    </Button>
                    <Button size="sm" variant="ghost">
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button size="sm" variant="ghost">
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                
                <p className="text-sm text-muted-foreground mb-3">
                  {job.description}
                </p>
                
                <div className="flex justify-between items-center">
                  <Badge variant="outline">
                    {job.applications} applications
                  </Badge>
                  <Button size="sm" variant="outline">
                    View Applications
                  </Button>
                </div>
              </div>
            ))}
            
            {jobPostings.length > 3 && (
              <Button 
                variant="outline" 
                onClick={() => setShowAll(!showAll)}
                className="w-full"
              >
                {showAll ? 'Show Less' : `Show All ${jobPostings.length} Jobs`}
              </Button>
            )}
          </div>
        )}
        
        <div className="mt-4 p-3 bg-green-50 rounded-lg">
          <h4 className="font-medium text-green-900 mb-1">Connect to YAT Jobs</h4>
          <p className="text-sm text-green-700 mb-2">
            Automatically sync your job postings with the YAT Jobs platform
          </p>
          <Button size="sm" variant="outline" className="text-green-700 border-green-300">
            Enable Integration
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default JobPostingsManager;
