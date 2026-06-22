import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { ringtone } from '@/lib/ringtone';
import type { RealtimeChannel } from '@supabase/supabase-js';
import type { TablesUpdate } from '@/integrations/supabase/types';

/**
 * 1:1 audio/video calling built on WebRTC.
 * Signaling (offer/answer) travels over Supabase Realtime broadcast:
 *  - each user listens on a personal channel `calls:user:{userId}` for `invite` / `reject` / `cancel`
 *  - the actual call uses a per-call channel `call:{callId}` for `answer` / `hangup`
 * ICE is gathered fully before sending the SDP (non-trickle) to keep ordering simple and robust.
 */

export type CallStatus = 'idle' | 'outgoing' | 'incoming' | 'connected' | 'ended';

export interface CallPeer {
  id: string;
  name: string;
  avatar_url?: string | null;
}

interface IncomingInvite {
  callId: string;
  from: CallPeer;
  isVideo: boolean;
  offer: RTCSessionDescriptionInit;
}

interface CallContextValue {
  status: CallStatus;
  peer: CallPeer | null;
  isVideo: boolean;
  micOn: boolean;
  camOn: boolean;
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  startCall: (peer: CallPeer, isVideo: boolean) => Promise<void>;
  acceptCall: () => Promise<void>;
  rejectCall: () => void;
  hangUp: () => void;
  toggleMic: () => void;
  toggleCam: () => void;
}

const CallContext = createContext<CallContextValue | undefined>(undefined);

export const useCall = () => {
  const ctx = useContext(CallContext);
  if (!ctx) throw new Error('useCall must be used within a CallProvider');
  return ctx;
};

// STUN is free; a TURN server is required for reliable connectivity across strict NATs.
// Configure your own via env vars; falls back to the public OpenRelay TURN for development.
const ICE_SERVERS: RTCIceServer[] = [
  { urls: 'stun:stun.l.google.com:19302' },
  {
    urls: import.meta.env.VITE_TURN_URL || 'turn:openrelay.metered.ca:80',
    username: import.meta.env.VITE_TURN_USERNAME || 'openrelayproject',
    credential: import.meta.env.VITE_TURN_CREDENTIAL || 'openrelayproject',
  },
];

// Fire-and-forget broadcast to a user's personal call channel (invite / reject / cancel).
const sendToUser = (uid: string, event: string, payload: Record<string, unknown>) => {
  const ch = supabase.channel(`calls:user:${uid}`);
  ch.subscribe((s) => {
    if (s === 'SUBSCRIBED') {
      ch.send({ type: 'broadcast', event, payload });
      setTimeout(() => supabase.removeChannel(ch), 600);
    }
  });
};

// No answer after this delay → the call is considered missed.
const RING_TIMEOUT_MS = 35000;

// Wait until ICE candidate gathering is complete (or a timeout) before sending the SDP.
const waitForIceGathering = (pc: RTCPeerConnection, timeoutMs = 2500): Promise<void> =>
  new Promise((resolve) => {
    if (pc.iceGatheringState === 'complete') return resolve();
    const check = () => {
      if (pc.iceGatheringState === 'complete') {
        pc.removeEventListener('icegatheringstatechange', check);
        resolve();
      }
    };
    pc.addEventListener('icegatheringstatechange', check);
    setTimeout(resolve, timeoutMs);
  });

export const CallProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [userId, setUserId] = useState<string | null>(null);
  const selfRef = useRef<CallPeer | null>(null);
  const [status, setStatus] = useState<CallStatus>('idle');
  const [peer, setPeer] = useState<CallPeer | null>(null);
  const [isVideo, setIsVideo] = useState(false);
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);

  const pcRef = useRef<RTCPeerConnection | null>(null);
  const callChannelRef = useRef<RealtimeChannel | null>(null);
  const personalChannelRef = useRef<RealtimeChannel | null>(null);
  const callIdRef = useRef<string | null>(null);
  const incomingRef = useRef<IncomingInvite | null>(null);
  const connectedAtRef = useRef<number | null>(null);
  const peerRef = useRef<CallPeer | null>(null);
  const isVideoRef = useRef(false);
  const ringTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearRingTimeout = () => {
    if (ringTimeoutRef.current) { clearTimeout(ringTimeoutRef.current); ringTimeoutRef.current = null; }
  };

  // Insert a "missed call" notification for the current user (the one who missed it).
  const notifyMissed = useCallback(async (from: CallPeer | null, video: boolean) => {
    if (!userId || !from) return;
    await supabase.from('notifications').insert({
      user_id: userId,
      type: 'call',
      title: 'Appel manqué',
      message: `Appel ${video ? 'vidéo ' : ''}manqué de ${from.name}`,
      link: '/calls',
    });
  }, [userId]);

  const loadSelf = useCallback(async (id: string) => {
    const { data } = await supabase.from('profiles').select('id, name, avatar_url').eq('id', id).single();
    if (data) selfRef.current = data as CallPeer;
  }, []);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      const id = data.user?.id || null;
      setUserId(id);
      if (id) loadSelf(id);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      const id = session?.user?.id || null;
      setUserId(id);
      if (id) loadSelf(id);
    });
    return () => sub.subscription.unsubscribe();
  }, [loadSelf]);

  const cleanup = useCallback((nextStatus: CallStatus = 'idle') => {
    ringtone.stop();
    clearRingTimeout();
    pcRef.current?.getSenders().forEach((s) => s.track?.stop());
    pcRef.current?.close();
    pcRef.current = null;
    setLocalStream((s) => { s?.getTracks().forEach((t) => t.stop()); return null; });
    setRemoteStream(null);
    if (callChannelRef.current) { supabase.removeChannel(callChannelRef.current); callChannelRef.current = null; }
    callIdRef.current = null;
    incomingRef.current = null;
    connectedAtRef.current = null;
    peerRef.current = null;
    setPeer(null);
    setMicOn(true);
    setCamOn(true);
    setStatus(nextStatus);
    if (nextStatus === 'ended') setTimeout(() => setStatus('idle'), 1500);
  }, []);

  const logCall = useCallback(async (calleeId: string, video: boolean) => {
    if (!userId) return null;
    const { data } = await supabase
      .from('calls')
      .insert({ caller_id: userId, callee_id: calleeId, is_video: video, status: 'ringing' })
      .select('id')
      .single();
    return data?.id as string | undefined;
  }, [userId]);

  const updateCallLog = useCallback(async (callDbId: string | null, patch: TablesUpdate<'calls'>) => {
    if (!callDbId) return;
    await supabase.from('calls').update(patch).eq('id', callDbId);
  }, []);

  const dbIdRef = useRef<string | null>(null);

  const buildPeerConnection = useCallback((stream: MediaStream) => {
    const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });
    stream.getTracks().forEach((track) => pc.addTrack(track, stream));
    const remote = new MediaStream();
    pc.ontrack = (e) => {
      e.streams[0]?.getTracks().forEach((t) => remote.addTrack(t));
      setRemoteStream(remote);
    };
    pc.onconnectionstatechange = () => {
      if (pc.connectionState === 'connected') {
        clearRingTimeout();
        connectedAtRef.current = Date.now();
        setStatus('connected');
        updateCallLog(dbIdRef.current, { status: 'connected', started_at: new Date().toISOString() });
      }
      if (pc.connectionState === 'failed' || pc.connectionState === 'disconnected') {
        hangUp();
      }
    };
    pcRef.current = pc;
    return pc;
  }, [updateCallLog]);

  const getMedia = async (video: boolean) => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video });
    setLocalStream(stream);
    return stream;
  };

  // ---- Outgoing call ----
  const startCall = useCallback(async (target: CallPeer, video: boolean) => {
    if (!userId) { toast({ title: 'Connecte-toi pour passer un appel', variant: 'destructive' }); return; }
    if (status !== 'idle') return;
    try {
      const callId = crypto.randomUUID();
      callIdRef.current = callId;
      peerRef.current = target;
      isVideoRef.current = video;
      setPeer(target);
      setIsVideo(video);
      setStatus('outgoing');

      const stream = await getMedia(video);
      const pc = buildPeerConnection(stream);

      dbIdRef.current = (await logCall(target.id, video)) || null;

      // Listen on the per-call channel for the callee's answer / hangup
      const callChannel = supabase.channel(`call:${callId}`);
      callChannel
        .on('broadcast', { event: 'answer' }, async ({ payload }) => {
          if (pc.signalingState === 'have-local-offer') {
            await pc.setRemoteDescription(new RTCSessionDescription(payload.answer));
          }
        })
        .on('broadcast', { event: 'hangup' }, () => {
          updateCallLog(dbIdRef.current, { status: 'ended', ended_at: new Date().toISOString() });
          cleanup('ended');
        })
        .subscribe();
      callChannelRef.current = callChannel;

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      await waitForIceGathering(pc);

      // Invite the callee on their personal channel
      const calleeChannel = supabase.channel(`calls:user:${target.id}`);
      await new Promise<void>((resolve) => {
        calleeChannel.subscribe((s) => { if (s === 'SUBSCRIBED') resolve(); });
      });
      await calleeChannel.send({
        type: 'broadcast',
        event: 'invite',
        payload: {
          callId,
          isVideo: video,
          offer: pc.localDescription,
          from: selfRef.current || { id: userId, name: 'Appel entrant', avatar_url: null },
        },
      });
      supabase.removeChannel(calleeChannel);

      // No answer within the timeout → cancel & mark as missed.
      clearRingTimeout();
      ringTimeoutRef.current = setTimeout(() => {
        if (connectedAtRef.current) return;
        sendToUser(target.id, 'cancel', { callId });
        updateCallLog(dbIdRef.current, { status: 'missed', ended_at: new Date().toISOString() });
        toast({ title: 'Pas de réponse', description: target.name });
        cleanup('ended');
      }, RING_TIMEOUT_MS);
    } catch (err: any) {
      toast({ title: "Impossible de démarrer l'appel", description: err?.message, variant: 'destructive' });
      cleanup('idle');
    }
  }, [userId, status, buildPeerConnection, logCall, updateCallLog, cleanup]);

  // ---- Incoming call ----
  const handleInvite = useCallback((invite: IncomingInvite) => {
    if (status !== 'idle') {
      // Busy: auto-reject and log a missed call for ourselves.
      sendToUser(invite.from.id, 'reject', { callId: invite.callId });
      notifyMissed(invite.from, invite.isVideo);
      return;
    }
    incomingRef.current = invite;
    callIdRef.current = invite.callId;
    peerRef.current = invite.from;
    isVideoRef.current = invite.isVideo;
    setPeer(invite.from);
    setIsVideo(invite.isVideo);
    setStatus('incoming');

    // Safety net: if the caller vanishes without sending a cancel, mark as missed.
    clearRingTimeout();
    ringTimeoutRef.current = setTimeout(() => {
      if (connectedAtRef.current) return;
      notifyMissed(invite.from, invite.isVideo);
      cleanup('idle');
    }, RING_TIMEOUT_MS + 10000);
  }, [status, notifyMissed, cleanup]);

  const acceptCall = useCallback(async () => {
    const invite = incomingRef.current;
    if (!invite || !userId) return;
    clearRingTimeout();
    ringtone.stop();
    try {
      const stream = await getMedia(invite.isVideo);
      const pc = buildPeerConnection(stream);

      const callChannel = supabase.channel(`call:${invite.callId}`);
      callChannel
        .on('broadcast', { event: 'hangup' }, () => cleanup('ended'))
        .subscribe();
      callChannelRef.current = callChannel;

      await pc.setRemoteDescription(new RTCSessionDescription(invite.offer));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      await waitForIceGathering(pc);

      // wait until subscribed before sending
      await new Promise<void>((resolve) => {
        if (callChannel.state === 'joined') return resolve();
        callChannel.subscribe((s) => { if (s === 'SUBSCRIBED') resolve(); });
      });
      await callChannel.send({ type: 'broadcast', event: 'answer', payload: { answer: pc.localDescription } });
    } catch (err: any) {
      toast({ title: "Impossible de répondre à l'appel", description: err?.message, variant: 'destructive' });
      rejectCall();
    }
  }, [userId, buildPeerConnection, cleanup]);

  const rejectCall = useCallback(() => {
    const invite = incomingRef.current;
    if (invite) sendToUser(invite.from.id, 'reject', { callId: invite.callId });
    cleanup('idle');
  }, [cleanup]);

  const hangUp = useCallback(() => {
    const connected = !!connectedAtRef.current;
    const duration = connected ? Math.round((Date.now() - connectedAtRef.current!) / 1000) : 0;
    if (connected) {
      // Already in a call: tell the peer over the call channel.
      callChannelRef.current?.send({ type: 'broadcast', event: 'hangup', payload: {} });
    } else if (peerRef.current && callIdRef.current) {
      // Cancelling before the callee answered: the callee is only on its personal channel.
      sendToUser(peerRef.current.id, 'cancel', { callId: callIdRef.current });
    }
    updateCallLog(dbIdRef.current, {
      status: connected ? 'ended' : 'cancelled',
      ended_at: new Date().toISOString(),
      duration_seconds: duration,
    });
    cleanup('ended');
  }, [cleanup, updateCallLog]);

  const toggleMic = useCallback(() => {
    setLocalStream((s) => {
      s?.getAudioTracks().forEach((t) => (t.enabled = !t.enabled));
      setMicOn((m) => !m);
      return s;
    });
  }, []);

  const toggleCam = useCallback(() => {
    setLocalStream((s) => {
      s?.getVideoTracks().forEach((t) => (t.enabled = !t.enabled));
      setCamOn((c) => !c);
      return s;
    });
  }, []);

  // Subscribe to personal channel for incoming invites
  useEffect(() => {
    if (!userId) return;
    const channel = supabase.channel(`calls:user:${userId}`);
    channel
      .on('broadcast', { event: 'invite' }, ({ payload }) => handleInvite(payload as IncomingInvite))
      .on('broadcast', { event: 'reject' }, () => {
        toast({ title: 'Appel refusé' });
        updateCallLog(dbIdRef.current, { status: 'rejected', ended_at: new Date().toISOString() });
        cleanup('ended');
      })
      .on('broadcast', { event: 'cancel' }, () => {
        // Caller hung up / timed out before we answered → missed call.
        if (incomingRef.current) notifyMissed(incomingRef.current.from, isVideoRef.current);
        cleanup('idle');
      })
      .subscribe();
    personalChannelRef.current = channel;
    return () => { supabase.removeChannel(channel); personalChannelRef.current = null; };
  }, [userId, handleInvite, cleanup, updateCallLog, notifyMissed]);

  // Ringtone: play while ringing (incoming) or waiting for an answer (outgoing).
  useEffect(() => {
    if (status === 'incoming') ringtone.start('incoming');
    else if (status === 'outgoing') ringtone.start('outgoing');
    else ringtone.stop();
    return () => ringtone.stop();
  }, [status]);

  const value: CallContextValue = {
    status, peer, isVideo, micOn, camOn, localStream, remoteStream,
    startCall, acceptCall, rejectCall, hangUp, toggleMic, toggleCam,
  };

  return <CallContext.Provider value={value}>{children}</CallContext.Provider>;
};
