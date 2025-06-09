
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, MapPin, Briefcase, Heart } from 'lucide-react';
import { user } from '@/components/profile/ProfileData';

const ProfileInfoCard: React.FC = () => {
  return (
    <Card className="bg-white">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-semibold text-gray-900">{user.name}</h1>
          <div className="flex gap-2">
            <Button className="bg-[#4BB34B] hover:bg-[#3E9A3E] text-white text-sm px-4 py-2">
              Написать сообщение
            </Button>
            <Button variant="outline" className="text-[#5181B8] border-[#5181B8] text-sm px-4 py-2">
              Добавить в друзья
            </Button>
          </div>
        </div>

        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-3">
            <Calendar className="h-4 w-4 text-gray-400" />
            <span className="text-gray-600">25 лет</span>
          </div>
          <div className="flex items-center gap-3">
            <MapPin className="h-4 w-4 text-gray-400" />
            <span className="text-gray-600">Москва</span>
          </div>
          <div className="flex items-center gap-3">
            <Briefcase className="h-4 w-4 text-gray-400" />
            <span className="text-gray-600">Frontend Developer</span>
          </div>
          <div className="flex items-center gap-3">
            <Heart className="h-4 w-4 text-gray-400" />
            <span className="text-gray-600">В активном поиске</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfileInfoCard;
