
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Coins, Plus, X, Upload, TrendingUp } from 'lucide-react';

const TokenizeProfile: React.FC = () => {
  const [profileData, setProfileData] = useState({
    name: '',
    title: '',
    description: '',
    category: '',
    initialTokenPrice: 10,
    totalSupply: 10000,
    royaltyPercentage: 5
  });
  
  const [skills, setSkills] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState('');
  const [achievements, setAchievements] = useState<string[]>([]);
  const [newAchievement, setNewAchievement] = useState('');

  const addSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill('');
    }
  };

  const removeSkill = (skill: string) => {
    setSkills(skills.filter(s => s !== skill));
  };

  const addAchievement = () => {
    if (newAchievement.trim() && !achievements.includes(newAchievement.trim())) {
      setAchievements([...achievements, newAchievement.trim()]);
      setNewAchievement('');
    }
  };

  const removeAchievement = (achievement: string) => {
    setAchievements(achievements.filter(a => a !== achievement));
  };

  const calculateMarketCap = () => {
    return (profileData.initialTokenPrice * profileData.totalSupply).toLocaleString();
  };

  const profileCompleteness = () => {
    const fields = [
      profileData.name,
      profileData.title,
      profileData.description,
      profileData.category,
      skills.length > 0,
      achievements.length > 0
    ];
    return Math.round((fields.filter(Boolean).length / fields.length) * 100);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Setup Form */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Coins className="h-5 w-5" />
                Create Your Talent Token
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={profileData.name}
                    onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                    placeholder="Your full name"
                  />
                </div>
                <div>
                  <Label htmlFor="title">Professional Title</Label>
                  <Input
                    id="title"
                    value={profileData.title}
                    onChange={(e) => setProfileData({...profileData, title: e.target.value})}
                    placeholder="e.g., Full-Stack Developer"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={profileData.description}
                  onChange={(e) => setProfileData({...profileData, description: e.target.value})}
                  placeholder="Describe your expertise, goals, and what makes you unique..."
                  rows={4}
                />
              </div>

              <div>
                <Label htmlFor="category">Category</Label>
                <Input
                  id="category"
                  value={profileData.category}
                  onChange={(e) => setProfileData({...profileData, category: e.target.value})}
                  placeholder="e.g., Technology, Creative, Marketing"
                />
              </div>

              <div>
                <Label>Skills</Label>
                <div className="flex gap-2 mb-2">
                  <Input
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    placeholder="Add a skill"
                    onKeyPress={(e) => e.key === 'Enter' && addSkill()}
                  />
                  <Button onClick={addSkill} size="sm">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {skills.map(skill => (
                    <Badge key={skill} variant="secondary" className="flex items-center gap-1">
                      {skill}
                      <X 
                        className="h-3 w-3 cursor-pointer" 
                        onClick={() => removeSkill(skill)}
                      />
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <Label>Key Achievements</Label>
                <div className="flex gap-2 mb-2">
                  <Input
                    value={newAchievement}
                    onChange={(e) => setNewAchievement(e.target.value)}
                    placeholder="Add an achievement"
                    onKeyPress={(e) => e.key === 'Enter' && addAchievement()}
                  />
                  <Button onClick={addAchievement} size="sm">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="space-y-2">
                  {achievements.map(achievement => (
                    <div key={achievement} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <span className="text-sm">{achievement}</span>
                      <X 
                        className="h-4 w-4 cursor-pointer text-gray-500" 
                        onClick={() => removeAchievement(achievement)}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Token Economics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label>Initial Token Price: ${profileData.initialTokenPrice}</Label>
                <Slider
                  value={[profileData.initialTokenPrice]}
                  onValueChange={(value) => setProfileData({...profileData, initialTokenPrice: value[0]})}
                  min={1}
                  max={100}
                  step={1}
                  className="mt-2"
                />
                <p className="text-sm text-gray-600 mt-1">
                  Set your starting token price based on your current market value
                </p>
              </div>

              <div>
                <Label>Total Token Supply: {profileData.totalSupply.toLocaleString()}</Label>
                <Slider
                  value={[profileData.totalSupply]}
                  onValueChange={(value) => setProfileData({...profileData, totalSupply: value[0]})}
                  min={1000}
                  max={100000}
                  step={1000}
                  className="mt-2"
                />
                <p className="text-sm text-gray-600 mt-1">
                  Higher supply = lower individual token price, more accessible
                </p>
              </div>

              <div>
                <Label>Future Earnings Royalty: {profileData.royaltyPercentage}%</Label>
                <Slider
                  value={[profileData.royaltyPercentage]}
                  onValueChange={(value) => setProfileData({...profileData, royaltyPercentage: value[0]})}
                  min={1}
                  max={20}
                  step={1}
                  className="mt-2"
                />
                <p className="text-sm text-gray-600 mt-1">
                  Percentage of future earnings shared with token holders
                </p>
              </div>

              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-semibold mb-2">Projected Market Cap</h4>
                <p className="text-2xl font-bold text-blue-600">${calculateMarketCap()}</p>
                <p className="text-sm text-gray-600">
                  Based on your token economics settings
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Profile Preview */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Profile Preview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <Avatar className="h-20 w-20 mx-auto mb-3">
                  <AvatarImage src="/placeholder.svg" />
                  <AvatarFallback>
                    {profileData.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <Button variant="outline" size="sm" className="mb-3">
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Photo
                </Button>
                <h3 className="font-semibold">{profileData.name || 'Your Name'}</h3>
                <p className="text-sm text-gray-600">{profileData.title || 'Your Title'}</p>
              </div>

              <div>
                <p className="text-sm text-gray-600 mb-2">Profile Completeness</p>
                <Progress value={profileCompleteness()} className="mb-1" />
                <p className="text-xs text-gray-500">{profileCompleteness()}% complete</p>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Token Price</span>
                  <span className="font-semibold">${profileData.initialTokenPrice}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Market Cap</span>
                  <span className="font-semibold">${calculateMarketCap()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Royalty</span>
                  <span className="font-semibold">{profileData.royaltyPercentage}%</span>
                </div>
              </div>

              {skills.length > 0 && (
                <div>
                  <p className="text-sm font-medium mb-2">Skills</p>
                  <div className="flex flex-wrap gap-1">
                    {skills.slice(0, 3).map(skill => (
                      <Badge key={skill} variant="secondary" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                    {skills.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{skills.length - 3} more
                      </Badge>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Button className="w-full" size="lg" disabled={profileCompleteness() < 80}>
            <TrendingUp className="h-4 w-4 mr-2" />
            Launch Your Token
          </Button>
          
          {profileCompleteness() < 80 && (
            <p className="text-sm text-center text-gray-600">
              Complete at least 80% of your profile to launch
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default TokenizeProfile;
