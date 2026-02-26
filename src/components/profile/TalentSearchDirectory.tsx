import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, MapPin, Star, FileText, Filter } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface TalentResult {
  id: string;
  name: string;
  avatar_url: string | null;
  bio: string | null;
  city: string | null;
  country: string | null;
  sport_type: string | null;
  platform_rating: number;
  skills: string[];
  education_count: number;
  achievements_count: number;
}

const TalentSearchDirectory: React.FC = () => {
  const [query, setQuery] = useState('');
  const [location, setLocation] = useState('');
  const [results, setResults] = useState<TalentResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async () => {
    setLoading(true);
    setSearched(true);
    try {
      let q = supabase
        .from('profiles')
        .select('id, name, avatar_url, bio, city, country, sport_type, platform_rating')
        .eq('user_type', 'talent');

      if (query.trim()) {
        q = q.or(`name.ilike.%${query}%,bio.ilike.%${query}%,sport_type.ilike.%${query}%`);
      }
      if (location.trim()) {
        q = q.or(`city.ilike.%${location}%,country.ilike.%${location}%`);
      }

      const { data: profiles } = await q.limit(20).order('platform_rating', { ascending: false });

      if (!profiles?.length) {
        setResults([]);
        return;
      }

      // Get skills and counts for found profiles
      const ids = profiles.map(p => p.id);
      const [skillsRes, eduRes, achRes] = await Promise.all([
        supabase.from('user_skills').select('user_id, skills(name)').in('user_id', ids),
        (supabase.from('talent_education') as any).select('user_id').in('user_id', ids),
        supabase.from('talent_achievements').select('user_id').in('user_id', ids),
      ]);

      const skillsMap: Record<string, string[]> = {};
      (skillsRes.data || []).forEach((s: any) => {
        if (!skillsMap[s.user_id]) skillsMap[s.user_id] = [];
        if (s.skills?.name) skillsMap[s.user_id].push(s.skills.name);
      });

      const eduCount: Record<string, number> = {};
      (eduRes.data || []).forEach((e: any) => { eduCount[e.user_id] = (eduCount[e.user_id] || 0) + 1; });

      const achCount: Record<string, number> = {};
      (achRes.data || []).forEach((a: any) => { achCount[a.user_id] = (achCount[a.user_id] || 0) + 1; });

      setResults(profiles.map(p => ({
        ...p,
        platform_rating: Number(p.platform_rating) || 0,
        skills: skillsMap[p.id] || [],
        education_count: eduCount[p.id] || 0,
        achievements_count: achCount[p.id] || 0,
      })));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Search className="h-4 w-4" /> Recherche de Talents
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-2">
          <Input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Compétence, nom, sport..."
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
          />
          <Input
            value={location}
            onChange={e => setLocation(e.target.value)}
            placeholder="Ville, pays..."
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
          />
          <Button onClick={handleSearch} disabled={loading} className="gap-1.5">
            <Filter className="h-3.5 w-3.5" />
            {loading ? 'Recherche...' : 'Rechercher'}
          </Button>
        </div>

        {searched && results.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">Aucun talent trouvé pour ces critères.</p>
        )}

        <div className="space-y-3">
          {results.map(t => (
            <div key={t.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
              <Avatar className="h-12 w-12">
                <AvatarImage src={t.avatar_url || ''} />
                <AvatarFallback>{t.name?.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm">{t.name}</span>
                  {t.platform_rating > 0 && (
                    <span className="flex items-center gap-0.5 text-xs text-yellow-600">
                      <Star className="h-3 w-3 fill-current" /> {t.platform_rating.toFixed(1)}
                    </span>
                  )}
                </div>
                {(t.city || t.country) && (
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <MapPin className="h-3 w-3" /> {[t.city, t.country].filter(Boolean).join(', ')}
                  </span>
                )}
                {t.bio && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{t.bio}</p>}
                <div className="flex flex-wrap gap-1 mt-2">
                  {t.skills.slice(0, 5).map((s, i) => (
                    <Badge key={i} variant="outline" className="text-[10px]">{s}</Badge>
                  ))}
                  {t.education_count > 0 && <Badge variant="secondary" className="text-[10px]">{t.education_count} formation(s)</Badge>}
                  {t.achievements_count > 0 && <Badge variant="secondary" className="text-[10px]">{t.achievements_count} réalisation(s)</Badge>}
                </div>
              </div>
              <Button variant="outline" size="sm" className="gap-1 shrink-0">
                <FileText className="h-3 w-3" /> CV
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default TalentSearchDirectory;
