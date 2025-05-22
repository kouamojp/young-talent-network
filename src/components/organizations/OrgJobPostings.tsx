
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Briefcase, FileText, Clock, MapPin, Calendar, Edit, Trash2, Eye } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import JobPostingForm from '@/components/work/JobPostingForm';

interface JobPosting {
  id: number;
  title: string;
  location: string;
  type: string;
  postedDate: string;
  applicationDeadline: string;
  status: 'active' | 'draft' | 'closed';
  applicantCount: number;
}

const sampleJobPostings: JobPosting[] = [
  {
    id: 1,
    title: "Junior Basketball Coach",
    location: "New York, NY",
    type: "Part-time",
    postedDate: "2023-05-15",
    applicationDeadline: "2023-06-30",
    status: "active",
    applicantCount: 12
  },
  {
    id: 2,
    title: "Dance Instructor",
    location: "Los Angeles, CA",
    type: "Contract",
    postedDate: "2023-04-22",
    applicationDeadline: "2023-07-15",
    status: "active",
    applicantCount: 8
  },
  {
    id: 3,
    title: "Music Teacher Assistant",
    location: "Chicago, IL",
    type: "Part-time",
    postedDate: "2023-05-01",
    applicationDeadline: "2023-05-30",
    status: "closed",
    applicantCount: 20
  }
];

interface OrgJobPostingsProps {
  organizationId?: number;
}

const OrgJobPostings: React.FC<OrgJobPostingsProps> = ({ organizationId }) => {
  const [jobPostings, setJobPostings] = useState<JobPosting[]>(sampleJobPostings);
  const [activeTab, setActiveTab] = useState<'active' | 'draft' | 'closed'>('active');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const handleNewJobPosting = (data: any) => {
    // In a real app, this would send data to your backend
    const newJob = {
      id: Math.max(0, ...jobPostings.map(job => job.id)) + 1,
      title: data.title,
      location: data.location,
      type: data.type,
      postedDate: new Date().toISOString().split('T')[0],
      applicationDeadline: data.applicationDeadline || "N/A",
      status: 'active' as 'active',
      applicantCount: 0
    };
    
    setJobPostings([newJob, ...jobPostings]);
    setIsDialogOpen(false);
  };
  
  const handleDeleteJob = (id: number) => {
    setJobPostings(jobPostings.filter(job => job.id !== id));
  };
  
  const filteredJobs = jobPostings.filter(job => job.status === activeTab);
  
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Briefcase className="h-5 w-5" />
          Job Postings
        </h3>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="flex items-center gap-1">
              <Plus className="h-4 w-4" />
              <span>Post New Job</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl">
            <JobPostingForm onSubmit={handleNewJobPosting} />
          </DialogContent>
        </Dialog>
      </div>
      
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'active' | 'draft' | 'closed')}>
        <TabsList className="mb-4">
          <TabsTrigger value="active">
            Active ({jobPostings.filter(j => j.status === 'active').length})
          </TabsTrigger>
          <TabsTrigger value="draft">
            Drafts ({jobPostings.filter(j => j.status === 'draft').length})
          </TabsTrigger>
          <TabsTrigger value="closed">
            Closed ({jobPostings.filter(j => j.status === 'closed').length})
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="active">
          <div className="space-y-4">
            {filteredJobs.length > 0 ? (
              filteredJobs.map(job => (
                <JobPostingCard 
                  key={job.id} 
                  job={job} 
                  onDelete={handleDeleteJob} 
                />
              ))
            ) : (
              <EmptyState 
                title="No Active Job Postings" 
                description="Post a job to start receiving applications from talented individuals."
                buttonText="Post a Job"
                onClick={() => setIsDialogOpen(true)}
              />
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="draft">
          <div className="space-y-4">
            {filteredJobs.length > 0 ? (
              filteredJobs.map(job => (
                <JobPostingCard 
                  key={job.id} 
                  job={job} 
                  onDelete={handleDeleteJob} 
                />
              ))
            ) : (
              <EmptyState 
                title="No Draft Job Postings" 
                description="Save job postings as drafts to publish them later."
                buttonText="Create Draft"
                onClick={() => setIsDialogOpen(true)}
              />
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="closed">
          <div className="space-y-4">
            {filteredJobs.length > 0 ? (
              filteredJobs.map(job => (
                <JobPostingCard 
                  key={job.id} 
                  job={job} 
                  onDelete={handleDeleteJob} 
                />
              ))
            ) : (
              <EmptyState 
                title="No Closed Job Postings" 
                description="Closed job postings will appear here."
                buttonText="View Active Jobs"
                onClick={() => setActiveTab('active')}
              />
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

interface JobPostingCardProps {
  job: JobPosting;
  onDelete: (id: number) => void;
}

const JobPostingCard: React.FC<JobPostingCardProps> = ({ job, onDelete }) => {
  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <CardContent className="p-0">
        <div className="p-4">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-semibold text-lg">{job.title}</h3>
              <div className="flex items-center gap-4 mt-1 text-gray-500 text-sm">
                <div className="flex items-center">
                  <MapPin className="h-3.5 w-3.5 mr-1" />
                  {job.location}
                </div>
                <div className="flex items-center">
                  <Clock className="h-3.5 w-3.5 mr-1" />
                  {job.type}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Badge 
                variant="outline" 
                className={`
                  ${job.status === 'active' ? 'bg-green-50 text-green-700 border-green-200' : 
                   job.status === 'draft' ? 'bg-amber-50 text-amber-700 border-amber-200' : 
                   'bg-gray-50 text-gray-700 border-gray-200'}
                `}
              >
                {job.status === 'active' ? 'Active' : 
                 job.status === 'draft' ? 'Draft' : 'Closed'}
              </Badge>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center justify-between mt-4">
            <div className="flex items-center gap-6 text-sm">
              <div className="flex items-center">
                <Calendar className="h-3.5 w-3.5 mr-1 text-gray-500" />
                <span>
                  Posted: <span className="font-medium">{job.postedDate}</span>
                </span>
              </div>
              <div className="flex items-center">
                <Calendar className="h-3.5 w-3.5 mr-1 text-gray-500" />
                <span>
                  Deadline: <span className="font-medium">{job.applicationDeadline}</span>
                </span>
              </div>
              <div>
                <span>
                  <span className="font-medium text-primary">{job.applicantCount}</span> applicants
                </span>
              </div>
            </div>
            
            <div className="flex gap-2 mt-2 sm:mt-0">
              <Button variant="outline" size="sm" className="gap-1">
                <Eye className="h-3.5 w-3.5" />
                <span>View</span>
              </Button>
              <Button variant="outline" size="sm" className="gap-1">
                <Edit className="h-3.5 w-3.5" />
                <span>Edit</span>
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="gap-1 text-destructive hover:bg-destructive/10" 
                onClick={() => onDelete(job.id)}
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Delete</span>
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

interface EmptyStateProps {
  title: string;
  description: string;
  buttonText: string;
  onClick: () => void;
}

const EmptyState: React.FC<EmptyStateProps> = ({ title, description, buttonText, onClick }) => {
  return (
    <Card>
      <CardContent className="p-8 text-center">
        <Briefcase className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <CardTitle className="mb-2">{title}</CardTitle>
        <p className="text-gray-500 mb-4">{description}</p>
        <Button onClick={onClick}>{buttonText}</Button>
      </CardContent>
    </Card>
  );
};

export default OrgJobPostings;
