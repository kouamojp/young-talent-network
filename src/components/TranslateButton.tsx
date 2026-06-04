import React, { useState } from 'react';
import { Languages, Loader2, Check } from 'lucide-react';
import { Button } from './ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuLabel, DropdownMenuSeparator } from './ui/dropdown-menu';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const TRANSLATE_LANGUAGES = [
  { code: 'auto', label: 'Auto-détection', flag: '🌐' },
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
  { code: 'ru', label: 'Русский', flag: '🇷🇺' },
  { code: 'es', label: 'Español', flag: '🇪🇸' },
  { code: 'ar', label: 'العربية', flag: '🇸🇦' },
  { code: 'pt', label: 'Português', flag: '🇵🇹' },
  { code: 'zh', label: '中文', flag: '🇨🇳' },
];

interface Props {
  text: string;
  onTranslated: (translated: string | null, lang: string | null) => void;
  currentLang?: string | null;
  size?: 'sm' | 'xs';
  variant?: 'ghost' | 'outline' | 'link';
  label?: string;
}

const TranslateButton: React.FC<Props> = ({ text, onTranslated, currentLang, size = 'xs', variant = 'ghost', label }) => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const translate = async (target: string) => {
    if (loading || !text?.trim()) return;
    if (currentLang === target) {
      onTranslated(null, null);
      return;
    }
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const resp = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/translate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.access_token || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
        },
        body: JSON.stringify({ text, target }),
      });
      const json = await resp.json();
      if (!resp.ok) throw new Error(json.error || 'Erreur traduction');
      onTranslated(json.translated, target);
    } catch (e: any) {
      toast({ title: 'Traduction échouée', description: e.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant={variant}
          size="sm"
          className={size === 'xs' ? 'h-7 px-2 text-xs gap-1' : 'gap-1'}
          disabled={loading}
        >
          {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Languages className="h-3 w-3" />}
          {label || (currentLang ? 'Traduit' : 'Traduire')}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        <DropdownMenuLabel className="text-xs">Traduire vers</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {TRANSLATE_LANGUAGES.map(l => (
          <DropdownMenuItem key={l.code} onClick={() => translate(l.code)} className="text-sm">
            <span className="mr-2">{l.flag}</span>
            <span className="flex-1">{l.label}</span>
            {currentLang === l.code && <Check className="h-3 w-3 text-primary" />}
          </DropdownMenuItem>
        ))}
        {currentLang && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onTranslated(null, null)} className="text-sm text-muted-foreground">
              Voir l'original
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default TranslateButton;
