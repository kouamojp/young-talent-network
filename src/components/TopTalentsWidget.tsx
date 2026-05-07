import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Trophy, TrendingUp } from 'lucide-react';
import { useLanguage } from '@/i18n/LanguageContext';

interface TopTalent {
  user_id: string;
  xp_total: number;
  level: number;
  name: string;
  avatar_url: string | null;
}

const TopTalentsWidget: React.FC = () => {
  const [talents, setTalents] = useState<TopTalent[]>([]);
  const { t } = useLanguage();

  useEffect(() => {
    const fetchTop = async () => {
      const { data } = await supabase
        .from('user_levels')
        .select('user_id, xp_total, level')
        .order('xp_total', { ascending: false })
        .limit(5);

      if (!data || data.length === 0) return;

      const userIds = data.map((d: any) => d.user_id);
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, name, avatar_url')
        .in('id', userIds);

      const profileMap = new Map((profiles || []).map((p: any) => [p.id, p]));
      setTalents(
        data.map((d: any) => {
          const p = profileMap.get(d.user_id);
          return {
            user_id: d.user_id,
            xp_total: d.xp_total,
            level: d.level,
            name: p?.name || 'User',
            avatar_url: p?.avatar_url,
          };
        })
      );
    };
    fetchTop();
  }, []);

  const medals = ['🥇', '🥈', '🥉'];

  if (talents.length === 0) return null;

  return (
    <div className="bg-card rounded-lg shadow-sm p-4 border border-border">
      <div className="flex items-center gap-2 mb-3">
        <Trophy className="h-4 w-4 text-yellow-500" />
        <h3 className="font-semibold text-sm">
          {t('feed.topTalents') || 'Топ талантов недели'}
        </h3>
      </div>
      <ul className="space-y-2">
        {talents.map((talent, i) => (
          <li key={talent.user_id} className="flex items-center gap-3 py-1.5 px-2 rounded-md hover:bg-muted transition-colors cursor-pointer">
            <span className="text-lg w-6 text-center">{medals[i] || `${i + 1}.`}</span>
            <Avatar className="h-8 w-8">
              <AvatarImage src={talent.avatar_url || '/placeholder.svg'} />
              <AvatarFallback>{talent.name[0]}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{talent.name}</p>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <TrendingUp className="h-3 w-3" />
                <span>Lv.{talent.level} · {talent.xp_total} XP</span>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TopTalentsWidget;
