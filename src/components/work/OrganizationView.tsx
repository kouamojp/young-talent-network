import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, MapPin, Users } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';

interface TalentProfile {
  id: string;
  name: string | null;
  avatar_url: string | null;
  professional_title: string | null;
  sport_type: string | null;
  bio: string | null;
  city: string | null;
  country: string | null;
  availability: string | null;
}

/** Talents inscrits, pour les organisations qui recrutent. */
const OrganizationView: React.FC<{ searchTerm?: string }> = ({ searchTerm = '' }) => {
  const navigate = useNavigate();
  const [talents, setTalents] = useState<TalentProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from('profiles')
      .select('id, name, avatar_url, professional_title, sport_type, bio, city, country, availability')
      .eq('user_type', 'talent')
      .order('platform_rating', { ascending: false, nullsFirst: false })
      .limit(50)
      .then(({ data }) => {
        setTalents((data as TalentProfile[] | null) ?? []);
        setLoading(false);
      });
  }, []);

  const query = searchTerm.toLowerCase();
  const visible = talents.filter(t => [t.name, t.professional_title, t.sport_type, t.city, t.country].some(v => v?.toLowerCase().includes(query)));

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;

  if (visible.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border p-10 text-center">
        <Users className="mx-auto h-8 w-8 text-muted-foreground/50" />
        <p className="mt-3 text-sm text-muted-foreground">
          {talents.length === 0 ? 'Aucun talent inscrit pour le moment.' : 'Aucun talent ne correspond à cette recherche.'}
        </p>
      </div>
    );
  }

  return (
    <ul className="rounded-xl border border-border bg-card divide-y divide-border">
      {visible.map(talent => {
        const place = [talent.city, talent.country].filter(Boolean).join(', ');
        return (
          <li key={talent.id}>
            <button type="button" onClick={() => navigate(`/talent/${talent.id}`)} className="flex w-full gap-4 p-4 text-left hover:bg-muted/60 transition-colors">
              <Avatar className="h-12 w-12 shrink-0">
                <AvatarImage src={talent.avatar_url || ''} />
                <AvatarFallback>{talent.name?.charAt(0) || '?'}</AvatarFallback>
              </Avatar>
              <span className="min-w-0 flex-1">
                <span className="flex flex-wrap items-center gap-2">
                  <span className="font-semibold break-words">{talent.name || 'Sans nom'}</span>
                  {talent.availability && <Badge variant="secondary">{talent.availability}</Badge>}
                </span>
                {(talent.professional_title || talent.sport_type) && (
                  <span className="block truncate text-sm text-muted-foreground">{talent.professional_title || talent.sport_type}</span>
                )}
                {talent.bio && <span className="mt-1 block text-sm line-clamp-2 break-words">{talent.bio}</span>}
                {place && (
                  <span className="mt-2 inline-flex items-center gap-1 text-xs text-muted-foreground"><MapPin className="h-3.5 w-3.5" />{place}</span>
                )}
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
};

export default OrganizationView;
