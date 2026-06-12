import React from 'react';
import { useMusicPlayer } from '@/contexts/MusicPlayerContext';
import { Play, Pause, SkipBack, SkipForward, Music as MusicIcon, Sparkles, Mic2 } from 'lucide-react';
import { Slider } from '@/components/ui/slider';

const fmt = (s: number) => {
  if (!s || !isFinite(s)) return '0:00';
  const m = Math.floor(s / 60);
  const r = Math.floor(s % 60);
  return `${m}:${r.toString().padStart(2, '0')}`;
};

const FloatingPlayer: React.FC = () => {
  const { current, isPlaying, toggle, next, prev, progress, duration, seek } = useMusicPlayer();
  if (!current) return null;

  return (
    <div className="fixed bottom-14 md:bottom-0 left-0 right-0 z-40 bg-card/95 backdrop-blur border-t border-border shadow-lg">
      <div className="max-w-[1400px] mx-auto flex items-center gap-3 px-3 py-2">
        <div className="h-10 w-10 rounded bg-muted overflow-hidden shrink-0 flex items-center justify-center">
          {current.cover_url ? (
            <img src={current.cover_url} alt="" className="h-full w-full object-cover" />
          ) : (
            <MusicIcon className="h-5 w-5 text-muted-foreground" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <p className="text-sm font-medium truncate">{current.title}</p>
            {current.origin === 'ai' ? (
              <Sparkles className="h-3 w-3 text-purple-500 shrink-0" />
            ) : (
              <Mic2 className="h-3 w-3 text-emerald-500 shrink-0" />
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-muted-foreground tabular-nums w-8 text-right">{fmt(progress)}</span>
            <Slider
              value={[progress]}
              max={duration || 1}
              step={1}
              onValueChange={(v) => seek(v[0])}
              className="flex-1"
            />
            <span className="text-[10px] text-muted-foreground tabular-nums w-8">{fmt(duration)}</span>
          </div>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <button onClick={prev} className="p-1.5 hover:bg-muted rounded-full"><SkipBack className="h-4 w-4" /></button>
          <button onClick={toggle} className="p-2 bg-primary text-primary-foreground hover:opacity-90 rounded-full">
            {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </button>
          <button onClick={next} className="p-1.5 hover:bg-muted rounded-full"><SkipForward className="h-4 w-4" /></button>
        </div>
      </div>
    </div>
  );
};

export default FloatingPlayer;
