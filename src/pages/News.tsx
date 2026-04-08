
import React, { useState, useEffect } from 'react';
import { Newspaper, TrendingUp, Search, Calendar, Eye, Heart, MessageSquare, Share2, BookOpen, Star, Filter, ChevronRight, Play, Image as ImageIcon, Clock, User, Flame } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { supabase } from '@/integrations/supabase/client';

const newsCategories = [
  'All', 'Sports', 'Arts', 'Music', 'Technology', 'Business', 'Entertainment', 'Education', 'Community'
];

const trendingTopics = [
  { tag: '#TalentShowcase', posts: 1240 },
  { tag: '#YATCommunity', posts: 890 },
  { tag: '#SportsNews', posts: 756 },
  { tag: '#NewOpportunities', posts: 623 },
  { tag: '#SuccessStories', posts: 512 },
];

const News: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('posts')
      .select(`*, profiles (name, avatar_url, city, country, sport_type)`)
      .order('created_at', { ascending: false })
      .limit(20);
    setPosts(data || []);
    setLoading(false);
  };

  const filteredPosts = posts.filter(post => {
    const matchesSearch = !searchQuery || post.content?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const popularPosts = [...filteredPosts].sort((a, b) => (b.likes_count || 0) - (a.likes_count || 0));

  const stats = [
    { icon: Newspaper, label: 'Articles', value: posts.length.toString(), color: 'text-blue-500' },
    { icon: Eye, label: 'Views Today', value: '12.4K', color: 'text-emerald-500' },
    { icon: TrendingUp, label: 'Trending', value: trendingTopics.length.toString(), color: 'text-orange-500' },
    { icon: Star, label: 'Featured', value: Math.min(3, posts.length).toString(), color: 'text-amber-500' },
  ];

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffH = Math.floor(diffMs / 3600000);
    if (diffH < 1) return 'Just now';
    if (diffH < 24) return `${diffH}h ago`;
    const diffD = Math.floor(diffH / 24);
    if (diffD < 7) return `${diffD}d ago`;
    return date.toLocaleDateString();
  };

  const PostCard = ({ post, featured = false }: { post: any; featured?: boolean }) => (
    <Card className={`overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer group ${featured ? 'border-primary/30' : ''}`}>
      {post.media_urls?.length > 0 && (
        <div className="relative h-48 bg-muted overflow-hidden">
          <img src={post.media_urls[0]} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          {featured && (
            <Badge className="absolute top-3 left-3 bg-primary text-primary-foreground">
              <Flame className="h-3 w-3 mr-1" /> Featured
            </Badge>
          )}
        </div>
      )}
      <CardContent className={`${post.media_urls?.length > 0 ? 'p-4' : 'p-5'}`}>
        <div className="flex items-center gap-3 mb-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={post.profiles?.avatar_url} />
            <AvatarFallback>{post.profiles?.name?.[0] || 'U'}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{post.profiles?.name || 'Anonymous'}</p>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              <span>{formatDate(post.created_at)}</span>
              {post.profiles?.sport_type && (
                <Badge variant="outline" className="text-[10px] px-1.5 py-0">{post.profiles.sport_type}</Badge>
              )}
            </div>
          </div>
        </div>

        <p className={`text-sm leading-relaxed ${featured ? 'line-clamp-4' : 'line-clamp-3'} mb-3`}>
          {post.content}
        </p>

        <div className="flex items-center justify-between pt-3 border-t border-border">
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><Heart className="h-3.5 w-3.5" /> {post.likes_count || 0}</span>
            <span className="flex items-center gap-1"><MessageSquare className="h-3.5 w-3.5" /> {post.comments_count || 0}</span>
          </div>
          <Button variant="ghost" size="sm" className="text-xs h-7">
            <Share2 className="h-3.5 w-3.5 mr-1" /> Share
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
              <Newspaper className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">YAT Post News</h1>
              <p className="text-white/80 text-sm">Articles, trending posts & community updates</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="container mx-auto px-4 -mt-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {stats.map((stat, i) => (
            <Card key={i} className="p-4">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg bg-muted ${stat.color}`}>
                  <stat.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xl font-bold">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Search & Filters */}
      <div className="container mx-auto px-4 py-4">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search articles, posts, news..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {newsCategories.map(cat => (
              <Button
                key={cat}
                variant={selectedCategory === cat ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory(cat)}
                className="whitespace-nowrap text-xs"
              >
                {cat}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 pb-8">
        <Tabs defaultValue="latest" className="space-y-4">
          <TabsList>
            <TabsTrigger value="latest"><Clock className="h-4 w-4 mr-1.5" /> Latest</TabsTrigger>
            <TabsTrigger value="trending"><TrendingUp className="h-4 w-4 mr-1.5" /> Trending</TabsTrigger>
            <TabsTrigger value="popular"><Flame className="h-4 w-4 mr-1.5" /> Popular</TabsTrigger>
            <TabsTrigger value="media"><Play className="h-4 w-4 mr-1.5" /> Media</TabsTrigger>
          </TabsList>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Feed */}
            <div className="lg:col-span-2 space-y-4">
              <TabsContent value="latest" className="mt-0 space-y-4">
                {loading ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <Card key={i} className="p-6"><div className="h-24 bg-muted animate-pulse rounded" /></Card>
                  ))
                ) : filteredPosts.length > 0 ? (
                  filteredPosts.map((post, i) => (
                    <PostCard key={post.id} post={post} featured={i === 0} />
                  ))
                ) : (
                  <Card className="p-12 text-center">
                    <Newspaper className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                    <h3 className="font-semibold mb-1">No posts yet</h3>
                    <p className="text-sm text-muted-foreground">Be the first to share news with the community!</p>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="trending" className="mt-0 space-y-4">
                {popularPosts.slice(0, 10).map((post) => (
                  <PostCard key={post.id} post={post} />
                ))}
              </TabsContent>

              <TabsContent value="popular" className="mt-0 space-y-4">
                {popularPosts.map((post) => (
                  <PostCard key={post.id} post={post} />
                ))}
              </TabsContent>

              <TabsContent value="media" className="mt-0">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {filteredPosts.filter(p => p.media_urls?.length > 0).length > 0 ? (
                    filteredPosts.filter(p => p.media_urls?.length > 0).map(post => (
                      <Card key={post.id} className="overflow-hidden group cursor-pointer">
                        <div className="relative aspect-square bg-muted">
                          <img src={post.media_urls[0]} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <div className="flex gap-3 text-white text-sm">
                              <span className="flex items-center gap-1"><Heart className="h-4 w-4" /> {post.likes_count || 0}</span>
                              <span className="flex items-center gap-1"><MessageSquare className="h-4 w-4" /> {post.comments_count || 0}</span>
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))
                  ) : (
                    <div className="col-span-full">
                      <Card className="p-12 text-center">
                        <ImageIcon className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                        <h3 className="font-semibold mb-1">No media posts</h3>
                        <p className="text-sm text-muted-foreground">Posts with photos and videos will appear here.</p>
                      </Card>
                    </div>
                  )}
                </div>
              </TabsContent>
            </div>

            {/* Right Sidebar */}
            <div className="space-y-4">
              {/* Trending Topics */}
              <Card className="p-4">
                <h3 className="font-semibold flex items-center gap-2 mb-3">
                  <TrendingUp className="h-4 w-4 text-orange-500" /> Trending Topics
                </h3>
                <div className="space-y-3">
                  {trendingTopics.map((topic, i) => (
                    <div key={i} className="flex items-center justify-between group cursor-pointer hover:bg-muted/50 rounded-lg p-2 -mx-2 transition-colors">
                      <div>
                        <p className="text-sm font-medium text-primary">{topic.tag}</p>
                        <p className="text-xs text-muted-foreground">{topic.posts.toLocaleString()} posts</p>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  ))}
                </div>
              </Card>

              {/* Recent Authors */}
              <Card className="p-4">
                <h3 className="font-semibold flex items-center gap-2 mb-3">
                  <User className="h-4 w-4 text-blue-500" /> Active Authors
                </h3>
                <div className="space-y-3">
                  {posts.slice(0, 5).map((post, i) => (
                    <div key={i} className="flex items-center gap-3 group cursor-pointer hover:bg-muted/50 rounded-lg p-2 -mx-2 transition-colors">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={post.profiles?.avatar_url} />
                        <AvatarFallback>{post.profiles?.name?.[0] || 'U'}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{post.profiles?.name || 'Anonymous'}</p>
                        <p className="text-xs text-muted-foreground">{post.profiles?.city || post.profiles?.country || 'Global'}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Categories */}
              <Card className="p-4">
                <h3 className="font-semibold flex items-center gap-2 mb-3">
                  <BookOpen className="h-4 w-4 text-purple-500" /> Categories
                </h3>
                <div className="flex flex-wrap gap-2">
                  {newsCategories.filter(c => c !== 'All').map(cat => (
                    <Badge
                      key={cat}
                      variant={selectedCategory === cat ? 'default' : 'outline'}
                      className="cursor-pointer"
                      onClick={() => setSelectedCategory(cat)}
                    >
                      {cat}
                    </Badge>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        </Tabs>
      </div>

    </div>
  );
};

export default News;
