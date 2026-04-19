"use client";

import Game from "@/components/game";
import { resolveGameId, type GameType, type GameUpdatePayload } from "@/lib/types";

type Props = {
  games: GameType[];
  loading: boolean;
  error: string | null;
  deletingId: string | null;
  emptyMessage: string;
  onDelete: (id: string) => Promise<void>;
  onUpdate: (id: string, payload: GameUpdatePayload) => Promise<void>;
};

const GameGrid = ({
  games,
  loading,
  error,
  deletingId,
  emptyMessage,
  onDelete,
  onUpdate,
}: Props) => {
  if (error) {
    return (
      <div className="rounded-xl border border-red-400/40 bg-red-500/10 px-4 py-3 text-sm text-red-100">
        {error}
      </div>
    );
  }
  if (loading && games.length === 0) {
    return <p className="text-white/70 text-lg">Loading games...</p>;
  }
  if (games.length === 0) {
    return <p className="text-white/70 text-lg">{emptyMessage}</p>;
  }
  return (
    <>
      {games.map((game) => (
        <Game
          key={resolveGameId(game) || `${game.name}-${game.year}`}
          game={game}
          showActions
          onDelete={onDelete}
          onUpdate={onUpdate}
          disableDelete={deletingId === resolveGameId(game)}
        />
      ))}
    </>
  );
};

export default GameGrid;
