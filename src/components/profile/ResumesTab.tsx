
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import GlassMorphism from '@/components/GlassMorphism';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

// Sample resume data
const sampleResumes = [
  {
    id: 1,
    sport: 'Basketball',
    position: 'Point Guard',
    active: true,
    achievements: [
      'State Championship MVP 2023',
      'All-State First Team 2022-2023',
      'School record for most assists in a season (320)'
    ],
    skills: ['Ball handling', 'Court vision', 'Perimeter defense', 'Leadership'],
    coaches: [
      { name: 'Coach Williams', organization: 'Lincoln High School' },
      { name: 'Coach Johnson', organization: 'Elite Basketball Academy' }
    ],
    metrics: {
      height: "6'2\"",
      weight: '180 lbs',
      verticalJump: '36 inches',
      speedQuarter: '3.2 seconds'
    }
  },
  {
    id: 2,
    sport: 'Track & Field',
    position: 'Sprinter (100m, 200m)',
    active: true,
    achievements: [
      'Regional Champion 100m 2023',
      '2nd Place State Finals 200m 2022',
      'School record 100m (10.4s)'
    ],
    skills: ['Explosiveness', 'Form technique', 'Block starts', 'Race strategy'],
    coaches: [
      { name: 'Coach Martinez', organization: 'Lincoln High School' },
      { name: 'Coach Thompson', organization: 'Speed Academy' }
    ],
    metrics: {
      personalBest100m: '10.4s',
      personalBest200m: '21.2s',
      reactionTime: '0.15s'
    }
  }
];

const ResumesTab: React.FC = () => {
  const [resumes, setResumes] = useState(sampleResumes);
  const [activeResumeTab, setActiveResumeTab] = useState<number>(1);

  const handleNewResume = () => {
    // This would open a form to create a new resume
    console.log('Create new resume');
  };

  const handleEditResume = (id: number) => {
    console.log('Edit resume', id);
  };

  const handleDeleteResume = (id: number) => {
    setResumes(resumes.filter(resume => resume.id !== id));
  };

  return (
    <GlassMorphism className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold">Sport Resumes</h3>
        <Button onClick={handleNewResume} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          New Resume
        </Button>
      </div>

      <Tabs 
        value={activeResumeTab.toString()} 
        onValueChange={(value) => setActiveResumeTab(parseInt(value))}
      >
        <TabsList className="mb-6">
          {resumes.map((resume) => (
            <TabsTrigger key={resume.id} value={resume.id.toString()}>
              {resume.sport}
            </TabsTrigger>
          ))}
        </TabsList>

        {resumes.map((resume) => (
          <TabsContent key={resume.id} value={resume.id.toString()}>
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h4 className="text-2xl font-bold">{resume.sport}</h4>
                  <div className="text-gray-600">{resume.position}</div>
                  {resume.active && (
                    <span className="mt-2 inline-block px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                      Active
                    </span>
                  )}
                </div>

                <div className="flex gap-2">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleEditResume(resume.id)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Edit resume</TooltipContent>
                  </Tooltip>
                  
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleDeleteResume(resume.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Delete resume</TooltipContent>
                  </Tooltip>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardContent className="p-4">
                    <h5 className="font-medium text-lg mb-2">Achievements</h5>
                    <ul className="space-y-1 list-disc list-inside">
                      {resume.achievements.map((achievement, i) => (
                        <li key={i} className="text-gray-700">{achievement}</li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <h5 className="font-medium text-lg mb-2">Skills</h5>
                    <div className="flex flex-wrap gap-2">
                      {resume.skills.map((skill, i) => (
                        <span 
                          key={i} 
                          className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <h5 className="font-medium text-lg mb-2">Coaches</h5>
                    <div className="space-y-3">
                      {resume.coaches.map((coach, i) => (
                        <div key={i} className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600">
                            {coach.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-medium">{coach.name}</p>
                            <p className="text-sm text-gray-600">{coach.organization}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <h5 className="font-medium text-lg mb-2">Metrics</h5>
                    <div className="grid grid-cols-2 gap-2">
                      {Object.entries(resume.metrics).map(([key, value], i) => (
                        <div key={i} className="bg-gray-50 p-3 rounded">
                          <p className="text-xs text-gray-500 capitalize">{key.replace(/([A-Z])/g, ' $1')}</p>
                          <p className="font-medium">{value}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </GlassMorphism>
  );
};

export default ResumesTab;
