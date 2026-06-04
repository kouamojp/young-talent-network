import { useState, useRef, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { MessageCircle, X, Send, Loader2, Sparkles, Briefcase, UserPlus, Edit3, TrendingUp, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import ReactMarkdown from "react-markdown";

interface Message {
  role: "user" | "assistant";
  content: string;
}

type Mode = 'chat' | 'compose-post' | 'compose-message' | 'profile-tips';

const QUICK_ACTIONS: { icon: any; label: string; prompt: string; mode: Mode }[] = [
  { icon: Briefcase, label: "Trouver des opportunités", prompt: "Quelles sont les meilleures opportunités (emplois, événements, formations) qui matchent mon profil ?", mode: 'chat' },
  { icon: UserPlus, label: "Suggestions de réseau", prompt: "Recommande-moi des personnes, organisations, agents et mentors à contacter avec un score de compatibilité.", mode: 'chat' },
  { icon: TrendingUp, label: "Améliorer mon YAT Score", prompt: "Analyse mon profil et donne-moi un plan d'action pour augmenter mon YAT Score et ma visibilité.", mode: 'profile-tips' },
  { icon: Edit3, label: "Rédiger un post", prompt: "Aide-moi à rédiger un post engageant. Voici l'idée : ", mode: 'compose-post' },
  { icon: MessageCircle, label: "Message networking", prompt: "Rédige-moi un message professionnel d'approche pour : ", mode: 'compose-message' },
  { icon: Calendar, label: "Événements à venir", prompt: "Quels événements correspondent à mon talent et ma localisation ?", mode: 'chat' },
];

export const AIAssistantChat = ({ fullPage = false }: { fullPage?: boolean }) => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<Mode>('chat');
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const location = useLocation();
  const hideFloating = !fullPage && location.pathname.startsWith('/messages');

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (overrideText?: string, overrideMode?: Mode) => {
    const text = (overrideText ?? input).trim();
    if (!text || loading) return;
    const useMode = overrideMode ?? mode;
    const userMsg: Message = { role: "user", content: text };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    let assistantContent = "";

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({ title: "Connectez-vous d'abord", variant: "destructive" });
        setLoading(false);
        return;
      }

      const resp = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-assistant`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
          apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
        },
        body: JSON.stringify({ messages: newMessages, mode: useMode }),
      });

      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}));
        throw new Error(err.error || "Error");
      }

      const reader = resp.body?.getReader();
      if (!reader) throw new Error("No stream");
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        let idx: number;
        while ((idx = buffer.indexOf("\n")) !== -1) {
          let line = buffer.slice(0, idx);
          buffer = buffer.slice(idx + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (!line.startsWith("data: ")) continue;
          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") break;
          try {
            const parsed = JSON.parse(jsonStr);
            const delta = parsed.choices?.[0]?.delta?.content;
            if (delta) {
              assistantContent += delta;
              setMessages(prev => {
                const last = prev[prev.length - 1];
                if (last?.role === "assistant") {
                  return prev.map((m, i) => i === prev.length - 1 ? { ...m, content: assistantContent } : m);
                }
                return [...prev, { role: "assistant", content: assistantContent }];
              });
            }
          } catch {}
        }
      }
    } catch (err: any) {
      toast({ title: "Erreur", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const handleQuickAction = (action: typeof QUICK_ACTIONS[0]) => {
    setMode(action.mode);
    if (action.mode === 'compose-post' || action.mode === 'compose-message') {
      setInput(action.prompt);
      inputRef.current?.focus();
    } else {
      sendMessage(action.prompt, action.mode);
    }
  };

  const chatContent = (
    <div className={`flex flex-col ${fullPage ? 'h-[calc(100vh-8rem)]' : 'h-[560px]'}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b bg-gradient-to-r from-primary/10 to-accent/10">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <div>
            <div className="font-semibold text-sm">YAT AI Assistant</div>
            <div className="text-[10px] text-muted-foreground">Talent advisor • Networking • Opportunities</div>
          </div>
        </div>
        {!fullPage && (
          <Button variant="ghost" size="icon" onClick={() => setOpen(false)} className="h-7 w-7">
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-3">
        {messages.length === 0 && (
          <div className="space-y-3">
            <div className="text-center text-sm py-2 space-y-1">
              <Sparkles className="h-7 w-7 mx-auto text-primary/50" />
              <p className="font-medium">Bonjour 👋 Je suis votre coach YAT.</p>
              <p className="text-xs text-muted-foreground">Opportunités, réseau, profil, posts, messages : choisissez une action.</p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {QUICK_ACTIONS.map((a, i) => (
                <button
                  key={i}
                  onClick={() => handleQuickAction(a)}
                  className="flex items-start gap-2 p-2 rounded-lg border bg-card hover:bg-muted/50 text-left transition-colors"
                >
                  <a.icon className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  <span className="text-[11px] font-medium leading-tight">{a.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}
        {messages.map((msg, i) => (
          <div key={i} className={`mb-3 flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
              {msg.role === 'assistant' ? (
                <div className="prose prose-sm dark:prose-invert max-w-none [&>p]:mb-1 [&>ul]:mb-1 [&_a]:text-primary">
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                </div>
              ) : msg.content}
            </div>
          </div>
        ))}
        {loading && messages[messages.length - 1]?.role !== 'assistant' && (
          <div className="flex justify-start mb-3">
            <div className="bg-muted rounded-lg px-3 py-2">
              <Loader2 className="h-4 w-4 animate-spin" />
            </div>
          </div>
        )}
        <div ref={scrollRef} />
      </ScrollArea>

      {/* Mode indicator */}
      {mode !== 'chat' && messages.length > 0 && (
        <div className="px-3 py-1 border-t bg-primary/5 flex items-center justify-between">
          <span className="text-[10px] text-primary font-medium">
            Mode : {mode === 'compose-post' ? '✏️ Rédaction post' : mode === 'compose-message' ? '💬 Message pro' : '📊 Conseils profil'}
          </span>
          <button onClick={() => setMode('chat')} className="text-[10px] text-muted-foreground hover:text-foreground">Retour chat</button>
        </div>
      )}

      {/* Input */}
      <div className="p-3 border-t">
        <form onSubmit={(e) => { e.preventDefault(); sendMessage(); }} className="flex gap-2">
          <Input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Posez votre question..."
            className="text-sm"
            disabled={loading}
          />
          <Button type="submit" size="icon" disabled={loading || !input.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  );

  if (fullPage) return chatContent;
  if (hideFloating) return null;

  return (
    <>
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-20 md:bottom-6 right-20 z-50 h-12 w-12 rounded-full bg-gradient-to-br from-primary to-accent text-primary-foreground shadow-lg flex items-center justify-center hover:scale-105 transition-transform"
          aria-label="Ouvrir YAT AI Assistant"
        >
          <Sparkles className="h-6 w-6" />
        </button>
      )}

      {open && (
        <div className="fixed bottom-20 md:bottom-20 right-4 z-50 w-[380px] max-w-[calc(100vw-2rem)] bg-card border rounded-xl shadow-2xl overflow-hidden">
          {chatContent}
        </div>
      )}
    </>
  );
};
