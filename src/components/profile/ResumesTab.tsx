
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import GlassMorphism from '@/components/GlassMorphism';
import { Plus, FileText, Briefcase } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TooltipProvider } from '@/components/ui/tooltip';
import ResumeCard, { ResumeProps } from './ResumeCard';

// Sample resume data
const sampleResumes: ResumeProps[] = [
  {
    id: 1,
    title: "Basketball Player",
    category: "Sports & Athletics",
    isActive: true,
    skills: ['Ball handling', 'Court vision', 'Perimeter defense', 'Leadership', 'Team coordination'],
    experience: "5+ years",
    achievements: [
      'State Championship MVP 2023',
      'All-State First Team 2022-2023',
      'School record for most assists in a season (320)'
    ],
    lastUpdated: "2023-05-15"
  },
  {
    id: 2,
    title: "Track & Field Athlete",
    category: "Sports & Athletics",
    isActive: true,
    skills: ['Sprinting', 'Endurance', 'Technique', 'Race strategy', 'Mental focus'],
    experience: "3 years",
    achievements: [
      'Regional Champion 100m 2023',
      '2nd Place State Finals 200m 2022',
      'School record 100m (10.4s)'
    ],
    lastUpdated: "2023-06-20"
  },
  {
    id: 3,
    title: "Pianist",
    category: "Music",
    isActive: false,
    skills: ['Classical piano', 'Music theory', 'Composition', 'Sight reading'],
    experience: "8 years",
    achievements: [
      'First place in Young Musicians Competition 2022',
      'Solo performance at Lincoln Center',
      'Published original composition in Music Monthly'
    ],
    lastUpdated: "2023-04-10"
  }
];

// Sample job applications
const sampleJobApplications = [
  {
    id: 1,
    position: "Junior Basketball Coach",
    organization: "Elite Sports Academy",
    status: "Applied",
    appliedDate: "2023-05-20",
    deadline: "2023-06-15"
  },
  {
    id: 2,
    position: "Camp Counselor - Athletics",
    organization: "Summer Sports Camp",
    status: "Interview",
    appliedDate: "2023-05-12",
    deadline: "2023-06-01"
  }
];

const ResumesTab: React.FC = () => {
  const [resumes, setResumes] = useState(sampleResumes);
  const [activeTab, setActiveTab] = useState<'resumes' | 'applications'>('resumes');

  const handleNewResume = () => {
    // This would open a form to create a new resume
    console.log('Create new resume');
  };

  const handleEditResume = (id: number) => {
    console.log('Edit resume', id);
  };

  const handleViewResume = (id: number) => {
    console.log('View resume', id);
  };

  const handleDeleteResume = (id: number) => {
    setResumes(resumes.filter(resume => resume.id !== id));
  };

  return (
    <TooltipProvider>
      <GlassMorphism className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold">My Career Profile</h3>
          <Button onClick={handleNewResume} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Create New Resume
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'resumes' | 'applications')}>
          <TabsList className="mb-6">
            <TabsTrigger value="resumes" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              My Resumes
            </TabsTrigger>
            <TabsTrigger value="applications" className="flex items-center gap-2">
              <Briefcase className="h-4 w-4" />
              Job Applications
            </TabsTrigger>
          </TabsList>

          <TabsContent value="resumes">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {resumes.map(resume => (
                <ResumeCard 
                  key={resume.id} 
                  resume={resume} 
                  onEdit={handleEditResume}
                  onDelete={handleDeleteResume}
                  onView={handleViewResume}
                />
              ))}
              
              {resumes.length === 0 && (
                <Card className="col-span-full py-8 px-4">
                  <CardContent className="flex flex-col items-center text-center">
                    <FileText className="h-12 w-12 text-gray-400 mb-3" />
                    <h3 className="text-xl font-bold mb-2">No Resumes Yet</h3>
                    <p className="text-gray-600 mb-4">
                      Create your first resume to showcase your talents and skills!
                    </p>
                    <Button onClick={handleNewResume}>
                      Create Resume
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="applications">
            <div className="rounded-lg overflow-hidden border">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Position</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Organization</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Applied</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Deadline</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {sampleJobApplications.map((application) => (
                    <tr key={application.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{application.position}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{application.organization}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                          ${application.status === 'Applied' ? 'bg-blue-100 text-blue-800' : 
                            application.status === 'Interview' ? 'bg-green-100 text-green-800' : 
                            'bg-gray-100 text-gray-800'}`}>
                          {application.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{application.appliedDate}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{application.deadline}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Button variant="ghost" size="sm">View</Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {sampleJobApplications.length === 0 && (
                <div className="py-8 px-4 text-center bg-white">
                  <Briefcase className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                  <h3 className="text-lg font-medium mb-2">No Job Applications</h3>
                  <p className="text-gray-500 mb-4">You haven't applied to any jobs yet</p>
                  <Button>Browse Job Openings</Button>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </GlassMorphism>
    </TooltipProvider>
  );
};

export default ResumesTab;
