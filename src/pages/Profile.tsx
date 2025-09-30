
import React, { useState } from 'react';
import { TooltipProvider } from '@/components/ui/tooltip';
import { user, userPosts } from '@/components/profile/ProfileData';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { MessageSquare, UserPlus, Settings, Calendar, MapPin, Briefcase, Heart, Home, Compass, MessagesSquare, Bell, Users, GraduationCap, Radio, Newspaper, User, FileText, Building, PanelRight } from 'lucide-react';
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
            {/* Navigation Menu Grid */}
            <Card className="bg-white">
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                  {/* Main Section */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-gray-500 text-sm uppercase tracking-wider">Main</h3>
                    <div className="space-y-3">
                      <Link to="/" className="flex items-center gap-3 text-gray-700 hover:text-[#5181B8] transition-colors">
                        <Home className="h-5 w-5" />
                        <span>Home</span>
                      </Link>
                      <Link to="/categories" className="flex items-center gap-3 text-gray-700 hover:text-[#5181B8] transition-colors">
                        <Compass className="h-5 w-5" />
                        <span>Discover</span>
                      </Link>
                      <Link to="/messages" className="flex items-center gap-3 text-gray-700 hover:text-[#5181B8] transition-colors">
                        <MessagesSquare className="h-5 w-5" />
                        <span>Messages</span>
                      </Link>
                      <Link to="/notifications" className="flex items-center gap-3 text-gray-700 hover:text-[#5181B8] transition-colors">
                        <Bell className="h-5 w-5" />
                        <span>Notifications</span>
                      </Link>
                    </div>
                  </div>

                  {/* Communities & Content Section */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-gray-500 text-sm uppercase tracking-wider">Communities & Content</h3>
                    <div className="space-y-3">
                      <Link to="/talents-around-me" className="flex items-center gap-3 text-gray-700 hover:text-[#5181B8] transition-colors">
                        <MapPin className="h-5 w-5" />
                        <span>Talents Around Me</span>
                      </Link>
                      <Link to="/sports-categories" className="flex items-center gap-3 text-gray-700 hover:text-[#5181B8] transition-colors">
                        <Users className="h-5 w-5" />
                        <span>Sports Categories</span>
                      </Link>
                      <Link to="/learning" className="flex items-center gap-3 text-gray-700 hover:text-[#5181B8] transition-colors">
                        <GraduationCap className="h-5 w-5" />
                        <span>Learning Hub</span>
                      </Link>
                      <Link to="/live" className="flex items-center gap-3 text-gray-700 hover:text-[#5181B8] transition-colors">
                        <Radio className="h-5 w-5" />
                        <span>Live Events</span>
                      </Link>
                      <Link to="/news" className="flex items-center gap-3 text-gray-700 hover:text-[#5181B8] transition-colors">
                        <Newspaper className="h-5 w-5" />
                        <span>News & Updates</span>
                      </Link>
                      <Link to="/events" className="flex items-center gap-3 text-gray-700 hover:text-[#5181B8] transition-colors">
                        <Calendar className="h-5 w-5" />
                        <span>Upcoming Events</span>
                      </Link>
                    </div>
                  </div>

                  {/* Your Talent Profile Section */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-gray-500 text-sm uppercase tracking-wider">Your Talent Profile</h3>
                    <div className="space-y-3">
                      <Link to="/profile" className="flex items-center gap-3 text-gray-700 hover:text-[#5181B8] transition-colors">
                        <User className="h-5 w-5" />
                        <span>My Profile</span>
                      </Link>
                      <Link to="/profile?tab=resumes" className="flex items-center gap-3 text-gray-700 hover:text-[#5181B8] transition-colors">
                        <FileText className="h-5 w-5" />
                        <span className="flex items-center gap-2">
                          My Resumes
                          <span className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full">New</span>
                        </span>
                      </Link>
                      <Link to="/organizations" className="flex items-center gap-3 text-gray-700 hover:text-[#5181B8] transition-colors">
                        <Building className="h-5 w-5" />
                        <span>Organizations</span>
                      </Link>
                      <Link to="/communities" className="flex items-center gap-3 text-gray-700 hover:text-[#5181B8] transition-colors">
                        <Users className="h-5 w-5" />
                        <span>Communities</span>
                      </Link>
                    </div>
                  </div>

                  {/* Connect Section */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-gray-500 text-sm uppercase tracking-wider">Connect</h3>
                    <div className="space-y-3">
                      <Link to="/participants" className="flex items-center gap-3 text-gray-700 hover:text-[#5181B8] transition-colors">
                        <Users className="h-5 w-5" />
                        <span>Talent Community</span>
                      </Link>
                      <Link to="/work" className="flex items-center gap-3 text-gray-700 hover:text-[#5181B8] transition-colors">
                        <Briefcase className="h-5 w-5" />
                        <span className="flex items-center gap-2">
                          Work Opportunities
                          <span className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full">New</span>
                        </span>
                      </Link>
                      <Link to="/online-tv" className="flex items-center gap-3 text-gray-700 hover:text-[#5181B8] transition-colors">
                        <PanelRight className="h-5 w-5" />
                        <span>YAT TV</span>
                      </Link>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

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
