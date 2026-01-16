'use client';

import Link from "next/link";
import { useEffect, useState } from "react";
import Game from "@/components/game";
import { API_BASE_URL } from "@/lib/api";
import RequireAuth from "@/components/requireAuth";
import { fetchWithAuth } from "@/lib/fetchWithAuth";
import { useAuth } from "@/components/authProvider";

type GameType = {
  id?: string;
  _id?: string;
  gameId?: string;
  itemId?: string;
  name: string;
  year: number;
  completedYear: number;
  isCompleted: boolean;
  isHundredPercent: boolean;
  isFavourite: boolean;
  specialDescription: string;
  imageUrl: string;
};

const Favourites = () => {
  const [games, setGames] = useState<GameType[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const { user, loading: authLoading } = useAuth();

  const gameId = (game: GameType): string => {
    if (game.id) return game.id.toString();
    if (game._id) return game._id.toString();
    if (game.gameId) return game.gameId.toString();
    if (game.itemId) return game.itemId.toString();
    return "";
  };

  useEffect(() => {
    const fetchFavourites = async () => {
      try {
        const res = await fetchWithAuth(
          `${API_BASE_URL}/admin/getFavouriteGames`
        );
        const data: unknown = await res.json();
        setGames(Array.isArray(data) ? (data as GameType[]) : []);
      } catch (error) {
        console.error("Error fetching favourite games:", error);
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading && user) {
      fetchFavourites();
    }
  }, [authLoading, user]);

  const handleDelete = async (id: string) => {
    if (!id) return;
    const previous = games;
    setDeletingId(id);
    setGames((prev) => prev.filter((g) => gameId(g) !== id));
    try {
      const res = await fetchWithAuth(`${API_BASE_URL}/admin/games/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        throw new Error("Failed to delete");
      }
    } catch (err) {
      console.error("Delete failed", err);
      alert("Failed to delete game.");
      setGames(previous);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <RequireAuth>
      <div className="min-h-screen text-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-16">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div>
            <div className="inline-block rounded-full border border-rose-400/20 bg-rose-500/10 px-4 py-2 backdrop-blur-sm">
              <p className="text-xs uppercase tracking-[0.3em] text-rose-300">
                Favorites Collection
              </p>
            </div>
            <h1 className="mt-4 bg-gradient-to-r from-white via-rose-100 to-pink-200 bg-clip-text text-5xl font-bold text-transparent">Favourites</h1>
            <p className="mt-3 text-lg text-slate-400">
              Your most-loved adventures, front and center
            </p>
          </div>
          <Link
            href="/"
            className="rounded-2xl border border-white/20 bg-gradient-to-br from-slate-800/60 to-slate-900/60 px-6 py-3 font-semibold text-white backdrop-blur-xl transition hover:border-indigo-400/40 hover:from-indigo-900/40 hover:to-purple-900/40"
          >
            ← Back Home
          </Link>
        </div>

            <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-slate-800/30 via-slate-900/30 to-slate-950/30 p-8 shadow-2xl shadow-black/40 backdrop-blur-2xl">
              <div className="flex flex-wrap justify-center gap-8">
                {loading ? (
                  <div className="flex flex-col items-center justify-center py-20">
                    <div className="h-12 w-12 animate-spin rounded-full border-4 border-rose-500/30 border-t-rose-500"></div>
                    <p className="mt-4 text-slate-400">Loading favorites...</p>
                  </div>
        ) : games.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 text-center">
                    <div className="text-6xl">⭐</div>
                    <p className="mt-4 text-xl text-slate-400">No favourite games found</p>
                    <p className="mt-2 text-sm text-slate-500">Mark games as favorites to see them here</p>
                  </div>
        ) : (
          games.map((game) => (
            <Game
              key={gameId(game) || `${game.name}-${game.year}`}
              game={game}
              showActions
              onDelete={handleDelete}
              onUpdate={async (id, payload) => {
                const res = await fetchWithAuth(
                  `${API_BASE_URL}/admin/games/${id}`,
                  {
                    method: "PUT",
                    headers: {
                      "Content-Type": "application/json",
                    },
                    body: JSON.stringify(payload),
                  }
                );
                if (!res.ok) {
                  const errText = await res.text();
                  throw new Error(errText || "Failed to update game");
                }
                const updated =
                  (await res.json()) as Partial<GameType> | undefined;
                setGames((prev) =>
                  prev.map((g) =>
                    gameId(g) === id ? { ...g, ...payload, ...updated } : g
                  )
                );
              }}
              disableDelete={deletingId === gameId(game)}
            />
          ))
        )}
      </div>
    </div>
      </div>
      </div>
    </RequireAuth>
  );
};

export default Favourites;
