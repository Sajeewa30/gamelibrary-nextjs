'use client';

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Game from "@/components/game";
import { API_BASE_URL } from "@/lib/api";
import RequireAuth from "@/components/requireAuth";
import { fetchWithAuth } from "@/lib/fetchWithAuth";
import { useAuth } from "@/components/authProvider";

type GameType = {
  name: string;
  year: number;
  completedYear: number;
  isCompleted: boolean;
  isHundredPercent: boolean;
  isFavourite: boolean;
  specialDescription: string;
  imageUrl: string;
};

const YearPage = () => {
  const params = useParams();
  const year = params?.year as string;

  const [games, setGames] = useState<GameType[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    if (!year || authLoading || !user) return;

    const fetchGamesByYear = async () => {
      try {
        const res = await fetchWithAuth(
          `${API_BASE_URL}/admin/games/byYear/${year}`
        );
        const data = await res.json();
        setGames(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to fetch games", err);
      } finally {
        setLoading(false);
      }
    };

    fetchGamesByYear();
  }, [year, user, authLoading]);

  return (
    <RequireAuth>
      <div className="min-h-screen bg-gradient-to-br from-[#0a0f1f] via-[#0d152d] to-[#0a0f1f] text-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-12">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-amber-400/70">
                Year view
              </p>
              <h1 className="text-4xl font-semibold text-white/90">{year}</h1>
              <p className="mt-2 text-white/60">
                All games completed or played in {year}.
              </p>
            </div>
            <Link
              href="/"
              className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:border-amber-400/50 hover:bg-white/10"
            >
              ← Back home
            </Link>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl shadow-black/30 backdrop-blur-2xl">
            <div className="flex flex-wrap gap-6 justify-center">
              {loading ? (
                <p className="text-white/70 text-lg">Loading games...</p>
              ) : games.length === 0 ? (
                <p className="text-white/70 text-lg">
                  No games found for {year}.
                </p>
              ) : (
                games.map((game) => (
                  <Game
                    key={`${game.name}-${game.year}`}
                    name={game.name}
                    year={game.year.toString()}
                    imageUrl={game.imageUrl}
                    specialDescription={game.specialDescription}
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

export default YearPage;
