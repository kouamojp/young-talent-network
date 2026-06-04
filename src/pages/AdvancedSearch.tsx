import React, { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Search as SearchIcon, MapPin, Star, Filter, BadgeCheck, MessageSquare, Eye, Sparkles } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { countries } from '@/data/countries';
import { toast } from 'sonner';

type ProfileType = 'all' | 'talent' | 'agent' | 'organization' | 'recruiter' | 'mentor' | 'sponsor';

interface ResultCard {
  id: string;
  name: string;
  avatar_url: string | null;
  country: string | null;
  city: string | null;
  sport_type: string | null;
  professional_title: string | null;
  talent_level: string | null;
  availability: string | null;
  platform_rating: number;
  rating_count: number;
  user_type: string;
  languages: string[] | null;
  birthday: string | null;
  yat_score: number;
}

const LEVELS = ['débutant', 'intermédiaire', 'avancé', 'professionnel'];
const AVAILABILITY = ['disponible', 'non disponible', 'ouvert aux opportunités'];
const LANGUAGES = ['English', 'Français', 'Русский', 'Español', 'العربية', 'Português', '中文', 'Deutsch'];

const calcAge = (birthday: string | null): number | null => {
  if (!birthday) return null;
  const diff = Date.now() - new Date(birthday).getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
};

const AdvancedSearch: React.FC = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [profileType, setProfileType] = useState<ProfileType>('all');
  const [country, setCountry] = useState('all');
  const [city, setCity] = useState('');
  const [domain, setDomain] = useState('');
  const [level, setLevel] = useState('all');
  const [skill, setSkill] = useState('');
  const [language, setLanguage] = useState('all');
  const [availability, setAvailability] = useState('all');
  const [ageRange, setAgeRange] = useState<[number, number]>([14, 65]);
  const [organization, setOrganization] = useState('');
  const [verifiedOnly, setVerifiedOnly] = useState(false);

  const [results, setResults] = useState<ResultCard[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [skillsList, setSkillsList] = useState<string[]>([]);

  useEffect(() => {
    supabase.from('skills').select('name').limit(200).then(({ data }) => {
      if (data) setSkillsList(data.map((s: any) => s.name));
    });
  }, []);

  const handleSearch = async () => {
    setLoading(true);
    setSearched(true);
    try {
      let q = supabase.from('profiles').select('*').limit(60);

      if (profileType !== 'all') {
        q = q.eq('user_type', profileType);
      }
      if (country !== 'all') q = q.eq('country', country);
      if (city) q = q.ilike('city', `%${city}%`);
      if (domain) q = q.ilike('sport_type', `%${domain}%`);
      if (level !== 'all') q = q.eq('talent_level', level);
      if (availability !== 'all') q = q.eq('availability', availability);
      if (language !== 'all') q = q.contains('languages', [language]);
      if (query) q = q.or(`name.ilike.%${query}%,professional_title.ilike.%${query}%,bio.ilike.%${query}%`);

      const { data, error } = await q;
      if (error) throw error;

      let rows = (data || []) as any[];

      // Filter by skill (post-fetch via user_skills join)
      if (skill) {
        const { data: sk } = await supabase
          .from('user_skills')
          .select('user_id, skills!inner(name)')
          .ilike('skills.name', `%${skill}%`);
        const ids = new Set((sk || []).map((r: any) => r.user_id));
        rows = rows.filter(r => ids.has(r.id));
      }

      // Organization filter (via experiences)
      if (organization) {
        const { data: ex } = await supabase
          .from('talent_experiences')
          .select('user_id')
          .ilike('organization', `%${organization}%`);
        const ids = new Set((ex || []).map((r: any) => r.user_id));
        rows = rows.filter(r => ids.has(r.id));
      }

      // Age filter
      rows = rows.filter(r => {
        const age = calcAge(r.birthday);
        if (age === null) return ageRange[0] === 14 && ageRange[1] === 65;
        return age >= ageRange[0] && age <= ageRange[1];
      });

      if (verifiedOnly) {
        rows = rows.filter(r => (r.platform_rating || 0) >= 4 || r.rating_count >= 5);
      }

      const mapped: ResultCard[] = rows.map(r => ({
        ...r,
        yat_score: Math.min(
          100,
          Math.round(
            (r.platform_rating || 0) * 12 +
              Math.min(r.rating_count || 0, 10) * 2 +
              (r.about_me ? 10 : 0) +
              (r.avatar_url ? 8 : 0) +
              (r.professional_title ? 10 : 0) +
              (r.languages?.length || 0) * 2
          )
        ),
      }));

      setResults(mapped);
    } catch (e: any) {
      toast.error(e.message || 'Erreur de recherche');
    } finally {
      setLoading(false);
    }
  };

  const handleContact = async (userId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate('/auth');
      return;
    }
    const { data, error } = await supabase.rpc('create_conversation_with_participant', { _other_user_id: userId });
    if (error) {
      toast.error(error.message);
      return;
    }
    navigate(`/messages?conv=${data}`);
  };

  const getProfileLink = (r: ResultCard) => {
    if (r.user_type === 'organization') return `/organization/${r.id}`;
    if (r.user_type === 'agent') return `/agent/${r.id}`;
    return `/talent/${r.id}`;
  };

  const resetFilters = () => {
    setQuery(''); setProfileType('all'); setCountry('all'); setCity(''); setDomain('');
    setLevel('all'); setSkill(''); setLanguage('all'); setAvailability('all');
    setAgeRange([14, 65]); setOrganization(''); setVerifiedOnly(false);
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Sparkles className="h-7 w-7 text-primary" />
          Recherche avancée
        </h1>
        <p className="text-muted-foreground mt-1">Trouve les bons profils avec des filtres précis</p>
      </div>

      <Card className="mb-6">
        <CardContent className="p-4 space-y-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Nom, titre, mot-clé..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="pl-9"
              />
            </div>
            <Button onClick={handleSearch} disabled={loading}>
              {loading ? 'Recherche...' : 'Rechercher'}
            </Button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            <div>
              <label className="text-xs font-medium mb-1 block">Type de profil</label>
              <Select value={profileType} onValueChange={(v) => setProfileType(v as ProfileType)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous</SelectItem>
                  <SelectItem value="talent">Talent</SelectItem>
                  <SelectItem value="agent">Agent</SelectItem>
                  <SelectItem value="organization">Organisation</SelectItem>
                  <SelectItem value="recruiter">Recruteur</SelectItem>
                  <SelectItem value="mentor">Mentor</SelectItem>
                  <SelectItem value="sponsor">Sponsor</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-xs font-medium mb-1 block">Pays</label>
              <Select value={country} onValueChange={setCountry}>
                <SelectTrigger><SelectValue placeholder="Tous" /></SelectTrigger>
                <SelectContent className="max-h-60">
                  <SelectItem value="all">Tous</SelectItem>
                  {countries.map((c: any) => (
                    <SelectItem key={c.code || c.name} value={c.name}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-xs font-medium mb-1 block">Ville</label>
              <Input value={city} onChange={(e) => setCity(e.target.value)} placeholder="Ville" />
            </div>

            <div>
              <label className="text-xs font-medium mb-1 block">Domaine</label>
              <Input value={domain} onChange={(e) => setDomain(e.target.value)} placeholder="Ex: Football, Design..." />
            </div>

            <div>
              <label className="text-xs font-medium mb-1 block">Niveau</label>
              <Select value={level} onValueChange={setLevel}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous</SelectItem>
                  {LEVELS.map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-xs font-medium mb-1 block">Compétence</label>
              <Input
                value={skill}
                onChange={(e) => setSkill(e.target.value)}
                placeholder="Ex: React, Piano..."
                list="skills-list"
              />
              <datalist id="skills-list">
                {skillsList.map(s => <option key={s} value={s} />)}
              </datalist>
            </div>

            <div>
              <label className="text-xs font-medium mb-1 block">Langue</label>
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes</SelectItem>
                  {LANGUAGES.map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-xs font-medium mb-1 block">Disponibilité</label>
              <Select value={availability} onValueChange={setAvailability}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes</SelectItem>
                  {AVAILABILITY.map(a => <SelectItem key={a} value={a}>{a}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-xs font-medium mb-1 block">Organisation</label>
              <Input value={organization} onChange={(e) => setOrganization(e.target.value)} placeholder="Nom de l'organisation" />
            </div>

            <div className="col-span-2">
              <label className="text-xs font-medium mb-1 block">
                Âge : {ageRange[0]} - {ageRange[1]} ans
              </label>
              <Slider
                value={ageRange}
                onValueChange={(v) => setAgeRange([v[0], v[1]] as [number, number])}
                min={14}
                max={80}
                step={1}
                className="mt-3"
              />
            </div>

            <div className="flex items-end pb-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <Checkbox checked={verifiedOnly} onCheckedChange={(v) => setVerifiedOnly(!!v)} />
                <span className="text-sm flex items-center gap-1">
                  <BadgeCheck className="h-4 w-4 text-blue-500" /> Vérifiés uniquement
                </span>
              </label>
            </div>
          </div>

          <div className="flex justify-between items-center pt-2 border-t">
            <Button variant="ghost" size="sm" onClick={resetFilters}>Réinitialiser</Button>
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Filter className="h-3 w-3" /> {Object.values({ profileType, country, level, language, availability }).filter(v => v !== 'all').length + (city ? 1 : 0) + (domain ? 1 : 0) + (skill ? 1 : 0) + (organization ? 1 : 0) + (verifiedOnly ? 1 : 0)} filtres actifs
            </span>
          </div>
        </CardContent>
      </Card>

      {searched && (
        <div className="mb-4 text-sm text-muted-foreground">
          {results.length} résultat{results.length !== 1 ? 's' : ''}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {results.map((r) => (
          <Card key={r.id} className="overflow-hidden hover:shadow-lg transition-all group">
            <div className="h-20 bg-gradient-to-br from-primary/20 via-primary/10 to-secondary/20" />
            <CardContent className="p-4 -mt-10">
              <div className="flex items-start justify-between mb-3">
                <Avatar className="h-16 w-16 border-4 border-background">
                  <AvatarImage src={r.avatar_url || undefined} />
                  <AvatarFallback>{r.name?.[0]?.toUpperCase() || '?'}</AvatarFallback>
                </Avatar>
                <div className="mt-10 flex items-center gap-1 bg-primary/10 px-2 py-1 rounded-full">
                  <Sparkles className="h-3 w-3 text-primary" />
                  <span className="text-xs font-bold text-primary">{r.yat_score}</span>
                </div>
              </div>

              <div className="space-y-1 mb-3">
                <div className="flex items-center gap-1">
                  <h3 className="font-semibold truncate">{r.name}</h3>
                  {(r.platform_rating || 0) >= 4 && <BadgeCheck className="h-4 w-4 text-blue-500 shrink-0" />}
                </div>
                {r.professional_title && (
                  <p className="text-sm text-muted-foreground truncate">{r.professional_title}</p>
                )}
                {r.sport_type && (
                  <Badge variant="secondary" className="text-xs">{r.sport_type}</Badge>
                )}
              </div>

              <div className="space-y-1 text-xs text-muted-foreground mb-3">
                {(r.city || r.country) && (
                  <div className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    <span className="truncate">{[r.city, r.country].filter(Boolean).join(', ')}</span>
                  </div>
                )}
                {r.talent_level && (
                  <div className="flex items-center gap-1">
                    <Star className="h-3 w-3" />
                    <span className="capitalize">{r.talent_level}</span>
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <Button size="sm" variant="outline" className="flex-1" onClick={() => navigate(getProfileLink(r))}>
                  <Eye className="h-3 w-3 mr-1" /> Profil
                </Button>
                <Button size="sm" className="flex-1" onClick={() => handleContact(r.id)}>
                  <MessageSquare className="h-3 w-3 mr-1" /> Contacter
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {searched && !loading && results.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          Aucun résultat. Essaie d'élargir tes filtres.
        </div>
      )}
    </div>
  );
};

export default AdvancedSearch;
