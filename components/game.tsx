'use client';
import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
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
  const [formIsCompleted, setFormIsCompleted] = useState(game.isCompleted);
  const [formIsHundredPercent, setFormIsHundredPercent] = useState(
    game.isHundredPercent
  );
  const [formIsFavourite, setFormIsFavourite] = useState(game.isFavourite);
  const [formDescription, setFormDescription] = useState(
    game.specialDescription
  );
  const [formImageUrl, setFormImageUrl] = useState(game.imageUrl);
  const [newImageFile, setNewImageFile] = useState<File | null>(null);

  useEffect(() => {
    setFormName(game.name);
    setFormYear(game.year.toString());
    setFormCompletedYear(game.completedYear.toString());
    setFormIsCompleted(game.isCompleted);
    setFormIsHundredPercent(game.isHundredPercent);
    setFormIsFavourite(game.isFavourite);
    setFormDescription(game.specialDescription);
    setFormImageUrl(game.imageUrl);
    setNewImageFile(null);
    setError(null);
    setEditing(false);
    setMenuOpen(false);
    setConfirmOpen(false);
  }, [game]);

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
    <div className="group relative w-[280px] overflow-hidden rounded-2xl border border-white/10 bg-white/5 shadow-lg shadow-black/30 backdrop-blur-xl transition hover:-translate-y-1 hover:border-white/20 hover:bg-white/10">
      {showActions && resolvedId && (
        <div className="absolute right-3 top-3 z-10 flex flex-col items-end gap-2">
          <button
            onClick={() => setMenuOpen((p) => !p)}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-black/60 text-white shadow-sm shadow-black/40 transition hover:border-white/50 hover:bg-white/10"
          >
            ⋯
          </button>
          {menuOpen && (
            <div className="w-40 rounded-xl border border-white/20 bg-black/80 p-2 text-sm text-white shadow-lg shadow-black/40 backdrop-blur">
              <button
                onClick={() => {
                  setEditing(true);
                  setMenuOpen(false);
                }}
                className="w-full rounded-lg px-3 py-2 text-left transition hover:bg-white/10"
              >
                Update
              </button>
              <button
                onClick={handleDeleteClick}
                disabled={disableDelete}
                className="w-full rounded-lg px-3 py-2 text-left text-red-200 transition hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Delete
              </button>
            </div>
          )}

          {confirmOpen && (
            <div className="w-64 rounded-xl border border-red-400/40 bg-black/80 p-3 text-left text-xs text-white shadow-lg shadow-black/40 backdrop-blur">
              <p className="font-semibold text-red-200">
                Are you sure you want to erase all your data for this game permanently?
              </p>
              <div className="mt-3 flex justify-end gap-2">
                <button
                  onClick={handleCancel}
                  className="rounded-lg border border-white/20 px-3 py-1 text-white/80 transition hover:border-white/50 hover:bg-white/10"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirm}
                  disabled={disableDelete}
                  className="rounded-lg border border-red-400/60 bg-red-500/20 px-3 py-1 font-semibold text-red-100 transition hover:bg-red-500/40 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Yes, delete
                </button>
              </div>
            </div>
          )}
        </div>
      )}
      <div className="relative h-[360px] w-full overflow-hidden">
        {hasValidImage ? (
          <Image
            src={game.imageUrl}
            alt={`Image for ${game.name}`}
            fill
            sizes="280px"
            className="object-cover transition duration-500 group-hover:scale-105"
            unoptimized
            priority={false}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-800 to-slate-700 text-white/60">
            No image available
          </div>
        )}

        <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 transition duration-500 group-hover:opacity-100">
          <div className="px-4 text-center text-sm text-white/90">
            {game.specialDescription || "No description provided"}
          </div>
        </div>
      </div>
      <div className="flex items-center justify-between px-4 py-3 text-white">
        <div className="flex flex-col">
          <span className="text-sm text-white/60">Title</span>
          <span className="text-base font-semibold">{game.name}</span>
        </div>
        <span className="rounded-lg border border-white/10 bg-black/40 px-3 py-1 text-sm font-semibold text-white/80">
          {game.year}
        </span>
      </div>

      {editing && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/70 backdrop-blur-md">
          <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-[#0c1224] p-5 text-sm text-white shadow-2xl shadow-black/40 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Update game</h3>
              <button
                onClick={() => setEditing(false)}
                className="rounded-lg px-2 py-1 text-white/60 transition hover:bg-white/10"
                disabled={saving}
              >
                ✕
              </button>
            </div>

            <div className="mt-4 space-y-3">
              <label className="flex flex-col gap-1">
                <span className="text-white/70">Name</span>
                <input
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="rounded-lg border border-white/15 bg-black/40 px-3 py-2 text-white outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-400/30"
                />
              </label>
              <div className="grid grid-cols-2 gap-3">
                <label className="flex flex-col gap-1">
                  <span className="text-white/70">Year</span>
                  <input
                    type="number"
                    value={formYear}
                    onChange={(e) => setFormYear(e.target.value)}
                    className="rounded-lg border border-white/15 bg-black/40 px-3 py-2 text-white outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-400/30"
                  />
                </label>
                <label className="flex flex-col gap-1">
                  <span className="text-white/70">Completed year</span>
                  <input
                    type="number"
                    value={formCompletedYear}
                    onChange={(e) => setFormCompletedYear(e.target.value)}
                    className="rounded-lg border border-white/15 bg-black/40 px-3 py-2 text-white outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-400/30"
                  />
                </label>
              </div>
              <label className="flex flex-col gap-1">
                <span className="text-white/70">Special description</span>
                <input
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="rounded-lg border border-white/15 bg-black/40 px-3 py-2 text-white outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-400/30"
                />
              </label>

              <div className="flex flex-wrap gap-3">
                <label className="flex items-center gap-2 text-white/80">
                  <input
                    type="checkbox"
                    checked={formIsCompleted}
                    onChange={(e) => setFormIsCompleted(e.target.checked)}
                    className="h-5 w-5 rounded border-white/20 bg-black/50 text-sky-400 focus:ring-sky-400/60"
                  />
                  Completed
                </label>
                <label className="flex items-center gap-2 text-white/80">
                  <input
                    type="checkbox"
                    checked={formIsHundredPercent}
                    onChange={(e) =>
                      setFormIsHundredPercent(e.target.checked)
                    }
                    className="h-5 w-5 rounded border-white/20 bg-black/50 text-emerald-400 focus:ring-emerald-400/60"
                  />
                  100% Completed
                </label>
                <label className="flex items-center gap-2 text-white/80">
                  <input
                    type="checkbox"
                    checked={formIsFavourite}
                    onChange={(e) => setFormIsFavourite(e.target.checked)}
                    className="h-5 w-5 rounded border-white/20 bg-black/50 text-fuchsia-400 focus:ring-fuchsia-400/60"
                  />
                  Favourite
                </label>
              </div>

              <label className="flex flex-col gap-1 text-white/70">
                Image
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    setNewImageFile(e.target.files?.[0] ?? null)
                  }
                  className="rounded-lg border border-dashed border-white/15 bg-black/30 px-3 py-3 text-white file:mr-4 file:rounded-lg file:border-0 file:bg-sky-500/20 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-sky-100 hover:border-sky-400/40"
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
                <div className="rounded-lg border border-red-400/50 bg-red-500/10 px-3 py-2 text-xs text-red-100">
                  {error}
                </div>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={() => setEditing(false)}
                  disabled={saving}
                  className="rounded-lg border border-white/20 px-4 py-2 text-white/80 transition hover:border-white/40 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdate}
                  disabled={saving}
                  className="rounded-lg bg-gradient-to-r from-sky-500 to-indigo-500 px-4 py-2 font-semibold text-white shadow-md shadow-sky-900/40 transition hover:shadow-lg hover:shadow-indigo-900/40 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving ? "Saving..." : "Save changes"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Game;
