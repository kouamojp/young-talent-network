
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { MapPin, Link as LinkIcon, Calendar, BookOpen, Briefcase } from 'lucide-react';
import GlassMorphism from '@/components/GlassMorphism';
import { tr } from '@/i18n';
import { localeTag } from '@/i18n/format';

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
                <span>{tr('profileInfo.talentDiscoveredNear')} {user.location.split(',')[0]}{tr('profileInfo.sendAWave')}</span>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>{tr('profileInfo.seeWhereThisTalentIsMaking')}</p>
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
                <span>{tr('profileInfo.bornToShineOn')} {user.birthday}!</span>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>{tr('profileInfo.markYourCalendarForCelebrationTime')}</p>
            </TooltipContent>
          </Tooltip>
        </div>
        
        <Card>
          <CardContent className="p-4">
            <h3 className="font-medium flex items-center gap-2 mb-2">
              <span>{tr('profileInfo.whenIMNotPerformingI')}</span>
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
              <span>{tr('profileInfo.learningTheArtOfMusicAt')} {user.education}</span>
            </h3>
            <h3 className="font-medium flex items-center gap-2 mt-3">
              <Briefcase size={16} className="text-purple-600" />
              <span>{tr('profileInfo.currently')} {user.work}{tr('profileInfo.destinedForGreaterStages')}</span>
            </h3>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex justify-between">
              <div>
                <span className="font-bold">{user.followers.toLocaleString(localeTag())}</span> 
                <span className="text-gray-600 ml-1">{tr('profileInfo.supportersInYourFanNetwork')}</span>
              </div>
              <div>
                <span className="font-bold">{user.mentors}</span> 
                <span className="text-gray-600 ml-1">{tr('profileInfo.mentorsGuidingYourJourney')}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProfileInfo;
