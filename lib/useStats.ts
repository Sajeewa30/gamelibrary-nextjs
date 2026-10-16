"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/authProvider";
import { fetchStats, type GameStats } from "@/lib/gameApi";
import { readListCache, writeListCache } from "@/lib/listCache";

// Under the "games:" prefix so every add/update/delete invalidates it.
const STATS_CACHE_KEY = "games:stats";

/**
 * Library stats for the signed-in user. Shows the cached value instantly, but
 * always revalidates so counts reflect games added or changed since.
 */
export function useStats() {
  const { user } = useAuth();
  const [stats, setStats] = useState<GameStats | null>(() =>
    readListCache<GameStats>(STATS_CACHE_KEY)
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    fetchStats()
      .then((data) => {
        writeListCache(STATS_CACHE_KEY, data);
        if (cancelled) return;
        setStats(data);
        setError(null);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "Failed to load stats.");
      });
    return () => {
      cancelled = true;
    };
  }, [user]);

  return { stats: user ? stats : null, error, loading: !!user && !stats && !error };
}
