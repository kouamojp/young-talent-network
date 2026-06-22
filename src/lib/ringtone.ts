/**
 * Synthesized ring tones using the Web Audio API — no audio asset needed.
 *  - 'incoming': a classic double-ring pattern (440 + 480 Hz, like a phone ringing)
 *  - 'outgoing': a single low ringback beep
 * Note: browsers require a prior user gesture before audio can play; we call
 * resume() best-effort. If still blocked, the call UI is shown regardless.
 */
type RingMode = 'incoming' | 'outgoing';

class Ringtone {
  private ctx: AudioContext | null = null;
  private interval: ReturnType<typeof setInterval> | null = null;

  private ensureCtx() {
    if (!this.ctx) {
      const Ctor = window.AudioContext || (window as any).webkitAudioContext;
      if (!Ctor) return null;
      this.ctx = new Ctor();
    }
    if (this.ctx.state === 'suspended') this.ctx.resume().catch(() => {});
    return this.ctx;
  }

  private beep(freqs: number[], duration: number, startOffset = 0, volume = 0.18) {
    const ctx = this.ctx;
    if (!ctx) return;
    const t0 = ctx.currentTime + startOffset;
    const gain = ctx.createGain();
    gain.connect(ctx.destination);
    gain.gain.setValueAtTime(0.0001, t0);
    gain.gain.exponentialRampToValueAtTime(volume, t0 + 0.04);
    gain.gain.setValueAtTime(volume, t0 + duration - 0.05);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);
    freqs.forEach((f) => {
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = f;
      osc.connect(gain);
      osc.start(t0);
      osc.stop(t0 + duration);
    });
  }

  start(mode: RingMode) {
    this.stop();
    const ctx = this.ensureCtx();
    if (!ctx) return;

    const cycle = () => {
      if (mode === 'incoming') {
        // ring … ring (two short bursts) then a gap
        this.beep([440, 480], 0.4, 0);
        this.beep([440, 480], 0.4, 0.6);
      } else {
        // single low ringback beep
        this.beep([400], 0.8, 0, 0.12);
      }
    };
    cycle();
    this.interval = setInterval(cycle, mode === 'incoming' ? 3000 : 3500);
  }

  stop() {
    if (this.interval) { clearInterval(this.interval); this.interval = null; }
  }
}

export const ringtone = new Ringtone();
