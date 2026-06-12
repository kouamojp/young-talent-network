import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface MusicTrack {
  id: string;
  user_id: string;
  title: string;
  audio_url: string;
  cover_url: string | null;
  duration_seconds: number | null;
  genre: string | null;
  style: string | null;
  origin: 'ai' | 'human';
  album_id?: string | null;
  artist_name?: string | null;
}

interface PlayerCtx {
  current: MusicTrack | null;
  queue: MusicTrack[];
  isPlaying: boolean;
  progress: number;
  duration: number;
  playTrack: (track: MusicTrack, queue?: MusicTrack[]) => void;
  toggle: () => void;
  next: () => void;
  prev: () => void;
  seek: (s: number) => void;
  enqueue: (track: MusicTrack) => void;
}

const Ctx = createContext<PlayerCtx | null>(null);

export const MusicPlayerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [current, setCurrent] = useState<MusicTrack | null>(null);
  const [queue, setQueue] = useState<MusicTrack[]>([]);
  const [index, setIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const playStartRef = useRef<number>(0);

  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.preload = 'metadata';
    }
    const a = audioRef.current;
    const onTime = () => setProgress(a.currentTime);
    const onLoaded = () => setDuration(a.duration || 0);
    const onEnd = () => nextRef.current?.();
    a.addEventListener('timeupdate', onTime);
    a.addEventListener('loadedmetadata', onLoaded);
    a.addEventListener('ended', onEnd);
    return () => {
      a.removeEventListener('timeupdate', onTime);
      a.removeEventListener('loadedmetadata', onLoaded);
      a.removeEventListener('ended', onEnd);
    };
  }, []);

  const recordPlay = useCallback(async (track: MusicTrack, seconds: number) => {
    if (seconds < 3) return;
    const { data: { user } } = await supabase.auth.getUser();
    await supabase.from('music_plays').insert({ user_id: user?.id ?? null, track_id: track.id, listened_seconds: Math.round(seconds) });
  }, []);

  const loadAndPlay = useCallback((track: MusicTrack) => {
    const a = audioRef.current!;
    if (current) {
      const listened = a.currentTime - playStartRef.current;
      if (listened > 0) recordPlay(current, listened);
    }
    a.src = track.audio_url;
    a.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
    playStartRef.current = 0;
    setCurrent(track);
  }, [current, recordPlay]);

  const playTrack: PlayerCtx['playTrack'] = (track, q) => {
    const newQueue = q && q.length ? q : [track];
    const idx = newQueue.findIndex(t => t.id === track.id);
    setQueue(newQueue);
    setIndex(idx >= 0 ? idx : 0);
    loadAndPlay(track);
  };

  const toggle = () => {
    const a = audioRef.current!;
    if (!current) return;
    if (a.paused) { a.play(); setIsPlaying(true); }
    else { a.pause(); setIsPlaying(false); }
  };

  const next = () => {
    if (index + 1 < queue.length) {
      const nextIdx = index + 1;
      setIndex(nextIdx);
      loadAndPlay(queue[nextIdx]);
    } else {
      setIsPlaying(false);
    }
  };
  const prev = () => {
    if (index > 0) {
      const p = index - 1;
      setIndex(p);
      loadAndPlay(queue[p]);
    }
  };
  const nextRef = useRef(next);
  nextRef.current = next;

  const seek = (s: number) => {
    if (audioRef.current) audioRef.current.currentTime = s;
  };

  const enqueue = (track: MusicTrack) => setQueue(q => [...q, track]);

  return (
    <Ctx.Provider value={{ current, queue, isPlaying, progress, duration, playTrack, toggle, next, prev, seek, enqueue }}>
      {children}
    </Ctx.Provider>
  );
};

export const useMusicPlayer = () => {
  const v = useContext(Ctx);
  if (!v) throw new Error('useMusicPlayer must be used within MusicPlayerProvider');
  return v;
};
