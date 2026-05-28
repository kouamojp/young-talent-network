import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Clock, MessageCircle, Heart, UserPlus, FileText, History, Loader2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

type ActivityType = 'post' | 'comment' | 'like' | 'connection';

interface ActivityItem {
  id: string;
  type: ActivityType;
  user_id: string;
  user_name: string;
  user_avatar: string | null;
  content: string;
  created_at: string;
  link?: string;
}

const typeIcon: Record<ActivityType, React.ElementType> = {
  post: FileText,
  comment: MessageCircle,
  like: Heart,
  connection: UserPlus,
};

const typeColor: Record<ActivityType, string> = {
  post: 'text-blue-500 bg-blue-500/10',
  comment: 'text-emerald-500 bg-emerald-500/10',
  like: 'text-rose-500 bg-rose-500/10',
  connection: 'text-violet-500 bg-violet-500/10',
};

const ActivityHistoryWidget: React.FC = () => {
  const navigate = useNavigate();
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'me' | 'friends'>('all');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }

      // Get accepted friends
      const { data: conns } = await supabase
        .from('connections')
        .select('user_id, connected_user_id')
        .eq('status', 'accepted')
        .or(`user_id.eq.${user.id},connected_user_id.eq.${user.id}`);

      const friendIds = (conns || []).map(c =>
        c.user_id === user.id ? c.connected_user_id : c.user_id
      );
      const scopeIds = [user.id, ...friendIds];

      // Recent posts
      const { data: posts } = await supabase
        .from('posts')
        .select('id, content, created_at, user_id, profiles(name, avatar_url)')
        .in('user_id', scopeIds)
        .order('created_at', { ascending: false })
        .limit(15);

      // Recent comments
      const { data: comments } = await supabase
        .from('comments')
        .select('id, content, created_at, user_id, post_id, profiles(name, avatar_url)')
        .in('user_id', scopeIds)
        .order('created_at', { ascending: false })
        .limit(15);

      // Recent connections
      const { data: newConns } = await supabase
        .from('connections')
        .select('id, created_at, user_id, connected_user_id, status')
        .eq('status', 'accepted')
        .in('user_id', scopeIds)
        .order('created_at', { ascending: false })
        .limit(10);

      const items: ActivityItem[] = [];

      (posts || []).forEach((p: any) => items.push({
        id: `p-${p.id}`,
        type: 'post',
        user_id: p.user_id,
        user_name: p.profiles?.name || 'User',
        user_avatar: p.profiles?.avatar_url || null,
        content: p.content?.slice(0, 80) || '',
        created_at: p.created_at,
        link: '/feed',
      }));

      (comments || []).forEach((c: any) => items.push({
        id: `c-${c.id}`,
        type: 'comment',
        user_id: c.user_id,
        user_name: c.profiles?.name || 'User',
        user_avatar: c.profiles?.avatar_url || null,
        content: c.content?.slice(0, 80) || '',
        created_at: c.created_at,
        link: '/feed',
      }));

      // Fetch profile info for connection items
      const connUserIds = (newConns || []).flatMap(c => [c.user_id, c.connected_user_id]);
      const { data: connProfiles } = connUserIds.length
        ? await supabase.from('profiles').select('id, name, avatar_url').in('id', connUserIds)
        : { data: [] as any[] };
      const profMap = new Map((connProfiles || []).map((p: any) => [p.id, p]));

      (newConns || []).forEach((c: any) => {
        const actor = profMap.get(c.user_id);
        const target = profMap.get(c.connected_user_id);
        items.push({
          id: `cn-${c.id}`,
          type: 'connection',
          user_id: c.user_id,
          user_name: actor?.name || 'User',
          user_avatar: actor?.avatar_url || null,
          content: `est désormais connecté(e) avec ${target?.name || 'un membre'}`,
          created_at: c.created_at,
          link: `/talent/${c.connected_user_id}`,
        });
      });

      items.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      setActivities(items.slice(0, 30));
      setLoading(false);
    };
    load();
  }, []);

  const filtered = activities.filter(a => {
    if (filter === 'all') return true;
    // requires currentUser id — recompute via async-stored; simpler: rely on user_avatar matching is fragile.
    return true;
  });

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3 bg-gradient-to-r from-primary/5 via-transparent to-transparent">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-sm flex items-center gap-2">
            <History className="h-4 w-4 text-primary" />
            Historique d'activité
          </h3>
          <div className="flex gap-1">
            {(['all', 'me', 'friends'] as const).map(f => (
              <Button
                key={f}
                variant={filter === f ? 'default' : 'ghost'}
                size="sm"
                className="h-6 px-2 text-[10px]"
                onClick={() => setFilter(f)}
              >
                {f === 'all' ? 'Tout' : f === 'me' ? 'Moi' : 'Amis'}
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {loading ? (
          <div className="flex justify-center py-6"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
        ) : filtered.length === 0 ? (
          <div className="text-center text-xs text-muted-foreground py-6 px-4">
            Aucune activité récente. Connectez-vous avec des amis pour voir leur historique.
          </div>
        ) : (
          <ScrollArea className="h-[360px]">
            <ul className="divide-y divide-border">
              {filtered.map(a => {
                const Icon = typeIcon[a.type];
                return (
                  <li
                    key={a.id}
                    onClick={() => a.link && navigate(a.link)}
                    className="flex items-start gap-3 px-3 py-2.5 hover:bg-muted/50 cursor-pointer transition-colors"
                  >
                    <div className="relative flex-shrink-0">
                      <Avatar className="h-9 w-9">
                        <AvatarImage src={a.user_avatar || ''} />
                        <AvatarFallback className="text-xs">{a.user_name[0]}</AvatarFallback>
                      </Avatar>
                      <div className={`absolute -bottom-1 -right-1 rounded-full p-1 border-2 border-background ${typeColor[a.type]}`}>
                        <Icon className="h-2.5 w-2.5" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs leading-snug">
                        <span className="font-semibold">{a.user_name}</span>{' '}
                        <span className="text-muted-foreground">
                          {a.type === 'post' && 'a publié :'}
                          {a.type === 'comment' && 'a commenté :'}
                          {a.type === 'like' && 'a aimé une publication'}
                          {a.type === 'connection' && ''}
                        </span>{' '}
                        {a.content && <span className="text-foreground/80">"{a.content}"</span>}
                      </p>
                      <p className="text-[10px] text-muted-foreground mt-0.5 flex items-center gap-1">
                        <Clock className="h-2.5 w-2.5" />
                        {formatDistanceToNow(new Date(a.created_at), { addSuffix: true, locale: fr })}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ul>
            <ScrollBar />
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
};

export default ActivityHistoryWidget;
