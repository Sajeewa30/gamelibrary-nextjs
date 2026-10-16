import type { GameDetail } from "@/lib/types";

const GAME_CACHE_TTL_MS = 2 * 60 * 1000;
const GAME_STORAGE_TTL_MS = 10 * 60 * 1000;
const GAME_STORAGE_KEY = "game-detail-cache-v1";
const gameCache = new Map<string, { data: GameDetail; expiresAt: number }>();

const readStorageCache = (id: string): GameDetail | null => {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(GAME_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as {
      id: string;
      data: GameDetail;
      expiresAt: number;
    };
    if (parsed.id !== id) return null;
    if (parsed.expiresAt < Date.now()) return null;
    return parsed.data;
  } catch {
    return null;
  }
};

const writeStorageCache = (id: string, data: GameDetail) => {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(
      GAME_STORAGE_KEY,
      JSON.stringify({
        id,
        data,
        expiresAt: Date.now() + GAME_STORAGE_TTL_MS,
      })
    );
  } catch {
    // Ignore storage errors.
  }
};

export const readGameDetailCache = (id: string): GameDetail | null => {
  const cached = gameCache.get(id);
  if (cached && cached.expiresAt > Date.now()) return cached.data;
  return readStorageCache(id);
};

export const writeGameDetailCache = (id: string, data: GameDetail) => {
  gameCache.set(id, { data, expiresAt: Date.now() + GAME_CACHE_TTL_MS });
  writeStorageCache(id, data);
};

// Drop a game's cached detail so the detail page refetches it. Call this
// whenever the game changes outside the detail page (e.g. the Update modal),
// otherwise the Hero keeps showing the old data until the cache expires.
export const invalidateGameDetailCache = (id: string) => {
  gameCache.delete(id);
  if (typeof window === "undefined") return;
  try {
    const raw = sessionStorage.getItem(GAME_STORAGE_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw) as { id?: string };
    if (parsed.id === id) sessionStorage.removeItem(GAME_STORAGE_KEY);
  } catch {
    sessionStorage.removeItem(GAME_STORAGE_KEY);
  }
};
