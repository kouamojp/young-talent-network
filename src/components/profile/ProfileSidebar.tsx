
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { user } from '@/components/profile/ProfileData';
import SidebarMenu from '@/components/sidebar/SidebarMenu';

const ProfileSidebar: React.FC = () => {
  return (
    <Card className="bg-white">
      <CardContent className="p-4">
        <div className="text-center mb-6">
          <Avatar className="w-20 h-20 mx-auto mb-3">
            <AvatarImage src={user.avatar} alt={user.name} />
            <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <h2 className="text-lg font-semibold text-gray-900">{user.name}</h2>
          <p className="text-sm text-gray-500">статус был 15 мин назад</p>
        </div>

        {/* Main Navigation Menu */}
        <div className="border-t border-gray-200 pt-4">
          <SidebarMenu />
        </div>

        {/* Quick Stats */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="grid grid-cols-3 gap-2 text-center text-sm">
            <div>
              <div className="font-semibold">432</div>
              <div className="text-gray-500 text-xs">друзья</div>
            </div>
            <div>
              <div className="font-semibold">67</div>
              <div className="text-gray-500 text-xs">фото</div>
            </div>
            <div>
              <div className="font-semibold">23</div>
              <div className="text-gray-500 text-xs">видео</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfileSidebar;
