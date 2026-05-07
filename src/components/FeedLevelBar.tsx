import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useUserLevel, getLevelBadge, getXpProgress } from '@/hooks/useUserLevel';
import { Progress } from './ui/progress';
import { Coins, Flame } from 'lucide-react';

const FeedLevelBar: React.FC = () => {
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) setUserId(user.id);
    });
  }, []);

  const { levelData, loading } = useUserLevel(userId);

  if (loading || !levelData) return null;

  const badge = getLevelBadge(levelData.level);
  const progress = getXpProgress(levelData.xp_total, levelData.level);

  return (
    <div className="bg-card rounded-lg shadow-sm p-3 border border-border">
      <div className="flex items-center gap-3">
        <span className="text-2xl">{badge.icon}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-semibold" style={{ color: badge.color }}>
              {badge.name} — Lv.{levelData.level}
            </span>
            <div className="flex items-center gap-1 text-xs text-yellow-500 font-medium">
              <Coins className="h-3.5 w-3.5" />
              {levelData.yat_coins.toFixed(4)}
            </div>
          </div>
          <Progress value={progress} className="h-2" />
          <div className="flex justify-between mt-1 text-[10px] text-muted-foreground">
            <span className="flex items-center gap-0.5"><Flame className="h-3 w-3" />{levelData.xp_total} XP</span>
            <span>Next: {levelData.level * 100} XP</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeedLevelBar;
