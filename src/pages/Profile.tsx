
import React, { useState } from 'react';
import { TooltipProvider } from '@/components/ui/tooltip';
import { user, userPosts } from '@/components/profile/ProfileData';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { MessageSquare, UserPlus, Settings, Calendar, MapPin, Briefcase, Heart } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import Navbar from '@/components/Navbar';
import ProfileMenu from '@/components/ProfileMenu';
import ProfileSidebarMenu from '@/components/ProfileSidebarMenu';
import { Link } from 'react-router-dom';

const Profile: React.FC = () => {
  const [isEditMode, setIsEditMode] = useState(false);
  const [statusText, setStatusText] = useState(user.status);
  const [isEditingStatus, setIsEditingStatus] = useState(false);
  const isMobile = useIsMobile();

  const handleStatusChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setStatusText(e.target.value);
  };

  const saveStatus = () => {
    setIsEditingStatus(false);
  };

  return (
    <div className="min-h-screen bg-[#E7E8EC]">
      {/* Mobile navbar */}
      <div className="md:hidden">
        <Navbar />
        <div className="h-14"></div>
      </div>
      
      {/* Header with integrated navigation */}
      <div className="bg-[#5181B8] text-white py-3">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <ProfileSidebarMenu user={user} />
              <div className="text-2xl font-bold">Y&T</div>
              <div className="hidden md:flex items-center gap-6 text-sm">
                <ProfileMenu />
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-sm">Александр Иванов ▼</div>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-4 py-6">
        <div className="space-y-6">

            {/* Status/Post Creation */}
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

            {/* Featured Post */}
            <Card className="bg-white">
              <CardContent className="p-6">
                <h2 className="text-lg font-semibold mb-4">Почему ментальное здоровье малых команд?</h2>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <p className="text-gray-700 text-sm leading-relaxed mb-4">
                      Потому что именно развитие самостоятельности трансформирует функцию: 
                      все еще больше создавать дополнительные преимущества, приходящие в голову, это отсутствие 
                      определяемого времени различных дизайн.
                    </p>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <button className="hover:text-[#5181B8]">👍 12</button>
                      <button className="hover:text-[#5181B8]">💬 3</button>
                      <button className="hover:text-[#5181B8]">↗ 2</button>
                    </div>
                  </div>
                  <div className="w-32 h-24 bg-gradient-to-br from-pink-400 via-purple-500 to-blue-500 rounded-lg flex-shrink-0">
                    <div className="w-full h-full bg-black/20 rounded-lg flex items-center justify-center">
                      <div className="text-white text-2xl">🎨</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Welcome Message */}
            <Card className="bg-white">
              <CardContent className="p-6">
                <h3 className="font-semibold mb-3">Всем привет!</h3>
                <p className="text-gray-700 text-sm">
                  Наверхстка и персонаж постоперативных операционных навыков дисциплин.
                  Баннеры и консультированные ластиковые анализы поддержки в таких блоках. 
                  Кого-нибудь другого-позволе решение проблем и шага, при базе кличко, проблематики и выставки.
                </p>
                <div className="flex items-center gap-4 text-sm text-gray-500 mt-4">
                  <button className="hover:text-[#5181B8]">👍 8</button>
                  <button className="hover:text-[#5181B8]">💬 1</button>
                  <button className="hover:text-[#5181B8]">↗ 1</button>
                </div>
              </CardContent>
            </Card>
        </div>
      </main>
    </div>
  );
};

export default Profile;
