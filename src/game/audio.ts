/** Lightweight Web Audio SFX — no asset files required */
export class GameAudio {
  private ctx: AudioContext | null = null;
  private muted = false;

  private ensureCtx(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      this.ctx = new AudioContext();
    }
    if (this.ctx.state === 'suspended') {
      void this.ctx.resume();
    }
    return this.ctx;
  }

  unlock() {
    this.ensureCtx();
  }

  setMuted(muted: boolean) {
    this.muted = muted;
  }

  private tone(
    freq: number,
    duration: number,
    type: OscillatorType = 'sine',
    gain = 0.08,
    pitchVar = 0,
  ) {
    if (this.muted) return;
    const ctx = this.ensureCtx();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = type;
    const detune = pitchVar ? (Math.random() - 0.5) * pitchVar : 0;
    osc.frequency.value = freq + detune;
    g.gain.value = gain;
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc.connect(g);
    g.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + duration);
  }

  playJump() {
    this.tone(520, 0.08, 'triangle', 0.06);
  }

  playLand() {
    this.tone(180, 0.06, 'sine', 0.05);
  }

  playOrb(points: number) {
    this.tone(660 + Math.min(points, 120), 0.1, 'sine', 0.07);
    setTimeout(() => this.tone(880, 0.08, 'sine', 0.05), 40);
  }

  playNearMiss() {
    this.tone(320, 0.07, 'square', 0.04, 30);
  }

  playHit() {
    this.tone(120, 0.15, 'sawtooth', 0.09, 40);
  }

  playPowerup() {
    this.tone(440, 0.12, 'triangle', 0.07);
    setTimeout(() => this.tone(660, 0.1, 'triangle', 0.06), 60);
  }

  playDeath() {
    this.tone(200, 0.25, 'sawtooth', 0.1);
    setTimeout(() => this.tone(90, 0.3, 'sine', 0.08), 80);
  }

  playContinue() {
    this.tone(330, 0.1, 'sine', 0.07);
    setTimeout(() => this.tone(550, 0.12, 'sine', 0.08), 70);
    setTimeout(() => this.tone(880, 0.15, 'triangle', 0.06), 140);
  }
}

export const gameAudio = new GameAudio();
