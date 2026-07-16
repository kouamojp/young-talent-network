import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp, Heart, Users, FileText } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const AnalyticsDashboard: React.FC = () => {
  const [stats, setStats] = useState({ connections: 0, posts: 0, likes: 0, events: 0 });

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const [connRes, postsCountRes, likesRes, eventsRes] = await Promise.all([
        supabase.from('connections').select('id', { count: 'exact', head: true })
          .or(`user_id.eq.${user.id},connected_user_id.eq.${user.id}`).eq('status', 'accepted'),
        supabase.from('posts').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
        supabase.from('posts').select('likes_count').eq('user_id', user.id),
        supabase.from('events').select('id', { count: 'exact', head: true }).eq('organizer_id', user.id),
      ]);

      const likes = ((likesRes.data || []) as { likes_count: number | null }[])
        .reduce((sum, p) => sum + (p.likes_count || 0), 0);

      setStats({
        connections: connRes.count || 0,
        posts: postsCountRes.count || 0,
        likes,
        events: eventsRes.count || 0,
      });
    })();
  }, []);

  const tiles = [
    { title: 'Connexions', value: stats.connections, icon: Users, color: 'text-purple-600' },
    { title: 'Publications', value: stats.posts, icon: FileText, color: 'text-blue-600' },
    { title: "J'aime reçus", value: stats.likes, icon: Heart, color: 'text-pink-600' },
    { title: 'Événements', value: stats.events, icon: TrendingUp, color: 'text-green-600' },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      {tiles.map((stat, index) => (
        <Card key={index}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{stat.title}</p>
                <p className="text-2xl font-bold">{stat.value.toLocaleString()}</p>
              </div>
              <stat.icon className={`h-8 w-8 ${stat.color}`} />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default AnalyticsDashboard;
