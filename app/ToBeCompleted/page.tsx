"use client";

import Link from "next/link";
import RequireAuth from "@/components/requireAuth";
import GameGrid from "@/components/gameGrid";
import { useGameCollection } from "@/lib/useGameCollection";

const ToBeCompleted = () => {
  const { games, loading, error, deletingId, handleDelete, handleUpdate } =
    useGameCollection({
      endpoint: "/admin/games/toBeCompleted",
      cacheKey: "games:backlog",
      dropOnCompleted: true,
    });

  return (
    <RequireAuth>
      <div className="min-h-screen bg-gradient-to-br from-[#0a0f1f] via-[#0d152d] to-[#0a0f1f] text-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-12">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-fuchsia-400/70">Backlog</p>
              <h1 className="text-4xl font-semibold text-white/90">To Be Completed</h1>
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
              <GameGrid
                games={games}
                loading={loading}
                error={error}
                deletingId={deletingId}
                emptyMessage="All caught up! No backlog games."
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

export default ToBeCompleted;
