"use client";

import Link from "next/link";
import RequireAuth from "@/components/requireAuth";
import { useStats } from "@/lib/useStats";

const StatTile = ({
  label,
  value,
  href,
  accent,
}: {
  label: string;
  value: number | string;
  href?: string;
  accent: string;
}) => {
  const body = (
    <>
      <p className="text-sm text-white/60">{label}</p>
      <p className={`mt-1 text-3xl font-semibold ${accent}`}>{value}</p>
    </>
  );
  const className =
    "rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl transition";
  return href ? (
    <Link href={href} className={`${className} hover:-translate-y-1 hover:border-white/25 hover:bg-white/10`}>
      {body}
    </Link>
  ) : (
    <div className={className}>{body}</div>
  );
};

const StatsPage = () => {
  const { stats, error, loading } = useStats();
  const maxPerYear = Math.max(1, ...(stats?.byYear.map((y) => y.count) ?? [1]));
  const show = (n: number | undefined) => (n === undefined ? "—" : n);

  return (
    <RequireAuth>
      <div className="min-h-screen bg-gradient-to-br from-[#0a0f1f] via-[#0d152d] to-[#0a0f1f] text-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-12">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-sky-400/70">Library</p>
              <h1 className="text-4xl font-semibold text-white/90">Stats</h1>
              <p className="mt-2 text-white/60">Your library at a glance.</p>
            </div>
            <Link
              href="/"
              className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:border-sky-400/50 hover:bg-white/10"
            >
              ← Back home
            </Link>
          </div>

          {error && (
            <div
              role="alert"
              className="rounded-xl border border-red-400/40 bg-red-500/10 px-4 py-3 text-sm text-red-100"
            >
              {stats ? `Couldn't refresh, showing saved stats. ${error}` : error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
            <StatTile label="Total games" value={show(stats?.total)} accent="text-white" />
            <StatTile label="Completed" value={show(stats?.completed)} accent="text-sky-200" />
            <StatTile label="100% completed" value={show(stats?.hundredPercent)} href="/FullyCompleted" accent="text-emerald-200" />
            <StatTile label="Favourites" value={show(stats?.favourites)} href="/Favourites" accent="text-fuchsia-200" />
            <StatTile label="Backlog" value={show(stats?.backlog)} href="/ToBeCompleted" accent="text-amber-200" />
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl shadow-black/30 backdrop-blur-2xl">
            <h2 className="text-lg font-semibold text-white">Completed per year</h2>
            {loading ? (
              <p className="mt-4 text-white/60">Loading stats...</p>
            ) : !stats?.byYear.length ? (
              <p className="mt-4 text-white/60">No completed games yet.</p>
            ) : (
              <ul className="mt-4 space-y-2">
                {stats.byYear.map(({ year, count }) => (
                  <li key={year}>
                    <Link
                      href={`/${year}`}
                      className="group grid grid-cols-[3.5rem_1fr_2.5rem] items-center gap-3 rounded-lg px-2 py-1 transition hover:bg-white/5"
                    >
                      <span className="text-sm font-semibold text-white/80">{year}</span>
                      <span className="h-3 overflow-hidden rounded-full bg-white/5">
                        <span
                          className="block h-full rounded-full bg-gradient-to-r from-sky-500 to-indigo-500 transition group-hover:from-sky-400 group-hover:to-indigo-400"
                          style={{ width: `${(count / maxPerYear) * 100}%` }}
                        />
                      </span>
                      <span className="text-right text-sm tabular-nums text-white/70">{count}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </RequireAuth>
  );
};

export default StatsPage;
