'use client';

import { useEffect, useMemo, useState, type ChangeEvent, type FormEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { createPortal } from "react-dom";
import RequireAuth from "@/components/requireAuth";
import { fetchWithAuth } from "@/lib/fetchWithAuth";
import { API_BASE_URL } from "@/lib/api";
import { useAuth } from "@/components/authProvider";

type GameDetail = {
  id?: string;
  _id?: string;
  gameId?: string;
  itemId?: string;
  name: string;
  year: number;
  completedYear: number;
  isCompleted: boolean;
  isHundredPercent: boolean;
  isFavourite: boolean;
  specialDescription: string;
  imageUrl: string;
  note?: string;
  gallery?: string[];
  videos?: string[];
};

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
    const fetchGame = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetchWithAuth(`${API_BASE_URL}/admin/games/${gameIdParam}`);
        if (!res.ok) {
          const txt = await res.text();
          throw new Error(txt || "Failed to load game");
        }
        const data = (await res.json()) as GameDetail;
        setGame(data);
        setNote(data.note ?? "");
      } catch (err: any) {
        setError(err?.message || "Failed to load game");
      } finally {
        setLoading(false);
      }
    };

    if (gameIdParam && user && !authLoading) {
      fetchGame();
    }
  }, [gameIdParam, user, authLoading]);

  useEffect(() => {
    setMounted(true);
  }, []);

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
        const txt = await res.text();
        throw new Error(txt || "Failed to save note");
      }
      setGame((prev) => (prev ? { ...prev, note } : prev));
    } catch (err: any) {
      alert(err?.message || "Failed to save note");
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
        const txt = await res.text();
        throw new Error(txt || "Failed to delete media");
      }
      const data = (await res.json()) as {
        gallery?: string[];
        videos?: string[];
      };
      setGame((prev) =>
        prev
          ? {
              ...prev,
              gallery: data.gallery ?? prev.gallery ?? [],
              videos: data.videos ?? prev.videos ?? [],
            }
          : prev
      );
      setLightboxIndex(null);
      setLightboxType("image");
    } catch (err: any) {
      alert(err?.message || "Failed to delete media");
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
        const txt = await res.text();
        throw new Error(txt || "Failed to upload files");
      }
      const data = (await res.json()) as { gallery?: string[]; videos?: string[] };
      setGame((prev) =>
        prev
          ? {
              ...prev,
              gallery: data.gallery ?? prev.gallery ?? [],
              videos: data.videos ?? prev.videos ?? [],
            }
          : prev
      );
      setGalleryFiles([]);
      setVideoFiles([]);
    } catch (err: any) {
      alert(err?.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <RequireAuth>
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#0a0f1f] via-[#0d152d] to-[#0a0f1f] text-white">
          Loading game...
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
                    {game.imageUrl ? (
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
                    <div
                      key={url}
                      className="overflow-hidden rounded-lg border border-white/10 bg-black/30 cursor-pointer"
                      onClick={() => {
                        setLightboxType("image");
                        setLightboxIndex(idx);
                      }}
                    >
                      <Image
                        src={url}
                        alt="Gallery item"
                        width={400}
                        height={250}
                        className="h-[150px] w-full object-cover"
                        unoptimized
                      />
                    </div>
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
                      className="overflow-hidden rounded-lg border border-white/10 bg-black/30 cursor-pointer"
                      onClick={() => {
                        setLightboxType("video");
                        setLightboxIndex(idx);
                      }}
                    >
                      <video controls className="w-full">
                        <source src={url} />
                      </video>
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
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md"
            onClick={() => setLightboxIndex(null)}
          >
            <button
              onClick={(e) => {
                e.stopPropagation();
                const list =
                  lightboxType === "image" ? game.gallery ?? [] : game.videos ?? [];
                if (!list.length) return;
                setLightboxIndex((prev) =>
                  prev === null
                    ? 0
                    : prev === 0
                    ? list.length - 1
                    : prev - 1
                );
              }}
              className="absolute left-6 top-1/2 -translate-y-1/2 rounded-full border border-white/30 bg-white/10 px-3 py-2 text-white transition hover:border-white/60 hover:bg-white/20"
            >
              ‹
            </button>
            <div
              className="max-h-[85vh] max-w-5xl overflow-hidden rounded-2xl border border-white/10 bg-black/60 shadow-2xl shadow-black/60"
              onClick={(e) => e.stopPropagation()}
            >
              {lightboxType === "image" && game.gallery?.length ? (
                <Image
                  src={game.gallery[lightboxIndex]}
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
                const list =
                  lightboxType === "image" ? game.gallery ?? [] : game.videos ?? [];
                if (!list.length) return;
                setLightboxIndex((prev) =>
                  prev === null
                    ? 0
                    : prev === list.length - 1
                    ? 0
                    : prev + 1
                );
              }}
              className="absolute right-6 top-1/2 -translate-y-1/2 rounded-full border border-white/30 bg-white/10 px-3 py-2 text-white transition hover:border-white/60 hover:bg-white/20"
            >
              ›
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
                className="rounded-full border border-white/30 bg-white/10 px-3 py-2 text-white transition hover:border-white/60 hover:bg-white/20"
              >
                ✕
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
