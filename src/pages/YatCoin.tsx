import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Coins, Heart, Loader2, PenLine } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { getLevelBadge, getXpProgress, useUserLevel } from '@/hooks/useUserLevel';

interface CoinTransaction {
  id: string;
  reason: string | null;
  amount: number;
  xp_earned: number | null;
  created_at: string;
}

/**
 * Solde et historique réels de YAT Coin. Les coins se gagnent en publiant et
 * en recevant des likes (table coin_transactions).
 */
const YatCoin: React.FC = () => {
  const navigate = useNavigate();
  const [userId, setUserId] = useState<string | null | undefined>(undefined);
  const [history, setHistory] = useState<CoinTransaction[]>([]);
  const { levelData } = useUserLevel(userId);

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      setUserId(user?.id ?? null);
      if (!user) return;
      const { data } = await supabase
        .from('coin_transactions')
        .select('id, reason, amount, xp_earned, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);
      setHistory((data as CoinTransaction[] | null) ?? []);
    });
  }, []);

  if (userId === undefined) {
    return <div className="flex justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;
  }

  if (userId === null) {
    return (
      <main className="max-w-xl mx-auto px-4 py-16 text-center">
        <Coins className="mx-auto h-10 w-10 text-gold" />
        <h1 className="mt-4 text-2xl font-semibold">YAT Coin</h1>
        <p className="mt-2 text-muted-foreground">Connectez-vous pour voir votre solde et vos gains.</p>
        <Button className="mt-6" onClick={() => navigate('/auth')}>Se connecter</Button>
      </main>
    );
  }

  const badge = levelData ? getLevelBadge(levelData.level) : null;

  return (
    <div className="min-h-screen">
      <main className="max-w-3xl mx-auto px-4 py-6 md:py-8 space-y-6">
        <section className="relative overflow-hidden rounded-xl bg-stage text-stage-foreground p-6 md:p-8">
          <div
            aria-hidden
            className="pointer-events-none absolute -top-40 -left-24 h-[420px] w-[620px] rounded-full opacity-60"
            style={{ background: 'radial-gradient(closest-side, hsl(var(--primary) / 0.55), transparent)' }}
          />
          <div className="relative">
            <p className="text-sm text-white/65">Votre solde</p>
            <p className="mt-1 flex items-center gap-3 font-display text-4xl md:text-5xl font-semibold tabular-nums text-gold">
              <Coins className="h-9 w-9 shrink-0" />
              {levelData ? levelData.yat_coins.toFixed(4) : '–'}
            </p>
            <p className="mt-3 max-w-md text-sm text-white/65">
              Vous gagnez des YAT Coins et de l'expérience à chaque publication et à chaque like reçu.
            </p>
            {levelData && badge && (
              <div className="mt-6 max-w-md">
                <div className="flex justify-between text-sm">
                  <span className="text-white">{badge.icon} {badge.name} · niveau {levelData.level}</span>
                  <span className="text-white/65 tabular-nums">{levelData.xp_total} / {levelData.level * 100} XP</span>
                </div>
                <Progress value={getXpProgress(levelData.xp_total, levelData.level)} className="mt-2 h-2 bg-white/15" />
              </div>
            )}
          </div>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-3">Historique</h2>
          {history.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border p-8 text-center">
              <p className="text-sm text-muted-foreground">Aucun gain pour l'instant. Publiez quelque chose pour gagner vos premiers YAT Coins.</p>
              <Button className="mt-4" variant="outline" onClick={() => navigate('/feed')}>Aller au fil</Button>
            </div>
          ) : (
            <ul className="rounded-xl border border-border bg-card divide-y divide-border">
              {history.map(tx => (
                <li key={tx.id} className="flex items-center gap-3 px-4 py-3 text-sm">
                  {tx.reason === 'post'
                    ? <PenLine className="h-4 w-4 shrink-0 text-primary" />
                    : <Heart className="h-4 w-4 shrink-0 text-destructive" />}
                  <span className="min-w-0 flex-1">
                    <span className="block font-medium">{tx.reason === 'post' ? 'Publication' : 'Like reçu'}</span>
                    <span className="block text-xs text-muted-foreground">{new Date(tx.created_at).toLocaleDateString()}</span>
                  </span>
                  {!!tx.xp_earned && <span className="text-xs text-muted-foreground tabular-nums">+{tx.xp_earned} XP</span>}
                  <span className="font-semibold text-gold tabular-nums">+{Number(tx.amount).toFixed(4)}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </div>
  );
};

export default YatCoin;
