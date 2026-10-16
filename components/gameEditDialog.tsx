'use client';

import { useEffect, useId, useState } from "react";
import { createPortal } from "react-dom";
import type { GameType, GameUpdatePayload } from "@/lib/types";
import { discardUploadedImage, uploadCoverImage } from "@/lib/uploads";

export const MIN_YEAR = 1975;
const MAX_YEAR_AHEAD = 5;

type GameFormValues = Pick<
  GameType,
  | "name"
  | "year"
  | "completedYear"
  | "isCompleted"
  | "isHundredPercent"
  | "isFavourite"
  | "completed"
  | "hundredPercent"
  | "favourite"
  | "specialDescription"
  | "imageUrl"
>;

type Props = {
  game: GameFormValues;
  onClose: () => void;
  /** Persists the changes; throw to keep the dialog open and show the error. */
  onSave: (payload: GameUpdatePayload) => Promise<void>;
};

// Returns an error message for the form, or null when it's valid.
function validateGameForm(name: string, year: string, completedYear: string): string | null {
  const maxYear = new Date().getFullYear() + MAX_YEAR_AHEAD;
  if (!name.trim()) return "Name is required.";
  const yearNum = Number(year);
  if (!year.trim() || !Number.isInteger(yearNum) || yearNum < MIN_YEAR || yearNum > maxYear) {
    return `Year must be a whole number between ${MIN_YEAR} and ${maxYear}.`;
  }
  // Empty / 0 means "not completed yet".
  const completedNum = Number(completedYear || 0);
  if (
    !Number.isInteger(completedNum) ||
    (completedNum !== 0 && (completedNum < MIN_YEAR || completedNum > maxYear))
  ) {
    return `Completed year must be empty or between ${MIN_YEAR} and ${maxYear}.`;
  }
  return null;
}

/**
 * The "Update game" dialog, shared by the game cards and the detail page.
 * Render it only while open: the form starts from `game` each time it mounts.
 */
const GameEditDialog = ({ game, onClose, onSave }: Props) => {
  const titleId = useId();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formName, setFormName] = useState(game.name);
  const [formYear, setFormYear] = useState(game.year.toString());
  const [formCompletedYear, setFormCompletedYear] = useState(game.completedYear.toString());
  const [formIsCompleted, setFormIsCompleted] = useState(game.isCompleted ?? game.completed ?? false);
  const [formIsHundredPercent, setFormIsHundredPercent] = useState(
    game.isHundredPercent ?? game.hundredPercent ?? false
  );
  const [formIsFavourite, setFormIsFavourite] = useState(game.isFavourite ?? game.favourite ?? false);
  const [formDescription, setFormDescription] = useState(game.specialDescription ?? "");
  const [newImageFile, setNewImageFile] = useState<File | null>(null);

  // Escape closes the dialog (unless a save is in flight).
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !saving) onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [saving, onClose]);

  const close = () => {
    if (!saving) onClose();
  };

  const handleSave = async () => {
    const validationError = validateGameForm(formName, formYear, formCompletedYear);
    if (validationError) {
      setError(validationError);
      return;
    }
    setSaving(true);
    setError(null);

    let imageUrl = game.imageUrl;
    let uploadedUrl: string | null = null;
    if (newImageFile && newImageFile.size > 0) {
      try {
        uploadedUrl = await uploadCoverImage(newImageFile);
        imageUrl = uploadedUrl;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Image upload failed.");
        setSaving(false);
        return;
      }
    }

    const payload: GameUpdatePayload = {
      name: formName.trim(),
      year: Number(formYear),
      completedYear: Number(formCompletedYear || 0),
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
      await onSave(payload);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update game.");
      // The game still points at its old cover, so the new upload is unused.
      if (uploadedUrl) void discardUploadedImage(uploadedUrl);
      setSaving(false);
    }
  };

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md"
      onClick={close}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="w-full max-w-3xl rounded-2xl border border-white/10 bg-[#0c1224] p-5 text-sm text-white shadow-2xl shadow-black/40 max-h-[90vh] overflow-y-auto md:w-1/2"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h3 id={titleId} className="text-lg font-semibold">Update game</h3>
          <button
            onClick={close}
            aria-label="Close"
            className="rounded-lg px-2 py-1 text-white/60 transition hover:bg-white/10"
            disabled={saving}
          >
            <span aria-hidden="true">✕</span>
          </button>
        </div>

        <div className="mt-4 space-y-3">
          <label className="flex flex-col gap-1">
            <span className="text-white/70">Name</span>
            <input
              autoFocus
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              className="rounded-lg border border-white/15 bg-black/40 px-3 py-2 text-white outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-400/30"
            />
          </label>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
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
                onChange={(e) => setFormIsHundredPercent(e.target.checked)}
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
              onChange={(e) => setNewImageFile(e.target.files?.[0] ?? null)}
              className="rounded-lg border border-dashed border-white/15 bg-black/30 px-3 py-3 text-white file:mr-4 file:rounded-lg file:border-0 file:bg-sky-500/20 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-sky-100 hover:border-sky-400/40"
            />
            {game.imageUrl && !newImageFile && (
              <span className="text-xs text-white/50 truncate">Current: {game.imageUrl}</span>
            )}
            {newImageFile && (
              <span className="text-xs text-white/70">New file: {newImageFile.name}</span>
            )}
          </label>

          {error && (
            <div
              role="alert"
              className="rounded-lg border border-red-400/50 bg-red-500/10 px-3 py-2 text-xs text-red-100"
            >
              {error}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={close}
              disabled={saving}
              className="rounded-lg border border-white/20 px-4 py-2 text-white/80 transition hover:border-white/40 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="rounded-lg bg-gradient-to-r from-sky-500 to-indigo-500 px-4 py-2 font-semibold text-white shadow-md shadow-sky-900/40 transition hover:shadow-lg hover:shadow-indigo-900/40 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? "Saving..." : "Save changes"}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default GameEditDialog;
