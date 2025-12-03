'use client';
import { useState } from "react";
import Image from "next/image";

type GameProps = {
  id?: string;
  name: string;
  year: string;
  specialDescription: string;
  imageUrl: string;
  showDelete?: boolean;
  onDelete?: (id: string) => void;
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
  id,
  name,
  year,
  imageUrl,
  specialDescription,
  showDelete = false,
  onDelete,
  disableDelete = false,
}: GameProps) => {
  const hasValidImage = isValidHttpUrl(imageUrl);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const handleDeleteClick = () => {
    if (!id || !onDelete) return;
    setConfirmOpen(true);
  };

  const handleConfirm = () => {
    if (!id || !onDelete) return;
    onDelete(id);
    setConfirmOpen(false);
  };

  const handleCancel = () => setConfirmOpen(false);

  return (
    <div className="group relative w-[280px] overflow-hidden rounded-2xl border border-white/10 bg-white/5 shadow-lg shadow-black/30 backdrop-blur-xl transition hover:-translate-y-1 hover:border-white/20 hover:bg-white/10">
      {showDelete && id && (
        <div className="absolute right-3 top-3 z-10 flex flex-col items-end gap-2">
          <button
            onClick={handleDeleteClick}
            disabled={disableDelete}
            className="rounded-full border border-white/20 bg-black/60 px-3 py-1 text-xs font-semibold text-white shadow-sm shadow-black/40 transition hover:border-red-300/70 hover:bg-red-500/30 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {disableDelete ? "Deleting..." : "Delete"}
          </button>
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
            src={imageUrl}
            alt={`Image for ${name}`}
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
            {specialDescription || "No description provided"}
          </div>
        </div>
      </div>
      <div className="flex items-center justify-between px-4 py-3 text-white">
        <div className="flex flex-col">
          <span className="text-sm text-white/60">Title</span>
          <span className="text-base font-semibold">{name}</span>
        </div>
        <span className="rounded-lg border border-white/10 bg-black/40 px-3 py-1 text-sm font-semibold text-white/80">
          {year}
        </span>
      </div>
    </div>
  );
};

export default Game;
