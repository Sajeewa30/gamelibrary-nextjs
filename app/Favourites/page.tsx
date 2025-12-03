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

  useEffect(() => {
    const fetchFavourites = async () => {
      try {
        const res = await fetchWithAuth(
          `${API_BASE_URL}/admin/getFavouriteGames`
        );
        const data = await res.json();
        setGames(Array.isArray(data) ? data : []);
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
    setDeletingId(id);
    try {
      const res = await fetchWithAuth(`${API_BASE_URL}/admin/games/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        throw new Error("Failed to delete");
      }
      setGames((prev) =>
        prev.filter((g) => (g.id ?? g._id ?? "") !== id)
      );
    } catch (err) {
      console.error("Delete failed", err);
      alert("Failed to delete game.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <RequireAuth>
      <div className="min-h-screen bg-gradient-to-br from-[#0a0f1f] via-[#0d152d] to-[#0a0f1f] text-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-12">
          <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-sky-400/70">
              Library
            </p>
            <h1 className="text-4xl font-semibold text-white/90">Favourites</h1>
            <p className="mt-2 text-white/60">
              Your most-loved adventures, front and center.
            </p>
          </div>
          <Link
            href="/"
            className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:border-sky-400/50 hover:bg-white/10"
          >
            ← Back home
          </Link>
        </div>

            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl shadow-black/30 backdrop-blur-2xl">
              <div className="flex flex-wrap justify-center gap-6">
                {loading ? (
                  <p className="text-white/70 text-lg">Loading...</p>
                ) : games.length === 0 ? (
              <p className="text-white/70 text-lg">No favourite games found.</p>
            ) : (
              games.map((game) => (
                    <Game
                      key={`${game.name}-${game.year}`}
                      id={(game.id ?? game._id ?? "").toString()}
                      name={game.name}
                      year={game.year.toString()}
                      imageUrl={game.imageUrl}
                      specialDescription={game.specialDescription}
                      showDelete
                      onDelete={handleDelete}
                      disableDelete={deletingId === (game.id ?? game._id ?? "")}
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
