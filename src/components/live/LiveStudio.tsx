import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Radio, Eye, Mic, MicOff, Video, VideoOff, SwitchCamera, StopCircle, Loader2, Clock } from 'lucide-react';
import { tr } from '@/i18n';

interface LiveStudioProps {
  title: string;
  localStream: MediaStream | null;
  viewers: number;
  startedAt: number | null;
  micOn: boolean;
  camOn: boolean;
  frontCamera: boolean;
  canSwitchCamera: boolean;
  ending: boolean;
  onToggleMic: () => void;
  onToggleCam: () => void;
  onSwitchCamera: () => void;
  onEnd: () => void;
}

const formatElapsed = (seconds: number) => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  const pad = (n: number) => String(n).padStart(2, '0');
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`;
};

/** The streamer's control room while on air: own picture, audience, controls. */
const LiveStudio: React.FC<LiveStudioProps> = ({
  title, localStream, viewers, startedAt, micOn, camOn, frontCamera, canSwitchCamera, ending,
  onToggleMic, onToggleCam, onSwitchCamera, onEnd,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (videoRef.current) videoRef.current.srcObject = localStream;
  }, [localStream]);

  useEffect(() => {
    if (!startedAt) return;
    const tick = () => setElapsed(Math.max(0, Math.round((Date.now() - startedAt) / 1000)));
    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, [startedAt]);

  return (
    <div className="space-y-4">
      <div className="relative rounded-xl overflow-hidden bg-black aspect-video">
        {/* Muted: the streamer must not hear their own microphone. */}
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className={`absolute inset-0 w-full h-full object-contain ${frontCamera ? '-scale-x-100' : ''}`}
        />
        {!camOn && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black text-white/80">
            <VideoOff className="h-10 w-10 mb-2" />
            <p className="text-sm">{tr('liveStudio.cameraOff')}</p>
          </div>
        )}
        <div className="absolute top-3 left-3 flex items-center gap-2">
          <Badge className="bg-destructive text-destructive-foreground text-xs px-2 py-1">
            <Radio className="h-3 w-3 mr-1 animate-pulse" /> {tr('common.live')}
          </Badge>
          <Badge variant="secondary" className="text-xs bg-black/60 text-white border-0 tabular-nums">
            <Clock className="h-3 w-3 mr-1" /> {formatElapsed(elapsed)}
          </Badge>
        </div>
        <div className="absolute top-3 right-3">
          <Badge variant="secondary" className="text-xs bg-black/60 text-white border-0 tabular-nums">
            <Eye className="h-3 w-3 mr-1" /> {viewers}
          </Badge>
        </div>
      </div>

      <h2 className="text-lg font-semibold text-foreground">{title}</h2>

      <div className="flex flex-wrap items-center gap-2">
        <Button
          variant={micOn ? 'outline' : 'secondary'}
          size="icon"
          onClick={onToggleMic}
          aria-label={micOn ? tr('calls.muteMic') : tr('calls.unmuteMic')}
          title={micOn ? tr('calls.muteMic') : tr('calls.unmuteMic')}
        >
          {micOn ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4 text-destructive" />}
        </Button>
        <Button
          variant={camOn ? 'outline' : 'secondary'}
          size="icon"
          onClick={onToggleCam}
          aria-label={camOn ? tr('calls.turnCamOff') : tr('calls.turnCamOn')}
          title={camOn ? tr('calls.turnCamOff') : tr('calls.turnCamOn')}
        >
          {camOn ? <Video className="h-4 w-4" /> : <VideoOff className="h-4 w-4 text-destructive" />}
        </Button>
        {canSwitchCamera && (
          <Button
            variant="outline"
            size="icon"
            onClick={onSwitchCamera}
            aria-label={tr('liveStudio.switchCamera')}
            title={tr('liveStudio.switchCamera')}
          >
            <SwitchCamera className="h-4 w-4" />
          </Button>
        )}
        <Button variant="destructive" onClick={onEnd} disabled={ending} className="gap-1.5 ml-auto">
          {ending ? <Loader2 className="h-4 w-4 animate-spin" /> : <StopCircle className="h-4 w-4" />}
          {tr('liveWatch.endStream')}
        </Button>
      </div>

      <p className="text-xs text-muted-foreground">{tr('liveStudio.keepOpen')}</p>
    </div>
  );
};

export default LiveStudio;
