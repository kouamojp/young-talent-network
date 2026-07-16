import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Tv, Upload, Play, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface Episode {
  id: string;
  title: string | null;
  category: string | null;
  url: string;
  item_date: string | null;
  created_at: string;
}

const VIDEO_TYPES = ['video', 'shorts', 'tv'];

const TVSection: React.FC = () => {
  const navigate = useNavigate();
  const [channelName, setChannelName] = useState('Ma chaîne');
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }

      const [profileRes, mediaRes] = await Promise.all([
        supabase.from('profiles').select('name').eq('id', user.id).single(),
        supabase.from('talent_media')
          .select('id, title, category, url, item_date, created_at, media_type')
          .eq('user_id', user.id)
          .in('media_type', VIDEO_TYPES)
          .order('created_at', { ascending: false }),
      ]);

      if (profileRes.data?.name) setChannelName(`${profileRes.data.name} TV`);
      setEpisodes((mediaRes.data || []) as Episode[]);
      setLoading(false);
    })();
  }, []);

  if (loading) {
    return <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  if (episodes.length === 0) {
    return (
      <div className="text-center py-12">
        <Tv className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold mb-2">Créez votre chaîne TV personnelle</h3>
        <p className="text-gray-600 mb-6 max-w-md mx-auto">
          Publiez vos vidéos et bâtissez votre audience. Vos contenus vidéo apparaîtront ici en tant qu'épisodes.
        </p>
        <Button onClick={() => navigate('/media')} size="lg">
          <Upload className="h-5 w-5 mr-2" />
          Publier une vidéo
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Channel Overview */}
      <Card className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-2xl font-bold">{channelName}</h3>
              <p className="opacity-90">Votre chaîne TV personnelle</p>
            </div>
            <Button variant="secondary" size="sm" onClick={() => navigate('/media')}>
              <Upload className="h-4 w-4 mr-2" />
              Publier
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm opacity-80">Épisodes</p>
              <p className="text-xl font-bold">{episodes.length}</p>
            </div>
            <div>
              <p className="text-sm opacity-80">Dernière publication</p>
              <p className="text-xl font-bold">
                {episodes[0]?.created_at ? new Date(episodes[0].created_at).toLocaleDateString('fr-FR') : '—'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Content Management */}
      <div className="flex justify-between items-center">
        <h4 className="text-lg font-semibold">📡 Bibliothèque de contenu</h4>
        <Button onClick={() => navigate('/media')}>
          <Plus className="h-4 w-4 mr-2" />
          Publier une vidéo
        </Button>
      </div>

      {/* Episodes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {episodes.map((episode) => (
          <Card key={episode.id} className="hover:shadow-md transition-shadow">
            <div className="aspect-video bg-gray-200 rounded-t-lg flex items-center justify-center overflow-hidden">
              <Play className="h-8 w-8 text-gray-400" />
            </div>
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-2">
                <h5 className="font-semibold text-sm line-clamp-1">{episode.title || 'Sans titre'}</h5>
                {episode.category && <Badge variant="secondary" className="text-xs">{episode.category}</Badge>}
              </div>
              <p className="text-xs text-gray-600">
                {new Date(episode.item_date || episode.created_at).toLocaleDateString('fr-FR')}
              </p>
              <div className="flex gap-2 mt-3">
                <Button size="sm" className="flex-1 text-xs" onClick={() => window.open(episode.url, '_blank')}>
                  Voir
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default TVSection;
