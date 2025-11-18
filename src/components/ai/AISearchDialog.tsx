import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Loader2, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface AISearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const AISearchDialog = ({ open, onOpenChange }: AISearchDialogProps) => {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any>(null);
  const { toast } = useToast();

  const handleSearch = async () => {
    if (!query.trim()) return;
    
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase.functions.invoke('ai-search', {
        body: { query, context: {} }
      });

      if (error) throw error;

      const parsedResults = JSON.parse(data.result);
      setResults(parsedResults);

      // Save to history
      await supabase.from('ai_search_history').insert({
        query,
        results: parsedResults,
        user_id: user.id
      });
    } catch (error: any) {
      toast({
        title: "Search failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            AI Smart Search
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="flex gap-2">
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask anything... Find users, events, jobs, or get recommendations"
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
            <Button onClick={handleSearch} disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
            </Button>
          </div>

          {results && (
            <div className="space-y-4">
              <div className="p-4 bg-secondary/20 rounded-lg">
                <h3 className="font-semibold mb-2">Summary</h3>
                <p className="text-sm text-muted-foreground">{results.summary}</p>
              </div>

              {results.suggestions && results.suggestions.length > 0 && (
                <div className="p-4 border rounded-lg">
                  <h3 className="font-semibold mb-2">Suggestions</h3>
                  <ul className="space-y-1">
                    {results.suggestions.map((suggestion: string, i: number) => (
                      <li key={i} className="text-sm">• {suggestion}</li>
                    ))}
                  </ul>
                </div>
              )}

              {results.links && results.links.length > 0 && (
                <div className="p-4 border rounded-lg">
                  <h3 className="font-semibold mb-2">Recommended Links</h3>
                  <div className="space-y-2">
                    {results.links.map((link: any, i: number) => (
                      <a
                        key={i}
                        href={link.path}
                        className="block p-2 hover:bg-secondary/20 rounded transition-colors"
                      >
                        <div className="font-medium text-sm">{link.title}</div>
                        <div className="text-xs text-muted-foreground">{link.description}</div>
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {results.categories && results.categories.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {results.categories.map((cat: string, i: number) => (
                    <span key={i} className="px-3 py-1 bg-primary/10 text-primary text-xs rounded-full">
                      {cat}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};