import React, { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, MapPin, Star, FileText, Filter, ChevronDown } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { fetchProfileAges } from '@/lib/profiles';
import { useNavigate } from 'react-router-dom';
import { countries } from '@/data/countries';
import { tr } from '@/i18n';

interface TalentResult {
  id: string;
  name: string;
  avatar_url: string | null;
  bio: string | null;
  city: string | null;
  country: string | null;
  sport_type: string | null;
  platform_rating: number;
  age: number | null;
  skills: string[];
}

const TalentSearchCards: React.FC = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [country, setCountry] = useState('');
  const [city, setCity] = useState('');
  const [results, setResults] = useState<TalentResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [showFilters, setShowFilters] = useState(false);

  const handleSearch = async () => {
    setLoading(true);
    setSearched(true);
    try {
      let q = supabase
        .from('profiles')
        .select('id, name, avatar_url, bio, city, country, sport_type, platform_rating', { count: 'exact' })
        .eq('user_type', 'talent');

      if (query.trim()) {
        q = q.or(`name.ilike.%${query}%,bio.ilike.%${query}%,sport_type.ilike.%${query}%`);
      }
      if (country) {
        q = q.ilike('country', `%${country}%`);
      }
      if (city.trim()) {
        q = q.ilike('city', `%${city}%`);
      }

      const { data: profiles, count } = await q.limit(40).order('platform_rating', { ascending: false });
      setTotalCount(count || 0);

      if (!profiles?.length) {
        setResults([]);
        return;
      }

      const ids = profiles.map(p => p.id);
      const [{ data: skillsData }, ages] = await Promise.all([
        supabase.from('user_skills').select('user_id, skills(name)').in('user_id', ids),
        fetchProfileAges(ids),
      ]);

      const skillsMap: Record<string, string[]> = {};
      (skillsData || []).forEach((s: any) => {
        if (!skillsMap[s.user_id]) skillsMap[s.user_id] = [];
        if (s.skills?.name) skillsMap[s.user_id].push(s.skills.name);
      });

      setResults(profiles.map(p => ({
        ...p,
        platform_rating: Number(p.platform_rating) || 0,
        age: ages[p.id] ?? null,
        skills: skillsMap[p.id] || [],
      })));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* Filters sidebar */}
      <div className={`lg:w-64 shrink-0 space-y-4 ${showFilters ? 'block' : 'hidden lg:block'}`}>
        <h3 className="font-semibold text-sm text-foreground">{tr('talentSearchCards.searchSettings')}</h3>
        
        <div className="space-y-3">
          <div>
            <label className="text-xs font-medium text-primary mb-1 block">{tr('events.region')}</label>
            <Select value={country} onValueChange={setCountry}>
              <SelectTrigger className="text-sm">
                <SelectValue placeholder={tr('talentSearchCards.country')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{tr('talentSearchCards.allCountries')}</SelectItem>
                {countries.map(c => (
                  <SelectItem key={c.value} value={c.label}>{c.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">{tr('settings.city')}</label>
            <Input
              value={city}
              onChange={e => setCity(e.target.value)}
              placeholder={tr('talentSearchCards.city')}
              className="text-sm"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-primary mb-1 block">{tr('common.specialty')}</label>
            <Input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder={tr('talentSearchCards.sportSkill')}
              className="text-sm"
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
            />
          </div>
        </div>

        <Button onClick={handleSearch} disabled={loading} className="w-full gap-2">
          <Search className="h-4 w-4" />
          {loading ? 'Recherche...' : tr('search.find')}
        </Button>
      </div>

      {/* Results grid */}
      <div className="flex-1">
        {/* Mobile filter toggle + search bar */}
        <div className="lg:hidden mb-4 space-y-3">
          <div className="flex gap-2">
            <Input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder={tr('talentSearchCards.searchForATalent')}
              className="flex-1"
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
            />
            <Button onClick={handleSearch} disabled={loading}>
              <Search className="h-4 w-4" />
            </Button>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setShowFilters(!showFilters)}
            className="gap-1.5 text-xs"
          >
            <Filter className="h-3.5 w-3.5" />
            {tr('common.filters')}
            <ChevronDown className={`h-3 w-3 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          </Button>
        </div>

        {searched && (
          <p className="text-sm text-muted-foreground mb-4">
            {tr('search.found')} {totalCount} {tr('talentSearchCards.person')}{totalCount !== 1 ? 's' : ''}
          </p>
        )}

        {searched && results.length === 0 && (
          <p className="text-center text-muted-foreground py-12">{tr('common.noTalentFoundForTheseCriteria')}</p>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {results.map(t => (
            <div 
              key={t.id} 
              className="bg-card border border-border rounded-xl p-4 hover:shadow-md transition-shadow flex flex-col items-center text-center"
            >
              <Avatar className="h-20 w-20 mb-3 ring-2 ring-border">
                <AvatarImage src={t.avatar_url || ''} />
                <AvatarFallback className="text-xl bg-muted">{t.name?.charAt(0)}</AvatarFallback>
              </Avatar>
              
              <h4 className="font-semibold text-sm text-primary hover:underline cursor-pointer" onClick={() => navigate(`/talent/${t.id}`)}>
                {t.name}
              </h4>

              {t.platform_rating > 0 && (
                <div className="flex items-center gap-1 text-xs text-yellow-600 mt-1">
                  <Star className="h-3 w-3 fill-current" /> {t.platform_rating.toFixed(1)}
                </div>
              )}

              <div className="w-full mt-3 space-y-1.5 text-xs text-left">
                {t.age != null && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{tr('common.age')}</span>
                    <span className="font-medium text-foreground">{t.age} {tr('search.years')}</span>
                  </div>
                )}
                {(t.city || t.country) && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{tr('talentSearchCards.location')}</span>
                    <span className="font-medium text-foreground">{[t.city, t.country].filter(Boolean).join(', ')}</span>
                  </div>
                )}
                {t.country && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{tr('talentSearchCards.country2')}</span>
                    <span className="font-medium text-foreground">{t.country}</span>
                  </div>
                )}
                {t.sport_type && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{tr('talentSearchCards.specialty')}</span>
                    <span className="font-medium text-foreground">{t.sport_type}</span>
                  </div>
                )}
              </div>

              {t.skills.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2 justify-center">
                  {t.skills.slice(0, 3).map((s, i) => (
                    <Badge key={i} variant="secondary" className="text-[10px]">{s}</Badge>
                  ))}
                </div>
              )}

              <Button 
                size="sm" 
                className="w-full mt-3 gap-1.5 text-xs"
                onClick={() => navigate(`/talent/${t.id}`)}
              >
                <FileText className="h-3.5 w-3.5" />
                {tr('talentSearchCards.moreInformation')}
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TalentSearchCards;
