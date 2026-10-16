'use client';
import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import GameEditDialog from "@/components/gameEditDialog";
import { resolveGameId, type GameType, type GameUpdatePayload } from "@/lib/types";
import { isValidHttpUrl } from "@/lib/url";

type GameProps = {
  game: GameType;
  showActions?: boolean;
  onDelete?: (id: string) => void;
  onUpdate?: (id: string, payload: GameUpdatePayload) => Promise<void>;
  disableDelete?: boolean;
  clickable?: boolean;
};

const Game = ({
  game,
  showActions = false,
  onDelete,
  onUpdate,
  disableDelete = false,
  clickable = true,
}: GameProps) => {
  const resolvedId = useMemo(() => resolveGameId(game), [game]);

  const hasValidImage = isValidHttpUrl(game.imageUrl);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [editing, setEditing] = useState(false);

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

  return (
    <div className="group relative w-[280px] overflow-hidden rounded-2xl border border-white/10 bg-white/5 shadow-lg shadow-black/30 backdrop-blur-xl transition hover:-translate-y-1 hover:border-white/20 hover:bg-white/10">
      {showActions && resolvedId && (
        <div className="absolute right-3 top-3 z-10 flex flex-col items-end gap-2">
          <button
            onClick={() => setMenuOpen((p) => !p)}
            aria-label={`Actions for ${game.name}`}
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-black/60 text-white shadow-sm shadow-black/40 transition hover:border-white/50 hover:bg-white/10"
          >
            <span aria-hidden="true">⋯</span>
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
        {clickable ? (
          <Link href={`/game/${resolvedId || ""}`} className="relative block h-full w-full">
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
          </Link>
        ) : hasValidImage ? (
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

      {editing && resolvedId && onUpdate && (
        <GameEditDialog
          game={game}
          onClose={() => setEditing(false)}
          onSave={(payload) => onUpdate(resolvedId, payload)}
        />
      )}
    </div>
  );
};

export default Game;
