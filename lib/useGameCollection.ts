"use client";

import { useCallback, useEffect, useState } from "react";
import { API_BASE_URL } from "@/lib/api";
import { ApiError, fetchWithAuth } from "@/lib/fetchWithAuth";
import { invalidateListCache, readListCache, writeListCache } from "@/lib/listCache";
import { resolveGameId, type GameType, type GameUpdatePayload } from "@/lib/types";
import { useAuth } from "@/components/authProvider";

type Options = {
  endpoint: string;
  cacheKey: string;
  /**
   * When true, games that transition to `isCompleted` are removed from the
   * visible list (used by the backlog page).
   */
  dropOnCompleted?: boolean;
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
  dropOnCompleted = false,
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
      const previous = games;
      setDeletingId(id);
      setGames((prev) => prev.filter((g) => resolveGameId(g) !== id));
      try {
        const res = await fetchWithAuth(`${API_BASE_URL}/admin/games/${id}`, {
          method: "DELETE",
        });
        if (!res.ok) throw new Error("Failed to delete");
        invalidateListCache("games:");
      } catch (err) {
        console.error("Delete failed", err);
        alert(
          err instanceof ApiError
            ? err.message
            : "Failed to delete game."
        );
        setGames(previous);
      } finally {
        setDeletingId(null);
      }
    },
    [games]
  );

  const handleUpdate = useCallback(
    async (id: string, payload: GameUpdatePayload) => {
      const res = await fetchWithAuth(`${API_BASE_URL}/admin/games/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const errText = await res.text();
        throw new Error(errText || "Failed to update game");
      }
      const updated = (await res.json()) as Partial<GameType> | undefined;
      setGames((prev) => {
        const merged = prev.map((g) =>
          resolveGameId(g) === id ? { ...g, ...payload, ...updated } : g
        );
        const next = dropOnCompleted
          ? merged.filter((g) => !(g.isCompleted ?? g.completed))
          : merged;
        writeListCache(cacheKey, next);
        return next;
      });
      invalidateListCache("games:");
    },
    [cacheKey, dropOnCompleted]
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
