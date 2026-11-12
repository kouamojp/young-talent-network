import React, { useEffect, useRef, useState } from 'react';
import { useCall } from '@/contexts/CallContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Phone, PhoneOff, Video, Mic, MicOff, VideoOff, Loader2 } from 'lucide-react';
import { tr } from '@/i18n';

const formatDuration = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

/** Attaches a MediaStream to a media element and starts playback (autoplay can be refused). */
const useStreamOn = <T extends HTMLMediaElement>(stream: MediaStream | null, deps: unknown[] = []) => {
  const ref = useRef<T>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (el.srcObject !== stream) el.srcObject = stream;
    if (stream) el.play().catch(() => { /* resumes on the next user gesture */ });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stream, ...deps]);
  return ref;
};

const CallOverlay: React.FC = () => {
  const { status, peer, isVideo, micOn, camOn, reconnecting, localStream, remoteStream, acceptCall, rejectCall, hangUp, toggleMic, toggleCam } = useCall();
  const [elapsed, setElapsed] = useState(0);

  const hasRemoteVideo = !!remoteStream && remoteStream.getVideoTracks().length > 0;
  const hasLocalVideo = !!localStream && localStream.getVideoTracks().length > 0;
  const showRemoteVideo = isVideo && hasRemoteVideo;

  // The remote sound always goes through this <audio>, in audio AND video calls:
  // the <video> is muted so the voice is never played twice, and an audio call
  // has no <video> at all.
  const remoteAudioRef = useStreamOn<HTMLAudioElement>(remoteStream, [status]);
  const remoteVideoRef = useStreamOn<HTMLVideoElement>(remoteStream, [status, showRemoteVideo]);
  const localVideoRef = useStreamOn<HTMLVideoElement>(localStream, [status, hasLocalVideo]);

  useEffect(() => {
    if (status !== 'connected') { setElapsed(0); return; }
    const id = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(id);
  }, [status]);

  if (status === 'idle') return null;

  // Incoming call prompt
  if (status === 'incoming') {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label={tr('callContext.incomingCall')}>
        <div className="bg-card rounded-2xl shadow-2xl p-8 w-[90%] max-w-sm text-center animate-in fade-in zoom-in">
          <Avatar className="h-24 w-24 mx-auto mb-4">
            <AvatarImage src={peer?.avatar_url || ''} />
            <AvatarFallback className="text-3xl">{peer?.name?.[0] || '?'}</AvatarFallback>
          </Avatar>
          <h2 className="text-xl font-bold break-words">{peer?.name}</h2>
          <p className="text-muted-foreground text-sm mb-8 flex items-center justify-center gap-1.5">
            {isVideo ? <Video className="h-4 w-4" /> : <Phone className="h-4 w-4" />}
            {isVideo ? tr('calls.incomingVideo') : tr('calls.incomingAudio')}
          </p>
          <div className="flex items-center justify-center gap-10">
            <button onClick={rejectCall} className="flex flex-col items-center gap-1">
              <span className="h-14 w-14 rounded-full bg-destructive flex items-center justify-center text-white"><PhoneOff className="h-6 w-6" /></span>
              <span className="text-xs text-muted-foreground">{tr('friends.decline')}</span>
            </button>
            <button onClick={acceptCall} className="flex flex-col items-center gap-1">
              <span className="h-14 w-14 rounded-full bg-green-600 flex items-center justify-center text-white animate-pulse">
                {isVideo ? <Video className="h-6 w-6" /> : <Phone className="h-6 w-6" />}
              </span>
              <span className="text-xs text-muted-foreground">{tr('friends.accept')}</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  const statusLine =
    status === 'ended' ? tr('callOverlay.callEnded')
      : reconnecting ? tr('calls.reconnecting')
        : status === 'connected' ? formatDuration(elapsed)
          : localStream && remoteStream ? tr('calls.connecting')
            : tr('callOverlay.calling');

  // Outgoing / connecting / connected / ended
  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-zinc-900 text-white" role="dialog" aria-modal="true">
      <audio ref={remoteAudioRef} autoPlay />

      <div className="relative flex-1 flex items-center justify-center overflow-hidden">
        {showRemoteVideo && (
          <video ref={remoteVideoRef} autoPlay playsInline muted className="absolute inset-0 w-full h-full object-contain bg-black" />
        )}

        {!showRemoteVideo && (
          <div className="flex flex-col items-center gap-4 px-6 text-center">
            <Avatar className={`h-32 w-32 ${status === 'connected' ? 'ring-4 ring-green-500/40' : ''}`}>
              <AvatarImage src={peer?.avatar_url || ''} />
              <AvatarFallback className="text-5xl text-foreground">{peer?.name?.[0] || '?'}</AvatarFallback>
            </Avatar>
            <h2 className="text-2xl font-bold break-words">{peer?.name}</h2>
          </div>
        )}

        {/* Status line */}
        <div className="absolute top-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-center">
          {showRemoteVideo && <p className="font-semibold drop-shadow">{peer?.name}</p>}
          <p className={`flex items-center gap-1.5 rounded-full bg-black/40 px-3 py-1 text-sm tabular-nums text-white/90 ${status === 'outgoing' ? 'animate-pulse' : ''}`}>
            {reconnecting && status !== 'ended' && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            {statusLine}
          </p>
        </div>

        {/* Local preview (mirrored, like a mirror) */}
        {isVideo && hasLocalVideo && (
          <div className="absolute bottom-4 right-4 w-28 h-40 overflow-hidden rounded-xl border-2 border-white/20 bg-black shadow-lg">
            <video ref={localVideoRef} autoPlay playsInline muted className="w-full h-full object-cover -scale-x-100" />
            {!camOn && (
              <div className="absolute inset-0 flex items-center justify-center bg-zinc-800"><VideoOff className="h-6 w-6 text-white/60" /></div>
            )}
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="pb-10 pt-6 flex items-center justify-center gap-6">
        <button
          onClick={toggleMic}
          aria-pressed={!micOn}
          aria-label={micOn ? tr('calls.muteMic') : tr('calls.unmuteMic')}
          title={micOn ? tr('calls.muteMic') : tr('calls.unmuteMic')}
          className="h-14 w-14 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
        >
          {micOn ? <Mic className="h-6 w-6" /> : <MicOff className="h-6 w-6 text-red-400" />}
        </button>
        <button
          onClick={hangUp}
          aria-label={tr('calls.hangUp')}
          title={tr('calls.hangUp')}
          className="h-16 w-16 rounded-full bg-destructive hover:bg-destructive/90 flex items-center justify-center transition-colors"
        >
          <PhoneOff className="h-7 w-7" />
        </button>
        {isVideo && hasLocalVideo && (
          <button
            onClick={toggleCam}
            aria-pressed={!camOn}
            aria-label={camOn ? tr('calls.turnCamOff') : tr('calls.turnCamOn')}
            title={camOn ? tr('calls.turnCamOff') : tr('calls.turnCamOn')}
            className="h-14 w-14 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
          >
            {camOn ? <Video className="h-6 w-6" /> : <VideoOff className="h-6 w-6 text-red-400" />}
          </button>
        )}
      </div>
    </div>
  );
};

export default CallOverlay;
