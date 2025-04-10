import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { Instagram, Youtube, Music } from 'lucide-react';
import GlassMorphism from '@/components/GlassMorphism';

interface SocialLink {
  platform: 'instagram' | 'youtube' | 'tiktok' | 'other';
  url: string;
  verified: boolean;
  lastActivity?: {
    type: string;
    value: string;
  };
}

interface SocialUniverseProps {
  initialLinks?: SocialLink[];
}

const SocialUniverse: React.FC<SocialUniverseProps> = ({ initialLinks = [] }) => {
  const [links, setLinks] = useState<SocialLink[]>(initialLinks);
  const [newLink, setNewLink] = useState<{
    platform: SocialLink['platform'];
    url: string;
  }>({
    platform: 'instagram',
    url: '',
  });
  const [privacySettings, setPrivacySettings] = useState({
    agents: true,
    mentors: true,
    public: false,
  });
  const [isAddingNew, setIsAddingNew] = useState(false);
  
  const getIconForPlatform = (platform: SocialLink['platform']) => {
    switch(platform) {
      case 'instagram':
        return <Instagram className="h-5 w-5 text-pink-500" />;
      case 'youtube':
        return <Youtube className="h-5 w-5 text-red-500" />;
      case 'tiktok':
        return <Music className="h-5 w-5 text-black" />;
      default:
        return <Music className="h-5 w-5 text-gray-500" />;
    }
  };
  
  const getPlatformDescription = (platform: SocialLink['platform']) => {
    switch(platform) {
      case 'instagram':
        return "Where I post my daily creative adventures 📸";
      case 'youtube':
        return "My proudest performance moments 🎥";
      case 'tiktok':
        return "Quick talent bites that make people smile ⚡";
      default:
        return "Another place where my talent shines!";
    }
  };

  const handleAddLink = () => {
    if (!newLink.url.trim()) {
      toast.error('Please enter a valid URL');
      return;
    }
    
    // Simple URL validation
    if (!newLink.url.includes('.')) {
      toast.error('Please enter a valid URL');
      return;
    }
    
    const newSocialLink: SocialLink = {
      ...newLink,
      verified: Math.random() > 0.5, // Randomly verify for demo purposes
    };
    
    setLinks([...links, newSocialLink]);
    setNewLink({ platform: 'instagram', url: '' });
    setIsAddingNew(false);
    
    toast.success(`Boom! Your ${newLink.platform} is now part of your talent orbit 🚀`);
  };
  
  const togglePrivacySetting = (setting: 'agents' | 'mentors' | 'public') => {
    setPrivacySettings({
      ...privacySettings,
      [setting]: !privacySettings[setting]
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">🌐 My Social Universe</h3>
        {!isAddingNew && (
          <Button onClick={() => setIsAddingNew(true)}>
            Add Social Link
          </Button>
        )}
      </div>
      
      <p className="text-gray-600">All the places where my talent shines!</p>
      
      {/* Privacy Controls */}
      <Card>
        <CardContent className="p-4">
          <h4 className="font-medium mb-2">Privacy Controls</h4>
          <p className="text-sm text-gray-600 mb-3">Show social links only to:</p>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="agents" 
                checked={privacySettings.agents}
                onCheckedChange={() => togglePrivacySetting('agents')}
              />
              <Label htmlFor="agents">Agents</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="mentors" 
                checked={privacySettings.mentors}
                onCheckedChange={() => togglePrivacySetting('mentors')}
              />
              <Label htmlFor="mentors">Mentors</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="public" 
                checked={privacySettings.public}
                onCheckedChange={() => togglePrivacySetting('public')}
              />
              <Label htmlFor="public">Public</Label>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Add new link form */}
      {isAddingNew && (
        <GlassMorphism className="p-4">
          <h4 className="font-medium mb-4">Add New Social Link</h4>
          <div className="space-y-4">
            <div>
              <Label htmlFor="platform">Select Platform</Label>
              <div className="grid grid-cols-4 gap-2 mt-2">
                {(['instagram', 'youtube', 'tiktok', 'other'] as const).map((platform) => (
                  <div 
                    key={platform}
                    className={`p-3 border rounded-md flex flex-col items-center justify-center gap-2 cursor-pointer transition-all duration-200 hover:scale-105 ${
                      newLink.platform === platform ? 'border-primary bg-primary/10' : 'border-gray-200'
                    }`}
                    onClick={() => setNewLink({ ...newLink, platform })}
                  >
                    {getIconForPlatform(platform)}
                    <span className="text-sm capitalize">{platform}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <Label htmlFor="url">Social Media URL</Label>
              <Input 
                id="url" 
                placeholder="Paste where the world can admire your work!"
                value={newLink.url}
                onChange={(e) => setNewLink({ ...newLink, url: e.target.value })}
              />
            </div>
            
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsAddingNew(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddLink}>
                Connect Account
              </Button>
            </div>
          </div>
        </GlassMorphism>
      )}
      
      {/* Existing links */}
      {links.length > 0 ? (
        <div className="grid grid-cols-1 gap-4">
          {links.map((link, index) => (
            <GlassMorphism key={index} className="p-4 transition-all duration-300 hover:shadow-md">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white/50 rounded-full">
                  {getIconForPlatform(link.platform)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium capitalize">{link.platform}</h4>
                    {link.verified && (
                      <span className="bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded-full flex items-center gap-1">
                        ✓ Connected
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600">{getPlatformDescription(link.platform)}</p>
                  <a 
                    href={link.url.startsWith('http') ? link.url : `https://${link.url}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:underline"
                  >
                    {link.url}
                  </a>
                </div>
              </div>
              
              {link.lastActivity && (
                <div className="mt-3 p-2 bg-gray-50 rounded-md text-sm">
                  <p>
                    Your latest {link.platform} {link.lastActivity.type} got {link.lastActivity.value}! 
                    <button className="text-primary ml-1 hover:underline">
                      Want to share it here too?
                    </button>
                  </p>
                </div>
              )}
            </GlassMorphism>
          ))}
        </div>
      ) : (
        <div className="text-center p-8 border border-dashed rounded-lg border-gray-300">
          <div className="text-4xl mb-3">✨</div>
          <h4 className="font-medium mb-2">Your stage is missing some spotlights!</h4>
          <p className="text-gray-600 mb-4">
            Your social media links are like extra stages for your talent!<br />
            Add them so fans can follow your whole journey ✨
          </p>
          {!isAddingNew && (
            <Button onClick={() => setIsAddingNew(true)}>
              Add Your First Link
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default SocialUniverse;
