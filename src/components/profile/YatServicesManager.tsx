import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import {
  Briefcase, GraduationCap, Radio, Tv, Calendar, Map, Coins, ShoppingBag, Globe, Sparkles, Loader2,
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { useLanguage } from '@/i18n/LanguageContext';
import { cn } from '@/lib/utils';

interface TalentPresence {
  id: string;
  section: string;
  is_active: boolean;
  visibility: string;
}

const SERVICES = [
  { key: 'work', label: 'YAT Work', icon: Briefcase, color: 'text-blue-500', bgColor: 'bg-blue-500/10' },
  { key: 'learning', label: 'YAT Learning', icon: GraduationCap, color: 'text-green-500', bgColor: 'bg-green-500/10' },
  { key: 'live', label: 'YAT Live', icon: Radio, color: 'text-red-500', bgColor: 'bg-red-500/10' },
  { key: 'tv', label: 'YAT TV', icon: Tv, color: 'text-purple-500', bgColor: 'bg-purple-500/10' },
  { key: 'events', label: 'YAT Events', icon: Calendar, color: 'text-orange-500', bgColor: 'bg-orange-500/10' },
  { key: 'karta', label: 'YAT Karta', icon: Map, color: 'text-teal-500', bgColor: 'bg-teal-500/10' },
  { key: 'yat-coin', label: 'YAT Coin', icon: Coins, color: 'text-yellow-500', bgColor: 'bg-yellow-500/10' },
  { key: 'marketplace', label: 'YAT Marketplace', icon: ShoppingBag, color: 'text-orange-600', bgColor: 'bg-orange-600/10' },
  { key: 'social', label: 'YAT Social', icon: Globe, color: 'text-indigo-500', bgColor: 'bg-indigo-500/10' },
];

export const YatServicesManager: React.FC = () => {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [presence, setPresence] = useState<TalentPresence[]>([]);
  const [busy, setBusy] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }
      const { data } = await supabase
        .from('talent_presence')
        .select('*')
        .eq('user_id', user.id);
      setPresence((data as TalentPresence[]) || []);
      setLoading(false);
    };
    load();
  }, []);

  const getPresence = (section: string) => presence.find((p) => p.section === section);

  const toggle = async (section: string, nextValue: boolean) => {
    setBusy(section);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setBusy(null); return; }
    const existing = getPresence(section);
    try {
      if (existing) {
        const { error } = await supabase
          .from('talent_presence')
          .update({ is_active: nextValue })
          .eq('id', existing.id);
        if (error) throw error;
        setPresence((p) => p.map((x) => x.id === existing.id ? { ...x, is_active: nextValue } : x));
      } else {
        const { data, error } = await supabase
          .from('talent_presence')
          .insert({ user_id: user.id, section, is_active: nextValue, visibility: 'public' })
          .select()
          .single();
        if (error) throw error;
        if (data) setPresence((p) => [...p, data as TalentPresence]);
      }
      toast({
        title: nextValue ? (t('services.activated') || 'Service activated') : (t('services.deactivated') || 'Service deactivated'),
      });
    } catch (e: any) {
      toast({ title: t('common.error') || 'Error', description: e.message, variant: 'destructive' });
    } finally {
      setBusy(null);
    }
  };

  const activeCount = presence.filter((p) => p.is_active).length;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          {t('services.title') || 'YAT Services'}
        </CardTitle>
        <CardDescription className="flex items-center gap-2">
          {t('services.description') || 'Activate or deactivate the YAT services you want to use.'}
          <Badge variant="secondary" className="ml-auto">
            {activeCount}/{SERVICES.length} {t('services.active') || 'active'}
          </Badge>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {loading ? (
          <div className="flex justify-center py-6"><Loader2 className="h-5 w-5 animate-spin text-primary" /></div>
        ) : (
          SERVICES.map((svc) => {
            const p = getPresence(svc.key);
            const isActive = !!p?.is_active;
            return (
              <div
                key={svc.key}
                className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-muted/40 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className={cn('p-2 rounded-md', svc.bgColor)}>
                    <svc.icon className={cn('h-4 w-4', svc.color)} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{svc.label}</p>
                    <p className={cn(
                      'text-xs',
                      isActive ? 'text-emerald-600' : 'text-muted-foreground'
                    )}>
                      {isActive ? (t('services.active') || 'active') : (t('services.inactive') || 'inactive')}
                    </p>
                  </div>
                </div>
                <Switch
                  checked={isActive}
                  disabled={busy === svc.key}
                  onCheckedChange={(v) => toggle(svc.key, v)}
                />
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
};

export default YatServicesManager;
