
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Edit, MessageSquare, UserPlus } from 'lucide-react';

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
    <div className="mb-4 bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="relative">
        <div className="h-96 overflow-hidden">
          <img 
            src={user.coverPhoto} 
            alt="Cover" 
            className="w-full h-full object-cover"
          />
        </div>
        
        <div className="absolute bottom-4 left-4 flex items-end gap-4">
          <Avatar className="w-40 h-40 border-4 border-white rounded-full">
            <AvatarImage src={user.avatar} alt={user.name} className="object-cover" />
            <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
          </Avatar>
          
          <div className="mb-4 text-white">
            <h1 className="text-3xl font-bold drop-shadow-lg">{user.name}</h1>
            <p className="text-lg drop-shadow-md">@{user.nickname}</p>
          </div>
        </div>
      </div>
      
      <div className="px-4 py-3 flex items-center justify-between border-t border-gray-200">
        <div className="flex gap-2">
          <Button className="bg-[#1877F2] hover:bg-[#166FE5]">
            <UserPlus className="mr-2 h-4 w-4" />
            Follow
          </Button>
          <Button variant="outline" className="text-[#1877F2]">
            <MessageSquare className="mr-2 h-4 w-4" />
            Message
          </Button>
        </div>
        
        {!isEditMode && (
          <Button variant="outline" onClick={() => setIsEditMode(true)}>
            <Edit className="mr-2 h-4 w-4" />
            Edit Profile
          </Button>
        )}
      </div>
    </div>
  );
};

export default ProfileHeader;
