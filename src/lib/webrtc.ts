import type { RealtimeChannel } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { tr } from '@/i18n';

/** WebRTC helpers shared by the 1:1 calls and the live broadcasts. */

// STUN is free; a TURN server is required for reliable connectivity across strict NATs.
// Preferred: short-lived credentials from the `turn-credentials` Edge Function
// (coturn or Metered, configured server-side). Fallback: VITE_TURN_* env vars,
// then the public OpenRelay TURN, which is only fit for development.
const FALLBACK_ICE_SERVERS: RTCIceServer[] = [
  { urls: 'stun:stun.l.google.com:19302' },
  {
    urls: import.meta.env.VITE_TURN_URL || 'turn:openrelay.metered.ca:80',
    username: import.meta.env.VITE_TURN_USERNAME || 'openrelayproject',
    credential: import.meta.env.VITE_TURN_CREDENTIAL || 'openrelayproject',
  },
];

let iceCache: { servers: RTCIceServer[]; expiresAt: number } | null = null;

/** Fetches (and caches until shortly before expiry) TURN credentials from the Edge Function. */
export const prefetchIceServers = async () => {
  if (iceCache && iceCache.expiresAt > Date.now()) return;
  try {
    const { data, error } = await supabase.functions.invoke('turn-credentials', { body: {} });
    if (error || !Array.isArray(data?.iceServers) || data.iceServers.length === 0) return;
    const ttlMs = Math.max(60, Number(data.ttl) || 3600) * 1000;
    iceCache = { servers: data.iceServers, expiresAt: Date.now() + ttlMs - 5 * 60 * 1000 };
  } catch {
    // keep the fallback servers
  }
};

export const currentIceServers = (): RTCIceServer[] =>
  iceCache && iceCache.expiresAt > Date.now() ? iceCache.servers : FALLBACK_ICE_SERVERS;

/** Resolves once the realtime channel is joined; rejects instead of waiting forever. */
export const whenSubscribed = (channel: RealtimeChannel, timeoutMs = 10000): Promise<void> =>
  new Promise((resolve, reject) => {
    if (channel.state === 'joined') return resolve();
    const timer = setTimeout(() => reject(new Error(tr('calls.signalingUnavailable'))), timeoutMs);
    channel.subscribe((s) => {
      if (s === 'SUBSCRIBED') { clearTimeout(timer); resolve(); }
      else if (s === 'CHANNEL_ERROR' || s === 'TIMED_OUT' || s === 'CLOSED') { clearTimeout(timer); reject(new Error(tr('calls.signalingUnavailable'))); }
    });
  });

/** Human-readable reason why the microphone / camera could not be opened. */
export const mediaErrorMessage = (err: unknown): string => {
  const name = (err as { name?: string })?.name;
  if (name === 'NotAllowedError' || name === 'SecurityError') return tr('calls.permissionDenied');
  if (name === 'NotFoundError' || name === 'OverconstrainedError') return tr('calls.noMicrophone');
  if (name === 'NotReadableError' || name === 'AbortError') return tr('calls.deviceBusy');
  return (err as Error)?.message || tr('calls.noMicrophone');
};
