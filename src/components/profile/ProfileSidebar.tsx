import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Briefcase, 
  GraduationCap, 
  Radio, 
  Tv, 
  Calendar, 
  Map, 
  Coins,
  User,
  LayoutDashboard
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface TalentPresence {
  id: string;
  section: string;
  is_active: boolean;
  visibility: string;
}

interface ProfileSidebarProps {
  talentPresence: TalentPresence[];
  userName?: string;
  userAvatar?: string;
  activeSection?: string;
  onSectionChange?: (section: string) => void;
}

const sidebarItems = [
  {
    key: 'work',
    label: 'YAT Work',
    icon: Briefcase,
    path: '/work',
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10'
  },
  {
    key: 'learning',
    label: 'YAT Learning',
    icon: GraduationCap,
    path: '/learning',
    color: 'text-green-500',
    bgColor: 'bg-green-500/10'
  },
  {
    key: 'live',
    label: 'YAT Live',
    icon: Radio,
    path: '/live',
    color: 'text-red-500',
    bgColor: 'bg-red-500/10'
  },
  {
    key: 'tv',
    label: 'YAT TV',
    icon: Tv,
    path: '/tv',
    color: 'text-purple-500',
    bgColor: 'bg-purple-500/10'
  },
  {
    key: 'events',
    label: 'YAT Events',
    icon: Calendar,
    path: '/events',
    color: 'text-orange-500',
    bgColor: 'bg-orange-500/10'
  },
  {
    key: 'karta',
    label: 'YAT Karta',
    icon: Map,
    path: '/karta',
    color: 'text-teal-500',
    bgColor: 'bg-teal-500/10'
  },
  {
    key: 'yat-coin',
    label: 'YAT Coin',
    icon: Coins,
    path: '/yat-coin',
    color: 'text-yellow-500',
    bgColor: 'bg-yellow-500/10'
  }
];

const ProfileSidebar: React.FC<ProfileSidebarProps> = ({ 
  talentPresence, 
  userName,
  userAvatar,
  activeSection,
  onSectionChange,
}) => {

  const getPresenceStatus = (section: string) => {
    const presence = talentPresence.find(p => p.section === section);
    return presence ? { isActive: presence.is_active, visibility: presence.visibility } : null;
  };

  return (
    <Card className="sticky top-20">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <User className="h-4 w-4" />
          Mes Profils YAT
        </CardTitle>
      </CardHeader>
      <CardContent className="p-2">
        <nav className="space-y-1">
          {sidebarItems.map((item) => {
            const presence = getPresenceStatus(item.key);
            return (
              <button
                key={item.key}
                onClick={() => onSectionChange?.(item.key)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all w-full text-left",
                  "hover:bg-muted group",
                  activeSection === item.key && "bg-primary/10 border-l-2 border-primary"
                )}
              >
                <div className={cn(
                  "p-1.5 rounded-md transition-colors",
                  item.bgColor,
                  "group-hover:scale-105"
                )}>
                  <item.icon className={cn("h-4 w-4", item.color)} />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-sm font-medium block truncate">
                    {item.label}
                  </span>
                </div>
                {presence && (
                  <Badge 
                    variant={presence.isActive ? "default" : "secondary"}
                    className="text-[10px] px-1.5 py-0"
                  >
                    {presence.isActive ? 'Actif' : 'Inactif'}
                  </Badge>
                )}
              </button>
            );
          })}
          
          {/* Separator */}
          <div className="my-2 border-t border-border" />
          
          {/* Dashboard Link */}
          <Link
            to="/talent-dashboard"
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all",
              "bg-gradient-to-r from-primary/10 to-accent/10",
              "hover:from-primary/20 hover:to-accent/20",
              "border border-primary/20"
            )}
          >
            <div className="p-1.5 rounded-md bg-primary/20">
              <LayoutDashboard className="h-4 w-4 text-primary" />
            </div>
            <span className="text-sm font-medium text-primary">
              Talent Dashboard
            </span>
          </Link>
        </nav>
      </CardContent>
    </Card>
  );
};

export default ProfileSidebar;
