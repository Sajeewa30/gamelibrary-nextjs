'use client';
import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { createPortal } from "react-dom";
import Link from "next/link";
import { API_BASE_URL } from "@/lib/api";
import { fetchWithAuth } from "@/lib/fetchWithAuth";

type GameProps = {
  game: {
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
  };
  showActions?: boolean;
  onDelete?: (id: string) => void;
  onUpdate?: (
    id: string,
    payload: {
      name: string;
      year: number;
      completedYear: number;
      isCompleted: boolean;
      isHundredPercent: boolean;
      isFavourite: boolean;
      specialDescription: string;
      imageUrl: string;
    }
  ) => Promise<void>;
  disableDelete?: boolean;
  clickable?: boolean;
};

// Helper function to validate URL
function isValidHttpUrl(str: string | null | undefined): boolean {
  if (!str) return false;
  try {
    const url = new URL(str);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

const Game = ({
  game,
  showActions = false,
  onDelete,
  onUpdate,
  disableDelete = false,
  clickable = true,
}: GameProps) => {
  const resolvedId = useMemo(() => {
    if (game.id) return game.id.toString();
    if (game._id) return game._id.toString();
    if (game.gameId) return game.gameId.toString();
    if (game.itemId) return game.itemId.toString();
    return "";
  }, [game]);

  const hasValidImage = isValidHttpUrl(game.imageUrl);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formName, setFormName] = useState(game.name);
  const [formYear, setFormYear] = useState(game.year.toString());
  const [formCompletedYear, setFormCompletedYear] = useState(
    game.completedYear.toString()
  );
  const [formIsCompleted, setFormIsCompleted] = useState(
    game.isCompleted ?? (game as { completed?: boolean }).completed ?? false
  );
  const [formIsHundredPercent, setFormIsHundredPercent] = useState(
    game.isHundredPercent ??
      (game as { hundredPercent?: boolean }).hundredPercent ??
      false
  );
  const [formIsFavourite, setFormIsFavourite] = useState(
    game.isFavourite ?? (game as { favourite?: boolean }).favourite ?? false
  );
  const [formDescription, setFormDescription] = useState(
    game.specialDescription
  );
  const [formImageUrl, setFormImageUrl] = useState(game.imageUrl);
  const [newImageFile, setNewImageFile] = useState<File | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setFormName(game.name);
    setFormYear(game.year.toString());
    setFormCompletedYear(game.completedYear.toString());
    setFormIsCompleted(
      game.isCompleted ?? (game as { completed?: boolean }).completed ?? false
    );
    setFormIsHundredPercent(
      game.isHundredPercent ??
        (game as { hundredPercent?: boolean }).hundredPercent ??
        false
    );
    setFormIsFavourite(
      game.isFavourite ?? (game as { favourite?: boolean }).favourite ?? false
    );
    setFormDescription(game.specialDescription);
    setFormImageUrl(game.imageUrl);
    setNewImageFile(null);
    setError(null);
    setEditing(false);
    setMenuOpen(false);
    setConfirmOpen(false);
  }, [game]);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleDeleteClick = () => {
    if (!resolvedId || !onDelete) return;
    setMenuOpen(false);
    setConfirmOpen(true);
  };

  const handleConfirm = () => {
    if (!resolvedId || !onDelete) return;
    onDelete(resolvedId);
    setConfirmOpen(false);
  };

  const handleCancel = () => setConfirmOpen(false);

  const handleUpdate = async () => {
    if (!resolvedId || !onUpdate) return;
    setSaving(true);
    setError(null);

    let imageUrl = formImageUrl;
    if (newImageFile && newImageFile.size > 0) {
      const uploadData = new FormData();
      uploadData.append("image", newImageFile);
      try {
        const res = await fetchWithAuth(`${API_BASE_URL}/admin/uploadImage`, {
          method: "POST",
          body: uploadData,
        });
        if (!res.ok) {
          throw new Error("Image upload failed.");
        }
        imageUrl = await res.text();
      } catch (err: any) {
        setError(err?.message || "Image upload failed.");
        setSaving(false);
        return;
      }
    }

    const payload = {
      name: formName,
      year: Number(formYear),
      completedYear: Number(formCompletedYear),
      isCompleted: formIsCompleted,
      isHundredPercent: formIsHundredPercent,
      isFavourite: formIsFavourite,
      completed: formIsCompleted,
      hundredPercent: formIsHundredPercent,
      favourite: formIsFavourite,
      specialDescription: formDescription,
      imageUrl,
    };

    try {
      await onUpdate(resolvedId, payload);
      setEditing(false);
      setMenuOpen(false);
    } catch (err: any) {
      setError(err?.message || "Failed to update game.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="group relative w-[320px] overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-slate-800/40 via-slate-900/40 to-slate-950/40 shadow-2xl shadow-black/40 backdrop-blur-xl transition-all duration-300 hover:-translate-y-2 hover:border-indigo-400/30 hover:shadow-3xl hover:shadow-indigo-500/20">
      {showActions && resolvedId && (
        <div className="absolute right-4 top-4 z-10 flex flex-col items-end gap-2">
          <button
            onClick={() => setMenuOpen((p) => !p)}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-gradient-to-br from-slate-900/90 to-slate-950/90 text-white shadow-lg shadow-black/50 backdrop-blur-xl transition hover:border-indigo-400/50 hover:from-indigo-900/80 hover:to-purple-900/80"
          >
            ⋯
          </button>
          {menuOpen && (
            <div className="w-44 overflow-hidden rounded-2xl border border-white/20 bg-gradient-to-br from-slate-900/95 to-slate-950/95 p-2 text-sm text-white shadow-2xl shadow-black/60 backdrop-blur-xl">
              <button
                onClick={() => {
                  setEditing(true);
                  setMenuOpen(false);
                }}
                className="w-full rounded-xl px-4 py-2.5 text-left font-medium transition hover:bg-indigo-500/20"
              >
                ✏️ Update
              </button>
              <button
                onClick={handleDeleteClick}
                disabled={disableDelete}
                className="w-full rounded-xl px-4 py-2.5 text-left font-medium text-red-300 transition hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-60"
              >
                🗑️ Delete
              </button>
            </div>
          )}

          {confirmOpen && (
            <div className="w-72 rounded-2xl border border-red-400/30 bg-gradient-to-br from-red-950/95 to-slate-950/95 p-4 text-left text-sm text-white shadow-2xl shadow-red-900/40 backdrop-blur-xl">
              <p className="font-semibold text-red-200">
                Are you sure you want to permanently delete this game and all its data?
              </p>
              <div className="mt-4 flex justify-end gap-2">
                <button
                  onClick={handleCancel}
                  className="rounded-xl border border-white/20 px-4 py-2 text-white/80 transition hover:border-white/40 hover:bg-white/10"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirm}
                  disabled={disableDelete}
                  className="rounded-xl bg-gradient-to-r from-red-600 to-red-700 px-4 py-2 font-semibold text-white shadow-lg shadow-red-900/40 transition hover:from-red-500 hover:to-red-600 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Yes, delete
                </button>
              </div>
            </div>
          )}
        </div>
      )}
      <div className="relative h-[400px] w-full overflow-hidden">
        {clickable ? (
          <Link href={`/game/${resolvedId || ""}`} className="block h-full w-full">
            {hasValidImage ? (
              <Image
                src={game.imageUrl}
                alt={`Image for ${game.name}`}
                fill
                sizes="320px"
                className="object-cover transition duration-700 group-hover:scale-110 group-hover:brightness-110"
                unoptimized
                priority={false}
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-700 via-slate-800 to-slate-900 text-slate-400">
                <div className="text-center">
                  <div className="text-4xl opacity-50">🎮</div>
                  <p className="mt-2 text-sm">No image available</p>
                </div>
              </div>
            )}
          </Link>
        ) : hasValidImage ? (
          <Image
            src={game.imageUrl}
            alt={`Image for ${game.name}`}
            fill
            sizes="320px"
            className="object-cover transition duration-700 group-hover:scale-110 group-hover:brightness-110"
            unoptimized
            priority={false}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-700 via-slate-800 to-slate-900 text-slate-400">
            <div className="text-center">
              <div className="text-4xl opacity-50">🎮</div>
              <p className="mt-2 text-sm">No image available</p>
            </div>
          </div>
        )}

        <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-gradient-to-t from-black/90 via-black/30 to-transparent opacity-0 transition duration-500 group-hover:opacity-100">
          <div className="px-6 text-center text-sm leading-relaxed text-white">
            {game.specialDescription || "No description provided"}
          </div>
        </div>
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/60 to-transparent" />
      </div>
      <div className="relative border-t border-white/10 bg-gradient-to-br from-slate-900/60 to-slate-950/60 px-5 py-4 backdrop-blur-sm">
        <div className="flex items-center justify-between text-white">
          <div className="flex-1">
            <span className="text-xs uppercase tracking-wider text-indigo-300/70">Title</span>
            <h3 className="mt-1 truncate text-lg font-bold leading-tight">{game.name}</h3>
          </div>
          <span className="ml-3 rounded-xl border border-indigo-400/20 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 px-3 py-1.5 text-sm font-bold text-indigo-200 shadow-lg shadow-indigo-900/20">
            {game.year}
          </span>
        </div>
      </div>

      {mounted &&
        editing &&
        createPortal(
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xl"
            onClick={() => !saving && setEditing(false)}
          >
            <div
              className="w-full max-w-3xl rounded-3xl border border-white/20 bg-gradient-to-br from-slate-900/95 via-slate-950/95 to-black/95 p-8 text-sm text-white shadow-2xl shadow-indigo-900/40 max-h-[90vh] overflow-y-auto backdrop-blur-2xl md:w-1/2"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold bg-gradient-to-r from-white to-indigo-200 bg-clip-text text-transparent">Update Game</h3>
                <button
                  onClick={() => setEditing(false)}
                  className="rounded-full p-2 text-white/60 transition hover:bg-white/10 hover:text-white"
                  disabled={saving}
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <label className="flex flex-col gap-2">
                  <span className="text-sm font-medium text-indigo-300">Game Name</span>
                  <input
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="rounded-xl border border-white/20 bg-slate-900/50 px-4 py-3 text-white outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/30"
                  />
                </label>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <label className="flex flex-col gap-2">
                    <span className="text-sm font-medium text-indigo-300">Release Year</span>
                    <input
                      type="number"
                      value={formYear}
                      onChange={(e) => setFormYear(e.target.value)}
                      className="rounded-xl border border-white/20 bg-slate-900/50 px-4 py-3 text-white outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/30"
                    />
                  </label>
                  <label className="flex flex-col gap-2">
                    <span className="text-sm font-medium text-indigo-300">Completed Year</span>
                    <input
                      type="number"
                      value={formCompletedYear}
                      onChange={(e) => setFormCompletedYear(e.target.value)}
                      className="rounded-xl border border-white/20 bg-slate-900/50 px-4 py-3 text-white outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/30"
                    />
                  </label>
                </div>
                <label className="flex flex-col gap-2">
                  <span className="text-sm font-medium text-indigo-300">Description</span>
                  <input
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    className="rounded-xl border border-white/20 bg-slate-900/50 px-4 py-3 text-white outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/30"
                  />
                </label>

                <div className="flex flex-wrap gap-4">
                  <label className="flex items-center gap-2 rounded-xl border border-indigo-400/20 bg-indigo-500/10 px-4 py-2 text-white transition hover:border-indigo-400/40">
                    <input
                      type="checkbox"
                      checked={formIsCompleted}
                      onChange={(e) => setFormIsCompleted(e.target.checked)}
                      className="h-5 w-5 rounded border-white/20 bg-slate-900/50 text-indigo-500 focus:ring-indigo-400/60"
                    />
                    <span className="font-medium">Completed</span>
                  </label>
                  <label className="flex items-center gap-2 rounded-xl border border-emerald-400/20 bg-emerald-500/10 px-4 py-2 text-white transition hover:border-emerald-400/40">
                    <input
                      type="checkbox"
                      checked={formIsHundredPercent}
                      onChange={(e) =>
                        setFormIsHundredPercent(e.target.checked)
                      }
                      className="h-5 w-5 rounded border-white/20 bg-slate-900/50 text-emerald-500 focus:ring-emerald-400/60"
                    />
                    <span className="font-medium">100% Completed</span>
                  </label>
                  <label className="flex items-center gap-2 rounded-xl border border-rose-400/20 bg-rose-500/10 px-4 py-2 text-white transition hover:border-rose-400/40">
                    <input
                      type="checkbox"
                      checked={formIsFavourite}
                      onChange={(e) => setFormIsFavourite(e.target.checked)}
                      className="h-5 w-5 rounded border-white/20 bg-slate-900/50 text-rose-500 focus:ring-rose-400/60"
                    />
                    <span className="font-medium">Favourite</span>
                  </label>
                </div>

                <label className="flex flex-col gap-2">
                  <span className="text-sm font-medium text-indigo-300">Game Image</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) =>
                      setNewImageFile(e.target.files?.[0] ?? null)
                    }
                    className="rounded-xl border border-dashed border-white/20 bg-slate-900/30 px-4 py-4 text-white file:mr-4 file:rounded-xl file:border-0 file:bg-indigo-500/20 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-indigo-200 hover:border-indigo-400/40"
                  />
                  {formImageUrl && !newImageFile && (
                    <span className="text-xs text-white/50 truncate">
                      Current: {formImageUrl}
                    </span>
                  )}
                  {newImageFile && (
                    <span className="text-xs text-white/70">
                      New file: {newImageFile.name}
                    </span>
                  )}
                </label>

                {error && (
                  <div className="rounded-xl border border-red-400/50 bg-gradient-to-r from-red-500/20 to-pink-500/20 px-4 py-3 text-sm text-red-100">
                    ⚠️ {error}
                  </div>
                )}

                <div className="flex justify-end gap-3 pt-4">
                  <button
                    onClick={() => setEditing(false)}
                    disabled={saving}
                    className="rounded-xl border border-white/20 px-6 py-3 font-semibold text-white/80 transition hover:border-white/40 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleUpdate}
                    disabled={saving}
                    className="rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 px-6 py-3 font-bold text-white shadow-lg shadow-purple-900/40 transition hover:shadow-xl hover:shadow-purple-900/60 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {saving ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
};

export default Game;
