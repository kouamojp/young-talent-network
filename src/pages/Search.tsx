import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search as SearchIcon, MapPin, Star, FileText, Filter, ChevronDown, Map, Users, Building2, UserCheck, Database } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate, Link } from 'react-router-dom';
import { countries } from '@/data/countries';
import { sportCategories } from '@/data/sportCategories';
import { useLanguage } from '@/i18n/LanguageContext';
import CategorySearchFilter from '@/components/categories/CategorySearchFilter';

type SearchType = 'all' | 'talent' | 'agent' | 'organization';

interface UnifiedResult {
  id: string;
  name: string;
  avatar_url: string | null;
  bio: string | null;
  city: string | null;
  country: string | null;
  sport_type: string | null;
  platform_rating: number;
  birthday: string | null;
  user_type: 'talent' | 'agent' | 'organization';
  sections: string[];
}

const Search: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [searchType, setSearchType] = useState<SearchType>('all');
  const [query, setQuery] = useState('');
  const [country, setCountry] = useState('');
  const [city, setCity] = useState('');
  const [sportFilter, setSportFilter] = useState('');
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [subcategoryId, setSubcategoryId] = useState<string | null>(null);
  const [results, setResults] = useState<UnifiedResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [showMap, setShowMap] = useState(true);

  const getProfileLink = (r: UnifiedResult) => {
    if (r.user_type === 'organization') return `/organization/${r.id}`;
    if (r.user_type === 'agent') return `/agent/${r.id}`;
    return `/talent/${r.id}`;
  };

  const handleSearch = async () => {
    setLoading(true);
    setSearched(true);
    try {
      // Optional pre-filter by yat category
      let userIdsByCategory: string[] | null = null;
      if (categoryId) {
        let cq = supabase.from('user_yat_categories').select('user_id').eq('category_id', categoryId);
        if (subcategoryId) cq = cq.eq('subcategory_id', subcategoryId);
        const { data } = await cq;
        userIdsByCategory = (data || []).map((r: any) => r.user_id);
        if (userIdsByCategory.length === 0) {
          setResults([]); setTotalCount(0); setLoading(false); return;
        }
      }

      let q = supabase.from('profiles')
        .select('id, name, avatar_url, bio, city, country, sport_type, platform_rating, birthday, user_type', { count: 'exact' });

      if (searchType === 'all') q = q.in('user_type', ['talent', 'agent', 'organization']);
      else q = q.eq('user_type', searchType);

      if (userIdsByCategory) q = q.in('id', userIdsByCategory);
      if (query.trim()) q = q.or(`name.ilike.%${query}%,bio.ilike.%${query}%,sport_type.ilike.%${query}%`);
      if (country && country !== 'all') q = q.ilike('country', `%${country}%`);
      if (city.trim()) q = q.ilike('city', `%${city}%`);
      if (sportFilter && sportFilter !== 'all') q = q.ilike('sport_type', `%${sportFilter}%`);

      const { data: profiles, count } = await q.limit(50).order('platform_rating', { ascending: false });
      setTotalCount(count || 0);

      // Load presence sections (YAT Database parity)
      const ids = (profiles || []).map((p: any) => p.id);
      let presenceMap: Record<string, string[]> = {};
      if (ids.length) {
        const { data: presenceData } = await supabase
          .from('talent_presence')
          .select('user_id, section')
          .in('user_id', ids)
          .eq('is_active', true);
        (presenceData || []).forEach((p: any) => {
          (presenceMap[p.user_id] ||= []).push(p.section);
        });
      }

      setResults((profiles || []).map((p: any) => ({
        id: p.id, name: p.name, avatar_url: p.avatar_url, bio: p.bio,
        city: p.city, country: p.country, sport_type: p.sport_type,
        platform_rating: Number(p.platform_rating) || 0,
        birthday: p.birthday, user_type: p.user_type,
        sections: presenceMap[p.id] || [],
      })));
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  // Auto-search when type/category changes
  useEffect(() => {
    handleSearch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchType, categoryId, subcategoryId]);

  const calculateAge = (birthday: string | null) => {
    if (!birthday) return null;
    const birth = new Date(birthday); const now = new Date();
    let age = now.getFullYear() - birth.getFullYear();
    if (now.getMonth() < birth.getMonth() || (now.getMonth() === birth.getMonth() && now.getDate() < birth.getDate())) age--;
    return age;
  };

  const typeBadge = (type: string) => {
    if (type === 'agent') return 'bg-emerald-500/10 text-emerald-600 border-emerald-200';
    if (type === 'organization') return 'bg-purple-500/10 text-purple-600 border-purple-200';
    return 'bg-blue-500/10 text-blue-600 border-blue-200';
  };

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <div className="bg-muted/50 border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-2 mb-3">
            <Database className="h-4 w-4 text-primary" />
            <span className="text-xs text-muted-foreground">{t('search.syncedYatDb') || 'Synchronisé avec YAT Database'}</span>
            <Link to="/yat-database" className="text-xs text-primary hover:underline ml-auto">{t('search.openDb') || 'Ouvrir YAT Database'} →</Link>
          </div>
          <div className="flex gap-2">
            <Input value={query} onChange={e => setQuery(e.target.value)} placeholder={t('search.searchPlaceholder')}
              className="flex-1 h-12 text-base bg-card" onKeyDown={e => e.key === 'Enter' && handleSearch()} />
            <Button onClick={handleSearch} disabled={loading} className="h-12 px-6"><SearchIcon className="h-5 w-5" /></Button>
          </div>
          <div className="flex gap-2 mt-3 flex-wrap">
            {([
              { key: 'all' as SearchType, icon: Database, label: t('search.all') || 'Tous' },
              { key: 'talent' as SearchType, icon: Users, label: t('search.talents') },
              { key: 'agent' as SearchType, icon: UserCheck, label: 'Agents' },
              { key: 'organization' as SearchType, icon: Building2, label: t('search.organizations') },
            ]).map(tab => (
              <Button key={tab.key} variant={searchType === tab.key ? 'default' : 'outline'} size="sm"
                onClick={() => setSearchType(tab.key)} className="gap-1.5 text-xs">
                <tab.icon className="h-3.5 w-3.5" />{tab.label}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {showMap && (
        <div className="bg-muted border-b border-border">
          <div className="container mx-auto px-4">
            <div className="h-48 md:h-64 bg-muted/80 rounded-lg my-3 flex items-center justify-center border border-border/50 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-primary/10" />
              <div className="text-center z-10">
                <Map className="h-10 w-10 text-muted-foreground/40 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">{t('search.map')}</p>
                <Button variant="link" size="sm" className="text-xs mt-1" onClick={() => navigate('/karta')}>{t('search.openFullMap')}</Button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 py-4">
        <div className="md:hidden mb-3">
          <Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)} className="gap-1.5 text-xs w-full justify-between">
            <span className="flex items-center gap-1.5"><Filter className="h-3.5 w-3.5" />{t('search.filters')}</span>
            <ChevronDown className={`h-3.5 w-3.5 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          </Button>
        </div>

        <div className="flex flex-col md:flex-row gap-4">
          <div className={`shrink-0 ${showFilters ? 'block' : 'hidden'} md:block md:w-56`}>
            <div className="bg-card border border-border rounded-xl p-3 space-y-3">
              <h3 className="text-xs font-bold text-foreground uppercase tracking-wide hidden md:block">{t('search.filters')}</h3>
              <CategorySearchFilter
                category={categoryId}
                subcategory={subcategoryId}
                onCategoryChange={setCategoryId}
                onSubcategoryChange={setSubcategoryId}
                className="!flex-col"
              />
              <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-1 gap-2">
                <div>
                  <label className="text-[11px] font-medium text-muted-foreground mb-1 block">{t('search.country')}</label>
                  <Select value={country} onValueChange={setCountry}>
                    <SelectTrigger className="text-xs h-8"><SelectValue placeholder={t('search.all')} /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t('search.all')}</SelectItem>
                      {countries.map(c => (<SelectItem key={c.value} value={c.label}>{c.label}</SelectItem>))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-[11px] font-medium text-muted-foreground mb-1 block">{t('search.city')}</label>
                  <Input value={city} onChange={e => setCity(e.target.value)} placeholder={t('search.city')} className="text-xs h-8" />
                </div>
                <div>
                  <label className="text-[11px] font-medium text-muted-foreground mb-1 block">{t('search.sport')}</label>
                  <Select value={sportFilter} onValueChange={setSportFilter}>
                    <SelectTrigger className="text-xs h-8"><SelectValue placeholder={t('search.all')} /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t('search.all')}</SelectItem>
                      {sportCategories.map(cat => (<SelectItem key={cat.name} value={cat.name}>{cat.name}</SelectItem>))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button onClick={handleSearch} disabled={loading} size="sm" className="w-full text-xs">
                {loading ? t('search.searching') : t('search.find')}
              </Button>
            </div>
            <div className="bg-card border border-border rounded-xl p-3 space-y-3 hidden md:block mt-3">
              <h3 className="text-xs font-bold text-foreground uppercase tracking-wide">{t('search.additionalFilters')}</h3>
              <div className="flex items-center justify-between">
                <label className="text-[11px] text-muted-foreground">{t('search.map')}</label>
                <Button variant="ghost" size="sm" className="h-6 text-[10px]" onClick={() => setShowMap(!showMap)}>
                  {showMap ? t('search.hide') : t('search.show')}
                </Button>
              </div>
            </div>
          </div>

          <div className="flex-1 min-w-0">
            {searched && (
              <p className="text-xs text-muted-foreground mb-3">
                {t('search.found')}: <span className="font-semibold text-foreground">{totalCount}</span> {t('search.results')}
              </p>
            )}
            {searched && results.length === 0 && (
              <div className="text-center py-16 text-muted-foreground">
                <SearchIcon className="h-10 w-10 mx-auto mb-3 opacity-30" />
                <p className="text-sm">{t('search.noResults')}</p>
              </div>
            )}
            <div className="space-y-2">
              {results.map(r => (
                <div key={r.id} onClick={() => navigate(getProfileLink(r))}
                  className="bg-card border border-border rounded-lg p-3 hover:bg-muted/50 transition-colors cursor-pointer flex items-center gap-3">
                  <Avatar className="h-12 w-12 shrink-0 ring-1 ring-border">
                    <AvatarImage src={r.avatar_url || ''} />
                    <AvatarFallback className="text-sm bg-muted">{r.name?.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-semibold text-sm text-foreground truncate">{r.name}</h4>
                      <Badge variant="outline" className={`text-[10px] shrink-0 ${typeBadge(r.user_type)}`}>{r.user_type}</Badge>
                      {r.platform_rating > 0 && (
                        <span className="flex items-center gap-0.5 text-[11px] text-yellow-600 shrink-0">
                          <Star className="h-3 w-3 fill-current" /> {r.platform_rating.toFixed(1)}
                        </span>
                      )}
                      {calculateAge(r.birthday) && (
                        <Badge variant="outline" className="text-[10px] shrink-0">{calculateAge(r.birthday)} {t('search.years')}</Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-0.5 text-xs text-muted-foreground flex-wrap">
                      {(r.city || r.country) && (
                        <span className="flex items-center gap-0.5 truncate">
                          <MapPin className="h-3 w-3 shrink-0" />{[r.city, r.country].filter(Boolean).join(', ')}
                        </span>
                      )}
                      {r.sport_type && <Badge variant="secondary" className="text-[10px]">{r.sport_type}</Badge>}
                      {r.sections.slice(0, 3).map(s => (
                        <Badge key={s} variant="outline" className="text-[9px] uppercase">{s}</Badge>
                      ))}
                    </div>
                    {r.bio && <p className="text-[11px] text-muted-foreground mt-1 line-clamp-1">{r.bio}</p>}
                  </div>
                  <Button variant="ghost" size="sm" className="shrink-0 h-8 w-8 p-0">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Search;
