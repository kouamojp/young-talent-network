
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Plus, Briefcase, DollarSign, Clock, MapPin } from 'lucide-react';

const WorkSection: React.FC = () => {
  const [jobs] = useState([
    {
      id: 1,
      company: 'Google',
      title: 'Senior UX Designer',
      timeline: 'Jan 2023 - Present',
      location: 'San Francisco, CA',
      type: 'Full-time',
      current: true
    },
    {
      id: 2,
      company: 'Apple',
      title: 'Product Designer',
      timeline: 'Jun 2021 - Dec 2022',
      location: 'Cupertino, CA',
      type: 'Full-time',
      current: false
    }
  ]);

  const [requests] = useState([
    {
      id: 1,
      title: 'Video Editor for Podcast',
      budget: '$500-800',
      timeline: '2 weeks',
      skills: ['Video Editing', 'After Effects', 'Premiere Pro'],
      applicants: 12
    }
  ]);

  return (
    <div className="space-y-6">
      <Tabs defaultValue="jobs" className="space-y-4">
        <TabsList>
          <TabsTrigger value="jobs">💼 Jobs</TabsTrigger>
          <TabsTrigger value="requests">📩 Requests</TabsTrigger>
        </TabsList>

        <TabsContent value="jobs" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Work Experience</h3>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Job
            </Button>
          </div>

          <div className="space-y-4">
            {jobs.map((job) => (
              <Card key={job.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold">{job.title}</h4>
                        {job.current && (
                          <Badge variant="secondary" className="text-xs">Current</Badge>
                        )}
                      </div>
                      <p className="text-gray-600 mb-1">{job.company}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {job.timeline}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {job.location}
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {job.type}
                        </Badge>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">
                      Edit
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="border-dashed">
            <CardContent className="p-6 text-center">
              <Briefcase className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-600 mb-4">Add your work experience</p>
              <Button variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Add Job Experience
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="requests" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Job Requests</h3>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Post Request
            </Button>
          </div>

          <div className="space-y-4">
            {requests.map((request) => (
              <Card key={request.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <h4 className="font-semibold">{request.title}</h4>
                    <Badge>{request.applicants} applicants</Badge>
                  </div>
                  
                  <div className="flex items-center gap-4 mb-3 text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      <DollarSign className="h-3 w-3" />
                      {request.budget}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {request.timeline}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {request.skills.map((skill, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="border-dashed">
            <CardContent className="p-6 text-center">
              <DollarSign className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-600 mb-4">Post a job request to find talent</p>
              <Button variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Create Job Request
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default WorkSection;
