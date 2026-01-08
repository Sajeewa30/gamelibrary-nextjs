'use client';

import { useMemo, useState, type FormEvent } from "react";
import Link from "next/link";
import { API_BASE_URL } from "@/lib/api";
import { fetchWithAuth } from "@/lib/fetchWithAuth";
import { useAuth } from "@/components/authProvider";

type AiGame = {
  name: string;
  releaseYear: number | null;
  summary: string | null;
  platforms: string[];
  genres: string[];
  coverUrl: string | null;
};

type AddFormState = {
  completedYear: number;
  isCompleted: boolean;
  isHundredPercent: boolean;
  isFavourite: boolean;
  specialDescription: string;
};

const currentYear = new Date().getFullYear();

const defaultFormState: AddFormState = {
  completedYear: currentYear,
  isCompleted: false,
  isHundredPercent: false,
  isFavourite: false,
  specialDescription: "",
};

const DiscoverPage = () => {
  const { user } = useAuth();
  const [year, setYear] = useState(currentYear);
  const [games, setGames] = useState<AiGame[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [genreFilter, setGenreFilter] = useState("all");
  const [platformFilter, setPlatformFilter] = useState("all");

  const [selectedGame, setSelectedGame] = useState<AiGame | null>(null);
  const [formState, setFormState] = useState<AddFormState>(defaultFormState);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<"success" | "error" | null>(null);
  const [statusMessage, setStatusMessage] = useState("");

  const loadGames = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(
        `${API_BASE_URL}/public/ai/games?year=${year}&count=50`
      );
      if (!res.ok) {
        throw new Error("Failed to load games.");
      }
      const data = await res.json();
      setGames(Array.isArray(data.items) ? data.items : []);
    } catch (err) {
      console.error(err);
      setError("Unable to fetch games right now. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const genres = useMemo(() => {
    const set = new Set<string>();
    games.forEach((game) => {
      game.genres?.forEach((genre) => set.add(genre));
    });
    return Array.from(set).sort();
  }, [games]);

  const platforms = useMemo(() => {
    const set = new Set<string>();
    games.forEach((game) => {
      game.platforms?.forEach((platform) => set.add(platform));
    });
    return Array.from(set).sort();
  }, [games]);

  const filteredGames = useMemo(() => {
    const query = search.trim().toLowerCase();
    return games.filter((game) => {
      if (genreFilter !== "all" && !game.genres?.includes(genreFilter)) {
        return false;
      }
      if (platformFilter !== "all" && !game.platforms?.includes(platformFilter)) {
        return false;
      }
      if (!query) return true;
      const haystack = `${game.name} ${game.summary ?? ""}`.toLowerCase();
      return haystack.includes(query);
    });
  }, [games, search, genreFilter, platformFilter]);

  const openAddModal = (game: AiGame) => {
    setSelectedGame(game);
    setFormState({
      ...defaultFormState,
      completedYear: currentYear,
      specialDescription: game.summary || "",
    });
    setStatus(null);
    setStatusMessage("");
  };

  const closeAddModal = () => {
    setSelectedGame(null);
    setSaving(false);
    setStatus(null);
    setStatusMessage("");
  };

  const handleAddSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedGame || !user) return;

    const releaseYear = selectedGame.releaseYear ?? year;

    const payload = {
      name: selectedGame.name,
      year: releaseYear,
      completedYear: Number(formState.completedYear),
      isCompleted: formState.isCompleted,
      isHundredPercent: formState.isHundredPercent,
      isFavourite: formState.isFavourite,
      specialDescription: formState.specialDescription,
      imageUrl: selectedGame.coverUrl ?? "",
    };

    setSaving(true);
    setStatus(null);
    setStatusMessage("");
    try {
      const res = await fetchWithAuth(`${API_BASE_URL}/admin/addGameItem`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const raw = await res.text();
      let parsed: any = null;
      try {
        parsed = raw ? JSON.parse(raw) : null;
      } catch {
        parsed = null;
      }

      if (res.ok) {
        setStatus("success");
        setStatusMessage(parsed?.message || "Game saved successfully.");
      } else {
        setStatus("error");
        setStatusMessage(parsed?.message || "Game was not saved.");
      }
    } catch (err) {
      console.error(err);
      setStatus("error");
      setStatusMessage("Unable to add the game right now.");
    }
    setSaving(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0f1f] via-[#0d152d] to-[#0a0f1f] text-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-12">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-sky-400/70">
              Discover by Year
            </p>
            <h1 className="text-4xl font-semibold text-white/90">
              AI-curated game list explorer
            </h1>
            <p className="mt-2 text-white/60">
              Pick a year, explore notable releases, then add your favorites.
            </p>
          </div>
          <Link
            href="/"
            className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:border-sky-400/50 hover:bg-white/10"
          >
            Back home
          </Link>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl shadow-black/30 backdrop-blur-2xl">
          <form
            className="flex flex-wrap items-end gap-4"
            onSubmit={(event) => {
              event.preventDefault();
              loadGames();
            }}
          >
            <label className="flex flex-col gap-2 text-sm text-white/70">
              Select year
              <input
                className="w-32 rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-white outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-400/40"
                type="number"
                min={1975}
                max={currentYear}
                value={year}
                onChange={(event) => setYear(Number(event.target.value))}
              />
            </label>

            <button
              type="submit"
              className="rounded-xl bg-gradient-to-r from-sky-500 to-indigo-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-sky-900/40 transition hover:translate-y-[-1px] hover:shadow-xl hover:shadow-indigo-900/40"
              disabled={loading}
            >
              {loading ? "Loading..." : "Load games"}
            </button>

            {games.length > 0 && (
              <div className="flex flex-1 flex-wrap items-end gap-4">
                <label className="flex flex-1 flex-col gap-2 text-sm text-white/70">
                  Search loaded games
                  <input
                    className="rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-white outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-400/40"
                    type="text"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search by name or summary"
                  />
                </label>

                <label className="flex flex-col gap-2 text-sm text-white/70">
                  Genre
                  <select
                    className="min-w-[160px] rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-white outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-400/40"
                    value={genreFilter}
                    onChange={(event) => setGenreFilter(event.target.value)}
                  >
                    <option value="all">All genres</option>
                    {genres.map((genre) => (
                      <option key={genre} value={genre}>
                        {genre}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="flex flex-col gap-2 text-sm text-white/70">
                  Platform
                  <select
                    className="min-w-[160px] rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-white outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-400/40"
                    value={platformFilter}
                    onChange={(event) => setPlatformFilter(event.target.value)}
                  >
                    <option value="all">All platforms</option>
                    {platforms.map((platform) => (
                      <option key={platform} value={platform}>
                        {platform}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            )}
          </form>

          {error && <p className="mt-6 text-sm text-rose-300">{error}</p>}
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl shadow-black/30 backdrop-blur-2xl">
          {loading ? (
            <p className="text-center text-lg text-white/70">Loading games...</p>
          ) : games.length === 0 ? (
            <p className="text-center text-lg text-white/70">
              Choose a year to load AI-curated games.
            </p>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filteredGames.map((game) => {
                const releaseYear = game.releaseYear ?? year;
                return (
                  <div
                    key={`${game.name}-${releaseYear}`}
                    className="group flex h-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/5 shadow-lg shadow-black/30 transition hover:-translate-y-1 hover:border-sky-400/40"
                  >
                    <div className="relative h-48 w-full overflow-hidden bg-black/40">
                      <img
                        src={game.coverUrl || "/placeholder.jpg"}
                        alt={game.name}
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                        loading="lazy"
                      />
                      <div className="absolute left-3 top-3 rounded-full bg-black/60 px-3 py-1 text-xs font-semibold text-white">
                        {releaseYear}
                      </div>
                    </div>
                    <div className="flex flex-1 flex-col gap-3 p-5">
                      <div>
                        <h3 className="text-lg font-semibold text-white">
                          {game.name}
                        </h3>
                        <p className="mt-1 text-xs text-white/60">
                          {game.platforms?.slice(0, 3).join(", ") || "Platforms unknown"}
                        </p>
                      </div>
                      <p className="line-clamp-3 text-sm text-white/70">
                        {game.summary || "No summary available."}
                      </p>
                      <div className="mt-auto flex flex-wrap gap-2">
                        {game.genres?.slice(0, 3).map((genre) => (
                          <span
                            key={genre}
                            className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs text-white/70"
                          >
                            {genre}
                          </span>
                        ))}
                      </div>
                      {user ? (
                        <button
                          className="mt-4 inline-flex items-center justify-center rounded-xl bg-sky-500/20 px-4 py-2 text-sm font-semibold text-sky-100 transition hover:bg-sky-500/30"
                          onClick={() => openAddModal(game)}
                        >
                          Add to my games
                        </button>
                      ) : (
                        <p className="mt-4 text-xs text-white/50">
                          Sign in to add this game to your library.
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {selectedGame && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-10">
          <div className="w-full max-w-xl rounded-3xl border border-white/10 bg-[#0b1224] p-6 shadow-2xl shadow-black/40">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.4em] text-sky-400/70">
                  Add to library
                </p>
                <h2 className="mt-2 text-2xl font-semibold text-white">
                  {selectedGame.name}
                </h2>
              </div>
              <button
                className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/70 transition hover:border-rose-400/50 hover:text-rose-200"
                onClick={closeAddModal}
                type="button"
              >
                Close
              </button>
            </div>

            <form className="mt-6 space-y-4" onSubmit={handleAddSubmit}>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="flex flex-col gap-2 text-sm text-white/70">
                  Release year (from AI)
                  <input
                    className="rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-white/70"
                    type="number"
                    value={selectedGame.releaseYear ?? year}
                    readOnly
                  />
                </label>

                <label className="flex flex-col gap-2 text-sm text-white/70">
                  Completed year
                  <input
                    className="rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-white outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-400/40"
                    type="number"
                    min={1975}
                    max={currentYear}
                    value={formState.completedYear}
                    onChange={(event) =>
                      setFormState((prev) => ({
                        ...prev,
                        completedYear: Number(event.target.value),
                      }))
                    }
                  />
                </label>
              </div>

              <label className="flex flex-col gap-2 text-sm text-white/70">
                Special description
                <input
                  className="rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-white outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-400/40"
                  type="text"
                  value={formState.specialDescription}
                  onChange={(event) =>
                    setFormState((prev) => ({
                      ...prev,
                      specialDescription: event.target.value,
                    }))
                  }
                  maxLength={40}
                />
              </label>

              <div className="flex flex-wrap gap-6">
                <label className="flex items-center gap-2 text-sm text-white/80">
                  <input
                    className="h-5 w-5 rounded border-white/20 bg-black/50 text-sky-400 focus:ring-sky-400/60"
                    type="checkbox"
                    checked={formState.isCompleted}
                    onChange={(event) =>
                      setFormState((prev) => ({
                        ...prev,
                        isCompleted: event.target.checked,
                      }))
                    }
                  />
                  Completed
                </label>

                <label className="flex items-center gap-2 text-sm text-white/80">
                  <input
                    className="h-5 w-5 rounded border-white/20 bg-black/50 text-emerald-400 focus:ring-emerald-400/60"
                    type="checkbox"
                    checked={formState.isHundredPercent}
                    onChange={(event) =>
                      setFormState((prev) => ({
                        ...prev,
                        isHundredPercent: event.target.checked,
                      }))
                    }
                  />
                  100% Completed
                </label>

                <label className="flex items-center gap-2 text-sm text-white/80">
                  <input
                    className="h-5 w-5 rounded border-white/20 bg-black/50 text-fuchsia-400 focus:ring-fuchsia-400/60"
                    type="checkbox"
                    checked={formState.isFavourite}
                    onChange={(event) =>
                      setFormState((prev) => ({
                        ...prev,
                        isFavourite: event.target.checked,
                      }))
                    }
                  />
                  Favourite
                </label>
              </div>

              {status && (
                <div
                  className={`rounded-xl border px-4 py-3 text-sm ${
                    status === "success"
                      ? "border-emerald-400/50 bg-emerald-500/10 text-emerald-100"
                      : "border-red-400/50 bg-red-500/10 text-red-100"
                  }`}
                >
                  {statusMessage}
                </div>
              )}

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:border-sky-400/50 hover:bg-white/10"
                  onClick={closeAddModal}
                  disabled={saving}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-gradient-to-r from-sky-500 to-indigo-500 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-sky-900/40 transition hover:translate-y-[-1px] hover:shadow-xl hover:shadow-indigo-900/40"
                  disabled={saving}
                >
                  {saving ? "Adding..." : "Add game"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DiscoverPage;
