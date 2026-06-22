import React, { useEffect, useRef, useState } from 'react';
import { useCall } from '@/contexts/CallContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Phone, PhoneOff, Video, Mic, MicOff, VideoOff } from 'lucide-react';

const formatDuration = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

const CallOverlay: React.FC = () => {
  const { status, peer, isVideo, micOn, camOn, localStream, remoteStream, acceptCall, rejectCall, hangUp, toggleMic, toggleCam } = useCall();
  const localRef = useRef<HTMLVideoElement>(null);
  const remoteRef = useRef<HTMLVideoElement>(null);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (localRef.current && localStream) localRef.current.srcObject = localStream;
  }, [localStream, status]);

  useEffect(() => {
    if (remoteRef.current && remoteStream) remoteRef.current.srcObject = remoteStream;
  }, [remoteStream, status]);

  useEffect(() => {
    if (status !== 'connected') { setElapsed(0); return; }
    const id = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(id);
  }, [status]);

  if (status === 'idle') return null;

  // Incoming call prompt
  if (status === 'incoming') {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm">
        <div className="bg-card rounded-2xl shadow-2xl p-8 w-[90%] max-w-sm text-center animate-in fade-in zoom-in">
          <Avatar className="h-24 w-24 mx-auto mb-4">
            <AvatarImage src={peer?.avatar_url || ''} />
            <AvatarFallback className="text-3xl">{peer?.name?.[0] || '?'}</AvatarFallback>
          </Avatar>
          <h2 className="text-xl font-bold">{peer?.name}</h2>
          <p className="text-muted-foreground text-sm mb-8 flex items-center justify-center gap-1">
            {isVideo ? <Video className="h-4 w-4" /> : <Phone className="h-4 w-4" />}
            Appel {isVideo ? 'vidéo' : 'audio'} entrant…
          </p>
          <div className="flex items-center justify-center gap-8">
            <button onClick={rejectCall} className="flex flex-col items-center gap-1">
              <span className="h-14 w-14 rounded-full bg-destructive flex items-center justify-center text-white"><PhoneOff className="h-6 w-6" /></span>
              <span className="text-xs text-muted-foreground">Refuser</span>
            </button>
            <button onClick={acceptCall} className="flex flex-col items-center gap-1">
              <span className="h-14 w-14 rounded-full bg-green-600 flex items-center justify-center text-white animate-pulse"><Phone className="h-6 w-6" /></span>
              <span className="text-xs text-muted-foreground">Accepter</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Outgoing / connected / ended
  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-zinc-900 text-white">
      {/* Remote video / avatar */}
      <div className="relative flex-1 flex items-center justify-center overflow-hidden">
        {isVideo && remoteStream ? (
          <video ref={remoteRef} autoPlay playsInline className="w-full h-full object-cover" />
        ) : (
          <div className="flex flex-col items-center gap-4">
            <Avatar className="h-32 w-32">
              <AvatarImage src={peer?.avatar_url || ''} />
              <AvatarFallback className="text-5xl">{peer?.name?.[0] || '?'}</AvatarFallback>
            </Avatar>
            <h2 className="text-2xl font-bold">{peer?.name}</h2>
          </div>
        )}

        {/* Status line */}
        <div className="absolute top-6 left-1/2 -translate-x-1/2 text-center">
          {status === 'outgoing' && <p className="text-white/80 animate-pulse">Appel en cours…</p>}
          {status === 'connected' && <p className="text-white/80">{formatDuration(elapsed)}</p>}
          {status === 'ended' && <p className="text-white/80">Appel terminé</p>}
        </div>

        {/* Local preview */}
        {isVideo && localStream && (
          <video ref={localRef} autoPlay playsInline muted className="absolute bottom-28 right-4 w-28 h-40 object-cover rounded-xl border-2 border-white/20 shadow-lg" />
        )}
      </div>

      {/* Controls */}
      <div className="pb-10 pt-6 flex items-center justify-center gap-6">
        <button onClick={toggleMic} className="h-14 w-14 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
          {micOn ? <Mic className="h-6 w-6" /> : <MicOff className="h-6 w-6 text-red-400" />}
        </button>
        <button onClick={hangUp} className="h-16 w-16 rounded-full bg-destructive hover:bg-destructive/90 flex items-center justify-center transition-colors">
          <PhoneOff className="h-7 w-7" />
        </button>
        {isVideo && (
          <button onClick={toggleCam} className="h-14 w-14 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
            {camOn ? <Video className="h-6 w-6" /> : <VideoOff className="h-6 w-6 text-red-400" />}
          </button>
        )}
      </div>
    </div>
  );
};

export default CallOverlay;
