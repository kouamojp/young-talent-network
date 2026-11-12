import { useCallback, useEffect, useRef, useState } from 'react';
import type { RealtimeChannel } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { currentIceServers, prefetchIceServers, whenSubscribed } from '@/lib/webrtc';
import { tr } from '@/i18n';

/**
 * Live broadcasts built on WebRTC, one peer connection per viewer (mesh):
 * the streamer's browser sends its camera and microphone to every viewer.
 * This needs no media server but is bounded by the streamer's upload, hence
 * MAX_LIVE_VIEWERS; a larger audience requires an SFU.
 *
 * Signaling travels over the Supabase Realtime broadcast channel `live:{streamId}`:
 *   viewer   → `join`                      asks for the stream (repeated until connected)
 *   streamer → `offer` / `streamer-ice`    one peer connection per viewer
 *   viewer   → `answer` / `viewer-ice`
 *   streamer → `full`                      no slot left
 *   streamer → `end`                       hint only: the viewer re-reads the row
 *
 * Broadcast channels are not authenticated, so viewers trust nothing on them:
 *  - each offer is signed with a key pair created for the stream; its public
 *    half is stored in `live_streams.signal_public_key`, which only the
 *    streamer can write (RLS). A forged offer is ignored, so nobody can push
 *    their own video into someone else's live;
 *  - the end of the stream is read from the `live_streams` row, never from a message.
 * The viewer count is the number of connected peers, written by the streamer;
 * each write also refreshes the row's heartbeat (see close_stale_live_streams).
 */

export const MAX_LIVE_VIEWERS = 20;

const HEARTBEAT_MS = 20000;            // streamer → database
const COUNT_WRITE_DELAY_MS = 1500;     // viewer count changes are written at most this often
const JOIN_RETRY_MS = 6000;            // viewer asks again while it has no connection
const ROW_POLL_EVERY = 3;              // …and re-reads the row every N retries
const NEGOTIATION_TIMEOUT_MS = 30000;  // a viewer that never connects frees its slot
const DISCONNECT_GRACE_MS = 10000;     // network blip tolerated before dropping a peer
const MAX_VIDEO_BITRATE = 1_200_000;   // per viewer, keeps the streamer's upload sustainable

const KEY_ALGO = { name: 'ECDSA', namedCurve: 'P-256' } as const;
const SIGN_ALGO = { name: 'ECDSA', hash: 'SHA-256' } as const;

const toBase64 = (buf: ArrayBuffer) => btoa(String.fromCharCode(...new Uint8Array(buf)));
const fromBase64 = (s: string) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0));
/** What the streamer signs: an offer is only valid for one stream and one viewer. */
const signedBytes = (streamId: string, viewerId: string, sdp: string) =>
  new TextEncoder().encode(`${streamId}\n${viewerId}\n${sdp}`);

const liveSupported = () =>
  typeof RTCPeerConnection !== 'undefined' && !!window.crypto?.subtle && typeof crypto.randomUUID === 'function';

const send = (channel: RealtimeChannel | null, event: string, payload: Record<string, unknown>) => {
  channel?.send({ type: 'broadcast', event, payload });
};

// =============================================================================
// Streamer
// =============================================================================

export type BroadcastStatus = 'idle' | 'starting' | 'live' | 'ended';

export interface LiveMeta {
  title: string;
  description?: string | null;
  category?: string | null;
}

interface ViewerPeer {
  pc: RTCPeerConnection;
  offerId: string;
  createdAt: number;
  offerSent: boolean;
  localIce: RTCIceCandidateInit[];   // found before the offer was sent
  remoteIce: RTCIceCandidateInit[];  // received before the answer was applied
  dropTimer?: ReturnType<typeof setTimeout>;
}

export function useLiveBroadcaster() {
  const [status, setStatusState] = useState<BroadcastStatus>('idle');
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [viewers, setViewers] = useState(0);
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [canSwitchCamera, setCanSwitchCamera] = useState(false);
  const [frontCamera, setFrontCamera] = useState(true);

  const statusRef = useRef<BroadcastStatus>('idle');
  const runRef = useRef(0);                              // invalidates a start() in progress
  const streamIdRef = useRef<string | null>(null);
  const mediaRef = useRef<MediaStream | null>(null);
  const channelRef = useRef<RealtimeChannel | null>(null);
  const keyRef = useRef<CryptoKey | null>(null);
  const peersRef = useRef(new Map<string, ViewerPeer>());
  const peakRef = useRef(0);
  const countRef = useRef(0);
  const heartbeatRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const countTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const frontRef = useRef(true);
  const camOnRef = useRef(true);

  const setStatus = (next: BroadcastStatus) => { statusRef.current = next; setStatusState(next); };

  const writeCount = useCallback(() => {
    const id = streamIdRef.current;
    if (!id) return;
    // Also the heartbeat: any update of a live row refreshes last_heartbeat_at.
    supabase.from('live_streams').update({ viewer_count: countRef.current }).eq('id', id).eq('is_live', true).then(() => undefined);
  }, []);

  const refreshCount = useCallback(() => {
    let n = 0;
    peersRef.current.forEach((p) => { if (p.pc.connectionState === 'connected') n++; });
    if (n === countRef.current) return;
    countRef.current = n;
    peakRef.current = Math.max(peakRef.current, n);
    setViewers(n);
    if (!countTimerRef.current) {
      countTimerRef.current = setTimeout(() => { countTimerRef.current = null; writeCount(); }, COUNT_WRITE_DELAY_MS);
    }
  }, [writeCount]);

  const dropPeer = useCallback((viewerId: string) => {
    const peer = peersRef.current.get(viewerId);
    if (!peer) return;
    peersRef.current.delete(viewerId);
    clearTimeout(peer.dropTimer);
    peer.pc.onicecandidate = null;
    peer.pc.onconnectionstatechange = null;
    peer.pc.close();
    refreshCount();
  }, [refreshCount]);

  /** Releases camera, connections and channel. Does not touch the database. */
  const teardown = useCallback(() => {
    runRef.current++;
    if (heartbeatRef.current) { clearInterval(heartbeatRef.current); heartbeatRef.current = null; }
    if (countTimerRef.current) { clearTimeout(countTimerRef.current); countTimerRef.current = null; }
    peersRef.current.forEach((peer) => {
      clearTimeout(peer.dropTimer);
      peer.pc.onicecandidate = null;
      peer.pc.onconnectionstatechange = null;
      peer.pc.close();
    });
    peersRef.current.clear();
    mediaRef.current?.getTracks().forEach((t) => t.stop());
    mediaRef.current = null;
    const channel = channelRef.current;
    channelRef.current = null;
    // Leave the channel a moment later so a last `end` message can go out.
    if (channel) setTimeout(() => supabase.removeChannel(channel), 600);
    keyRef.current = null;
    streamIdRef.current = null;
    countRef.current = 0;
    setLocalStream(null);
    setViewers(0);
  }, []);

  /** Ends the live. `writeDb` is false when the row is already closed. */
  const stop = useCallback(async (writeDb = true) => {
    const id = streamIdRef.current;
    const peak = peakRef.current;
    const wasActive = statusRef.current === 'live' || statusRef.current === 'starting';
    send(channelRef.current, 'end', {});
    teardown();
    if (wasActive) setStatus(id ? 'ended' : 'idle');
    if (id && writeDb) {
      await supabase
        .from('live_streams')
        .update({ is_live: false, ended_at: new Date().toISOString(), viewer_count: peak })
        .eq('id', id);
    }
  }, [teardown]);

  const capBitrate = (pc: RTCPeerConnection) => {
    const sender = pc.getSenders().find((s) => s.track?.kind === 'video');
    if (!sender) return;
    try {
      const params = sender.getParameters();
      if (!params.encodings?.length) return;
      params.encodings[0].maxBitrate = MAX_VIDEO_BITRATE;
      sender.setParameters(params).catch(() => undefined);
    } catch { /* not supported by this browser: keep its default */ }
  };

  const handleJoin = useCallback(async (viewerId: unknown) => {
    const streamId = streamIdRef.current;
    const media = mediaRef.current;
    const key = keyRef.current;
    const channel = channelRef.current;
    if (!streamId || !media || !key || !channel) return;
    if (typeof viewerId !== 'string' || !viewerId || viewerId.length > 64) return;

    const existing = peersRef.current.get(viewerId);
    if (existing) {
      // A healthy or just-created connection is kept: only a viewer that lost it asks again.
      if (existing.pc.connectionState === 'connected' || Date.now() - existing.createdAt < JOIN_RETRY_MS - 1000) return;
      dropPeer(viewerId);
    }
    if (peersRef.current.size >= MAX_LIVE_VIEWERS) { send(channel, 'full', { to: viewerId }); return; }

    const pc = new RTCPeerConnection({ iceServers: currentIceServers() });
    const peer: ViewerPeer = { pc, offerId: crypto.randomUUID(), createdAt: Date.now(), offerSent: false, localIce: [], remoteIce: [] };
    peersRef.current.set(viewerId, peer);
    media.getTracks().forEach((track) => pc.addTrack(track, media));

    const sendIce = (candidate: RTCIceCandidateInit) =>
      send(channel, 'streamer-ice', { to: viewerId, offerId: peer.offerId, candidate });
    pc.onicecandidate = (e) => {
      if (!e.candidate) return;
      const candidate = e.candidate.toJSON();
      if (peer.offerSent) sendIce(candidate);
      else peer.localIce.push(candidate);
    };
    pc.onconnectionstatechange = () => {
      if (peersRef.current.get(viewerId) !== peer) return;
      const state = pc.connectionState;
      if (state === 'failed' || state === 'closed') { dropPeer(viewerId); return; }
      if (state === 'connected') { clearTimeout(peer.dropTimer); capBitrate(pc); }
      if (state === 'disconnected') {
        clearTimeout(peer.dropTimer);
        peer.dropTimer = setTimeout(() => dropPeer(viewerId), DISCONNECT_GRACE_MS);
      }
      refreshCount();
    };
    peer.dropTimer = setTimeout(() => dropPeer(viewerId), NEGOTIATION_TIMEOUT_MS);

    try {
      await pc.setLocalDescription(await pc.createOffer());
      const sdp = pc.localDescription?.sdp || '';
      const sig = toBase64(await crypto.subtle.sign(SIGN_ALGO, key, signedBytes(streamId, viewerId, sdp)));
      if (peersRef.current.get(viewerId) !== peer) return;
      send(channel, 'offer', { to: viewerId, offerId: peer.offerId, sdp, sig });
      peer.offerSent = true;
      peer.localIce.splice(0).forEach(sendIce);
    } catch {
      dropPeer(viewerId);
    }
  }, [dropPeer, refreshCount]);

  const peerFor = (payload: { from?: unknown; offerId?: unknown }) => {
    const peer = typeof payload?.from === 'string' ? peersRef.current.get(payload.from) : undefined;
    return peer && peer.offerId === payload.offerId ? peer : undefined;
  };

  const handleAnswer = useCallback(async (payload: { from?: string; offerId?: string; sdp?: string }) => {
    const peer = peerFor(payload);
    if (!peer || typeof payload.sdp !== 'string' || peer.pc.signalingState !== 'have-local-offer') return;
    try {
      await peer.pc.setRemoteDescription({ type: 'answer', sdp: payload.sdp });
      for (const c of peer.remoteIce.splice(0)) await peer.pc.addIceCandidate(c).catch(() => undefined);
    } catch {
      if (payload.from) dropPeer(payload.from);
    }
  }, [dropPeer]);

  const handleViewerIce = useCallback((payload: { from?: string; offerId?: string; candidate?: RTCIceCandidateInit }) => {
    const peer = peerFor(payload);
    if (!peer || !payload.candidate) return;
    if (!peer.pc.remoteDescription) { if (peer.remoteIce.length < 50) peer.remoteIce.push(payload.candidate); return; }
    peer.pc.addIceCandidate(payload.candidate).catch(() => undefined);
  }, []);

  /**
   * Opens the camera, creates the `live_streams` row and starts serving viewers.
   * Resolves with the stream id; rejects (nothing left open) if it cannot start.
   */
  const start = useCallback(async (meta: LiveMeta): Promise<string | null> => {
    if (statusRef.current === 'starting' || statusRef.current === 'live') return streamIdRef.current;
    const run = ++runRef.current;
    const aborted = () => runRef.current !== run;
    setStatus('starting');
    let media: MediaStream | null = null;
    let rowId: string | null = null;
    try {
      if (!navigator.mediaDevices?.getUserMedia || !liveSupported()) throw new Error(tr('liveStudio.httpsRequired'));
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error(tr('liveBroadcast.logInToStartALive'));
      prefetchIceServers();

      media = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
        video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 }, frameRate: { ideal: 30 } },
      });
      if (aborted()) { media.getTracks().forEach((t) => t.stop()); return null; }

      const keys = await crypto.subtle.generateKey(KEY_ALGO, true, ['sign', 'verify']);
      const publicJwk = JSON.stringify(await crypto.subtle.exportKey('jwk', keys.publicKey));

      // One live per streamer: a previous one left open (crashed tab) ends here.
      await supabase.from('live_streams')
        .update({ is_live: false, ended_at: new Date().toISOString() })
        .eq('streamer_id', user.id).eq('is_live', true);

      const { data: row, error } = await supabase
        .from('live_streams')
        .insert({
          streamer_id: user.id,
          title: meta.title,
          description: meta.description || null,
          category: meta.category || null,
          is_live: true,
          started_at: new Date().toISOString(),
          viewer_count: 0,
          signal_public_key: publicJwk,
        })
        .select('id')
        .single();
      if (error || !row) throw new Error(error?.message || tr('liveBroadcast.couldNotStart'));
      rowId = row.id;

      const channel = supabase.channel(`live:${rowId}`);
      channel
        .on('broadcast', { event: 'join' }, ({ payload }) => { handleJoin(payload?.viewerId); })
        .on('broadcast', { event: 'answer' }, ({ payload }) => { handleAnswer(payload || {}); })
        .on('broadcast', { event: 'viewer-ice' }, ({ payload }) => { handleViewerIce(payload || {}); })
        // Closed elsewhere (another device, or considered abandoned): stop here too.
        .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'live_streams', filter: `id=eq.${rowId}` }, (change) => {
          const next = change.new as { is_live: boolean | null };
          if (!next.is_live && streamIdRef.current === rowId) stop(false);
        });
      await whenSubscribed(channel);
      if (aborted()) {
        supabase.removeChannel(channel);
        throw new Error('aborted');
      }

      mediaRef.current = media;
      keyRef.current = keys.privateKey;
      channelRef.current = channel;
      streamIdRef.current = rowId;
      peakRef.current = 0;
      countRef.current = 0;
      frontRef.current = true;
      camOnRef.current = true;
      heartbeatRef.current = setInterval(writeCount, HEARTBEAT_MS);
      setLocalStream(media);
      setMicOn(true);
      setCamOn(true);
      setFrontCamera(true);
      setStartedAt(Date.now());
      setStatus('live');
      navigator.mediaDevices.enumerateDevices()
        .then((devices) => setCanSwitchCamera(devices.filter((d) => d.kind === 'videoinput').length > 1))
        .catch(() => undefined);
      return rowId;
    } catch (err) {
      media?.getTracks().forEach((t) => t.stop());
      if (rowId) await supabase.from('live_streams').update({ is_live: false, ended_at: new Date().toISOString() }).eq('id', rowId);
      if (aborted()) return null;
      setStatus('idle');
      throw err;
    }
  }, [handleAnswer, handleJoin, handleViewerIce, stop, writeCount]);

  const toggleMic = useCallback(() => {
    const tracks = mediaRef.current?.getAudioTracks() ?? [];
    if (!tracks.length) return;
    const enabled = !tracks[0].enabled;
    tracks.forEach((t) => { t.enabled = enabled; });
    setMicOn(enabled);
  }, []);

  const toggleCam = useCallback(() => {
    const tracks = mediaRef.current?.getVideoTracks() ?? [];
    if (!tracks.length) return;
    const enabled = !tracks[0].enabled;
    tracks.forEach((t) => { t.enabled = enabled; });
    camOnRef.current = enabled;
    setCamOn(enabled);
  }, []);

  /** Front ↔ back camera, without renegotiating: the new track replaces the old one. */
  const switchCamera = useCallback(async () => {
    const media = mediaRef.current;
    const oldTrack = media?.getVideoTracks()[0];
    if (!media || !oldTrack) return;
    const front = !frontRef.current;
    // Most phones cannot open two cameras at once: release the current one first.
    oldTrack.stop();
    let newTrack: MediaStreamTrack | undefined;
    try {
      const next = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: front ? 'user' : 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
      });
      newTrack = next.getVideoTracks()[0];
      frontRef.current = front;
    } catch {
      // The other camera is unavailable: reopen the one we had.
      const back = await navigator.mediaDevices.getUserMedia({ video: { facingMode: frontRef.current ? 'user' : 'environment' } }).catch(() => null);
      newTrack = back?.getVideoTracks()[0];
    }
    if (mediaRef.current !== media) { newTrack?.stop(); return; } // the live ended meanwhile
    media.removeTrack(oldTrack);
    if (!newTrack) { camOnRef.current = false; setCamOn(false); return; }
    newTrack.enabled = camOnRef.current;
    media.addTrack(newTrack);
    peersRef.current.forEach((peer) => {
      peer.pc.getSenders().find((s) => s.track === oldTrack || s.track?.kind === 'video')?.replaceTrack(newTrack!).catch(() => undefined);
    });
    setFrontCamera(frontRef.current);
    setLocalStream(new MediaStream(media.getTracks())); // new object so the preview re-attaches
  }, []);

  // Leaving the page or closing the tab ends the live.
  const stopRef = useRef(stop);
  stopRef.current = stop;
  useEffect(() => {
    const onHide = () => { stopRef.current(); };
    window.addEventListener('pagehide', onHide);
    return () => { window.removeEventListener('pagehide', onHide); stopRef.current(); };
  }, []);

  return { status, localStream, viewers, micOn, camOn, startedAt, canSwitchCamera, frontCamera, start, stop, toggleMic, toggleCam, switchCamera };
}

// =============================================================================
// Viewer
// =============================================================================

export type WatchStatus = 'connecting' | 'live' | 'reconnecting' | 'full' | 'ended' | 'unsupported';

export function useLiveViewer(streamId: string, initialViewers = 0) {
  const [status, setStatus] = useState<WatchStatus>('connecting');
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [viewers, setViewers] = useState(initialViewers);

  useEffect(() => {
    if (!liveSupported()) { setStatus('unsupported'); return; }
    setStatus('connecting');
    setRemoteStream(null);
    prefetchIceServers();

    const viewerId = crypto.randomUUID();
    const channel = supabase.channel(`live:${streamId}`);
    let closed = false;
    let ended = false;
    let publicKey: CryptoKey | null = null;
    let pc: RTCPeerConnection | null = null;
    let offerId = '';
    let earlyIce: { offerId: string; candidate: RTCIceCandidateInit }[] = [];
    let graceTimer: ReturnType<typeof setTimeout> | undefined;
    let ticks = 0;

    const closePc = () => {
      clearTimeout(graceTimer);
      if (!pc) return;
      pc.ontrack = null;
      pc.onicecandidate = null;
      pc.onconnectionstatechange = null;
      pc.close();
      pc = null;
    };

    const applyRow = (row: { is_live: boolean | null; viewer_count: number | null }) => {
      if (closed) return;
      setViewers(row.viewer_count ?? 0);
      if (!row.is_live && !ended) {
        ended = true;
        closePc();
        setRemoteStream(null);
        setStatus('ended');
      }
    };

    const loadRow = async () => {
      const { data } = await supabase
        .from('live_streams')
        .select('is_live, viewer_count, signal_public_key')
        .eq('id', streamId)
        .maybeSingle();
      if (closed || !data) return;
      if (!publicKey && data.signal_public_key) {
        try {
          publicKey = await crypto.subtle.importKey('jwk', JSON.parse(data.signal_public_key), KEY_ALGO, false, ['verify']);
        } catch { /* unreadable key: no offer can be trusted, the viewer keeps waiting */ }
      }
      applyRow(data);
    };

    const join = () => {
      if (closed || ended || pc || !publicKey || channel.state !== 'joined') return;
      send(channel, 'join', { viewerId });
    };

    const lostConnection = (conn: RTCPeerConnection) => {
      if (pc !== conn) return;
      closePc();
      setRemoteStream(null);
      setStatus('reconnecting');
      join();
    };

    const onOffer = async (payload: { to?: string; offerId?: string; sdp?: string; sig?: string }) => {
      if (closed || ended || !publicKey || payload.to !== viewerId) return;
      if (typeof payload.sdp !== 'string' || typeof payload.sig !== 'string' || typeof payload.offerId !== 'string') return;
      if (pc?.connectionState === 'connected') return; // only a viewer without video takes a new offer
      let genuine = false;
      try {
        genuine = await crypto.subtle.verify(SIGN_ALGO, publicKey, fromBase64(payload.sig), signedBytes(streamId, viewerId, payload.sdp));
      } catch { /* malformed signature */ }
      if (!genuine || closed || ended) return;

      closePc();
      const conn = new RTCPeerConnection({ iceServers: currentIceServers() });
      const thisOffer = payload.offerId;
      pc = conn;
      offerId = thisOffer;

      conn.ontrack = (e) => {
        const stream = e.streams[0] ?? new MediaStream([e.track]);
        // New object each time so React re-renders and the player picks up every track.
        setRemoteStream(new MediaStream(stream.getTracks()));
      };
      conn.onicecandidate = (e) => {
        if (e.candidate) send(channel, 'viewer-ice', { from: viewerId, offerId: thisOffer, candidate: e.candidate.toJSON() });
      };
      conn.onconnectionstatechange = () => {
        if (pc !== conn) return;
        clearTimeout(graceTimer);
        const state = conn.connectionState;
        if (state === 'connected') setStatus('live');
        else if (state === 'failed') lostConnection(conn);
        else if (state === 'disconnected') {
          // Usually a short network blip: give ICE time to recover before asking again.
          setStatus('reconnecting');
          graceTimer = setTimeout(() => lostConnection(conn), DISCONNECT_GRACE_MS);
        }
      };

      try {
        await conn.setRemoteDescription({ type: 'offer', sdp: payload.sdp });
        await conn.setLocalDescription(await conn.createAnswer());
        if (pc !== conn) return;
        send(channel, 'answer', { from: viewerId, offerId: thisOffer, sdp: conn.localDescription?.sdp });
        const pending = earlyIce.filter((c) => c.offerId === thisOffer);
        earlyIce = [];
        for (const c of pending) await conn.addIceCandidate(c.candidate).catch(() => undefined);
      } catch {
        if (pc === conn) closePc();
      }
    };

    const onStreamerIce = (payload: { to?: string; offerId?: string; candidate?: RTCIceCandidateInit }) => {
      if (payload.to !== viewerId || !payload.candidate || typeof payload.offerId !== 'string') return;
      if (pc && payload.offerId === offerId && pc.remoteDescription) {
        pc.addIceCandidate(payload.candidate).catch(() => undefined);
      } else if (earlyIce.length < 50) {
        // Arrived while the offer is still being verified / applied.
        earlyIce.push({ offerId: payload.offerId, candidate: payload.candidate });
      }
    };

    channel
      .on('broadcast', { event: 'offer' }, ({ payload }) => { onOffer(payload || {}); })
      .on('broadcast', { event: 'streamer-ice' }, ({ payload }) => { onStreamerIce(payload || {}); })
      .on('broadcast', { event: 'full' }, ({ payload }) => {
        if (payload?.to === viewerId && !pc && !ended) setStatus('full');
      })
      // Untrusted hint: the row says whether the live is really over.
      .on('broadcast', { event: 'end' }, () => { loadRow(); })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'live_streams', filter: `id=eq.${streamId}` }, (change) => {
        applyRow(change.new as { is_live: boolean | null; viewer_count: number | null });
      })
      .subscribe((s) => { if (s === 'SUBSCRIBED') join(); });

    loadRow().then(join);
    const loop = setInterval(() => {
      if (ended) return;
      join();
      if (++ticks % ROW_POLL_EVERY === 0) loadRow();
    }, JOIN_RETRY_MS);

    return () => {
      closed = true;
      clearInterval(loop);
      closePc();
      supabase.removeChannel(channel);
    };
  }, [streamId]);

  return { status, remoteStream, viewers };
}
