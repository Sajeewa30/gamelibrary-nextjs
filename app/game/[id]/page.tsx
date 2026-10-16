'use client';

import { useEffect, useMemo, useState, type ChangeEvent, type FormEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { createPortal } from "react-dom";
import RequireAuth from "@/components/requireAuth";
import { fetchWithAuth, readErrorMessage } from "@/lib/fetchWithAuth";
import { API_BASE_URL } from "@/lib/api";
import { useAuth } from "@/components/authProvider";
import { readGameDetailCache, writeGameDetailCache } from "@/lib/gameDetailCache";
import type { GameDetail } from "@/lib/types";
import { isValidHttpUrl } from "@/lib/url";

const GameDetailPage = () => {
  const params = useParams();
  const router = useRouter();
  const gameIdParam = params?.id as string;
  const { user, loading: authLoading } = useAuth();

  const [game, setGame] = useState<GameDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [savingNote, setSavingNote] = useState(false);
  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
  const [videoFiles, setVideoFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [lightboxType, setLightboxType] = useState<"image" | "video">("image");
  const [deletingMedia, setDeletingMedia] = useState(false);
  const [mounted, setMounted] = useState(false);

  const resolvedId = useMemo(() => {
    if (!game) return gameIdParam;
    if (game.id) return game.id.toString();
    if (game._id) return game._id.toString();
    if (game.gameId) return game.gameId.toString();
    if (game.itemId) return game.itemId.toString();
    return gameIdParam;
  }, [game, gameIdParam]);

  useEffect(() => {
    // Ignore a response that arrives after navigating to another game.
    let cancelled = false;
    const fetchGame = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetchWithAuth(`${API_BASE_URL}/admin/games/${gameIdParam}`);
        if (!res.ok) {
          throw new Error(await readErrorMessage(res, "Failed to load game."));
        }
        const data = (await res.json()) as GameDetail;
        writeGameDetailCache(gameIdParam, data);
        if (cancelled) return;
        setGame(data);
        setNote(data.note ?? "");
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Failed to load game.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    if (gameIdParam && user && !authLoading) {
      const cached = readGameDetailCache(gameIdParam);
      if (cached) {
        setGame(cached);
        setNote(cached.note ?? "");
        setLoading(false);
        return;
      }
      fetchGame();
    }
    return () => {
      cancelled = true;
    };
  }, [gameIdParam, user, authLoading]);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Moves the lightbox to the previous (-1) or next (+1) item, wrapping around.
  const stepLightbox = (delta: number) => {
    const list = lightboxType === "image" ? game?.gallery ?? [] : game?.videos ?? [];
    if (!list.length) return;
    setLightboxIndex((prev) =>
      prev === null ? 0 : (prev + delta + list.length) % list.length
    );
  };

  // Keyboard support for the lightbox: Escape closes, arrows navigate.
  useEffect(() => {
    if (lightboxIndex === null) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightboxIndex(null);
      else if (e.key === "ArrowLeft") stepLightbox(-1);
      else if (e.key === "ArrowRight") stepLightbox(1);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  });

  const handleSaveNote = async (e: FormEvent) => {
    e.preventDefault();
    if (!resolvedId) return;
    setSavingNote(true);
    try {
      const res = await fetchWithAuth(`${API_BASE_URL}/admin/games/${resolvedId}/note`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ note }),
      });
      if (!res.ok) {
        throw new Error(await readErrorMessage(res, "Failed to save note."));
      }
      setGame((prev) => {
        if (!prev) return prev;
        const updated = { ...prev, note };
        if (resolvedId) {
          writeGameDetailCache(resolvedId, updated);
        }
        return updated;
      });
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to save note");
    } finally {
      setSavingNote(false);
    }
  };

  const handleDeleteMedia = async () => {
    if (lightboxIndex === null || !resolvedId || !game) return;
    const list =
      lightboxType === "image"
        ? game.gallery ?? []
        : game.videos ?? [];
    if (!list.length) return;

    const url = list[lightboxIndex];
    const confirmed = window.confirm(
      `Are you sure you want to delete this ${lightboxType}?`
    );
    if (!confirmed) return;
    setDeletingMedia(true);
    try {
      const res = await fetchWithAuth(
        `${API_BASE_URL}/admin/games/${resolvedId}/media`,
        {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url, type: lightboxType }),
        }
      );
      if (!res.ok) {
        throw new Error(await readErrorMessage(res, "Failed to delete media."));
      }
      const data = (await res.json()) as {
        gallery?: string[];
        videos?: string[];
      };
      setGame((prev) => {
        if (!prev) return prev;
        const updated = {
          ...prev,
          gallery: data.gallery ?? prev.gallery ?? [],
          videos: data.videos ?? prev.videos ?? [],
        };
        if (resolvedId) {
          writeGameDetailCache(resolvedId, updated);
        }
        return updated;
      });
      setLightboxIndex(null);
      setLightboxType("image");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete media");
    } finally {
      setDeletingMedia(false);
    }
  };

  const uploadFiles = async (files: File[], type: "image" | "video") => {
    if (!resolvedId || files.length === 0) return;
    const formData = new FormData();
    files.forEach((file) => formData.append("files", file));
    formData.append("type", type);
    setUploading(true);
    try {
      const res = await fetchWithAuth(`${API_BASE_URL}/admin/games/${resolvedId}/media`, {
        method: "POST",
        body: formData,
      });
      if (!res.ok) {
        throw new Error(await readErrorMessage(res, "Failed to upload files."));
      }
      const data = (await res.json()) as { gallery?: string[]; videos?: string[] };
      setGame((prev) => {
        if (!prev) return prev;
        const updated = {
          ...prev,
          gallery: data.gallery ?? prev.gallery ?? [],
          videos: data.videos ?? prev.videos ?? [],
        };
        if (resolvedId) {
          writeGameDetailCache(resolvedId, updated);
        }
        return updated;
      });
      setGalleryFiles([]);
      setVideoFiles([]);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <RequireAuth>
        <div className="min-h-screen bg-gradient-to-br from-[#0a0f1f] via-[#0d152d] to-[#0a0f1f] text-white">
          <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-10">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="space-y-3">
                <div className="h-3 w-24 rounded-full bg-white/10 animate-pulse" />
                <div className="h-8 w-64 rounded-lg bg-white/10 animate-pulse" />
                <div className="h-4 w-80 rounded-lg bg-white/10 animate-pulse" />
              </div>
              <div className="h-9 w-28 rounded-xl bg-white/10 animate-pulse" />
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              <div className="md:col-span-2">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4 shadow-lg shadow-black/30 backdrop-blur-2xl">
                  <div className="h-5 w-20 rounded-lg bg-white/10 animate-pulse" />
                  <div className="mt-3 grid gap-5 md:grid-cols-[minmax(220px,320px)_1fr] md:items-stretch">
                    <div className="aspect-[3/4] w-full rounded-xl border border-white/10 bg-white/5 animate-pulse" />
                    <div className="flex h-full flex-col rounded-xl border border-white/10 bg-white/5 p-4">
                      <div className="h-5 w-24 rounded-lg bg-white/10 animate-pulse" />
                      <div className="mt-3 flex-1 space-y-3">
                        <div className="h-4 w-full rounded-lg bg-white/10 animate-pulse" />
                        <div className="h-4 w-5/6 rounded-lg bg-white/10 animate-pulse" />
                        <div className="h-4 w-4/6 rounded-lg bg-white/10 animate-pulse" />
                      </div>
                      <div className="mt-4 h-9 w-28 rounded-lg bg-white/10 animate-pulse self-end" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4 shadow-lg shadow-black/30 backdrop-blur-2xl">
                  <div className="h-5 w-24 rounded-lg bg-white/10 animate-pulse" />
                  <div className="mt-3 space-y-2">
                    <div className="h-4 w-40 rounded-lg bg-white/10 animate-pulse" />
                    <div className="h-4 w-36 rounded-lg bg-white/10 animate-pulse" />
                    <div className="h-4 w-32 rounded-lg bg-white/10 animate-pulse" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </RequireAuth>
    );
  }

  if (error || !game) {
    return (
      <RequireAuth>
        <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-[#0a0f1f] via-[#0d152d] to-[#0a0f1f] text-white">
          <p className="mb-4 text-lg text-red-200">{error || "Game not found."}</p>
          <button
            onClick={() => router.back()}
            className="rounded-lg border border-white/20 px-4 py-2 text-white/80 transition hover:border-white/40 hover:bg-white/10"
          >
            Go back
          </button>
        </div>
      </RequireAuth>
    );
  }

  const isCompleted = game.isCompleted ?? (game as { completed?: boolean }).completed ?? false;
  const isHundredPercent =
    game.isHundredPercent ??
    (game as { hundredPercent?: boolean }).hundredPercent ??
    false;
  const isFavourite = game.isFavourite ?? (game as { favourite?: boolean }).favourite ?? false;

  return (
    <RequireAuth>
      <div className="min-h-screen bg-gradient-to-br from-[#0a0f1f] via-[#0d152d] to-[#0a0f1f] text-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-10">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-sky-400/70">
                Game Detail
              </p>
              <h1 className="text-4xl font-semibold text-white/90">{game.name}</h1>
              <p className="text-white/60">
                Year: {game.year} · Completed: {game.completedYear} ·{" "}
                {isCompleted ? "Finished" : "In progress"} ·{" "}
                {isHundredPercent ? "100%" : "Not 100%"}
              </p>
            </div>
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:border-sky-400/50 hover:bg-white/10"
            >
              ← Back home
            </Link>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <div className="md:col-span-2">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 shadow-lg shadow-black/30 backdrop-blur-2xl">
                <h2 className="text-lg font-semibold text-white">Hero</h2>
                <div className="mt-3 grid gap-5 md:grid-cols-[minmax(220px,320px)_1fr] md:items-stretch">
                  <div className="overflow-hidden rounded-xl border border-white/10 bg-black/40">
                    {isValidHttpUrl(game.imageUrl) ? (
                      <div className="relative aspect-[3/4] w-full">
                        <Image
                          src={game.imageUrl}
                          alt={game.name}
                          fill
                          sizes="(max-width: 768px) 100vw, 320px"
                          className="object-contain"
                          unoptimized
                        />
                      </div>
                    ) : (
                      <div className="flex aspect-[3/4] w-full items-center justify-center text-white/60">
                        No image available
                      </div>
                    )}
                  </div>
                  <div className="flex h-full flex-col rounded-xl border border-white/10 bg-white/5 p-4 shadow-lg shadow-black/30 backdrop-blur-2xl">
                    <h3 className="text-lg font-semibold text-white">Game note</h3>
                    <form onSubmit={handleSaveNote} className="mt-3 flex h-full flex-col gap-3">
                      <textarea
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        rows={10}
                        className="h-full min-h-[220px] w-full flex-1 rounded-lg border border-white/15 bg-black/40 px-3 py-2 text-sm text-white outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-400/30"
                        placeholder="Write a short description, memories, or tips..."
                      />
                      <div className="flex justify-end">
                        <button
                          type="submit"
                          disabled={savingNote}
                          className="rounded-lg bg-gradient-to-r from-sky-500 to-indigo-500 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-sky-900/40 transition hover:shadow-lg hover:shadow-indigo-900/40 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {savingNote ? "Saving..." : "Save note"}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 shadow-lg shadow-black/30 backdrop-blur-2xl">
                <h2 className="text-lg font-semibold text-white">Quick stats</h2>
                <ul className="mt-2 text-sm text-white/70 space-y-1">
                  <li>Year: {game.year}</li>
                  <li>Completed year: {game.completedYear}</li>
                  <li>Status: {isCompleted ? "Finished" : "In progress"}</li>
                  <li>100%: {isHundredPercent ? "Yes" : "No"}</li>
                  <li>Favourite: {isFavourite ? "Yes" : "No"}</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 shadow-lg shadow-black/30 backdrop-blur-2xl">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-white">Gallery</h2>
                <div className="text-xs text-white/60">
                  {game.gallery?.length ?? 0} items
                </div>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-3">
                {game.gallery?.length ? (
                  game.gallery.map((url, idx) => (
                    <button
                      type="button"
                      key={url}
                      aria-label={`Open gallery image ${idx + 1}`}
                      className="overflow-hidden rounded-lg border border-white/10 bg-black/30 cursor-pointer transition hover:border-sky-400/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
                      onClick={() => {
                        setLightboxType("image");
                        setLightboxIndex(idx);
                      }}
                    >
                      {isValidHttpUrl(url) ? (
                        <Image
                          src={url}
                          alt=""
                          width={400}
                          height={250}
                          className="h-[150px] w-full object-cover"
                          unoptimized
                        />
                      ) : (
                        <div className="flex h-[150px] w-full items-center justify-center text-xs text-white/50">
                          Image unavailable
                        </div>
                      )}
                    </button>
                  ))
                ) : (
                  <p className="col-span-2 text-sm text-white/60">
                    No gallery items yet.
                  </p>
                )}
              </div>
              <div className="mt-4 space-y-3 rounded-xl border border-dashed border-white/15 bg-black/30 p-3">
                <p className="text-sm text-white/70">Add images</p>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    setGalleryFiles(Array.from(e.target.files ?? []))
                  }
                  className="w-full cursor-pointer rounded-lg border border-white/15 bg-black/20 px-3 py-2 text-sm text-white file:mr-4 file:rounded-lg file:border-0 file:bg-sky-500/20 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-sky-100 hover:border-sky-400/40"
                />
                <button
                  onClick={() => uploadFiles(galleryFiles, "image")}
                  disabled={uploading || galleryFiles.length === 0}
                  className="rounded-lg bg-gradient-to-r from-sky-500 to-indigo-500 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-sky-900/40 transition hover:shadow-lg hover:shadow-indigo-900/40 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {uploading ? "Uploading..." : "Upload images"}
                </button>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 shadow-lg shadow-black/30 backdrop-blur-2xl">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-white">Videos</h2>
                <div className="text-xs text-white/60">
                  {game.videos?.length ?? 0} items
                </div>
              </div>
              <div className="mt-3 space-y-3">
                {game.videos?.length ? (
                  game.videos.map((url, idx) => (
                    <div
                      key={url}
                      className="relative overflow-hidden rounded-lg border border-white/10 bg-black/30"
                    >
                      {/* Separate button: clicks on the player's own controls
                          (play, seek, volume) must not open the lightbox. */}
                      <video controls className="w-full">
                        <source src={url} />
                      </video>
                      <button
                        type="button"
                        aria-label={`Expand video ${idx + 1}`}
                        onClick={() => {
                          setLightboxType("video");
                          setLightboxIndex(idx);
                        }}
                        className="absolute right-2 top-2 rounded-full border border-white/30 bg-black/60 px-3 py-1 text-xs font-semibold text-white transition hover:border-white/60 hover:bg-white/20"
                      >
                        Expand
                      </button>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-white/60">No videos yet.</p>
                )}
              </div>
              <div className="mt-4 space-y-3 rounded-xl border border-dashed border-white/15 bg-black/30 p-3">
                <p className="text-sm text-white/70">Add videos</p>
                <input
                  type="file"
                  accept="video/*"
                  multiple
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    setVideoFiles(Array.from(e.target.files ?? []))
                  }
                  className="w-full cursor-pointer rounded-lg border border-white/15 bg-black/20 px-3 py-2 text-sm text-white file:mr-4 file:rounded-lg file:border-0 file:bg-fuchsia-500/20 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-fuchsia-100 hover:border-fuchsia-400/40"
                />
                <button
                  onClick={() => uploadFiles(videoFiles, "video")}
                  disabled={uploading || videoFiles.length === 0}
                  className="rounded-lg bg-gradient-to-r from-fuchsia-500 to-purple-500 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-fuchsia-900/40 transition hover:shadow-lg hover:shadow-purple-900/40 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {uploading ? "Uploading..." : "Upload videos"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {mounted && lightboxIndex !== null && (
        createPortal(
          <div
            role="dialog"
            aria-modal="true"
            aria-label={lightboxType === "image" ? "Gallery image" : "Video"}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md"
            onClick={() => setLightboxIndex(null)}
          >
            <button
              onClick={(e) => {
                e.stopPropagation();
                stepLightbox(-1);
              }}
              aria-label="Previous"
              className="absolute left-6 top-1/2 -translate-y-1/2 rounded-full border border-white/30 bg-white/10 px-3 py-2 text-white transition hover:border-white/60 hover:bg-white/20"
            >
              <span aria-hidden="true">‹</span>
            </button>
            <div
              className="max-h-[85vh] max-w-5xl overflow-hidden rounded-2xl border border-white/10 bg-black/60 shadow-2xl shadow-black/60"
              onClick={(e) => e.stopPropagation()}
            >
              {lightboxType === "image" && isValidHttpUrl(game.gallery?.[lightboxIndex]) ? (
                <Image
                  src={game.gallery![lightboxIndex]}
                  alt="Gallery item"
                  width={1400}
                  height={900}
                  className="h-full w-full max-h-[85vh] object-contain"
                  unoptimized
                />
              ) : lightboxType === "video" && game.videos?.length ? (
                <div className="relative h-full w-full max-h-[85vh]">
                  <video
                    controls
                    autoPlay
                    className="h-full w-full max-h-[85vh] object-contain"
                    src={game.videos[lightboxIndex]}
                  />
                </div>
              ) : null}
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                stepLightbox(1);
              }}
              aria-label="Next"
              className="absolute right-6 top-1/2 -translate-y-1/2 rounded-full border border-white/30 bg-white/10 px-3 py-2 text-white transition hover:border-white/60 hover:bg-white/20"
            >
              <span aria-hidden="true">›</span>
            </button>
            <div className="absolute right-6 top-6 flex items-center gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteMedia();
                }}
                disabled={deletingMedia}
                className="rounded-full border border-red-300/50 bg-red-500/30 px-3 py-2 text-white shadow-sm shadow-black/40 transition hover:border-red-200/80 hover:bg-red-500/50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {deletingMedia ? "Deleting..." : "Delete"}
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setLightboxIndex(null);
                }}
                aria-label="Close"
                className="rounded-full border border-white/30 bg-white/10 px-3 py-2 text-white transition hover:border-white/60 hover:bg-white/20"
              >
                <span aria-hidden="true">✕</span>
              </button>
            </div>
          </div>,
          document.body
        )
      )}
    </RequireAuth>
  );
};

export default GameDetailPage;
