import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { tr } from '@/i18n';

export interface UserLevel {
  level: number;
  xp_total: number;
  yat_coins: number;
  card_background: string;
}

const LEVEL_BADGES: Record<number, { name: string; icon: string; color: string }> = {
  1: { name: tr('useUserLevel.newcomer'), icon: '🌱', color: '#4ade80' },
  2: { name: tr('common.explore'), icon: '🧭', color: '#60a5fa' },
  3: { name: tr('useUserLevel.creator'), icon: '✨', color: '#a78bfa' },
  5: { name: tr('useUserLevel.risingStar'), icon: '⭐', color: '#facc15' },
  10: { name: tr('useUserLevel.influencer'), icon: '🔥', color: '#f97316' },
  15: { name: tr('useUserLevel.legend'), icon: '👑', color: '#ef4444' },
  20: { name: tr('useUserLevel.master'), icon: '💎', color: '#06b6d4' },
  25: { name: tr('useUserLevel.champion'), icon: '🏆', color: '#eab308' },
  50: { name: tr('useUserLevel.icon'), icon: '🌟', color: '#f59e0b' },
};

export const getLevelBadge = (level: number) => {
  const keys = Object.keys(LEVEL_BADGES).map(Number).sort((a, b) => b - a);
  for (const key of keys) {
    if (level >= key) return LEVEL_BADGES[key];
  }
  return LEVEL_BADGES[1];
};

export const getXpForLevel = (level: number) => (level - 1) * 100;
export const getXpForNextLevel = (level: number) => level * 100;
export const getXpProgress = (xp: number, level: number) => {
  const currentLevelXp = getXpForLevel(level);
  const nextLevelXp = getXpForNextLevel(level);
  return ((xp - currentLevelXp) / (nextLevelXp - currentLevelXp)) * 100;
};

export const useUserLevel = (userId?: string | null) => {
  const [levelData, setLevelData] = useState<UserLevel | null>(null);
  const [loading, setLoading] = useState(true);
  const prevLevelRef = useRef<number | null>(null);

  const fetchLevel = async () => {
    if (!userId) return;
    const { data } = await supabase
      .from('user_levels')
      .select('level, xp_total, yat_coins, card_background')
      .eq('user_id', userId)
      .single();

    if (data) {
      const d = data as any;
      const newLevel = d.level as number;
      if (prevLevelRef.current !== null && newLevel > prevLevelRef.current) {
        const badge = getLevelBadge(newLevel);
        toast.success(tr('useUserLevel.levelUpYouReachedLevel', { p0: badge.icon, p1: newLevel }), {
          description: tr('useUserLevel.badgeKeepGoing', { p0: badge.name }),
          duration: 5000,
        });
      }
      prevLevelRef.current = newLevel;
      setLevelData({
        level: d.level,
        xp_total: d.xp_total,
        yat_coins: Number(d.yat_coins),
        card_background: d.card_background,
      });
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchLevel();
    if (!userId) return;
    const channel = supabase
      .channel(`user-level-${userId}`)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'user_levels', filter: `user_id=eq.${userId}` }, () => fetchLevel())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [userId]);

  return { levelData, loading, refetch: fetchLevel };
};
