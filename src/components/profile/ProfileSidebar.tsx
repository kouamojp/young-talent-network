import React, { useState } from 'react';
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
  LayoutDashboard,
  ShoppingBag,
  Globe,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { useLanguage } from '@/i18n/LanguageContext';

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
  { key: 'work', label: 'YAT Work', icon: Briefcase, color: 'text-blue-500', bgColor: 'bg-blue-500/10' },
  { key: 'learning', label: 'YAT Learning', icon: GraduationCap, color: 'text-green-500', bgColor: 'bg-green-500/10' },
  { key: 'live', label: 'YAT Live', icon: Radio, color: 'text-red-500', bgColor: 'bg-red-500/10' },
  { key: 'tv', label: 'YAT TV', icon: Tv, color: 'text-purple-500', bgColor: 'bg-purple-500/10' },
  { key: 'events', label: 'YAT Events', icon: Calendar, color: 'text-orange-500', bgColor: 'bg-orange-500/10' },
  { key: 'karta', label: 'YAT Karta', icon: Map, color: 'text-teal-500', bgColor: 'bg-teal-500/10' },
  { key: 'yat-coin', label: 'YAT Coin', icon: Coins, color: 'text-yellow-500', bgColor: 'bg-yellow-500/10' },
  { key: 'marketplace', label: 'YAT Marketplace', icon: ShoppingBag, color: 'text-orange-600', bgColor: 'bg-orange-600/10' },
  { key: 'social', label: 'YAT Social', icon: Globe, color: 'text-indigo-500', bgColor: 'bg-indigo-500/10' },
];

const ProfileSidebar: React.FC<ProfileSidebarProps> = ({ 
  talentPresence: initialPresence, 
  activeSection,
  onSectionChange,
}) => {
  const { t } = useLanguage();
  const [presence, setPresence] = useState<TalentPresence[]>(initialPresence);
  const [busyKey, setBusyKey] = useState<string | null>(null);

  React.useEffect(() => {
    setPresence(initialPresence);
  }, [initialPresence]);

  const getPresence = (section: string) =>
    presence.find((p) => p.section === section);

  const handleToggle = async (section: string, nextValue: boolean) => {
    setBusyKey(section);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({ title: t('common.error') || 'Error', description: t('auth.signInRequired') || 'Please sign in', variant: 'destructive' });
      setBusyKey(null);
      return;
    }

    const existing = getPresence(section);
    try {
      if (existing) {
        const { error } = await supabase
          .from('talent_presence')
          .update({ is_active: nextValue })
          .eq('id', existing.id);
        if (error) throw error;
        setPresence((prev) => prev.map((p) => p.id === existing.id ? { ...p, is_active: nextValue } : p));
      } else {
        const { data, error } = await supabase
          .from('talent_presence')
          .insert({ user_id: user.id, section, is_active: nextValue, visibility: 'public' })
          .select()
          .single();
        if (error) throw error;
        if (data) setPresence((prev) => [...prev, data as TalentPresence]);
      }
      toast({ title: nextValue ? (t('services.activated') || 'Service activated') : (t('services.deactivated') || 'Service deactivated') });
    } catch (e: any) {
      toast({ title: t('common.error') || 'Error', description: e.message, variant: 'destructive' });
    } finally {
      setBusyKey(null);
    }
  };

  return (
    <Card className="sticky top-20">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <User className="h-4 w-4" />
          {t('profile.myYatProfiles') || 'Mes Profils YAT'}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-2">
        <nav className="space-y-1">
          {sidebarItems.map((item) => {
            const p = getPresence(item.key);
            const isActive = !!p?.is_active;
            return (
              <div
                key={item.key}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 w-full",
                  "hover:bg-muted group",
                  activeSection === item.key && "bg-primary/10 border-l-2 border-primary shadow-sm"
                )}
              >
                <button
                  type="button"
                  onClick={() => onSectionChange?.(item.key)}
                  className="flex items-center gap-3 flex-1 min-w-0 text-left"
                >
                  <div className={cn(
                    "p-1.5 rounded-md transition-all duration-200",
                    item.bgColor,
                    "group-hover:scale-110"
                  )}>
                    <item.icon className={cn("h-4 w-4", item.color)} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-sm font-medium block truncate">
                      {item.label}
                    </span>
                    <span className={cn(
                      "text-[10px] font-medium",
                      isActive ? "text-emerald-600" : "text-muted-foreground"
                    )}>
                      {isActive ? (t('services.active') || 'active') : (t('services.inactive') || 'inactive')}
                    </span>
                  </div>
                </button>
                <Switch
                  checked={isActive}
                  disabled={busyKey === item.key}
                  onCheckedChange={(v) => handleToggle(item.key, v)}
                  aria-label={`Toggle ${item.label}`}
                />
              </div>
            );
          })}
          
          <div className="my-2 border-t border-border" />
          
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
