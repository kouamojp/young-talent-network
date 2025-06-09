
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { user } from '@/components/profile/ProfileData';

const StatusInput: React.FC = () => {
  return (
    <Card className="bg-white">
      <CardContent className="p-4">
        <div className="flex gap-3">
          <Avatar className="w-10 h-10">
            <AvatarImage src={user.avatar} alt={user.name} />
            <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <input 
              type="text" 
              placeholder="Что у вас нового?"
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#5181B8]"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StatusInput;
