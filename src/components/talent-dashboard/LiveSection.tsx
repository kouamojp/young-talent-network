import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Radio, Calendar, Clock, Users, Loader2, Video } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface StreamRow {
  id: string;
  title: string;
  category: string | null;
  viewer_count: number | null;
  is_live: boolean | null;
  started_at: string | null;
  ended_at: string | null;
}

const duration = (start: string | null, end: string | null) => {
  if (!start || !end) return '';
  const ms = new Date(end).getTime() - new Date(start).getTime();
  if (ms <= 0) return '';
  const mins = Math.round(ms / 60000);
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
};

const LiveSection: React.FC = () => {
  const navigate = useNavigate();
  const [liveNow, setLiveNow] = useState<StreamRow[]>([]);
  const [pastStreams, setPastStreams] = useState<StreamRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }
      const { data } = await supabase
        .from('live_streams')
        .select('id, title, category, viewer_count, is_live, started_at, ended_at')
        .eq('streamer_id', user.id)
        .order('started_at', { ascending: false });
      const rows = (data || []) as StreamRow[];
      setLiveNow(rows.filter(r => r.is_live));
      setPastStreams(rows.filter(r => !r.is_live));
      setLoading(false);
    })();
  }, []);

  if (loading) {
    return <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Diffusion en direct</h3>
        <Button onClick={() => navigate('/live')}>
          <Video className="h-4 w-4 mr-2" />
          Lancer un direct
        </Button>
      </div>

      {/* Live now */}
      {liveNow.length > 0 && (
        <div className="space-y-4">
          <h4 className="font-medium text-gray-900">🔴 En direct maintenant</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {liveNow.map((stream) => (
              <Card key={stream.id} className="border-l-4 border-l-destructive">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <h5 className="font-semibold">{stream.title}</h5>
                    <Badge className="bg-destructive text-destructive-foreground">
                      <Radio className="h-3 w-3 mr-1 animate-pulse" /> LIVE
                    </Badge>
                  </div>
                  <div className="space-y-2 text-sm text-gray-600">
                    {stream.category && (
                      <div className="flex items-center gap-2"><Radio className="h-3 w-3" />{stream.category}</div>
                    )}
                    <div className="flex items-center gap-2"><Users className="h-3 w-3" />{stream.viewer_count || 0} spectateurs</div>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <Button size="sm" className="flex-1" onClick={() => navigate('/live')}>Voir</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Past streams */}
      <div className="space-y-4">
        <h4 className="font-medium text-gray-900">🎥 Directs passés</h4>
        {pastStreams.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="p-6 text-center">
              <Video className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-600 mb-4">Aucun direct passé pour le moment</p>
              <Button variant="outline" onClick={() => navigate('/live')}>
                <Video className="h-4 w-4 mr-2" />
                Lancer votre premier direct
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {pastStreams.map((stream) => (
              <Card key={stream.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h5 className="font-semibold mb-1">{stream.title}</h5>
                      <div className="flex items-center gap-4 text-sm text-gray-600 flex-wrap">
                        {stream.category && (
                          <span className="flex items-center gap-1"><Radio className="h-3 w-3" />{stream.category}</span>
                        )}
                        {stream.started_at && (
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(stream.started_at).toLocaleDateString('fr-FR')}
                          </span>
                        )}
                        {duration(stream.started_at, stream.ended_at) && (
                          <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{duration(stream.started_at, stream.ended_at)}</span>
                        )}
                        <span className="flex items-center gap-1"><Users className="h-3 w-3" />{stream.viewer_count || 0} spectateurs</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default LiveSection;
