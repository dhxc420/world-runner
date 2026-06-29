/** Arcade soundtrack — home uses royalty-free MP3; gameplay uses procedural synth */

const HOME_TRACK_SRC = '/audio/home-ambient.mp3';
const HOME_TRACK_VOLUME = 0.28;

const THEME_ROOT: Record<string, number> = {
  grove: 146.83,
  grid: 130.81,
  hangar: 164.81,
};

const THEME_ARPS: Record<string, number[]> = {
  grove: [0, 4, 7, 12, 7, 4, 3, 7],
  grid: [0, 3, 7, 10, 7, 3, 5, 10],
  hangar: [0, 5, 7, 12, 10, 7, 5, 12],
};

type MusicMode = 'game' | 'menu' | 'home';

export class GameMusic {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private padOsc: OscillatorNode | null = null;
  private padGain: GainNode | null = null;
  private homeAudio: HTMLAudioElement | null = null;
  private timer: ReturnType<typeof setInterval> | null = null;
  private step = 0;
  private themeId = 'grove';
  private muted = false;
  private active = false;
  private volume = 0.09;
  private stepInterval = 240;
  private mode: MusicMode = 'game';

  private ensureCtx(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) this.ctx = new AudioContext();
    return this.ctx;
  }

  private ensureHomeAudio(): HTMLAudioElement | null {
    if (typeof window === 'undefined') return null;
    if (!this.homeAudio) {
      this.homeAudio = new Audio(HOME_TRACK_SRC);
      this.homeAudio.loop = true;
      this.homeAudio.preload = 'auto';
    }
    return this.homeAudio;
  }

  async ensureRunning(): Promise<AudioContext | null> {
    const ctx = this.ensureCtx();
    if (!ctx) return null;
    if (ctx.state === 'suspended') {
      try {
        await ctx.resume();
      } catch {
        /* needs user gesture */
      }
    }
    return ctx;
  }

  unlock() {
    void this.ensureRunning();
  }

  isActive() {
    return this.active;
  }

  setMuted(muted: boolean) {
    this.muted = muted;
    if (this.master) this.master.gain.value = muted ? 0 : this.volume;
    if (this.homeAudio && this.mode === 'home') {
      this.homeAudio.volume = muted ? 0 : HOME_TRACK_VOLUME;
    }
  }

  startMenu(themeId = 'grove') {
    this.start(themeId, { menu: true });
  }

  /** Home screen — CC0 ambient loop (OpenGameArt) */
  startHomeTron() {
    this.stop();
    this.mode = 'home';
    this.themeId = 'home';
    this.active = true;

    const audio = this.ensureHomeAudio();
    if (!audio) return;

    audio.volume = 0;
    const targetVol = this.muted ? 0 : HOME_TRACK_VOLUME;
    void audio.play().then(() => {
      this.fadeHomeVolume(audio, targetVol);
    }).catch(() => {
      /* blocked until user gesture */
    });
  }

  private fadeHomeVolume(audio: HTMLAudioElement, target: number) {
    if (this.mode !== 'home' || this.muted) {
      audio.volume = 0;
      return;
    }
    const steps = 24;
    let i = 0;
    const tick = () => {
      if (this.mode !== 'home') return;
      i += 1;
      audio.volume = Math.min(target, (target * i) / steps);
      if (i < steps) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  /** @deprecated use startHomeTron */
  startHomeSynthwave() {
    this.startHomeTron();
  }

  start(themeId: string, options?: { menu?: boolean }) {
    this.stop();
    this.mode = options?.menu ? 'menu' : 'game';
    this.themeId = themeId;
    this.active = true;
    this.volume = options?.menu ? 0.055 : 0.09;
    this.stepInterval = options?.menu ? 340 : 240;
    const ctx = this.ensureCtx();
    if (!ctx) return;

    this.master = ctx.createGain();
    this.master.gain.value = this.muted ? 0 : this.volume;
    this.master.connect(ctx.destination);

    const root = THEME_ROOT[themeId] ?? THEME_ROOT.grove;
    this.padOsc = ctx.createOscillator();
    this.padGain = ctx.createGain();
    this.padOsc.type = 'sine';
    this.padOsc.frequency.value = root / 2;
    this.padGain.gain.value = 0.35;
    this.padOsc.connect(this.padGain);
    this.padGain.connect(this.master);
    this.padOsc.start();

    this.step = 0;
    this.timer = setInterval(() => {
      this.playStep(root);
      this.step += 1;
    }, this.stepInterval);
  }

  stop() {
    this.active = false;
    this.mode = 'game';

    if (this.homeAudio) {
      this.homeAudio.pause();
      this.homeAudio.currentTime = 0;
    }

    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }

    if (this.padOsc) {
      try {
        this.padOsc.stop();
      } catch {
        /* already stopped */
      }
    }

    this.padOsc = null;
    this.padGain = null;
    this.master = null;
  }

  updateTheme(themeId: string) {
    if (!this.active || themeId === this.themeId || this.mode === 'home') return;
    const menu = this.mode === 'menu';
    this.start(themeId, menu ? { menu: true } : undefined);
  }

  private playStep(root: number) {
    const ctx = this.ctx;
    const master = this.master;
    if (!ctx || !master || this.muted) return;

    const arp = THEME_ARPS[this.themeId] ?? THEME_ARPS.grove;
    const semi = arp[this.step % arp.length];
    const freq = root * 2 ** (semi / 12);

    const isDownbeat = this.step % 8 === 0;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = isDownbeat ? 'triangle' : 'square';
    osc.frequency.value = freq;
    g.gain.value = isDownbeat ? 0.12 : 0.055;
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + (isDownbeat ? 0.35 : 0.18));
    osc.connect(g);
    g.connect(master);
    osc.start();
    osc.stop(ctx.currentTime + 0.4);

    if (this.step % 4 === 0) {
      const bass = ctx.createOscillator();
      const bg = ctx.createGain();
      bass.type = 'sine';
      bass.frequency.value = root / 2;
      bg.gain.value = 0.14;
      bg.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.28);
      bass.connect(bg);
      bg.connect(master);
      bass.start();
      bass.stop(ctx.currentTime + 0.3);
    }
  }
}

export const gameMusic = new GameMusic();
