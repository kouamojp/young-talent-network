import React from 'react';
import { getLevelBadge, getXpProgress, UserLevel } from '@/hooks/useUserLevel';
import { Progress } from '@/components/ui/progress';
import { Coins } from 'lucide-react';

interface UserLevelBadgeProps {
  levelData: UserLevel;
  compact?: boolean;
}

export const UserLevelBadge: React.FC<UserLevelBadgeProps> = ({ levelData, compact = false }) => {
  const badge = getLevelBadge(levelData.level);
  const progress = getXpProgress(levelData.xp_total, levelData.level);

  if (compact) {
    return (
      <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold"
        style={{ backgroundColor: badge.color + '22', color: badge.color, border: `1px solid ${badge.color}44` }}>
        <span>{badge.icon}</span>
        <span>Lv.{levelData.level}</span>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-card p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{badge.icon}</span>
          <div>
            <p className="font-bold text-sm" style={{ color: badge.color }}>{badge.name}</p>
            <p className="text-xs text-muted-foreground">Level {levelData.level}</p>
          </div>
        </div>
        <div className="flex items-center gap-1 text-sm font-semibold text-yellow-500">
          <Coins className="h-4 w-4" />
          <span>{levelData.yat_coins.toFixed(4)}</span>
        </div>
      </div>
      <div className="space-y-1">
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{levelData.xp_total} XP</span>
          <span>Next: {levelData.level * 100} XP</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>
    </div>
  );
};
