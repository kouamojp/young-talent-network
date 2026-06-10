import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trophy, Sparkles, ArrowRight, Loader2, RefreshCw, TrendingUp, CheckCircle2, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useYatScore } from '@/hooks/useYatScore';

interface Props {
  userId?: string;
  compact?: boolean;
  showAnalyzeButton?: boolean;
}

export const YatScoreCard = ({ userId, compact, showAnalyzeButton = true }: Props) => {
  const navigate = useNavigate();
  const { data, loading, refresh } = useYatScore(userId);

  if (loading && !data) {
    return (
      <Card className="p-4 flex items-center justify-center min-h-[120px]">
        <Loader2 className="h-5 w-5 animate-spin text-primary" />
      </Card>
    );
  }
  if (!data) return null;

  const tone = data.yat_score >= 80 ? 'text-emerald-500' : data.yat_score >= 50 ? 'text-amber-500' : 'text-rose-500';

  return (
    <Card className="p-4 space-y-4">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <Trophy className={`h-5 w-5 ${tone}`} />
          <div>
            <h3 className="font-semibold text-sm">YAT Score</h3>
            <p className="text-[11px] text-muted-foreground">Mesure de votre attractivité</p>
          </div>
        </div>
        <Button size="icon" variant="ghost" className="h-7 w-7" onClick={refresh} disabled={loading}>
          {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
        </Button>
      </div>

      <div className="space-y-1.5">
        <div className="flex items-baseline justify-between">
          <span className={`text-3xl font-bold ${tone}`}>{data.yat_score}<span className="text-base text-muted-foreground">/100</span></span>
          <Badge variant="outline" className="text-[10px]">Profil {data.profile_completion}%</Badge>
        </div>
        <Progress value={data.yat_score} className="h-2" />
        <p className="text-xs text-muted-foreground">{data.summary}</p>
      </div>

      {!compact && (
        <div className="space-y-1.5">
          <p className="text-xs font-semibold flex items-center gap-1"><Sparkles className="h-3.5 w-3.5 text-primary" /> Détail du score</p>
          {Object.entries(data.breakdown).map(([key, b]) => (
            <div key={key} className="space-y-1">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-muted-foreground">{b.label}</span>
                <span className="font-medium">{b.score}/{b.max} <span className="text-muted-foreground">· {b.value}</span></span>
              </div>
              <Progress value={(b.score / b.max) * 100} className="h-1" />
            </div>
          ))}
        </div>
      )}

      {data.improvements.length > 0 && (
        <div className="space-y-1 p-2 rounded-lg bg-amber-500/5 border border-amber-500/20">
          <p className="text-xs font-semibold flex items-center gap-1 text-amber-700 dark:text-amber-400">
            <AlertCircle className="h-3.5 w-3.5" /> À améliorer
          </p>
          {data.improvements.slice(0, 3).map(s => (
            <div key={s} className="text-[11px] text-muted-foreground">→ {s}</div>
          ))}
        </div>
      )}

      {data.strengths.length > 0 && !compact && (
        <div className="space-y-1 p-2 rounded-lg bg-emerald-500/5 border border-emerald-500/20">
          <p className="text-xs font-semibold flex items-center gap-1 text-emerald-700 dark:text-emerald-400">
            <CheckCircle2 className="h-3.5 w-3.5" /> Vos forces
          </p>
          {data.strengths.slice(0, 3).map(s => (
            <div key={s} className="text-[11px] text-muted-foreground">✓ {s}</div>
          ))}
        </div>
      )}

      {data.tips.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-xs font-semibold flex items-center gap-1"><TrendingUp className="h-3.5 w-3.5 text-primary" /> Conseils ciblés</p>
          {data.tips.slice(0, compact ? 2 : 4).map((t, i) => (
            <button
              key={i}
              onClick={() => t.action_link && navigate(t.action_link)}
              className="w-full text-left text-[11px] flex items-start gap-2 p-2 rounded-md hover:bg-muted/50 transition-colors group"
            >
              <span className="flex-1">{t.tip}</span>
              {t.gain > 0 && <Badge variant="outline" className="text-[9px] shrink-0">+{t.gain}pts</Badge>}
              {t.action_link && <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition" />}
            </button>
          ))}
        </div>
      )}

      {showAnalyzeButton && (
        <Button size="sm" variant="outline" className="w-full" onClick={() => navigate('/assistant')}>
          <Sparkles className="h-3.5 w-3.5 mr-2" /> Analyser mon profil avec l'IA
        </Button>
      )}
    </Card>
  );
};

export default YatScoreCard;
