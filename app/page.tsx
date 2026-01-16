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
    <div className="min-h-screen text-white">
      <section className="relative flex h-screen items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-30"
          style={{
            backgroundImage:
              "linear-gradient(180deg, rgba(15,15,35,0.85) 0%, rgba(15,15,35,0.95) 100%), url('/Home%20page%20background.jpg')",
          }}
        />
        <div className="absolute inset-0 bg-gradient-radial from-indigo-900/20 via-transparent to-transparent" />
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 h-96 w-96 rounded-full bg-indigo-600/20 blur-[120px]" />
          <div className="absolute bottom-1/4 right-1/4 h-96 w-96 rounded-full bg-purple-600/20 blur-[120px]" />
        </div>

        <div className="relative z-10 mx-auto max-w-5xl px-4 text-center">
          <div className="inline-block rounded-full border border-indigo-400/30 bg-indigo-500/10 px-4 py-2 backdrop-blur-sm">
            <p className="text-xs uppercase tracking-[0.3em] text-indigo-300">
              Your Personal Game Library
            </p>
          </div>
          <h1 className="mt-6 bg-gradient-to-r from-white via-indigo-100 to-purple-200 bg-clip-text text-5xl font-bold text-transparent sm:text-7xl">
            Track, Celebrate, and Discover
          </h1>
          <p className="mt-4 text-xl text-slate-300 sm:text-2xl">
            Your ultimate gaming journey, beautifully organized
          </p>
        </div>

        <button
          onClick={scrollToMain}
          className="absolute bottom-12 inline-flex h-14 w-14 animate-bounce items-center justify-center rounded-full border border-indigo-400/30 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 text-2xl text-white shadow-xl shadow-indigo-900/30 backdrop-blur-sm transition hover:border-indigo-400/50 hover:from-indigo-500/30 hover:to-purple-500/30"
          aria-label="Enter library"
        >
          <span aria-hidden="true">↓</span>
        </button>
      </section>

      <div
        ref={mainRef}
        className="mx-auto flex max-w-7xl flex-col items-center gap-12 px-4 py-16"
      >
        <header className="w-full text-center">
          <div className="inline-block rounded-full border border-indigo-400/20 bg-indigo-500/5 px-4 py-2 backdrop-blur-sm">
            <p className="text-xs uppercase tracking-[0.3em] text-indigo-300">
              Your Collection
            </p>
          </div>
          <h2 className="mt-4 text-4xl font-bold text-white">
            Explore Your Gaming Universe
          </h2>
          <p className="mt-3 text-lg text-slate-400">
            Quick access to your favorites, achievements, and upcoming adventures
          </p>
        </header>

        <div className="grid w-full grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <Link
            href="/Favourites"
            className="group relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-rose-500/10 via-pink-500/5 to-transparent p-8 backdrop-blur-xl transition duration-300 hover:-translate-y-2 hover:border-rose-400/30 hover:shadow-2xl hover:shadow-rose-500/20"
          >
            <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-rose-500/20 blur-3xl transition duration-300 group-hover:bg-rose-500/30" />
            <div className="relative">
              <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-500/20 to-pink-500/20 text-3xl text-rose-300 shadow-lg shadow-rose-500/20">
                ★
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider text-rose-300/70">Favorites</p>
                <p className="mt-1 text-xl font-bold text-white">
                  Most Loved Games
                </p>
                <p className="mt-2 text-sm text-slate-400">
                  Your all-time favorite titles
                </p>
              </div>
            </div>
          </Link>

          <Link
            href="/FullyCompleted"
            className="group relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-transparent p-8 backdrop-blur-xl transition duration-300 hover:-translate-y-2 hover:border-emerald-400/30 hover:shadow-2xl hover:shadow-emerald-500/20"
          >
            <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-emerald-500/20 blur-3xl transition duration-300 group-hover:bg-emerald-500/30" />
            <div className="relative">
              <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 text-2xl font-bold text-emerald-300 shadow-lg shadow-emerald-500/20">
                100%
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider text-emerald-300/70">Completionist</p>
                <p className="mt-1 text-xl font-bold text-white">
                  Fully Mastered
                </p>
                <p className="mt-2 text-sm text-slate-400">
                  100% completed achievements
                </p>
              </div>
            </div>
          </Link>

          <Link
            href="/ToBeCompleted"
            className="group relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-violet-500/10 via-purple-500/5 to-transparent p-8 backdrop-blur-xl transition duration-300 hover:-translate-y-2 hover:border-violet-400/30 hover:shadow-2xl hover:shadow-violet-500/20"
          >
            <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-violet-500/20 blur-3xl transition duration-300 group-hover:bg-violet-500/30" />
            <div className="relative">
              <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500/20 to-purple-500/20 text-3xl text-violet-300 shadow-lg shadow-violet-500/20">
                ➜
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider text-violet-300/70">Backlog</p>
                <p className="mt-1 text-xl font-bold text-white">
                  To Be Completed
                </p>
                <p className="mt-2 text-sm text-slate-400">
                  Your upcoming adventures
                </p>
              </div>
            </div>
          </Link>

          <Link
            href="/discover"
            className="group relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-cyan-500/10 via-blue-500/5 to-transparent p-8 backdrop-blur-xl transition duration-300 hover:-translate-y-2 hover:border-cyan-400/30 hover:shadow-2xl hover:shadow-cyan-500/20"
          >
            <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-cyan-500/20 blur-3xl transition duration-300 group-hover:bg-cyan-500/30" />
            <div className="relative">
              <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 text-xl font-bold text-cyan-300 shadow-lg shadow-cyan-500/20">
                AI
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider text-cyan-300/70">Discover</p>
                <p className="mt-1 text-xl font-bold text-white">
                  AI-Curated Games
                </p>
                <p className="mt-2 text-sm text-slate-400">
                  Explore personalized recommendations
                </p>
              </div>
            </div>
          </Link>

          <div className="group relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-transparent p-8 backdrop-blur-xl transition duration-300 hover:border-amber-400/30 hover:shadow-2xl hover:shadow-amber-500/20 sm:col-span-2 lg:col-span-1">
            <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-amber-500/20 blur-3xl" />
            <div className="relative">
              <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 text-3xl shadow-lg shadow-amber-500/20">
                📅
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider text-amber-300/70">Browse by Year</p>
                <p className="mt-1 text-xl font-bold text-white">
                  Time Travel
                </p>
                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <Link
                    href={`/${year}`}
                    className="rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-amber-500/30 transition hover:shadow-xl hover:shadow-amber-500/40"
                  >
                    Open {year}
                  </Link>
                  <input
                    type="number"
                    id="year"
                    min="1975"
                    className="w-28 rounded-xl border border-white/20 bg-black/40 px-4 py-2.5 text-center text-white outline-none backdrop-blur-sm transition focus:border-amber-400 focus:ring-2 focus:ring-amber-400/40"
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
        </div>

        <div className="flex w-full flex-col items-stretch gap-6 sm:flex-row sm:items-center">
          <div className="flex-1 rounded-3xl border border-white/10 bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-transparent p-6 text-center backdrop-blur-xl">
            <p className="text-sm uppercase tracking-wider text-indigo-300/70">Total Collection</p>
            <p className="mt-2 bg-gradient-to-r from-white to-indigo-200 bg-clip-text text-4xl font-bold text-transparent">
              {user ? gameCount ?? "—" : "Sign in to load"}
            </p>
            <p className="mt-1 text-xs text-slate-400">Games tracked</p>
          </div>

          <Link
            href="/add-game"
            className="group inline-flex items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 px-8 py-5 text-lg font-bold text-white shadow-2xl shadow-purple-900/40 transition hover:scale-105 hover:shadow-3xl hover:shadow-purple-900/60"
          >
            <span className="text-2xl">+</span>
            <span>Add New Game</span>
            <span className="transition duration-200 group-hover:translate-x-1">
              →
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
}
