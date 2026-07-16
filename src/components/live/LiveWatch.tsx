import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Radio, Eye, MapPin, ArrowLeft, Video, StopCircle, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

export interface WatchStream {
  id: string;
  title: string;
  streamerName: string;
  streamerId: string;
  streamerAvatar?: string;
  thumbnail: string;
  viewers: number;
  category: string;
  location: string;
  description?: string;
}

interface LiveWatchProps {
  stream: WatchStream;
  currentUserId: string | null;
  onBack: () => void;
  onEnded: () => void;
}

const LiveWatch: React.FC<LiveWatchProps> = ({ stream, currentUserId, onBack, onEnded }) => {
  const { toast } = useToast();
  const isStreamer = currentUserId === stream.streamerId;
  const [viewers, setViewers] = useState(stream.viewers);
  const [isLive, setIsLive] = useState(true);
  const [ending, setEnding] = useState(false);
  const countedRef = useRef(false);

  const bumpViewers = async (delta: number) => {
    const { data } = await supabase.from('live_streams').select('viewer_count').eq('id', stream.id).single();
    const current = data?.viewer_count ?? 0;
    await supabase.from('live_streams').update({ viewer_count: Math.max(0, current + delta) }).eq('id', stream.id);
  };

  useEffect(() => {
    // Count this viewer (skip the streamer watching their own stream).
    if (!isStreamer && !countedRef.current) {
      countedRef.current = true;
      bumpViewers(1);
    }

    const channel = supabase
      .channel(`live-stream-${stream.id}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'live_streams', filter: `id=eq.${stream.id}` },
        (payload) => {
          const row = payload.new as { viewer_count: number | null; is_live: boolean | null };
          setViewers(row.viewer_count ?? 0);
          setIsLive(!!row.is_live);
        }
      )
      .subscribe();

    return () => {
      if (!isStreamer && countedRef.current) {
        countedRef.current = false;
        bumpViewers(-1);
      }
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stream.id]);

  const handleEndStream = async () => {
    if (ending) return;
    setEnding(true);
    const { error } = await supabase
      .from('live_streams')
      .update({ is_live: false, ended_at: new Date().toISOString() })
      .eq('id', stream.id);
    setEnding(false);
    if (error) {
      toast({ title: 'Erreur', description: error.message, variant: 'destructive' });
      return;
    }
    toast({ title: 'Direct terminé' });
    onEnded();
  };

  return (
    <div className="space-y-4">
      <Button variant="ghost" size="sm" onClick={onBack} className="gap-1.5">
        <ArrowLeft className="h-4 w-4" />
        Назад / Retour
      </Button>

      {/* Video area */}
      <div className="relative rounded-xl overflow-hidden bg-black aspect-video flex items-center justify-center">
        <img src={stream.thumbnail} alt={stream.title} className="absolute inset-0 w-full h-full object-cover opacity-40" />
        <div className="relative z-10 text-center text-white">
          <Video className="h-12 w-12 mx-auto mb-2 opacity-70" />
          <p className="text-sm opacity-80">
            {isLive ? 'Flux vidéo en direct' : 'Le direct est terminé'}
          </p>
        </div>
        {isLive && (
          <div className="absolute top-3 left-3 z-20">
            <Badge className="bg-destructive text-destructive-foreground text-xs px-2 py-1">
              <Radio className="h-3 w-3 mr-1 animate-pulse" /> LIVE
            </Badge>
          </div>
        )}
        <div className="absolute top-3 right-3 z-20">
          <Badge variant="secondary" className="text-xs bg-black/60 text-white border-0">
            <Eye className="h-3 w-3 mr-1" /> {viewers}
          </Badge>
        </div>
      </div>

      {/* Info */}
      <div className="space-y-3">
        <h1 className="text-xl font-bold text-foreground">{stream.title}</h1>

        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={stream.streamerAvatar} />
              <AvatarFallback>{stream.streamerName?.[0] || 'U'}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium text-sm">{stream.streamerName}</p>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                {stream.category && <Badge variant="outline" className="text-[10px]">{stream.category}</Badge>}
                {stream.location && (
                  <span className="flex items-center"><MapPin className="h-3 w-3 mr-0.5" />{stream.location}</span>
                )}
              </div>
            </div>
          </div>

          {isStreamer && isLive && (
            <Button variant="destructive" size="sm" onClick={handleEndStream} disabled={ending} className="gap-1.5">
              {ending ? <Loader2 className="h-4 w-4 animate-spin" /> : <StopCircle className="h-4 w-4" />}
              Terminer le direct
            </Button>
          )}
        </div>

        {stream.description && (
          <p className="text-sm text-muted-foreground whitespace-pre-wrap">{stream.description}</p>
        )}

        {!isLive && (
          <div className="rounded-lg border border-border bg-muted/40 p-4 text-center text-sm text-muted-foreground">
            Ce direct est terminé.
            <div className="mt-2">
              <Button size="sm" variant="outline" onClick={onBack}>Retour aux directs</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LiveWatch;
