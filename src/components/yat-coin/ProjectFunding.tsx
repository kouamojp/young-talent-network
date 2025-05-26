
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Target, Clock, Users, DollarSign, Plus, Calendar } from 'lucide-react';

const ProjectFunding: React.FC = () => {
  const [newProject, setNewProject] = useState({
    title: '',
    description: '',
    fundingGoal: '',
    timeline: '',
    category: ''
  });

  const activeProjects = [
    {
      id: 1,
      title: 'AI-Powered Learning Platform',
      creator: 'Alex Chen',
      description: 'Building an adaptive learning platform that personalizes education using AI.',
      fundingGoal: 25000,
      currentFunding: 18750,
      backers: 42,
      daysLeft: 15,
      category: 'Technology',
      image: '/placeholder.svg',
      rewards: [
        { amount: 100, reward: 'Early access + 10% token bonus' },
        { amount: 500, reward: 'Premium features + 20% token bonus' },
        { amount: 1000, reward: 'Beta testing role + 30% token bonus' }
      ]
    },
    {
      id: 2,
      title: 'Digital Art NFT Collection',
      creator: 'Maria Rodriguez',
      description: 'Creating a unique NFT collection that represents the evolution of digital consciousness.',
      fundingGoal: 15000,
      currentFunding: 12300,
      backers: 28,
      daysLeft: 8,
      category: 'Creative',
      image: '/placeholder.svg',
      rewards: [
        { amount: 50, reward: 'Exclusive NFT + 5% royalties' },
        { amount: 200, reward: 'Limited edition print + 10% royalties' },
        { amount: 500, reward: 'Custom artwork + 15% royalties' }
      ]
    },
    {
      id: 3,
      title: 'Sustainable Fashion Startup',
      creator: 'Sarah Johnson',
      description: 'Launching an eco-friendly fashion brand that combines style with sustainability.',
      fundingGoal: 40000,
      currentFunding: 8200,
      backers: 15,
      daysLeft: 22,
      category: 'Business',
      image: '/placeholder.svg',
      rewards: [
        { amount: 75, reward: 'Sustainable fabric samples + updates' },
        { amount: 250, reward: 'First collection piece + 5% profit sharing' },
        { amount: 1000, reward: 'Design collaboration + 10% profit sharing' }
      ]
    }
  ];

  const fundingHistory = [
    {
      id: 1,
      title: 'Mobile Game Development',
      creator: 'David Kim',
      funded: 30000,
      goalReached: true,
      return: '+45%',
      status: 'Completed'
    },
    {
      id: 2,
      title: 'Photography Workshop Series',
      creator: 'Emily Zhang',
      funded: 12000,
      goalReached: true,
      return: '+22%',
      status: 'In Progress'
    }
  ];

  const calculateProgress = (current: number, goal: number) => {
    return Math.min((current / goal) * 100, 100);
  };

  const handleCreateProject = () => {
    console.log('Creating project:', newProject);
    // Reset form
    setNewProject({
      title: '',
      description: '',
      fundingGoal: '',
      timeline: '',
      category: ''
    });
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="browse" className="space-y-4">
        <TabsList>
          <TabsTrigger value="browse">Browse Projects</TabsTrigger>
          <TabsTrigger value="create">Create Project</TabsTrigger>
          <TabsTrigger value="history">Funding History</TabsTrigger>
        </TabsList>

        <TabsContent value="browse" className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Active Projects Seeking Funding</h3>
            <Button variant="outline">
              View All Categories
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {activeProjects.map(project => (
              <Card key={project.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold mb-1">{project.title}</h4>
                      <div className="flex items-center gap-2 mb-2">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={project.image} />
                          <AvatarFallback>
                            {project.creator.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm text-gray-600">by {project.creator}</span>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {project.category}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <p className="text-sm text-gray-600">{project.description}</p>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progress</span>
                      <span className="font-semibold">
                        ${project.currentFunding.toLocaleString()} / ${project.fundingGoal.toLocaleString()}
                      </span>
                    </div>
                    <Progress value={calculateProgress(project.currentFunding, project.fundingGoal)} />
                    <div className="text-xs text-gray-500">
                      {calculateProgress(project.currentFunding, project.fundingGoal).toFixed(1)}% funded
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-xs text-gray-600">Backers</p>
                      <p className="font-semibold flex items-center justify-center gap-1">
                        <Users className="h-3 w-3" />
                        {project.backers}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Days Left</p>
                      <p className="font-semibold flex items-center justify-center gap-1">
                        <Clock className="h-3 w-3" />
                        {project.daysLeft}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Goal</p>
                      <p className="font-semibold flex items-center justify-center gap-1">
                        <Target className="h-3 w-3" />
                        ${project.fundingGoal.toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm font-medium">Funding Rewards:</p>
                    {project.rewards.slice(0, 2).map((reward, index) => (
                      <div key={index} className="text-xs p-2 bg-gray-50 rounded">
                        <span className="font-semibold">${reward.amount}:</span> {reward.reward}
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-2">
                    <Input placeholder="Amount ($)" className="flex-1" />
                    <Button>
                      <DollarSign className="h-4 w-4 mr-1" />
                      Fund
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="create" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Create New Project
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="project-title">Project Title</Label>
                  <Input
                    id="project-title"
                    value={newProject.title}
                    onChange={(e) => setNewProject({...newProject, title: e.target.value})}
                    placeholder="Give your project a compelling title"
                  />
                </div>
                <div>
                  <Label htmlFor="project-category">Category</Label>
                  <Input
                    id="project-category"
                    value={newProject.category}
                    onChange={(e) => setNewProject({...newProject, category: e.target.value})}
                    placeholder="e.g., Technology, Creative, Business"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="project-description">Project Description</Label>
                <Textarea
                  id="project-description"
                  value={newProject.description}
                  onChange={(e) => setNewProject({...newProject, description: e.target.value})}
                  placeholder="Describe your project, its goals, and why people should fund it..."
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="funding-goal">Funding Goal ($)</Label>
                  <Input
                    id="funding-goal"
                    type="number"
                    value={newProject.fundingGoal}
                    onChange={(e) => setNewProject({...newProject, fundingGoal: e.target.value})}
                    placeholder="25000"
                  />
                </div>
                <div>
                  <Label htmlFor="timeline">Project Timeline (days)</Label>
                  <Input
                    id="timeline"
                    type="number"
                    value={newProject.timeline}
                    onChange={(e) => setNewProject({...newProject, timeline: e.target.value})}
                    placeholder="30"
                  />
                </div>
              </div>

              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-semibold mb-2">Project Launch Benefits</h4>
                <ul className="text-sm space-y-1 text-gray-600">
                  <li>• Access to YAT COIN investor network</li>
                  <li>• Token holders get priority funding access</li>
                  <li>• Automatic marketing to relevant investor segments</li>
                  <li>• Transparent progress tracking and updates</li>
                </ul>
              </div>

              <Button 
                onClick={handleCreateProject} 
                className="w-full" 
                size="lg"
                disabled={!newProject.title || !newProject.description || !newProject.fundingGoal}
              >
                Launch Project
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Your Funding History</h3>
            <div className="text-sm text-gray-600">
              Total Projects Funded: {fundingHistory.length}
            </div>
          </div>

          <div className="space-y-4">
            {fundingHistory.map(project => (
              <Card key={project.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src="/placeholder.svg" />
                        <AvatarFallback>
                          {project.creator.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h4 className="font-semibold">{project.title}</h4>
                        <p className="text-sm text-gray-600">by {project.creator}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-6">
                      <div className="text-center">
                        <p className="text-sm text-gray-600">Amount Funded</p>
                        <p className="font-semibold">${project.funded.toLocaleString()}</p>
                      </div>

                      <div className="text-center">
                        <p className="text-sm text-gray-600">Return</p>
                        <p className="font-semibold text-green-600">{project.return}</p>
                      </div>

                      <Badge 
                        variant={project.status === 'Completed' ? 'default' : 'secondary'}
                      >
                        {project.status}
                      </Badge>

                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {fundingHistory.length === 0 && (
            <div className="text-center py-12">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Funding History Yet</h3>
              <p className="text-gray-600 mb-4">Start funding projects to see your investment history here.</p>
              <Button onClick={() => setActiveTab?.('browse')}>
                Browse Projects
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProjectFunding;
