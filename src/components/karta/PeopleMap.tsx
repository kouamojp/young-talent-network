import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageCircle, User } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import KartaMap, { type KartaPoint } from './KartaMap';
import { tr } from '@/i18n';

interface Person { id: string; name: string; role: string; sport: string; avatar: string }

const profileLink = (p: Person) =>
  p.role === 'organization' ? `/organization/${p.id}` : p.role === 'agent' ? `/agent/${p.id}` : `/talent/${p.id}`;

/** Membres qui ont renseigné leur position. */
const PeopleMap = () => {
  const navigate = useNavigate();
  const [points, setPoints] = useState<KartaPoint<Person>[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from('profiles')
      .select('id, name, user_type, sport_type, latitude, longitude, avatar_url')
      .not('latitude', 'is', null)
      .not('longitude', 'is', null)
      .limit(500)
      .then(({ data }) => {
        setPoints((data ?? []).map(p => ({
          id: p.id,
          lngLat: [Number(p.longitude), Number(p.latitude)],
          data: { id: p.id, name: p.name || '?', role: p.user_type || '', sport: p.sport_type || '', avatar: p.avatar_url || '' },
        })));
        setLoading(false);
      });
  }, []);

  return (
    <KartaMap
      points={points}
      loading={loading}
      emptyLabel={tr('peopleMap.noMemberHasSharedTheirLocation')}
      renderSelected={({ data: person }) => (
        <div className="flex items-start gap-4 pr-4">
          <Avatar className="h-14 w-14 border-2 border-primary">
            <AvatarImage src={person.avatar} />
            <AvatarFallback>{person.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-lg break-words">{person.name}</h3>
            <div className="flex flex-wrap gap-2 mt-2">
              {person.role && <Badge variant="secondary">{person.role}</Badge>}
              {person.sport && <Badge variant="outline">{person.sport}</Badge>}
            </div>
            <div className="flex gap-2 mt-3">
              <Button size="sm" className="flex-1 gap-2" onClick={() => navigate(`/messages?to=${person.id}`)}>
                <MessageCircle className="h-4 w-4" /> {tr('common.message')}
              </Button>
              <Button size="sm" variant="outline" className="gap-2" onClick={() => navigate(profileLink(person))}>
                <User className="h-4 w-4" /> {tr('sidebar.profile')}
              </Button>
            </div>
          </div>
        </div>
      )}
    />
  );
};

export default PeopleMap;
