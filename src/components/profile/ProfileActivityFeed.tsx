import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { Calendar, GraduationCap, Briefcase, Radio, ShoppingBag, Image as ImageIcon, MapPin } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface Props {
  userIds: string[];
  /** Optional label override for the section */
  title?: string;
  /** Max items per category to fetch */
  limit?: number;
}

type Activity = {
  id: string;
  kind: 'event' | 'course' | 'job' | 'live' | 'listing' | 'media';
  title: string;
  subtitle?: string | null;
  date: string;
  link: string;
  badge?: string;
  user_id?: string;
};

const ICONS: Record<Activity['kind'], React.ElementType> = {
  event: Calendar,
  course: GraduationCap,
  job: Briefcase,
  live: Radio,
  listing: ShoppingBag,
  media: ImageIcon,
};

const KIND_LABEL: Record<Activity['kind'], string> = {
  event: 'Événement',
  course: 'Cours',
  job: 'Offre',
  live: 'LIVE',
  listing: 'Marketplace',
  media: 'Média',
};

const KIND_COLOR: Record<Activity['kind'], string> = {
  event: 'bg-blue-500/10 text-blue-600 border-blue-500/30',
  course: 'bg-purple-500/10 text-purple-600 border-purple-500/30',
  job: 'bg-amber-500/10 text-amber-600 border-amber-500/30',
  live: 'bg-red-500/10 text-red-600 border-red-500/30',
  listing: 'bg-green-500/10 text-green-600 border-green-500/30',
  media: 'bg-pink-500/10 text-pink-600 border-pink-500/30',
};

export const ProfileActivityFeed: React.FC<Props> = ({ userIds, title = 'Activités', limit = 5 }) => {
  const navigate = useNavigate();
  const [items, setItems] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userIds || userIds.length === 0) {
      setItems([]);
      setLoading(false);
      return;
    }
    loadAll();
  }, [JSON.stringify(userIds)]);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [evRes, coRes, jobRes, liveRes, mkRes, mdRes] = await Promise.all([
        supabase.from('events').select('id, title, location, start_date, organizer_id').in('organizer_id', userIds).order('start_date', { ascending: false }).limit(limit),
        supabase.from('courses').select('id, title, category, created_at, instructor_id').in('instructor_id', userIds).order('created_at', { ascending: false }).limit(limit),
        supabase.from('job_postings').select('id, title, location, created_at, organization_id').in('organization_id', userIds).order('created_at', { ascending: false }).limit(limit),
        supabase.from('live_streams').select('id, title, category, started_at, created_at, streamer_id').in('streamer_id', userIds).order('created_at', { ascending: false }).limit(limit),
        supabase.from('marketplace_listings').select('id, title, category, price, currency, created_at, user_id').in('user_id', userIds).eq('status', 'active').order('created_at', { ascending: false }).limit(limit),
        supabase.from('talent_media').select('id, title, media_type, created_at, user_id').in('user_id', userIds).order('created_at', { ascending: false }).limit(limit),
      ]);

      const merged: Activity[] = [
        ...(evRes.data || []).map((e: any) => ({ id: `ev-${e.id}`, kind: 'event' as const, title: e.title, subtitle: e.location, date: e.start_date, link: `/events`, user_id: e.organizer_id })),
        ...(coRes.data || []).map((c: any) => ({ id: `co-${c.id}`, kind: 'course' as const, title: c.title, subtitle: c.category, date: c.created_at, link: `/learning`, user_id: c.instructor_id })),
        ...(jobRes.data || []).map((j: any) => ({ id: `jo-${j.id}`, kind: 'job' as const, title: j.title, subtitle: j.location, date: j.created_at, link: `/work`, user_id: j.organization_id })),
        ...(liveRes.data || []).map((l: any) => ({ id: `li-${l.id}`, kind: 'live' as const, title: l.title, subtitle: l.category, date: l.started_at || l.created_at, link: `/live`, user_id: l.streamer_id })),
        ...(mkRes.data || []).map((m: any) => ({ id: `mk-${m.id}`, kind: 'listing' as const, title: m.title, subtitle: m.price ? `${m.price} ${m.currency || ''}` : m.category, date: m.created_at, link: `/marketplace`, user_id: m.user_id })),
        ...(mdRes.data || []).map((m: any) => ({ id: `md-${m.id}`, kind: 'media' as const, title: m.title || m.media_type, subtitle: m.media_type, date: m.created_at, link: `/media`, user_id: m.user_id })),
      ];

      merged.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setItems(merged.slice(0, 20));
    } catch (e) {
      console.error('Activity load error', e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 text-center text-sm text-muted-foreground">Chargement des activités…</div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="p-6 text-center text-sm text-muted-foreground">Aucune activité publique dans les autres sections.</div>
    );
  }

  return (
    <div className="divide-y divide-border/40">
      {items.map((it) => {
        const Icon = ICONS[it.kind];
        return (
          <button
            key={it.id}
            onClick={() => navigate(it.link)}
            className="w-full flex items-start gap-3 p-3 text-left hover:bg-muted/40 transition-colors"
          >
            <div className={`shrink-0 h-9 w-9 rounded-lg border flex items-center justify-center ${KIND_COLOR[it.kind]}`}>
              <Icon className="h-4 w-4" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="outline" className="text-[10px] py-0">{KIND_LABEL[it.kind]}</Badge>
                <p className="text-sm font-semibold text-foreground truncate">{it.title}</p>
              </div>
              {it.subtitle && (
                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                  {it.kind === 'event' && <MapPin className="h-3 w-3" />}
                  <span className="truncate">{it.subtitle}</span>
                </p>
              )}
              <p className="text-[10px] text-muted-foreground mt-0.5">
                {it.date ? new Date(it.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' }) : ''}
              </p>
            </div>
          </button>
        );
      })}
    </div>
  );
};

export default ProfileActivityFeed;
