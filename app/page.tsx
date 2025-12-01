'use client'

import Link from "next/link";
import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { API_BASE_URL } from "@/lib/api";
import { fetchWithAuth } from "@/lib/fetchWithAuth";
import { useAuth } from "@/components/authProvider";

export default function Home() {
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState(currentYear);
  const [gameCount, setGameCount] = useState<number | null>(null);
  const mainRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();

  useEffect(() => {
    const fullGameCount = async () => {
      const res = await fetchWithAuth(`${API_BASE_URL}/admin/fullGameCount`);
      const data = await res.json();
      setGameCount(data.fullGameCount);
    };

    if (user) {
      fullGameCount();
    } else {
      setGameCount(null);
    }
  }, [user]);

  const scrollToMain = () => {
    mainRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0f1f] via-[#0d152d] to-[#0a0f1f] text-white">
      <section className="relative flex h-screen items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "linear-gradient(180deg, rgba(4,9,30,0.65) 0%, rgba(4,9,30,0.85) 100%), url('/Home%20page%20background.jpg')",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/20 to-black/50" />

        <div className="relative z-10 mx-auto max-w-4xl px-4 text-center">
          <p className="text-sm uppercase tracking-[0.4em] text-sky-300/80">
            Game Library
          </p>
          <h1 className="mt-4 text-4xl font-semibold text-white sm:text-5xl">
            Track, Celebrate, and Discover Your Games
          </h1>
        </div>

        <button
          onClick={scrollToMain}
          className="absolute bottom-10 inline-flex h-12 w-12 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white shadow-lg shadow-black/30 backdrop-blur transition hover:-translate-y-1 hover:border-sky-400/60 hover:bg-white/20"
          aria-label="Enter library"
        >
          <span aria-hidden="true">↓</span>
        </button>
      </section>

      <div
        ref={mainRef}
        className="mx-auto flex max-w-6xl flex-col items-center gap-8 px-4 py-12"
      >
        <header className="w-full text-center">
          <p className="text-sm uppercase tracking-[0.4em] text-sky-400/70">
            Game Library
          </p>
          <h1 className="mt-2 text-4xl font-semibold text-white/90">
            Track, Celebrate, and Discover Your Games
          </h1>
          <p className="mt-3 text-white/60">
            Quick links into your collection, completion streaks, and backlog.
          </p>
        </header>

        <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2">
          <Link
            href="/Favourites"
            className="group relative overflow-hidden rounded-2xl border border-white/5 bg-white/5 p-6 backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:border-sky-400/40 hover:bg-white/10"
          >
            <div className="absolute -left-10 -top-10 h-28 w-28 rounded-full bg-sky-500/10 blur-3xl" />
            <div className="absolute -right-16 -bottom-16 h-32 w-32 rounded-full bg-indigo-500/10 blur-3xl" />
            <div className="relative flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-sky-500/20 text-sky-200">
                ★
              </div>
              <div>
                <p className="text-sm text-white/60">Favorites</p>
                <p className="text-lg font-semibold text-white">
                  See the games you love most
                </p>
              </div>
            </div>
          </Link>

          <Link
            href="/FullyCompleted"
            className="group relative overflow-hidden rounded-2xl border border-white/5 bg-white/5 p-6 backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:border-emerald-400/40 hover:bg-white/10"
          >
            <div className="absolute -left-10 -top-10 h-28 w-28 rounded-full bg-emerald-500/10 blur-3xl" />
            <div className="absolute -right-16 -bottom-16 h-32 w-32 rounded-full bg-teal-500/10 blur-3xl" />
            <div className="relative flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-200">
                100%
              </div>
              <div>
                <p className="text-sm text-white/60">Completionists</p>
                <p className="text-lg font-semibold text-white">
                  View games you fully mastered
                </p>
              </div>
            </div>
          </Link>

          <div className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-white/5 bg-white/5 p-6 backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:border-amber-400/40 hover:bg-white/10">
            <div className="absolute -left-10 -top-10 h-28 w-28 rounded-full bg-amber-500/10 blur-3xl" />
            <div className="absolute -right-16 -bottom-16 h-32 w-32 rounded-full bg-orange-500/10 blur-3xl" />
            <div className="relative flex items-start gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/20 text-amber-200">
                📅
              </div>
              <div className="flex-1">
                <p className="text-sm text-white/60">By Year</p>
                <p className="text-lg font-semibold text-white">
                  Explore games completed in
                </p>
                <div className="mt-3 flex items-center gap-3">
                  <Link
                    href={`/${year}`}
                    className="rounded-lg bg-amber-500/20 px-3 py-2 text-sm font-semibold text-amber-100 transition hover:bg-amber-500/30"
                  >
                    Open {year}
                  </Link>
                  <input
                    type="number"
                    id="year"
                    min="1975"
                    className="w-24 rounded-lg border border-white/10 bg-black/50 px-3 py-2 text-center text-white outline-none transition focus:border-amber-400 focus:ring-2 focus:ring-amber-400/40"
                    autoComplete="off"
                    value={year}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      setYear(Number(e.target.value))
                    }
                  />
                </div>
              </div>
            </div>
          </div>

          <Link
            href="/ToBeCompleted"
            className="group relative overflow-hidden rounded-2xl border border-white/5 bg-white/5 p-6 backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:border-fuchsia-400/40 hover:bg-white/10"
          >
            <div className="absolute -left-10 -top-10 h-28 w-28 rounded-full bg-fuchsia-500/10 blur-3xl" />
            <div className="absolute -right-16 -bottom-16 h-32 w-32 rounded-full bg-purple-500/10 blur-3xl" />
            <div className="relative flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-fuchsia-500/20 text-fuchsia-200">
                ➜
              </div>
              <div>
                <p className="text-sm text-white/60">Backlog</p>
                <p className="text-lg font-semibold text-white">
                  Games still waiting to be conquered
                </p>
              </div>
            </div>
          </Link>
        </div>

        <div className="flex w-full flex-col items-center gap-4 sm:flex-row sm:justify-between">
          <div className="w-full rounded-2xl border border-white/5 bg-white/5 px-6 py-4 text-center backdrop-blur-xl">
            <p className="text-sm text-white/60">Total games tracked</p>
            <p className="text-2xl font-semibold text-white">
              {user ? gameCount ?? "—" : "Sign in to load"}
            </p>
          </div>

          <Link
            href="/add-game"
            className="group inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-500 px-6 py-4 text-lg font-semibold text-white shadow-lg shadow-sky-900/40 transition hover:shadow-xl hover:shadow-indigo-900/40 sm:w-auto"
          >
            + Add a new game
            <span className="transition duration-200 group-hover:translate-x-1">
              →
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
}
