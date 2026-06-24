const KEYS = {
  highScore: 'world-runner-high-score',
  verified: 'world-runner-verified',
  premiumSkin: 'world-runner-premium-skin',
  wonderTrail: 'world-runner-wonder-trail',
  spiritAura: 'world-runner-spirit-aura',
  continues: 'world-runner-continues',
  speedBoosts: 'world-runner-speed-boosts',
  magnetBoosts: 'world-runner-magnet-boosts',
  dailyChallenge: 'world-runner-daily-challenge',
  stats: 'world-runner-stats',
  milestones: 'world-runner-milestones',
} as const;

export interface PlayerStats {
  totalRuns: number;
  totalOrbs: number;
  bestDistance: number;
}

export interface DailyChallengeState {
  date: string;
  completed: boolean;
  bestOrbs: number;
  targetOrbs: number;
}

export interface MilestoneState {
  lastOrbMilestone: number;
  wonderFlowersCollected: number;
  spiritShrinesCollected: number;
}

export interface RunRewards {
  speedBoost?: number;
  magnetBoost?: number;
  continueToken?: number;
  message?: string;
}

const defaultStats = (): PlayerStats => ({
  totalRuns: 0,
  totalOrbs: 0,
  bestDistance: 0,
});

const todayKey = () => new Date().toISOString().slice(0, 10);

function readJson<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeJson<T>(key: string, value: T) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(key, JSON.stringify(value));
}

export const gameStorage = {
  getHighScore(): number {
    if (typeof window === 'undefined') return 0;
    return Number(localStorage.getItem(KEYS.highScore) ?? 0);
  },

  setHighScore(score: number) {
    if (typeof window === 'undefined') return;
    localStorage.setItem(KEYS.highScore, String(score));
  },

  isVerifiedHuman(): boolean {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem(KEYS.verified) === 'true';
  },

  setVerifiedHuman(value: boolean) {
    if (typeof window === 'undefined') return;
    localStorage.setItem(KEYS.verified, value ? 'true' : 'false');
  },

  hasPremiumSkin(): boolean {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem(KEYS.premiumSkin) === 'true';
  },

  setPremiumSkin(value: boolean) {
    if (typeof window === 'undefined') return;
    localStorage.setItem(KEYS.premiumSkin, value ? 'true' : 'false');
  },

  hasWonderTrail(): boolean {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem(KEYS.wonderTrail) === 'true';
  },

  setWonderTrail(value: boolean) {
    if (typeof window === 'undefined') return;
    localStorage.setItem(KEYS.wonderTrail, value ? 'true' : 'false');
  },

  hasSpiritAura(): boolean {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem(KEYS.spiritAura) === 'true';
  },

  setSpiritAura(value: boolean) {
    if (typeof window === 'undefined') return;
    localStorage.setItem(KEYS.spiritAura, value ? 'true' : 'false');
  },

  getContinues(): number {
    if (typeof window === 'undefined') return 0;
    return Number(localStorage.getItem(KEYS.continues) ?? 0);
  },

  addContinues(count: number) {
    const next = this.getContinues() + count;
    if (typeof window === 'undefined') return;
    localStorage.setItem(KEYS.continues, String(next));
  },

  consumeContinue(): boolean {
    const current = this.getContinues();
    if (current <= 0) return false;
    if (typeof window === 'undefined') return false;
    localStorage.setItem(KEYS.continues, String(current - 1));
    return true;
  },

  getSpeedBoosts(): number {
    if (typeof window === 'undefined') return 0;
    return Number(localStorage.getItem(KEYS.speedBoosts) ?? 0);
  },

  addSpeedBoosts(count: number) {
    const next = this.getSpeedBoosts() + count;
    if (typeof window === 'undefined') return;
    localStorage.setItem(KEYS.speedBoosts, String(next));
  },

  consumeSpeedBoost(): boolean {
    const current = this.getSpeedBoosts();
    if (current <= 0) return false;
    if (typeof window === 'undefined') return false;
    localStorage.setItem(KEYS.speedBoosts, String(current - 1));
    return true;
  },

  getMagnetBoosts(): number {
    if (typeof window === 'undefined') return 0;
    return Number(localStorage.getItem(KEYS.magnetBoosts) ?? 0);
  },

  addMagnetBoosts(count: number) {
    const next = this.getMagnetBoosts() + count;
    if (typeof window === 'undefined') return;
    localStorage.setItem(KEYS.magnetBoosts, String(next));
  },

  consumeMagnetBoost(): boolean {
    const current = this.getMagnetBoosts();
    if (current <= 0) return false;
    if (typeof window === 'undefined') return false;
    localStorage.setItem(KEYS.magnetBoosts, String(current - 1));
    return true;
  },

  getStats(): PlayerStats {
    return readJson(KEYS.stats, defaultStats());
  },

  recordRun(distance: number, orbs: number) {
    const stats = this.getStats();
    stats.totalRuns += 1;
    stats.totalOrbs += orbs;
    stats.bestDistance = Math.max(stats.bestDistance, Math.floor(distance));
    writeJson(KEYS.stats, stats);
  },

  getDailyChallenge(): DailyChallengeState {
    const fallback: DailyChallengeState = {
      date: todayKey(),
      completed: false,
      bestOrbs: 0,
      targetOrbs: 15,
    };
    const stored = readJson<DailyChallengeState | null>(KEYS.dailyChallenge, null);
    if (!stored || stored.date !== todayKey()) return fallback;
    return stored;
  },

  updateDailyChallenge(orbsInRun: number) {
    const current = this.getDailyChallenge();
    const wasComplete = current.completed;
    current.bestOrbs = Math.max(current.bestOrbs, orbsInRun);
    if (current.bestOrbs >= current.targetOrbs) current.completed = true;
    writeJson(KEYS.dailyChallenge, current);
    return !wasComplete && current.completed;
  },

  getMilestones(): MilestoneState {
    return readJson(KEYS.milestones, {
      lastOrbMilestone: 0,
      wonderFlowersCollected: 0,
      spiritShrinesCollected: 0,
    });
  },

  recordWonderFlower() {
    const m = this.getMilestones();
    m.wonderFlowersCollected += 1;
    writeJson(KEYS.milestones, m);
  },

  recordSpiritShrine() {
    const m = this.getMilestones();
    m.spiritShrinesCollected += 1;
    writeJson(KEYS.milestones, m);
  },

  /** Recompensas solo por jugar — nunca de pago */
  awardRunRewards(orbsInRun: number, dailyJustCompleted: boolean): RunRewards {
    const rewards: RunRewards = {};
    const messages: string[] = [];

    if (dailyJustCompleted) {
      this.addContinues(1);
      this.addSpeedBoosts(1);
      rewards.continueToken = 1;
      rewards.speedBoost = 1;
      messages.push('Daily completado: +1 Continue y +1 Score Rush');
    }

    const stats = this.getStats();
    const milestone = Math.floor(stats.totalOrbs / 25);
    const m = this.getMilestones();
    if (milestone > m.lastOrbMilestone) {
      m.lastOrbMilestone = milestone;
      writeJson(KEYS.milestones, m);
      this.addMagnetBoosts(1);
      rewards.magnetBoost = 1;
      messages.push('Hito de orbes: +1 Magnet');
    }

    if (orbsInRun >= 12 && stats.totalRuns % 4 === 0) {
      this.addSpeedBoosts(1);
      rewards.speedBoost = (rewards.speedBoost ?? 0) + 1;
      messages.push('Carrera fuerte: +1 Score Rush');
    }

    if (messages.length > 0) rewards.message = messages.join(' · ');
    return rewards;
  },
};
