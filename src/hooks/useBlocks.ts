import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { tr } from '@/i18n';

/**
 * Users the signed-in user has blocked. A block (either direction) stops all
 * private messages; it is enforced in the database (messages policy).
 */
export const useBlocks = () => {
  const [blockedIds, setBlockedIds] = useState<Set<string>>(new Set());
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async (uid: string) => {
    const { data } = await (supabase.from as any)('user_blocks').select('blocked_id').eq('blocker_id', uid);
    setBlockedIds(new Set((data || []).map((r: { blocked_id: string }) => r.blocked_id)));
    setLoading(false);
  }, []);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUserId(user?.id ?? null);
      if (user) refresh(user.id);
      else setLoading(false);
    });
  }, [refresh]);

  const block = useCallback(async (targetId: string, name?: string) => {
    if (!userId) return false;
    const { error } = await (supabase.from as any)('user_blocks').insert({ blocker_id: userId, blocked_id: targetId });
    if (error && error.code !== '23505') {
      toast({ title: tr('useBlocks.couldNotBlock'), description: error.message, variant: 'destructive' });
      return false;
    }
    setBlockedIds(prev => new Set(prev).add(targetId));
    toast({ title: tr('useBlocks.isBlocked', { p0: name || 'Ce membre' }), description: tr('useBlocks.theyCanNoLongerMessageYou') });
    return true;
  }, [userId]);

  const unblock = useCallback(async (targetId: string, name?: string) => {
    if (!userId) return false;
    const { error } = await (supabase.from as any)('user_blocks').delete().eq('blocker_id', userId).eq('blocked_id', targetId);
    if (error) {
      toast({ title: tr('useBlocks.couldNotUnblock'), description: error.message, variant: 'destructive' });
      return false;
    }
    setBlockedIds(prev => { const next = new Set(prev); next.delete(targetId); return next; });
    toast({ title: tr('useBlocks.isUnblocked', { p0: name || 'Ce membre' }) });
    return true;
  }, [userId]);

  return { userId, blockedIds, isBlocked: (id: string) => blockedIds.has(id), block, unblock, loading };
};
