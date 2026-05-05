import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Loader2, ThumbsUp, MessageSquare, Search, Globe, Users, Link as LinkIcon } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useLanguage } from '@/i18n/LanguageContext';

type SortKey = 'recent' | 'oldest' | 'likes' | 'comments';
type VisibilityFilter = 'all' | 'public' | 'friends' | 'link' | 'mine';

const Articles: React.FC = () => {
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<SortKey>('recent');
  const [visibilityFilter, setVisibilityFilter] = useState<VisibilityFilter>('all');
  const [category, setCategory] = useState<string>('all');
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setCurrentUserId(data.user?.id ?? null));
    load();
  }, []);

  const load = async () => {
    setLoading(true);
    // RLS already filters by visibility (public, own, friends-of-author).
    const { data } = await supabase
      .from('user_pages')
      .select('id,title,content,category,visibility,user_id,likes_count,comments_count,created_at,updated_at');
    setArticles(data || []);
    setLoading(false);
  };

  const categories = useMemo(() => {
    const set = new Set<string>();
    articles.forEach((a) => a.category && set.add(a.category));
    return Array.from(set).sort();
  }, [articles]);

  const filtered = useMemo(() => {
    let list = [...articles];
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((a) =>
        a.title?.toLowerCase().includes(q) || a.content?.toLowerCase().includes(q)
      );
    }
    if (category !== 'all') list = list.filter((a) => a.category === category);
    if (visibilityFilter !== 'all') {
      if (visibilityFilter === 'mine') {
        list = list.filter((a) => a.user_id === currentUserId);
      } else {
        list = list.filter((a) => a.visibility === visibilityFilter);
      }
    }
    switch (sort) {
      case 'recent': list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()); break;
      case 'oldest': list.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()); break;
      case 'likes': list.sort((a, b) => (b.likes_count || 0) - (a.likes_count || 0)); break;
      case 'comments': list.sort((a, b) => (b.comments_count || 0) - (a.comments_count || 0)); break;
    }
    return list;
  }, [articles, search, sort, visibilityFilter, category, currentUserId]);

  const VisIcon = ({ v }: { v: string }) => {
    if (v === 'friends') return <Users className="h-3 w-3" />;
    if (v === 'link') return <LinkIcon className="h-3 w-3" />;
    return <Globe className="h-3 w-3" />;
  };

  return (
    <div className="max-w-5xl mx-auto py-6 px-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Articles</h1>
        <Badge variant="secondary">{filtered.length} results</Badge>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 mb-6">
        <div className="relative sm:col-span-2 lg:col-span-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search articles..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8"
          />
        </div>

        <Select value={sort} onValueChange={(v) => setSort(v as SortKey)}>
          <SelectTrigger><SelectValue placeholder="Sort by" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="recent">Most recent</SelectItem>
            <SelectItem value="oldest">Oldest first</SelectItem>
            <SelectItem value="likes">Most liked</SelectItem>
            <SelectItem value="comments">Most commented</SelectItem>
          </SelectContent>
        </Select>

        <Select value={visibilityFilter} onValueChange={(v) => setVisibilityFilter(v as VisibilityFilter)}>
          <SelectTrigger><SelectValue placeholder="Visibility" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All visibilities</SelectItem>
            <SelectItem value="public">Public only</SelectItem>
            <SelectItem value="friends">Friends only</SelectItem>
            <SelectItem value="link">By link</SelectItem>
            <SelectItem value="mine">My articles</SelectItem>
          </SelectContent>
        </Select>

        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger><SelectValue placeholder="Category" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {categories.map((c) => (
              <SelectItem key={c} value={c}>{c}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin" /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">No articles found.</div>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {filtered.map((a) => (
            <Link key={a.id} to={`/article/${a.id}`}>
              <Card className="p-4 h-full hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h2 className="font-semibold text-lg line-clamp-2">{a.title}</h2>
                  <Badge variant="outline" className="shrink-0 gap-1">
                    <VisIcon v={a.visibility} />
                    {a.visibility}
                  </Badge>
                </div>
                {a.category && <Badge variant="secondary" className="mb-2">{a.category}</Badge>}
                <p className="text-sm text-muted-foreground line-clamp-3 mb-3">{a.content}</p>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{formatDistanceToNow(new Date(a.created_at), { addSuffix: true })}</span>
                  <div className="flex gap-3">
                    <span className="inline-flex items-center gap-1">
                      <ThumbsUp className="h-3 w-3" /> {a.likes_count || 0}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <MessageSquare className="h-3 w-3" /> {a.comments_count || 0}
                    </span>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default Articles;
