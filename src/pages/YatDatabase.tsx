import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Search, MapPin, Star, Database, Users, Building2, UserCheck, 
  Filter, Eye, Briefcase, GraduationCap, Radio, Tv, Calendar, 
  Map, Coins, ShoppingBag, Globe, X
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Link, useSearchParams } from 'react-router-dom';
import CategorySearchFilter from '@/components/categories/CategorySearchFilter';
import { useYatCategories } from '@/hooks/useYatCategories';

type ParticipantType = 'all' | 'talent' | 'agent' | 'organization';

interface ParticipantResult {
  id: string;
  name: string;
  avatar_url: string | null;
  type: 'talent' | 'agent' | 'organization';
  bio: string | null;
  location: string | null;
  city: string | null;
  country: string | null;
  sport_type: string | null;
  rating: number;
  category: string | null;
  sections: string[];
  extra: Record<string, any>;
}

const sectionOptions = [
  { key: 'work', label: 'YAT Work', icon: Briefcase },
  { key: 'learning', label: 'YAT Learning', icon: GraduationCap },
  { key: 'live', label: 'YAT Live', icon: Radio },
  { key: 'tv', label: 'YAT TV', icon: Tv },
  { key: 'events', label: 'YAT Events', icon: Calendar },
  { key: 'karta', label: 'YAT Karta', icon: Map },
  { key: 'yat-coin', label: 'YAT Coin', icon: Coins },
  { key: 'marketplace', label: 'Marketplace', icon: ShoppingBag },
  { key: 'social', label: 'Social', icon: Globe },
];

const YatDatabase: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { categories } = useYatCategories();
  const [query, setQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<ParticipantType>('all');
  const [sectionFilter, setSectionFilter] = useState<string>('all');
  const [countryFilter, setCountryFilter] = useState('');
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [subcategoryId, setSubcategoryId] = useState<string | null>(null);
  const [results, setResults] = useState<ParticipantResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [stats, setStats] = useState({ talents: 0, agents: 0, organizations: 0 });

  // Initialize from ?category=slug
  useEffect(() => {
    const slug = searchParams.get('category');
    if (slug && categories.length > 0) {
      const found = categories.find((c) => c.slug === slug);
      if (found) setCategoryId(found.id);
    }
  }, [searchParams, categories]);

  // Load stats on mount
  useEffect(() => {
    const loadStats = async () => {
      const [talentRes, agentRes, orgRes] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('user_type', 'talent'),
        supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('user_type', 'agent'),
        supabase.from('organization_profiles').select('id', { count: 'exact', head: true }),
      ]);
      setStats({
        talents: talentRes.count || 0,
        agents: agentRes.count || 0,
        organizations: orgRes.count || 0,
      });
    };
    loadStats();
  }, []);

  const handleSearch = async () => {
    setLoading(true);
    setSearched(true);
    try {
      const allResults: ParticipantResult[] = [];

      // If category filter active, pre-fetch user_ids matching that category
      let userIdsByCategory: string[] | null = null;
      if (categoryId) {
        let q = supabase.from('user_yat_categories').select('user_id').eq('category_id', categoryId);
        if (subcategoryId) q = q.eq('subcategory_id', subcategoryId);
        const { data } = await q;
        userIdsByCategory = (data || []).map((r: any) => r.user_id);
        if (userIdsByCategory.length === 0) {
          setResults([]);
          setLoading(false);
          return;
        }
      }

      // Fetch talents & agents from profiles
      if (typeFilter === 'all' || typeFilter === 'talent' || typeFilter === 'agent') {
        let profileQuery = supabase
          .from('profiles')
          .select('id, name, avatar_url, bio, location, city, country, sport_type, platform_rating, user_type');

        if (typeFilter === 'talent') profileQuery = profileQuery.eq('user_type', 'talent');
        else if (typeFilter === 'agent') profileQuery = profileQuery.eq('user_type', 'agent');
        else profileQuery = profileQuery.in('user_type', ['talent', 'agent']);

        if (userIdsByCategory) profileQuery = profileQuery.in('id', userIdsByCategory);

        if (query.trim()) {
          profileQuery = profileQuery.or(`name.ilike.%${query}%,bio.ilike.%${query}%,sport_type.ilike.%${query}%`);
        }
        if (countryFilter.trim()) {
          profileQuery = profileQuery.or(`country.ilike.%${countryFilter}%,city.ilike.%${countryFilter}%`);
        }

        const { data: profiles } = await profileQuery.limit(50).order('platform_rating', { ascending: false });

        if (profiles?.length) {
          const ids = profiles.map(p => p.id);
          const { data: presenceData } = await supabase
            .from('talent_presence')
            .select('user_id, section')
            .in('user_id', ids)
            .eq('is_active', true);

          const presenceMap: Record<string, string[]> = {};
          (presenceData || []).forEach(p => {
            if (!presenceMap[p.user_id]) presenceMap[p.user_id] = [];
            presenceMap[p.user_id].push(p.section);
          });

          for (const p of profiles) {
            const sections = presenceMap[p.id] || [];
            if (sectionFilter !== 'all' && !sections.includes(sectionFilter)) continue;

            allResults.push({
              id: p.id,
              name: p.name,
              avatar_url: p.avatar_url,
              type: p.user_type as 'talent' | 'agent',
              bio: p.bio,
              location: p.location,
              city: p.city,
              country: p.country,
              sport_type: p.sport_type,
              rating: Number(p.platform_rating) || 0,
              category: p.sport_type,
              sections,
              extra: {},
            });
          }
        }
      }

      // Fetch organizations
      if ((typeFilter === 'all' || typeFilter === 'organization') && !categoryId) {
        let orgQuery = supabase
          .from('organization_profiles')
          .select('id, user_id, company_name, description, industry, headquarters, logo_url, verified');

        if (query.trim()) {
          orgQuery = orgQuery.or(`company_name.ilike.%${query}%,description.ilike.%${query}%,industry.ilike.%${query}%`);
        }
        if (countryFilter.trim()) {
          orgQuery = orgQuery.ilike('headquarters', `%${countryFilter}%`);
        }

        const { data: orgs } = await orgQuery.limit(50);

        if (orgs?.length) {
          for (const o of orgs) {
            if (sectionFilter !== 'all') continue;
            allResults.push({
              id: o.id,
              name: o.company_name,
              avatar_url: o.logo_url,
              type: 'organization',
              bio: o.description,
              location: o.headquarters,
              city: null,
              country: null,
              sport_type: null,
              rating: 0,
              category: o.industry,
              sections: [],
              extra: { verified: o.verified, industry: o.industry, user_id: o.user_id },
            });
          }
        }
      }

      setResults(allResults);
    } catch (err) {
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Auto-search on filter change
  useEffect(() => {
    handleSearch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [typeFilter, sectionFilter, categoryId, subcategoryId]);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'talent': return <Users className="h-3 w-3" />;
      case 'agent': return <UserCheck className="h-3 w-3" />;
      case 'organization': return <Building2 className="h-3 w-3" />;
      default: return null;
    }
  };

  const getTypeBadgeColor = (type: string) => {
    switch (type) {
      case 'talent': return 'bg-blue-500/10 text-blue-600 border-blue-200';
      case 'agent': return 'bg-emerald-500/10 text-emerald-600 border-emerald-200';
      case 'organization': return 'bg-purple-500/10 text-purple-600 border-purple-200';
      default: return '';
    }
  };

  const getProfileLink = (r: ParticipantResult) => {
    if (r.type === 'organization') return `/organization/${r.id}`;
    if (r.type === 'agent') return `/agent/${r.id}`;
    return `/talent/${r.id}`;
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="flex items-center justify-center gap-3">
            <div className="p-3 rounded-xl bg-primary/10">
              <Database className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-3xl font-bold text-foreground">YAT Database</h1>
          </div>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Moteur de recherche de tous les participants de la plateforme — Talents, Agents et Organisations.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <Card className="text-center p-4">
            <div className="text-2xl font-bold text-blue-600">{stats.talents}</div>
            <div className="text-xs text-muted-foreground flex items-center justify-center gap-1">
              <Users className="h-3 w-3" /> Talents
            </div>
          </Card>
          <Card className="text-center p-4">
            <div className="text-2xl font-bold text-emerald-600">{stats.agents}</div>
            <div className="text-xs text-muted-foreground flex items-center justify-center gap-1">
              <UserCheck className="h-3 w-3" /> Agents
            </div>
          </Card>
          <Card className="text-center p-4">
            <div className="text-2xl font-bold text-purple-600">{stats.organizations}</div>
            <div className="text-xs text-muted-foreground flex items-center justify-center gap-1">
              <Building2 className="h-3 w-3" /> Organisations
            </div>
          </Card>
        </div>

        {/* Search & Filters */}
        <Card>
          <CardContent className="p-4 space-y-4">
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  placeholder="Rechercher par nom, compétence, sport, industrie..."
                  className="pl-9"
                  onKeyDown={e => e.key === 'Enter' && handleSearch()}
                />
              </div>
              <Input
                value={countryFilter}
                onChange={e => setCountryFilter(e.target.value)}
                placeholder="Ville, pays..."
                className="sm:w-48"
                onKeyDown={e => e.key === 'Enter' && handleSearch()}
              />
              <Button onClick={handleSearch} disabled={loading} className="gap-1.5">
                <Filter className="h-3.5 w-3.5" />
                {loading ? 'Recherche...' : 'Rechercher'}
              </Button>
            </div>

            <div className="flex flex-wrap gap-2 items-center">
              <span className="text-xs font-medium text-muted-foreground">Type:</span>
              {(['all', 'talent', 'agent', 'organization'] as const).map(t => (
                <Button
                  key={t}
                  size="sm"
                  variant={typeFilter === t ? 'default' : 'outline'}
                  className="h-7 text-xs gap-1"
                  onClick={() => setTypeFilter(t)}
                >
                  {t === 'all' && 'Tous'}
                  {t === 'talent' && <><Users className="h-3 w-3" /> Talents</>}
                  {t === 'agent' && <><UserCheck className="h-3 w-3" /> Agents</>}
                  {t === 'organization' && <><Building2 className="h-3 w-3" /> Organisations</>}
                </Button>
              ))}
            </div>

            <div className="flex flex-wrap gap-2 items-center">
              <span className="text-xs font-medium text-muted-foreground">Section:</span>
              <Button
                size="sm"
                variant={sectionFilter === 'all' ? 'default' : 'outline'}
                className="h-7 text-xs"
                onClick={() => setSectionFilter('all')}
              >
                Toutes
              </Button>
              {sectionOptions.map(s => (
                <Button
                  key={s.key}
                  size="sm"
                  variant={sectionFilter === s.key ? 'default' : 'outline'}
                  className="h-7 text-xs gap-1"
                  onClick={() => setSectionFilter(s.key)}
                >
                  <s.icon className="h-3 w-3" />
                  {s.label}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              {results.length} résultat{results.length !== 1 ? 's' : ''} trouvé{results.length !== 1 ? 's' : ''}
            </span>
          </div>

          {searched && results.length === 0 && (
            <Card className="p-8 text-center">
              <Database className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-muted-foreground">Aucun participant trouvé pour ces critères.</p>
            </Card>
          )}

          <div className="grid gap-3">
            {results.map(r => (
              <Card key={`${r.type}-${r.id}`} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <Avatar className="h-14 w-14 shrink-0">
                      <AvatarImage src={r.avatar_url || ''} />
                      <AvatarFallback className="text-lg">{r.name?.charAt(0)}</AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0 space-y-1.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Link to={getProfileLink(r)} className="font-semibold text-foreground hover:text-primary transition-colors">
                          {r.name}
                        </Link>
                        <Badge variant="outline" className={`text-[10px] gap-1 ${getTypeBadgeColor(r.type)}`}>
                          {getTypeIcon(r.type)}
                          {r.type === 'talent' ? 'Talent' : r.type === 'agent' ? 'Agent' : 'Organisation'}
                        </Badge>
                        {r.rating > 0 && (
                          <span className="flex items-center gap-0.5 text-xs text-yellow-600">
                            <Star className="h-3 w-3 fill-current" /> {r.rating.toFixed(1)}
                          </span>
                        )}
                        {r.extra?.verified && (
                          <Badge className="text-[10px] bg-emerald-500">Vérifié</Badge>
                        )}
                      </div>

                      {(r.city || r.country || r.location) && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <MapPin className="h-3 w-3" />
                          {[r.city, r.country, r.location].filter(Boolean).join(', ')}
                        </div>
                      )}

                      {r.bio && <p className="text-xs text-muted-foreground line-clamp-2">{r.bio}</p>}

                      {r.category && (
                        <Badge variant="secondary" className="text-[10px]">{r.category}</Badge>
                      )}

                      {r.sections.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {r.sections.map(s => {
                            const sec = sectionOptions.find(so => so.key === s);
                            return sec ? (
                              <Badge key={s} variant="outline" className="text-[9px] gap-0.5 py-0">
                                <sec.icon className="h-2.5 w-2.5" />
                                {sec.label}
                              </Badge>
                            ) : null;
                          })}
                        </div>
                      )}
                    </div>

                    <Link to={getProfileLink(r)}>
                      <Button variant="outline" size="sm" className="gap-1 shrink-0">
                        <Eye className="h-3.5 w-3.5" />
                        Voir
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default YatDatabase;
