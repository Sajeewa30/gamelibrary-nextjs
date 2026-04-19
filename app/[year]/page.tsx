"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import RequireAuth from "@/components/requireAuth";
import GameGrid from "@/components/gameGrid";
import { useGameCollection } from "@/lib/useGameCollection";

const YearPage = () => {
  const params = useParams();
  const year = params?.year as string;

  const { games, loading, error, deletingId, handleDelete, handleUpdate } =
    useGameCollection({
      endpoint: `/admin/games/byYear/${year}`,
      cacheKey: `games:year:${year}`,
    });

  return (
    <RequireAuth>
      <div className="min-h-screen bg-gradient-to-br from-[#0a0f1f] via-[#0d152d] to-[#0a0f1f] text-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-12">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-amber-400/70">Year view</p>
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
              <GameGrid
                games={games}
                loading={loading}
                error={error}
                deletingId={deletingId}
                emptyMessage={`No games found for ${year}.`}
                onDelete={handleDelete}
                onUpdate={handleUpdate}
              />
            </div>
          </div>
        </div>
      </div>
    </RequireAuth>
  );
};

export default YearPage;
