
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { MapPin, Link as LinkIcon, Calendar, BookOpen, Briefcase } from 'lucide-react';
import GlassMorphism from '@/components/GlassMorphism';

interface ProfileInfoProps {
  user: {
    location: string;
    website: string;
    birthday: string;
    hobbies: string[];
    education: string;
    work: string;
    followers: number;
    mentors: number;
  };
}

const ProfileInfo: React.FC<ProfileInfoProps> = ({ user }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
      {/* Left Column */}
      <div className="space-y-4">
        <div className="flex flex-wrap gap-4 text-sm text-gray-600">
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-1">
                <MapPin size={16} />
                <span>🌍 Talent spotted near {user.location.split(',')[0]}! Send a wave 👋</span>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>The world should know where this talent shines from!</p>
            </TooltipContent>
          </Tooltip>
          
          <div className="flex items-center gap-1">
            <LinkIcon size={16} />
            <a href={`https://${user.website}`} className="hover:underline">{user.website}</a>
          </div>
          
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-1">
                <Calendar size={16} />
                <span>🎉 Born to shine on {user.birthday}!</span>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>Mark your calendar for celebration time!</p>
            </TooltipContent>
          </Tooltip>
        </div>
        
        <Card>
          <CardContent className="p-4">
            <h3 className="font-medium flex items-center gap-2 mb-2">
              <span>When I'm not being amazing at piano, I love...</span>
            </h3>
            <div className="flex flex-wrap gap-2">
              {user.hobbies.map((hobby, index) => (
                <span 
                  key={index} 
                  className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm"
                >
                  {hobby}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Right Column */}
      <div className="space-y-4">
        <Card>
          <CardContent className="p-4">
            <h3 className="font-medium flex items-center gap-2 mb-2">
              <BookOpen size={16} className="text-purple-600" />
              <span>📚 Learning the secrets of music at {user.education}</span>
            </h3>
            <h3 className="font-medium flex items-center gap-2 mt-3">
              <Briefcase size={16} className="text-purple-600" />
              <span>💡 Currently: {user.work}. (But destined for bigger stages!)</span>
            </h3>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex justify-between">
              <div>
                <span className="font-bold">{user.followers.toLocaleString()}</span> 
                <span className="text-gray-600 ml-1">👥 cheerleaders in your fan club</span>
              </div>
              <div>
                <span className="font-bold">{user.mentors}</span> 
                <span className="text-gray-600 ml-1">🎓 wise mentors guiding your journey</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProfileInfo;
