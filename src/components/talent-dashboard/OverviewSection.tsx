import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Briefcase, GraduationCap, Radio, Tv, Calendar, Map, Coins, ShoppingBag, Globe, ArrowRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/i18n/LanguageContext';

interface Presence { id: string; section: string; is_active: boolean; visibility: string }

const SECTIONS = [
  { key: 'work', label: 'YAT Work', icon: Briefcase, color: 'bg-blue-500/20 text-blue-600', route: '/work' },
  { key: 'learning', label: 'YAT Learning', icon: GraduationCap, color: 'bg-green-500/20 text-green-600', route: '/learning' },
  { key: 'live', label: 'YAT Live', icon: Radio, color: 'bg-red-500/20 text-red-600', route: '/live' },
  { key: 'tv', label: 'YAT TV', icon: Tv, color: 'bg-purple-500/20 text-purple-600', route: '/tv' },
  { key: 'events', label: 'YAT Events', icon: Calendar, color: 'bg-orange-500/20 text-orange-600', route: '/events' },
  { key: 'karta', label: 'YAT Karta', icon: Map, color: 'bg-teal-500/20 text-teal-600', route: '/karta' },
  { key: 'yat-coin', label: 'YAT Coin', icon: Coins, color: 'bg-yellow-500/20 text-yellow-600', route: '/yat-coin' },
  { key: 'marketplace', label: 'YAT Marketplace', icon: ShoppingBag, color: 'bg-orange-600/20 text-orange-700', route: '/marketplace' },
  { key: 'social', label: 'YAT Social', icon: Globe, color: 'bg-indigo-500/20 text-indigo-600', route: '/social' },
];

const OverviewSection: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [presence, setPresence] = useState<Presence[]>([]);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase.from('talent_presence').select('*').eq('user_id', user.id);
      if (data) setPresence(data as Presence[]);
    })();
  }, []);

  const getPresence = (key: string) => presence.find(p => p.section === key);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Vue d'ensemble de mes profils YAT</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {SECTIONS.map(s => {
            const p = getPresence(s.key);
            const active = !!p?.is_active;
            const Icon = s.icon;
            return (
              <div key={s.key} className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-muted/40 transition-colors">
                <div className={`p-2 rounded-md ${s.color}`}><Icon className="h-4 w-4" /></div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{s.label}</p>
                  <Badge variant={active ? 'default' : 'secondary'} className="mt-1 text-[10px]">
                    {active ? (t('profile.active') || 'Actif') : (t('profile.inactive') || 'Inactif')}
                  </Badge>
                </div>
                <Button size="icon" variant="ghost" onClick={() => navigate(s.route)}>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default OverviewSection;
