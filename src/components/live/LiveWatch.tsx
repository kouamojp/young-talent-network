import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Radio, Eye, MapPin, ArrowLeft, Video, StopCircle, Loader2, VolumeX } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { tr } from '@/i18n';
import { useLiveViewer } from '@/hooks/useLiveStream';

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
  const { status, remoteStream, viewers } = useLiveViewer(stream.id, stream.viewers);
  const isLive = status !== 'ended';
  const [ending, setEnding] = useState(false);
  const [muted, setMuted] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Browsers may refuse to start a video with sound without a click on the page:
  // in that case it starts muted and the viewer turns the sound on.
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.srcObject = remoteStream;
    if (!remoteStream) return;
    video.muted = false;
    setMuted(false);
    video.play().catch(() => {
      video.muted = true;
      setMuted(true);
      video.play().catch(() => undefined);
    });
  }, [remoteStream]);

  const unmute = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = false;
    setMuted(false);
    video.play().catch(() => undefined);
  };

  const overlayText =
    status === 'ended' ? tr('liveWatch.theStreamHasEnded')
    : status === 'full' ? tr('liveWatch.full')
    : status === 'unsupported' ? tr('liveStudio.httpsRequired')
    : status === 'reconnecting' ? tr('calls.reconnecting')
    : status === 'connecting' ? tr('liveWatch.connecting')
    : null;

  const handleEndStream = async () => {
    if (ending) return;
    setEnding(true);
    const { error } = await supabase
      .from('live_streams')
      .update({ is_live: false, ended_at: new Date().toISOString() })
      .eq('id', stream.id);
    setEnding(false);
    if (error) {
      toast({ title: tr('settings.error'), description: error.message, variant: 'destructive' });
      return;
    }
    toast({ title: tr('liveWatch.streamEnded') });
    onEnded();
  };

  return (
    <div className="space-y-4">
      <Button variant="ghost" size="sm" onClick={onBack} className="gap-1.5">
        <ArrowLeft className="h-4 w-4" />
        {tr('liveWatch.back')}
      </Button>

      {/* Video area */}
      <div className="relative rounded-xl overflow-hidden bg-black aspect-video flex items-center justify-center">
        <video ref={videoRef} autoPlay playsInline className="absolute inset-0 w-full h-full object-contain" />
        {overlayText && (
          <>
            <img src={stream.thumbnail} alt={stream.title} className="absolute inset-0 w-full h-full object-cover opacity-40" />
            <div className="relative z-10 text-center text-white px-4">
              {status === 'connecting' || status === 'reconnecting'
                ? <Loader2 className="h-10 w-10 mx-auto mb-2 animate-spin opacity-80" />
                : <Video className="h-12 w-12 mx-auto mb-2 opacity-70" />}
              <p className="text-sm opacity-80">{overlayText}</p>
            </div>
          </>
        )}
        {status === 'live' && muted && (
          <Button size="sm" variant="secondary" onClick={unmute} className="absolute bottom-3 left-3 z-20 gap-1.5">
            <VolumeX className="h-4 w-4" />
            {tr('liveWatch.unmute')}
          </Button>
        )}
        {isLive && (
          <div className="absolute top-3 left-3 z-20">
            <Badge className="bg-destructive text-destructive-foreground text-xs px-2 py-1">
              <Radio className="h-3 w-3 mr-1 animate-pulse" /> {tr('common.live')}
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
              {tr('liveWatch.endStream')}
            </Button>
          )}
        </div>

        {stream.description && (
          <p className="text-sm text-muted-foreground whitespace-pre-wrap">{stream.description}</p>
        )}

        {!isLive && (
          <div className="rounded-lg border border-border bg-muted/40 p-4 text-center text-sm text-muted-foreground">
            {tr('liveWatch.thisStreamHasEnded')}
            <div className="mt-2">
              <Button size="sm" variant="outline" onClick={onBack}>{tr('liveWatch.backToLiveStreams')}</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LiveWatch;
