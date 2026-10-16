import { API_BASE_URL } from "@/lib/api";
import { fetchWithAuth, readErrorMessage } from "@/lib/fetchWithAuth";
import { invalidateGameDetailCache } from "@/lib/gameDetailCache";
import { invalidateListCache } from "@/lib/listCache";
import type { GameDetail, GameUpdatePayload } from "@/lib/types";

export type GameStats = {
  total: number;
  completed: number;
  backlog: number;
  hundredPercent: number;
  favourites: number;
  /** Completed games per year, newest year first. */
  byYear: { year: number; count: number }[];
};

// Saves a game and drops every cache that could still show the old version:
// the game may move between lists (year, favourite, 100%, backlog), and the
// detail page keeps its own copy. Returns the game as the backend saved it.
export async function updateGame(
  id: string,
  payload: GameUpdatePayload
): Promise<Partial<GameDetail> | undefined> {
  const res = await fetchWithAuth(`${API_BASE_URL}/admin/games/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    throw new Error(await readErrorMessage(res, "Failed to update game."));
  }
  invalidateGameDetailCache(id);
  invalidateListCache("games:");
  const data = (await res.json().catch(() => undefined)) as
    | { item?: Partial<GameDetail> }
    | undefined;
  return data?.item;
}

export async function deleteGame(id: string): Promise<void> {
  const res = await fetchWithAuth(`${API_BASE_URL}/admin/games/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) {
    throw new Error(await readErrorMessage(res, "Failed to delete game."));
  }
  invalidateGameDetailCache(id);
  invalidateListCache("games:");
}

export async function fetchStats(): Promise<GameStats> {
  const res = await fetchWithAuth(`${API_BASE_URL}/admin/stats`);
  if (!res.ok) {
    throw new Error(await readErrorMessage(res, "Failed to load stats."));
  }
  return (await res.json()) as GameStats;
}
