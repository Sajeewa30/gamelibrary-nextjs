export type GameType = {
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
  completed?: boolean;
  hundredPercent?: boolean;
  favourite?: boolean;
  specialDescription: string;
  imageUrl: string;
};

export type GameUpdatePayload = {
  name: string;
  year: number;
  completedYear: number;
  isCompleted: boolean;
  isHundredPercent: boolean;
  isFavourite: boolean;
  completed?: boolean;
  hundredPercent?: boolean;
  favourite?: boolean;
  specialDescription: string;
  imageUrl: string;
};

export const resolveGameId = (game: Pick<GameType, "id" | "_id" | "gameId" | "itemId">): string => {
  if (game.id) return game.id.toString();
  if (game._id) return game._id.toString();
  if (game.gameId) return game.gameId.toString();
  if (game.itemId) return game.itemId.toString();
  return "";
};
