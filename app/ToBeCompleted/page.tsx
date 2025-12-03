"use client";
export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

import Link from "next/link";
import { useEffect, useState } from "react";
import RequireAuth from "@/components/requireAuth";
import { API_BASE_URL } from "@/lib/api";
import { fetchWithAuth } from "@/lib/fetchWithAuth";
import Game from "@/components/game";
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

const ToBeCompleted = () => {
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
    const fetchBacklog = async () => {
      setLoading(true);
      try {
        const res = await fetchWithAuth(
          `${API_BASE_URL}/admin/games/toBeCompleted`,
          { cache: "no-store" }
        );
        const data: unknown = await res.json();
        setGames(
          Array.isArray(data)
            ? (data as GameType[]).filter((g) => !g.isCompleted)
            : []
        );
      } catch (err) {
        console.error("Failed to fetch backlog games", err);
      } finally {
        setLoading(false);
      }
    };

    if (user && !authLoading) {
      fetchBacklog();
    }
  }, [user, authLoading]);

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
      <div className="min-h-screen bg-gradient-to-br from-[#0a0f1f] via-[#0d152d] to-[#0a0f1f] text-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-12">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-fuchsia-400/70">
                Backlog
              </p>
              <h1 className="text-4xl font-semibold text-white/90">
                To Be Completed
              </h1>
              <p className="mt-2 text-white/60">
                Games you still need to finish. Update status when you complete them.
              </p>
            </div>
            <Link
              href="/"
              className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:border-fuchsia-400/50 hover:bg-white/10"
            >
              ← Back home
            </Link>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl shadow-black/30 backdrop-blur-2xl">
            <div className="flex flex-wrap justify-center gap-6">
              {loading ? (
                <p className="text-white/70 text-lg">Loading games...</p>
              ) : games.length === 0 ? (
                <p className="text-white/70 text-lg">
                  All caught up! No backlog games.
                </p>
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
                        prev
                          .map((g) =>
                            gameId(g) === id ? { ...g, ...payload, ...updated } : g
                          )
                          .filter((g) => !g.isCompleted)
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

export default ToBeCompleted;
