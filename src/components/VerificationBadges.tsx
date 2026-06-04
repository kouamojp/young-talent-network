import React, { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';
import { BadgeCheck, Award, Building2, Search, GraduationCap, Heart, Star } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

export const BADGE_META: Record<string, { label: string; icon: any; color: string }> = {
  talent: { label: 'Talent vérifié', icon: Star, color: 'bg-blue-500' },
  agent: { label: 'Agent certifié', icon: Award, color: 'bg-purple-500' },
  organization: { label: 'Organisation vérifiée', icon: Building2, color: 'bg-emerald-500' },
  recruiter: { label: 'Recruteur vérifié', icon: Search, color: 'bg-amber-500' },
  mentor: { label: 'Mentor vérifié', icon: GraduationCap, color: 'bg-indigo-500' },
  sponsor: { label: 'Sponsor vérifié', icon: Heart, color: 'bg-pink-500' },
};

interface Props {
  userId: string;
  size?: 'sm' | 'md';
  showLabels?: boolean;
}

export const VerificationBadges: React.FC<Props> = ({ userId, size = 'sm', showLabels = false }) => {
  const [badges, setBadges] = useState<string[]>([]);

  useEffect(() => {
    if (!userId) return;
    supabase
      .from('profile_badges')
      .select('badge_type')
      .eq('user_id', userId)
      .then(({ data }) => setBadges((data || []).map((b: any) => b.badge_type)));
  }, [userId]);

  if (badges.length === 0) return null;
  const iconSize = size === 'sm' ? 'h-4 w-4' : 'h-5 w-5';

  return (
    <TooltipProvider>
      <div className="inline-flex flex-wrap items-center gap-1">
        {badges.map((b) => {
          const meta = BADGE_META[b];
          if (!meta) return null;
          const Icon = meta.icon;
          if (showLabels) {
            return (
              <Badge key={b} className={`${meta.color} text-white gap-1 hover:${meta.color}`}>
                <Icon className={iconSize} /> {meta.label}
              </Badge>
            );
          }
          return (
            <Tooltip key={b}>
              <TooltipTrigger asChild>
                <span className={`inline-flex items-center justify-center rounded-full ${meta.color} text-white p-0.5`}>
                  <BadgeCheck className={iconSize} />
                </span>
              </TooltipTrigger>
              <TooltipContent>{meta.label}</TooltipContent>
            </Tooltip>
          );
        })}
      </div>
    </TooltipProvider>
  );
};

export default VerificationBadges;
