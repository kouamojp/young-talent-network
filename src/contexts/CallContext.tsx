import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { ringtone } from '@/lib/ringtone';
import type { RealtimeChannel } from '@supabase/supabase-js';
import type { TablesUpdate } from '@/integrations/supabase/types';
import { tr } from '@/i18n';
import { currentIceServers, mediaErrorMessage, prefetchIceServers, whenSubscribed } from '@/lib/webrtc';

/**
 * 1:1 audio/video calling built on WebRTC.
 *
 * Signaling travels over Supabase Realtime broadcast:
 *  - every signed-in user listens on a personal channel `calls:user:{userId}`
 *    for `invite` / `reject` / `busy` / `cancel` / `handled`;
 *  - a call then uses its own channel `call:{callId}` for `answer` / `ice` / `hangup`.
 *
 * The call id is the id of the row inserted in `public.calls` by the caller.
 * Broadcast channels are not authenticated, so the callee never trusts the
 * invite payload: before ringing it reads that row (RLS guarantees the caller
 * is who the row says) and checks the messaging safety rules (blocks, minors).
 *
 * The offer/answer carry the ICE candidates gathered during a short wait;
 * candidates found later are exchanged on the call channel (trickle ICE).
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
  /** The media connection dropped and is trying to recover. */
  reconnecting: boolean;
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

/** Fire-and-forget broadcast to another user's personal call channel. */
const sendToUser = (uid: string, event: string, payload: Record<string, unknown>) => {
  const ch = supabase.channel(`calls:user:${uid}`);
  ch.subscribe((s) => {
    if (s === 'SUBSCRIBED') {
      ch.send({ type: 'broadcast', event, payload });
      setTimeout(() => supabase.removeChannel(ch), 600);
    }
  });
};

const RING_TIMEOUT_MS = 35000;          // no answer → missed
const INVITE_MAX_AGE_MS = 60000;        // an invite older than this is ignored
const DISCONNECT_GRACE_MS = 12000;      // network blip tolerated before hanging up
const ICE_GATHERING_WAIT_MS = 2500;     // candidates gathered in that time ride in the SDP

/** Waits until ICE gathering completes, or the timeout: later candidates are trickled. */
const waitForIceGathering = (pc: RTCPeerConnection, timeoutMs = ICE_GATHERING_WAIT_MS): Promise<void> =>
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

/** Message shown when the safety rules forbid calling someone (see message_block_reason). */
const blockReasonMessage = (reason: string): string => {
  if (reason === 'minor_not_connected') return tr('calls.minorNotConnected');
  if (reason === 'sender_consent_pending') return tr('calls.consentPending');
  return tr('calls.cannotCall');
};

export const CallProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [userId, setUserId] = useState<string | null>(null);
  const [status, setStatusState] = useState<CallStatus>('idle');
  const [peer, setPeer] = useState<CallPeer | null>(null);
  const [isVideo, setIsVideo] = useState(false);
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [reconnecting, setReconnecting] = useState(false);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);

  // Everything the realtime handlers need lives in refs, so the personal
  // channel is subscribed once and never misses an event while re-subscribing.
  const userIdRef = useRef<string | null>(null);
  const selfRef = useRef<CallPeer | null>(null);
  const statusRef = useRef<CallStatus>('idle');
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const callChannelRef = useRef<RealtimeChannel | null>(null);
  const personalChannelRef = useRef<RealtimeChannel | null>(null);
  const callIdRef = useRef<string | null>(null);        // = id of the row in public.calls
  const incomingRef = useRef<IncomingInvite | null>(null);
  const connectedAtRef = useRef<number | null>(null);
  const peerRef = useRef<CallPeer | null>(null);
  const isCallerRef = useRef(false);
  const ringTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const disconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const endedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Trickle ICE: candidates we cannot send yet, and remote ones we cannot apply yet.
  const sdpSentRef = useRef(false);
  const canTrickleRef = useRef(false);
  const pendingLocalIceRef = useRef<RTCIceCandidateInit[]>([]);
  const pendingRemoteIceRef = useRef<RTCIceCandidateInit[]>([]);

  const setStatus = useCallback((next: CallStatus) => {
    statusRef.current = next;
    setStatusState(next);
  }, []);

  const clearTimer = (ref: React.MutableRefObject<ReturnType<typeof setTimeout> | null>) => {
    if (ref.current) { clearTimeout(ref.current); ref.current = null; }
  };

  // ---- Session ----
  useEffect(() => {
    const apply = async (id: string | null) => {
      userIdRef.current = id;
      setUserId(id);
      if (!id) { selfRef.current = null; return; }
      prefetchIceServers();
      const { data } = await supabase.from('profiles').select('id, name, avatar_url').eq('id', id).maybeSingle();
      if (data) selfRef.current = data as CallPeer;
    };
    supabase.auth.getUser().then(({ data }) => apply(data.user?.id || null));
    // IMPORTANT: this callback must stay synchronous and must not await any Supabase
    // call. supabase-js runs it while holding the auth lock; a query awaited here waits
    // for that same lock and freezes every request of the app (in all tabs).
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      const id = session?.user?.id || null;
      setTimeout(() => { apply(id); }, 0);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  // ---- Call log (public.calls) ----
  const updateCallLog = useCallback(async (patch: TablesUpdate<'calls'>, callId = callIdRef.current) => {
    if (!callId) return;
    await supabase.from('calls').update(patch).eq('id', callId);
  }, []);

  // ---- Teardown ----
  const cleanup = useCallback((nextStatus: CallStatus = 'idle') => {
    ringtone.stop();
    clearTimer(ringTimeoutRef);
    clearTimer(disconnectTimerRef);
    clearTimer(endedTimerRef);
    const pc = pcRef.current;
    if (pc) {
      pc.onicecandidate = null;
      pc.ontrack = null;
      pc.onconnectionstatechange = null;
      pc.close();
    }
    pcRef.current = null;
    localStreamRef.current?.getTracks().forEach((t) => t.stop());
    localStreamRef.current = null;
    setLocalStream(null);
    setRemoteStream(null);
    if (callChannelRef.current) { supabase.removeChannel(callChannelRef.current); callChannelRef.current = null; }
    callIdRef.current = null;
    incomingRef.current = null;
    connectedAtRef.current = null;
    peerRef.current = null;
    isCallerRef.current = false;
    sdpSentRef.current = false;
    canTrickleRef.current = false;
    pendingLocalIceRef.current = [];
    pendingRemoteIceRef.current = [];
    setReconnecting(false);
    setMicOn(true);
    setCamOn(true);
    setStatus(nextStatus);
    if (nextStatus === 'ended') {
      // Keep the "call ended" screen briefly, then release the UI.
      endedTimerRef.current = setTimeout(() => {
        if (statusRef.current === 'ended') { setPeer(null); setStatus('idle'); }
      }, 1500);
    } else {
      setPeer(null);
    }
  }, [setStatus]);

  /** Ends the current call locally and records it; `notifyPeer` tells the other side. */
  const endCall = useCallback((notifyPeer: boolean) => {
    const callId = callIdRef.current;
    if (!callId) { cleanup('idle'); return; }
    const connected = !!connectedAtRef.current;
    const duration = connected ? Math.round((Date.now() - connectedAtRef.current!) / 1000) : 0;
    if (notifyPeer) {
      if (connected || !isCallerRef.current) {
        callChannelRef.current?.send({ type: 'broadcast', event: 'hangup', payload: {} });
      } else if (peerRef.current) {
        // Caller giving up before an answer: the callee is only on its personal channel.
        sendToUser(peerRef.current.id, 'cancel', { callId });
      }
    }
    updateCallLog(
      connected
        ? { status: 'ended', ended_at: new Date().toISOString(), duration_seconds: duration }
        : { status: isCallerRef.current ? 'cancelled' : 'ended', ended_at: new Date().toISOString() },
      callId,
    );
    cleanup('ended');
  }, [cleanup, updateCallLog]);

  // ---- Media ----
  /** Opens the microphone (and the camera for a video call, falling back to audio only). */
  const getMedia = useCallback(async (video: boolean): Promise<MediaStream> => {
    if (!navigator.mediaDevices?.getUserMedia) throw new Error(tr('calls.httpsRequired'));
    const audio = { echoCancellation: true, noiseSuppression: true, autoGainControl: true };
    let stream: MediaStream;
    if (video) {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ audio, video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } } });
      } catch (err) {
        // No camera, or camera refused: keep the call going with sound only.
        stream = await navigator.mediaDevices.getUserMedia({ audio, video: false });
        setCamOn(false);
        toast({ title: tr('calls.cameraUnavailable'), description: mediaErrorMessage(err) });
      }
    } else {
      stream = await navigator.mediaDevices.getUserMedia({ audio, video: false });
    }
    localStreamRef.current = stream;
    setLocalStream(stream);
    return stream;
  }, []);

  // ---- Peer connection ----
  const sendIce = (candidate: RTCIceCandidateInit) =>
    callChannelRef.current?.send({ type: 'broadcast', event: 'ice', payload: { candidate } });

  const flushLocalIce = () => {
    canTrickleRef.current = true;
    pendingLocalIceRef.current.splice(0).forEach(sendIce);
  };

  const addRemoteIce = async (candidate: RTCIceCandidateInit) => {
    const pc = pcRef.current;
    if (!pc) return;
    if (!pc.remoteDescription) { pendingRemoteIceRef.current.push(candidate); return; }
    try { await pc.addIceCandidate(candidate); } catch { /* candidate for a previous session */ }
  };

  const flushRemoteIce = async () => {
    for (const c of pendingRemoteIceRef.current.splice(0)) await addRemoteIce(c);
  };

  const buildPeerConnection = useCallback((stream: MediaStream) => {
    const pc = new RTCPeerConnection({ iceServers: currentIceServers() });
    prefetchIceServers(); // refresh for the next call if the cache is about to expire
    stream.getTracks().forEach((track) => pc.addTrack(track, stream));

    const remote = new MediaStream();
    pc.ontrack = (e) => {
      const tracks = e.streams[0]?.getTracks() ?? [e.track];
      tracks.forEach((t) => { if (!remote.getTracks().includes(t)) remote.addTrack(t); });
      // New object each time so React re-renders and the players pick up the tracks.
      setRemoteStream(new MediaStream(remote.getTracks()));
    };

    pc.onicecandidate = (e) => {
      // Candidates found before the SDP is sent are already inside it.
      if (!e.candidate || !sdpSentRef.current) return;
      const candidate = e.candidate.toJSON();
      if (canTrickleRef.current) sendIce(candidate);
      else pendingLocalIceRef.current.push(candidate);
    };

    pc.onconnectionstatechange = () => {
      if (pcRef.current !== pc) return;
      const state = pc.connectionState;
      if (state === 'connected') {
        clearTimer(ringTimeoutRef);
        clearTimer(disconnectTimerRef);
        setReconnecting(false);
        if (!connectedAtRef.current) {
          connectedAtRef.current = Date.now();
          setStatus('connected');
          updateCallLog({ status: 'connected', started_at: new Date().toISOString() });
        }
      } else if (state === 'disconnected') {
        // Usually a short network blip: give ICE time to recover before giving up.
        setReconnecting(true);
        clearTimer(disconnectTimerRef);
        disconnectTimerRef.current = setTimeout(() => {
          if (pcRef.current === pc && pc.connectionState !== 'connected') {
            toast({ title: tr('calls.connectionLost'), variant: 'destructive' });
            endCall(true);
          }
        }, DISCONNECT_GRACE_MS);
      } else if (state === 'failed') {
        toast({ title: tr('calls.connectionFailed'), description: tr('calls.connectionFailedHint'), variant: 'destructive' });
        endCall(true);
      }
    };

    pcRef.current = pc;
    return pc;
  }, [endCall, setStatus, updateCallLog]);

  // ---- Outgoing call ----
  const startCall = useCallback(async (target: CallPeer, video: boolean) => {
    const me = userIdRef.current;
    if (!me) { toast({ title: tr('callContext.logInToMakeACall'), variant: 'destructive' }); return; }
    if (statusRef.current !== 'idle' || target.id === me) return;

    // Safety rules (blocks, minors, parental consent) apply to calls like to messages.
    const { data: reason } = await (supabase.rpc as any)('message_block_reason', { _sender: me, _recipient: target.id });
    if (reason) { toast({ title: tr('callContext.couldNotStartTheCall'), description: blockReasonMessage(reason), variant: 'destructive' }); return; }
    if (statusRef.current !== 'idle') return;

    peerRef.current = target;
    isCallerRef.current = true;
    setPeer(target);
    setIsVideo(video);
    setStatus('outgoing');

    try {
      const stream = await getMedia(video);
      if ((statusRef.current as CallStatus) !== 'outgoing') { stream.getTracks().forEach((t) => t.stop()); return; } // hung up meanwhile

      // The row id is the call id: the callee reads it back to authenticate the invite.
      const { data: row, error: logError } = await supabase
        .from('calls')
        .insert({ caller_id: me, callee_id: target.id, is_video: video, status: 'ringing' })
        .select('id')
        .single();
      if (logError || !row) throw new Error(logError?.message || tr('calls.cannotCall'));
      const callId = row.id as string;
      callIdRef.current = callId;

      const pc = buildPeerConnection(stream);

      const callChannel = supabase.channel(`call:${callId}`);
      callChannel
        .on('broadcast', { event: 'answer' }, async ({ payload }) => {
          if (pcRef.current !== pc || pc.signalingState !== 'have-local-offer') return;
          await pc.setRemoteDescription(new RTCSessionDescription(payload.answer));
          await flushRemoteIce();
          flushLocalIce(); // the callee is on the channel now
        })
        .on('broadcast', { event: 'ice' }, ({ payload }) => addRemoteIce(payload.candidate))
        .on('broadcast', { event: 'hangup' }, () => endCall(false));
      callChannelRef.current = callChannel;
      await whenSubscribed(callChannel);

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      await waitForIceGathering(pc);
      if (callIdRef.current !== callId) return; // cancelled while gathering
      sdpSentRef.current = true;

      const calleeChannel = supabase.channel(`calls:user:${target.id}`);
      await whenSubscribed(calleeChannel);
      await calleeChannel.send({
        type: 'broadcast',
        event: 'invite',
        payload: {
          callId,
          isVideo: video,
          offer: pc.localDescription,
          from: selfRef.current || { id: me, name: '', avatar_url: null },
        },
      });
      setTimeout(() => supabase.removeChannel(calleeChannel), 600);

      // No answer within the timeout → cancel & mark as missed.
      clearTimer(ringTimeoutRef);
      ringTimeoutRef.current = setTimeout(() => {
        if (connectedAtRef.current || callIdRef.current !== callId) return;
        sendToUser(target.id, 'cancel', { callId });
        updateCallLog({ status: 'missed', ended_at: new Date().toISOString() }, callId);
        toast({ title: tr('callContext.noAnswer'), description: target.name });
        cleanup('ended');
      }, RING_TIMEOUT_MS);
    } catch (err) {
      toast({ title: tr('callContext.couldNotStartTheCall'), description: mediaErrorMessage(err), variant: 'destructive' });
      if (callIdRef.current) updateCallLog({ status: 'cancelled', ended_at: new Date().toISOString() });
      cleanup('idle');
    }
  }, [buildPeerConnection, cleanup, endCall, getMedia, setStatus, updateCallLog]);

  // ---- Incoming call ----
  const handleInvite = useCallback(async (invite: IncomingInvite) => {
    const me = userIdRef.current;
    if (!me || !invite?.callId || !invite.offer || !invite.from?.id) return;

    // Never trust the broadcast: the caller is whoever the `calls` row says (RLS-protected).
    const [{ data: row }, { data: reason }] = await Promise.all([
      supabase.from('calls').select('id, caller_id, callee_id, is_video, status, created_at').eq('id', invite.callId).maybeSingle(),
      (supabase.rpc as any)('message_block_reason', { _sender: invite.from.id, _recipient: me }),
    ]);
    if (!row || row.callee_id !== me || row.caller_id !== invite.from.id || row.status !== 'ringing') return;
    if (Date.now() - new Date(row.created_at).getTime() > INVITE_MAX_AGE_MS) return;
    if (reason) return; // blocked, or an adult calling a minor they are not connected to: no ring

    if (statusRef.current !== 'idle') {
      if (callIdRef.current !== invite.callId) sendToUser(row.caller_id, 'busy', { callId: invite.callId });
      return;
    }

    const { data: profile } = await supabase.from('profiles').select('id, name, avatar_url').eq('id', row.caller_id).maybeSingle();
    if (statusRef.current !== 'idle') return;
    const from: CallPeer = (profile as CallPeer) || { id: row.caller_id, name: invite.from.name || '?', avatar_url: null };
    const verified: IncomingInvite = { callId: row.id, from, isVideo: !!row.is_video, offer: invite.offer };

    incomingRef.current = verified;
    callIdRef.current = verified.callId;
    peerRef.current = from;
    isCallerRef.current = false;
    setPeer(from);
    setIsVideo(verified.isVideo);
    setStatus('incoming');

    // Safety net: if the caller vanishes without sending a cancel, stop ringing.
    clearTimer(ringTimeoutRef);
    ringTimeoutRef.current = setTimeout(() => {
      if (statusRef.current === 'incoming' && callIdRef.current === verified.callId) cleanup('idle');
    }, RING_TIMEOUT_MS + 10000);
  }, [cleanup, setStatus]);

  const rejectCall = useCallback(() => {
    const invite = incomingRef.current;
    if (invite) {
      sendToUser(invite.from.id, 'reject', { callId: invite.callId });
      // Stop the ringing on my other tabs / devices too.
      personalChannelRef.current?.send({ type: 'broadcast', event: 'handled', payload: { callId: invite.callId } });
      updateCallLog({ status: 'rejected', ended_at: new Date().toISOString() }, invite.callId);
    }
    cleanup('idle');
  }, [cleanup, updateCallLog]);

  const acceptCall = useCallback(async () => {
    const invite = incomingRef.current;
    if (!invite || !userIdRef.current || pcRef.current) return;
    clearTimer(ringTimeoutRef);
    ringtone.stop();
    personalChannelRef.current?.send({ type: 'broadcast', event: 'handled', payload: { callId: invite.callId } });
    try {
      const stream = await getMedia(invite.isVideo);
      if (incomingRef.current !== invite) { stream.getTracks().forEach((t) => t.stop()); return; } // cancelled meanwhile
      const pc = buildPeerConnection(stream);

      const callChannel = supabase.channel(`call:${invite.callId}`);
      callChannel
        .on('broadcast', { event: 'ice' }, ({ payload }) => addRemoteIce(payload.candidate))
        .on('broadcast', { event: 'hangup' }, () => endCall(false));
      callChannelRef.current = callChannel;

      await pc.setRemoteDescription(new RTCSessionDescription(invite.offer));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      await Promise.all([waitForIceGathering(pc), whenSubscribed(callChannel)]);
      if (pcRef.current !== pc) return;
      sdpSentRef.current = true;
      await callChannel.send({ type: 'broadcast', event: 'answer', payload: { answer: pc.localDescription } });
      await flushRemoteIce();
      flushLocalIce();
      setStatus('outgoing'); // "connecting…" until the media path is up
    } catch (err) {
      toast({ title: tr('callContext.couldNotAnswerTheCall'), description: mediaErrorMessage(err), variant: 'destructive' });
      rejectCall();
    }
  }, [buildPeerConnection, endCall, getMedia, rejectCall, setStatus]);

  const hangUp = useCallback(() => {
    if (statusRef.current === 'incoming') rejectCall();
    else endCall(true);
  }, [endCall, rejectCall]);

  const toggleMic = useCallback(() => {
    const tracks = localStreamRef.current?.getAudioTracks() ?? [];
    if (!tracks.length) return;
    const enabled = !tracks[0].enabled;
    tracks.forEach((t) => { t.enabled = enabled; });
    setMicOn(enabled);
  }, []);

  const toggleCam = useCallback(() => {
    const tracks = localStreamRef.current?.getVideoTracks() ?? [];
    if (!tracks.length) return;
    const enabled = !tracks[0].enabled;
    tracks.forEach((t) => { t.enabled = enabled; });
    setCamOn(enabled);
  }, []);

  // ---- Personal channel: subscribed once per signed-in user ----
  const handlersRef = useRef({ handleInvite, cleanup, updateCallLog });
  handlersRef.current = { handleInvite, cleanup, updateCallLog };

  useEffect(() => {
    if (!userId) return;
    const isCurrent = (payload: any) => !!payload?.callId && payload.callId === callIdRef.current;
    const channel = supabase.channel(`calls:user:${userId}`);
    channel
      .on('broadcast', { event: 'invite' }, ({ payload }) => { handlersRef.current.handleInvite(payload as IncomingInvite); })
      // The events below only count for the call in progress: anyone can broadcast here.
      .on('broadcast', { event: 'reject' }, ({ payload }) => {
        if (!isCurrent(payload) || !isCallerRef.current || connectedAtRef.current) return;
        toast({ title: tr('callContext.callDeclined'), description: peerRef.current?.name });
        handlersRef.current.cleanup('ended');
      })
      .on('broadcast', { event: 'busy' }, ({ payload }) => {
        if (!isCurrent(payload) || !isCallerRef.current || connectedAtRef.current) return;
        toast({ title: tr('calls.busy', { name: peerRef.current?.name || '' }) });
        handlersRef.current.updateCallLog({ status: 'missed', ended_at: new Date().toISOString() });
        handlersRef.current.cleanup('ended');
      })
      .on('broadcast', { event: 'cancel' }, ({ payload }) => {
        // The caller gave up before we answered (a missed-call notification comes from the database).
        if (isCurrent(payload) && statusRef.current === 'incoming') handlersRef.current.cleanup('idle');
      })
      .on('broadcast', { event: 'handled' }, ({ payload }) => {
        // Answered or declined on another tab / device of mine.
        if (isCurrent(payload) && statusRef.current === 'incoming') handlersRef.current.cleanup('idle');
      })
      .subscribe();
    personalChannelRef.current = channel;
    return () => { supabase.removeChannel(channel); personalChannelRef.current = null; };
  }, [userId]);

  // Closing the tab during a call: tell the other side instead of leaving it hanging.
  useEffect(() => {
    const onUnload = () => {
      if (statusRef.current === 'incoming') return;
      if (callIdRef.current) endCall(true);
    };
    window.addEventListener('pagehide', onUnload);
    return () => window.removeEventListener('pagehide', onUnload);
  }, [endCall]);

  // Ringtone: play while ringing (incoming) or waiting for an answer (outgoing).
  useEffect(() => {
    if (status === 'incoming') ringtone.start('incoming');
    else if (status === 'outgoing' && isCallerRef.current) ringtone.start('outgoing');
    else ringtone.stop();
    return () => ringtone.stop();
  }, [status]);

  const value: CallContextValue = {
    status, peer, isVideo, micOn, camOn, reconnecting, localStream, remoteStream,
    startCall, acceptCall, rejectCall, hangUp, toggleMic, toggleCam,
  };

  return <CallContext.Provider value={value}>{children}</CallContext.Provider>;
};
