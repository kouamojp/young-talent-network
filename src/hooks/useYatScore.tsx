import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface YatScoreBreakdownItem {
  score: number;
  max: number;
  label: string;
  value: string;
}

export interface YatScoreTip {
  tip: string;
  gain: number;
  action_link?: string;
}

export interface YatScoreData {
  yat_score: number;
  profile_completion: number;
  breakdown: Record<string, YatScoreBreakdownItem>;
  strengths: string[];
  improvements: string[];
  tips: YatScoreTip[];
  summary: string;
  suggested_token_price: number;
}

export function useYatScore(userId?: string) {
  const [data, setData] = useState<YatScoreData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchScore = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const path = userId ? `yat-score?user_id=${userId}` : 'yat-score';
      const { data: res, error: err } = await supabase.functions.invoke(path);
      if (err) throw err;
      setData(res as YatScoreData);
    } catch (e: any) {
      setError(e.message || 'Erreur YAT Score');
    } finally { setLoading(false); }
  }, [userId]);

  useEffect(() => { fetchScore(); }, [fetchScore]);

  return { data, loading, error, refresh: fetchScore };
}
