'use client'

import Link from "next/link";
import AddGameForm from "@/components/addGameForm";

const AddGamePage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0f1f] via-[#0d152d] to-[#0a0f1f] text-white">
      <div className="mx-auto flex max-w-5xl flex-col gap-10 px-4 py-12">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-sky-400/70">
              Add New Game
            </p>
            <h1 className="text-3xl font-semibold text-white/90">
              Log a fresh adventure
            </h1>
          </div>
          <Link
            href="/"
            className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:border-sky-400/50 hover:bg-white/10"
          >
            ← Back home
          </Link>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl shadow-black/30 backdrop-blur-2xl">
          <AddGameForm />
        </div>
      </div>
    </div>
  );
};

export default AddGamePage;
