import { useState, useEffect } from "react";
import { Sparkles, ArrowRight, X, RefreshCw, TrendingUp, Lightbulb, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

interface Suggestion {
  id?: string;
  suggestion_type: string;
  title: string;
  description: string;
  action_link?: string;
  action_data?: any;
  dismissed?: boolean;
}

interface PlatformInsights {
  trending: string;
  growth: string;
  tip: string;
}

export const AgentSuggestionsWidget = () => {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [insights, setInsights] = useState<PlatformInsights | null>(null);
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        loadSuggestions(user.id);
      }
    };
    init();
  }, []);

  const loadSuggestions = async (uid: string) => {
    const { data } = await supabase
      .from('agent_suggestions')
      .select('*')
      .eq('user_id', uid)
      .eq('dismissed', false)
      .order('created_at', { ascending: false })
      .limit(6);
    if (data?.length) setSuggestions(data as any);
  };

  const refreshSuggestions = async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { toast({ title: "Connectez-vous", variant: "destructive" }); return; }

      const { data, error } = await supabase.functions.invoke('ai-agent', {});
      if (error) throw error;

      if (data.suggestions) setSuggestions(data.suggestions.map((s: any) => ({ ...s, id: crypto.randomUUID() })));
      if (data.platform_insights) setInsights(data.platform_insights);
      
      // Reload from DB
      if (userId) setTimeout(() => loadSuggestions(userId), 1000);
    } catch (err: any) {
      toast({ title: "Erreur agent", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const dismissSuggestion = async (suggestion: Suggestion) => {
    if (suggestion.id) {
      await supabase.from('agent_suggestions').update({ dismissed: true }).eq('id', suggestion.id);
    }
    setSuggestions(prev => prev.filter(s => s !== suggestion));
  };

  const typeColors: Record<string, string> = {
    event: "bg-blue-500/10 text-blue-500",
    job: "bg-green-500/10 text-green-500",
    connection: "bg-purple-500/10 text-purple-500",
    learning: "bg-orange-500/10 text-orange-500",
    profile: "bg-yellow-500/10 text-yellow-500",
    community: "bg-pink-500/10 text-pink-500",
    general: "bg-muted text-muted-foreground",
  };

  if (!userId) return null;

  return (
    <Card className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <h3 className="font-semibold text-sm">Agent YAT</h3>
        </div>
        <Button variant="ghost" size="sm" onClick={refreshSuggestions} disabled={loading}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
        </Button>
      </div>

      {/* Insights */}
      {insights && (
        <div className="space-y-2 p-3 bg-gradient-to-r from-primary/5 to-accent/5 rounded-lg">
          {insights.trending && (
            <div className="flex items-start gap-2 text-xs">
              <TrendingUp className="h-3.5 w-3.5 mt-0.5 text-primary shrink-0" />
              <span>{insights.trending}</span>
            </div>
          )}
          {insights.tip && (
            <div className="flex items-start gap-2 text-xs">
              <Lightbulb className="h-3.5 w-3.5 mt-0.5 text-yellow-500 shrink-0" />
              <span>{insights.tip}</span>
            </div>
          )}
        </div>
      )}

      {/* Suggestions */}
      {suggestions.length === 0 && !loading && (
        <div className="text-center py-4 text-sm text-muted-foreground">
          <p>Cliquez sur actualiser pour obtenir des suggestions personnalisées</p>
        </div>
      )}

      <div className="space-y-2">
        {suggestions.map((s, i) => (
          <div key={i} className="flex items-start gap-2 p-2 rounded-lg hover:bg-muted/50 group transition-colors">
            <Badge variant="outline" className={`text-[10px] shrink-0 ${typeColors[s.suggestion_type] || typeColors.general}`}>
              {s.suggestion_type}
            </Badge>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium truncate">{s.title}</p>
              <p className="text-[11px] text-muted-foreground line-clamp-2">{s.description}</p>
            </div>
            <div className="flex shrink-0 gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              {s.action_link && (
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => navigate(s.action_link!)}>
                  <ArrowRight className="h-3 w-3" />
                </Button>
              )}
              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => dismissSuggestion(s)}>
                <X className="h-3 w-3" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};
