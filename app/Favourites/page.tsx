'use client';

import Link from "next/link";
import { useEffect, useState } from "react";
import Game from "@/components/game";
import { API_BASE_URL } from "@/lib/api";

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

const Favourites = () => {
  const [games, setGames] = useState<GameType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFavourites = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/admin/getFavouriteGames`);
        const data = await res.json();
        setGames(data);
      } catch (error) {
        console.error("Error fetching favourite games:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFavourites();
  }, []);

  return (
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
          <div className="flex flex-wrap gap-6 justify-center">
            {loading ? (
              <p className="text-white/70 text-lg">Loading...</p>
            ) : games.length === 0 ? (
              <p className="text-white/70 text-lg">No favourite games found.</p>
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
  );
};

export default Favourites;
