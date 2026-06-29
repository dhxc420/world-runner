export interface LeaderboardEntry {
  walletAddress: string;
  username: string;
  profilePictureUrl: string;
  score: number;
  distance: number;
  levelName: string;
  verified: boolean;
  updatedAt: string;
}

export interface VerifiedPlayer {
  walletAddress: string;
  username: string;
  profilePictureUrl: string;
  nullifierHash: string;
  verifiedAt: string;
}

type StoreGlobal = {
  leaderboard: LeaderboardEntry[];
  verified: Map<string, VerifiedPlayer>;
  nullifiers: Set<string>;
  hydrated: boolean;
  hydrating: Promise<void> | null;
};

const STORE_KEY = '__world_runner_store__';

function getStore(): StoreGlobal {
  const g = globalThis as typeof globalThis & { [STORE_KEY]?: StoreGlobal };
  if (!g[STORE_KEY]) {
    g[STORE_KEY] = {
      leaderboard: [],
      verified: new Map(),
      nullifiers: new Set(),
      hydrated: false,
      hydrating: null,
    };
  }
  return g[STORE_KEY];
}

async function redisGet<T>(key: string): Promise<T | null> {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  try {
    const res = await fetch(`${url}/get/${encodeURIComponent(key)}`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { result?: string | null };
    return data.result ? (JSON.parse(data.result) as T) : null;
  } catch {
    return null;
  }
}

async function redisSet(key: string, value: unknown) {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return;
  try {
    await fetch(`${url}/set/${encodeURIComponent(key)}/${encodeURIComponent(JSON.stringify(value))}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });
  } catch {
    /* optional persistence */
  }
}

const LB_KEY = 'world-runner:leaderboard';
const VERIFIED_KEY = 'world-runner:verified';

async function ensureStoreHydrated(store: StoreGlobal): Promise<void> {
  if (store.hydrated) return;
  if (store.hydrating) {
    await store.hydrating;
    return;
  }

  store.hydrating = (async () => {
    const [remoteVerified, remoteLeaderboard] = await Promise.all([
      redisGet<VerifiedPlayer[]>(VERIFIED_KEY),
      redisGet<LeaderboardEntry[]>(LB_KEY),
    ]);

    if (remoteVerified) {
      for (const player of remoteVerified) {
        const addr = player.walletAddress.toLowerCase();
        store.verified.set(addr, player);
        store.nullifiers.add(player.nullifierHash);
      }
    }

    if (remoteLeaderboard) {
      store.leaderboard = remoteLeaderboard;
    }

    store.hydrated = true;
    store.hydrating = null;
  })();

  await store.hydrating;
}

function isRealVerifiedEntry(entry: LeaderboardEntry, store: StoreGlobal): boolean {
  const addr = entry.walletAddress.toLowerCase();
  if (!addr || addr.startsWith('0xseed')) return false;
  return entry.verified === true && store.verified.has(addr);
}

export async function getLeaderboard(limit = 20): Promise<LeaderboardEntry[]> {
  const store = getStore();
  await ensureStoreHydrated(store);
  return [...store.leaderboard]
    .filter((e) => isRealVerifiedEntry(e, store))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

export async function submitScore(entry: Omit<LeaderboardEntry, 'updatedAt' | 'verified'>) {
  const store = getStore();
  await ensureStoreHydrated(store);

  const addr = entry.walletAddress.toLowerCase();
  const verified = store.verified.get(addr);
  if (!verified) {
    throw new Error('NOT_VERIFIED');
  }

  const full: LeaderboardEntry = {
    ...entry,
    username: entry.username || verified.username,
    profilePictureUrl: entry.profilePictureUrl || verified.profilePictureUrl,
    verified: true,
    updatedAt: new Date().toISOString(),
  };

  const existing = store.leaderboard.findIndex(
    (e) => e.walletAddress.toLowerCase() === entry.walletAddress.toLowerCase(),
  );
  if (existing >= 0) {
    if (full.score <= store.leaderboard[existing].score) return store.leaderboard[existing];
    store.leaderboard[existing] = full;
  } else {
    store.leaderboard.push(full);
  }

  store.leaderboard = store.leaderboard
    .filter((e) => isRealVerifiedEntry(e, store))
    .sort((a, b) => b.score - a.score)
    .slice(0, 100);
  await redisSet(LB_KEY, store.leaderboard);
  return full;
}

export async function registerVerifiedPlayer(player: VerifiedPlayer) {
  const store = getStore();
  await ensureStoreHydrated(store);

  if (store.nullifiers.has(player.nullifierHash)) {
    throw new Error('NULLIFIER_USED');
  }

  const addr = player.walletAddress.toLowerCase();
  store.nullifiers.add(player.nullifierHash);
  store.verified.set(addr, player);

  const remoteVerified = (await redisGet<VerifiedPlayer[]>(VERIFIED_KEY)) ?? [];
  const filtered = remoteVerified.filter((p) => p.walletAddress.toLowerCase() !== addr);
  filtered.push(player);
  await redisSet(VERIFIED_KEY, filtered);

  return player;
}

export function isWalletVerifiedServer(walletAddress: string): boolean {
  const store = getStore();
  return store.verified.has(walletAddress.toLowerCase());
}
