import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Heart, MessageCircle, Newspaper } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface Props {
  userIds: string[];
  /** Map from user_id -> label shown on the post (e.g. "Talent", "Agent") */
  labels?: Record<string, string>;
  limit?: number;
  emptyMessage?: string;
}

type PostRow = {
  id: string;
  user_id: string;
  content: string | null;
  media_urls: string[] | null;
  created_at: string;
  likes_count: number | null;
  comments_count: number | null;
};

type ProfileRow = {
  id: string;
  name: string | null;
  avatar_url: string | null;
  user_type: string | null;
};

export const AggregatedPostsFeed: React.FC<Props> = ({ userIds, labels, limit = 20, emptyMessage = 'Aucune publication publique.' }) => {
  const navigate = useNavigate();
  const [posts, setPosts] = useState<PostRow[]>([]);
  const [profilesMap, setProfilesMap] = useState<Record<string, ProfileRow>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userIds || userIds.length === 0) {
      setPosts([]); setLoading(false); return;
    }
    load();
  }, [JSON.stringify(userIds)]);

  const load = async () => {
    setLoading(true);
    try {
      const [postsRes, profilesRes] = await Promise.all([
        supabase
          .from('posts')
          .select('id, user_id, content, media_urls, created_at, likes_count, comments_count')
          .in('user_id', userIds)
          .eq('is_published', true)
          .eq('visibility', 'public')
          .order('created_at', { ascending: false })
          .limit(limit),
        supabase
          .from('profiles')
          .select('id, name, avatar_url, user_type')
          .in('id', userIds),
      ]);

      setPosts((postsRes.data || []) as PostRow[]);
      const map: Record<string, ProfileRow> = {};
      (profilesRes.data || []).forEach((p: any) => { map[p.id] = p; });
      setProfilesMap(map);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-6 text-center text-sm text-muted-foreground">Chargement…</div>;

  if (posts.length === 0) {
    return (
      <div className="p-8 text-center">
        <Newspaper className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
        <p className="text-sm text-muted-foreground">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {posts.map((p) => {
        const author = profilesMap[p.user_id];
        const label = labels?.[p.user_id];
        return (
          <div key={p.id} className="p-3 rounded-lg border border-border/50 bg-card">
            <div className="flex items-center gap-2 mb-2">
              <button onClick={() => navigate(`/talent/${p.user_id}`)} className="shrink-0">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={author?.avatar_url || ''} />
                  <AvatarFallback className="text-[10px]">{author?.name?.charAt(0) || '?'}</AvatarFallback>
                </Avatar>
              </button>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={() => navigate(`/talent/${p.user_id}`)}
                    className="text-sm font-semibold text-foreground truncate hover:text-primary"
                  >
                    {author?.name || 'Utilisateur'}
                  </button>
                  {label && <Badge variant="outline" className="text-[10px] py-0">{label}</Badge>}
                </div>
                <p className="text-[10px] text-muted-foreground">
                  {new Date(p.created_at).toLocaleString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
            {p.content && <p className="text-sm text-foreground whitespace-pre-wrap mb-2">{p.content}</p>}
            {p.media_urls && p.media_urls.length > 0 && (
              <div className={`grid gap-1.5 mb-2 ${p.media_urls.length > 1 ? 'grid-cols-2' : 'grid-cols-1'}`}>
                {p.media_urls.slice(0, 4).map((url, i) => (
                  <img key={i} src={url} alt="" className="w-full h-32 object-cover rounded-md" />
                ))}
              </div>
            )}
            <div className="flex items-center gap-4 text-[11px] text-muted-foreground pt-1 border-t border-border/30">
              <span className="flex items-center gap-1"><Heart className="h-3 w-3" /> {p.likes_count || 0}</span>
              <span className="flex items-center gap-1"><MessageCircle className="h-3 w-3" /> {p.comments_count || 0}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default AggregatedPostsFeed;
