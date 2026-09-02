// Procedural Web Audio synthesizer for Quantum Observer
class SoundEngine {
  private ctx: AudioContext | null = null;
  public enabled: boolean = true;

  private initCtx() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // Play sci-fi collision impact when two attractor cores collide
  public playCollision(force: number = 1.0) {
    if (!this.enabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const intensity = Math.min(Math.max(force, 0.2), 2.5);

      // Low sub-bass thump
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(140 * intensity, now);
      osc.frequency.exponentialRampToValueAtTime(32, now + 0.35);

      gain.gain.setValueAtTime(0.3 * Math.min(intensity, 1.2), now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.36);

      // Metallic high harmonic ping
      const ping = this.ctx.createOscillator();
      const pingGain = this.ctx.createGain();
      ping.type = 'triangle';
      ping.frequency.setValueAtTime(880 * intensity, now);
      ping.frequency.exponentialRampToValueAtTime(220, now + 0.2);

      pingGain.gain.setValueAtTime(0.12 * Math.min(intensity, 1), now);
      pingGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.2);

      ping.connect(pingGain);
      pingGain.connect(this.ctx.destination);

      ping.start(now);
      ping.stop(now + 0.21);
    } catch {
      // Ignore audio failure
    }
  }

  // Play proximity gravitational hum when attractor cores come close
  public playAttractionTension(distance: number, maxDist: number = 600) {
    if (!this.enabled) return;
    // Throttle / only subtle clicks
    if (distance > maxDist) return;
  }
}

export const soundEngine = new SoundEngine();
