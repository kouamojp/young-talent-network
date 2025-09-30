import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, Briefcase, Heart, Settings } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ProfileSidebarMenuProps {
  user: {
    name: string;
    avatar: string;
    status: string;
  };
}

const ProfileSidebarMenu: React.FC<ProfileSidebarMenuProps> = ({ user }) => {
  const [open, setOpen] = React.useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon"
          className="rounded-full hover:bg-white/10"
        >
          <Menu className="h-6 w-6" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-80 p-0">
        <ScrollArea className="h-full">
          <Card className="border-0 rounded-none">
            <CardContent className="p-6">
              <div className="text-center mb-6">
                <Avatar className="w-32 h-32 mx-auto mb-4">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <h1 className="text-xl font-semibold text-gray-900">{user.name}</h1>
                <p className="text-sm text-gray-500">статус был 15 мин назад</p>
              </div>

              <div className="space-y-2 mb-6">
                <Button className="w-full bg-[#4BB34B] hover:bg-[#3E9A3E] text-white">
                  Написать сообщение
                </Button>
                <Button variant="outline" className="w-full text-[#5181B8] border-[#5181B8]">
                  Добавить в друзья
                </Button>
              </div>

              <div className="space-y-3 text-sm">
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

              <div className="mt-6 pt-4 border-t border-gray-200">
                <div className="grid grid-cols-3 gap-4 text-center text-sm">
                  <div>
                    <div className="font-semibold">432</div>
                    <div className="text-gray-500">друзья</div>
                  </div>
                  <div>
                    <div className="font-semibold">67</div>
                    <div className="text-gray-500">фото</div>
                  </div>
                  <div>
                    <div className="font-semibold">23</div>
                    <div className="text-gray-500">видео</div>
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <Link to="/talent-dashboard" onClick={() => setOpen(false)}>
                  <Button 
                    variant="outline"
                    className="w-full flex items-center justify-center gap-2 bg-purple-50 hover:bg-purple-100 border-purple-200 text-purple-700"
                  >
                    <Settings className="h-4 w-4" />
                    <span>Talent Dashboard</span>
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};

export default ProfileSidebarMenu;
