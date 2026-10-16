"use client";

import { useCallback, useEffect, useState } from "react";
import { API_BASE_URL } from "@/lib/api";
import { ApiError, fetchWithAuth } from "@/lib/fetchWithAuth";
import { deleteGame, updateGame } from "@/lib/gameApi";
import { readListCache, writeListCache } from "@/lib/listCache";
import { resolveGameId, type GameType, type GameUpdatePayload } from "@/lib/types";
import { useAuth } from "@/components/authProvider";

type Options = {
  endpoint: string;
  cacheKey: string;
  /**
   * Whether a game still belongs on this list after it is updated, e.g. the
   * backlog drops games marked completed and Favourites drops un-favourited
   * ones. Defaults to keeping every game. Define it outside the component so
   * its identity is stable.
   */
  keepWhen?: (game: GameType) => boolean;
};

export type GameCollection = {
  games: GameType[];
  loading: boolean;
  error: string | null;
  deletingId: string | null;
  refetch: () => Promise<void>;
  handleDelete: (id: string) => Promise<void>;
  handleUpdate: (id: string, payload: GameUpdatePayload) => Promise<void>;
};

export function useGameCollection({
  endpoint,
  cacheKey,
  keepWhen,
}: Options): GameCollection {
  const { user, loading: authLoading } = useAuth();
  const [games, setGames] = useState<GameType[]>(() => readListCache<GameType[]>(cacheKey) ?? []);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchGames = useCallback(async () => {
    setError(null);
    try {
      const res = await fetchWithAuth(`${API_BASE_URL}${endpoint}`);
      if (!res.ok) {
        throw new Error(`Request failed (${res.status})`);
      }
      const data: unknown = await res.json();
      const list = Array.isArray(data) ? (data as GameType[]) : [];
      setGames(list);
      writeListCache(cacheKey, list);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Something went wrong loading your games.");
      }
      console.error("useGameCollection fetch failed", err);
    } finally {
      setLoading(false);
    }
  }, [endpoint, cacheKey]);

  useEffect(() => {
    if (authLoading || !user) return;
    const cached = readListCache<GameType[]>(cacheKey);
    if (cached) {
      setGames(cached);
      setLoading(false);
    }
    fetchGames();
  }, [authLoading, user, cacheKey, fetchGames]);

  const handleDelete = useCallback(
    async (id: string) => {
      if (!id) return;
      const index = games.findIndex((g) => resolveGameId(g) === id);
      const removed = index >= 0 ? games[index] : undefined;
      setDeletingId(id);
      setGames((prev) => prev.filter((g) => resolveGameId(g) !== id));
      try {
        await deleteGame(id);
      } catch (err) {
        console.error("Delete failed", err);
        alert(err instanceof Error ? err.message : "Failed to delete game.");
        // Put back only this game, so a concurrent delete of another game that
        // succeeded isn't undone by restoring an older snapshot.
        if (removed) {
          setGames((prev) => {
            if (prev.some((g) => resolveGameId(g) === id)) return prev;
            const next = [...prev];
            next.splice(Math.min(index, next.length), 0, removed);
            return next;
          });
        }
      } finally {
        setDeletingId(null);
      }
    },
    [games]
  );

  const handleUpdate = useCallback(
    async (id: string, payload: GameUpdatePayload) => {
      const item = await updateGame(id, payload);
      setGames((prev) => {
        const merged = prev.map((g) =>
          resolveGameId(g) === id ? { ...g, ...payload, ...item } : g
        );
        return keepWhen ? merged.filter(keepWhen) : merged;
      });
    },
    [keepWhen]
  );

  return {
    games,
    loading,
    error,
    deletingId,
    refetch: fetchGames,
    handleDelete,
    handleUpdate,
  };
}
