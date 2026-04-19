const LIST_TTL_MS = 2 * 60 * 1000;

type CachedEntry<T> = { value: T; expiresAt: number };

export function readListCache<T>(key: string): T | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CachedEntry<T>;
    if (!parsed || parsed.expiresAt < Date.now()) {
      sessionStorage.removeItem(key);
      return null;
    }
    return parsed.value;
  } catch {
    return null;
  }
}

export function writeListCache<T>(key: string, value: T, ttlMs: number = LIST_TTL_MS) {
  if (typeof window === "undefined") return;
  try {
    const entry: CachedEntry<T> = { value, expiresAt: Date.now() + ttlMs };
    sessionStorage.setItem(key, JSON.stringify(entry));
  } catch {
    // Storage quota or disabled — safe to ignore.
  }
}

export function invalidateListCache(prefix?: string) {
  if (typeof window === "undefined") return;
  try {
    if (!prefix) {
      sessionStorage.clear();
      return;
    }
    const toRemove: string[] = [];
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (key && key.startsWith(prefix)) toRemove.push(key);
    }
    toRemove.forEach((k) => sessionStorage.removeItem(k));
  } catch {
    // ignore
  }
}
