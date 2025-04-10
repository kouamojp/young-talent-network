
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import GlassMorphism from '@/components/GlassMorphism';
import { UserPlus, Mail, Edit, Sparkles } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface ProfileHeaderProps {
  user: {
    name: string;
    nickname: string;
    avatar: string;
    coverPhoto: string;
    bio: string;
    status: string;
  };
  statusText: string;
  isEditingStatus: boolean;
  isEditMode: boolean;
  handleStatusChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  saveStatus: () => void;
  setIsEditingStatus: (value: boolean) => void;
  setIsEditMode: (value: boolean) => void;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  user,
  statusText,
  isEditingStatus,
  isEditMode,
  handleStatusChange,
  saveStatus,
  setIsEditingStatus,
  setIsEditMode
}) => {
  return (
    <div className="relative mb-6">
      <div className="h-64 w-full overflow-hidden rounded-b-xl">
        <img 
          src={user.coverPhoto} 
          alt="Cover" 
          className="w-full h-full object-cover"
        />
      </div>
      
      <GlassMorphism className="relative mx-4 -mt-20 p-6">
        <div className="flex flex-col md:flex-row items-center md:items-end gap-4">
          <Avatar className="w-32 h-32 border-4 border-white">
            <AvatarImage src={user.avatar} alt={user.name} />
            <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
          </Avatar>
          
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-2xl font-bold">
              Meet {user.name.split(' ')[0]} "{user.nickname}" {user.name.split(' ')[1]} – the future of music!
            </h1>
            
            {isEditingStatus ? (
              <div className="flex mt-2 items-center">
                <input 
                  type="text" 
                  value={statusText} 
                  onChange={handleStatusChange} 
                  placeholder="Tell us your dream in 5 words..." 
                  className="border rounded px-2 py-1 text-sm flex-1"
                  maxLength={50}
                />
                <Button size="sm" onClick={saveStatus} className="ml-2">Save</Button>
              </div>
            ) : (
              <p 
                className="text-gray-600 cursor-pointer hover:text-gray-800" 
                onClick={() => setIsEditingStatus(true)}
              >
                "{statusText}" <span className="text-xs">(click to edit)</span>
              </p>
            )}
            
            <p className="mt-2 max-w-md">{user.bio}</p>
          </div>
          
          <div className="flex gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button className="gap-2">
                  <UserPlus size={16} />
                  Follow
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Join Alex's cheerleaders!</p>
              </TooltipContent>
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <Mail size={16} />
                  Message
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Start your legendary duo journey!</p>
              </TooltipContent>
            </Tooltip>
            
            {!isEditMode && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" className="gap-2" onClick={() => setIsEditMode(true)}>
                    <Edit size={16} />
                    <Sparkles className="h-3 w-3" />
                    Polish your sparkle
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Make your profile shine brighter!</p>
                </TooltipContent>
              </Tooltip>
            )}
          </div>
        </div>
      </GlassMorphism>
    </div>
  );
};

export default ProfileHeader;
