import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, MapPin, Search, Star } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';

interface Person {
  id: string;
  name: string | null;
  avatar_url: string | null;
  city: string | null;
  country: string | null;
  sport_type: string | null;
  professional_title: string | null;
  platform_rating: number | null;
  user_type: string | null;
}

const PeopleList: React.FC<{ people: Person[]; onOpen: (p: Person) => void }> = ({ people, onOpen }) => {
  if (people.length === 0) {
    return <p className="rounded-xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">Personne ne correspond à cette recherche.</p>;
  }
  return (
    <ul className="rounded-xl border border-border bg-card divide-y divide-border">
      {people.map(p => {
        const place = [p.city, p.country].filter(Boolean).join(', ');
        const role = p.professional_title || p.sport_type;
        return (
          <li key={p.id}>
            <button type="button" onClick={() => onOpen(p)} className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-muted/60 transition-colors">
              <Avatar className="h-11 w-11 shrink-0">
                <AvatarImage src={p.avatar_url || ''} />
                <AvatarFallback>{p.name?.charAt(0) || '?'}</AvatarFallback>
              </Avatar>
              <span className="min-w-0 flex-1">
                <span className="block truncate font-semibold">{p.name || 'Sans nom'}</span>
                <span className="flex flex-wrap gap-x-3 text-sm text-muted-foreground">
                  {role && <span className="truncate">{role}</span>}
                  {place && <span className="inline-flex min-w-0 items-center gap-1"><MapPin className="h-3.5 w-3.5 shrink-0" /><span className="truncate">{place}</span></span>}
                </span>
              </span>
              {!!p.platform_rating && (
                <span className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold tabular-nums">
                  <Star className="h-4 w-4 fill-gold text-gold" />{Number(p.platform_rating).toFixed(1)}
                </span>
              )}
            </button>
          </li>
        );
      })}
    </ul>
  );
};

const Participants: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [people, setPeople] = useState<Person[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from('profiles')
      .select('id, name, avatar_url, city, country, sport_type, professional_title, platform_rating, user_type')
      .in('user_type', ['talent', 'agent'])
      .order('platform_rating', { ascending: false, nullsFirst: false })
      .limit(200)
      .then(({ data }) => {
        setPeople((data as Person[] | null) ?? []);
        setLoading(false);
      });
  }, []);

  const query = searchTerm.toLowerCase();
  const matches = (p: Person) =>
    [p.name, p.city, p.country, p.sport_type, p.professional_title].some(v => v?.toLowerCase().includes(query));
  const talents = people.filter(p => p.user_type === 'talent' && matches(p));
  const agents = people.filter(p => p.user_type === 'agent' && matches(p));
  const open = (p: Person) => navigate(p.user_type === 'agent' ? `/agent/${p.id}` : `/talent/${p.id}`);

  return (
    <div className="min-h-screen">
      <main className="max-w-3xl mx-auto px-4 py-6 md:py-8">
        <h1 className="text-2xl md:text-3xl font-semibold mb-6">Participants</h1>

        <div className="relative mb-6">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input className="pl-10" placeholder="Rechercher par nom, discipline ou ville" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>

        {loading ? (
          <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
        ) : (
          <Tabs defaultValue="talents">
            <TabsList className="mb-4">
              <TabsTrigger value="talents">Talents ({talents.length})</TabsTrigger>
              <TabsTrigger value="agents">Agents ({agents.length})</TabsTrigger>
            </TabsList>
            <TabsContent value="talents"><PeopleList people={talents} onOpen={open} /></TabsContent>
            <TabsContent value="agents"><PeopleList people={agents} onOpen={open} /></TabsContent>
          </Tabs>
        )}
      </main>
    </div>
  );
};

export default Participants;
