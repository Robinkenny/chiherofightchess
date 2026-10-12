/** 對標 PokéSurvivor 類型地圖的可玩區域尺度（42×36 格） */
export const MAP_WIDTH = 42;
export const MAP_HEIGHT = 36;
export const TILE_SIZE = 32;

export const TILE = {
  GRASS: 0,
  FOREST: 1,
  WATER: 2,
  CLIFF: 3,
  MOUNTAIN: 4,
  XP_ORB: 5,
} as const;

export type TileId = (typeof TILE)[keyof typeof TILE];

export const MOVE_COST: Record<number, number> = {
  [TILE.GRASS]: 1,
  [TILE.FOREST]: 2,
  [TILE.WATER]: 2,
  [TILE.XP_ORB]: 1,
  [TILE.CLIFF]: Infinity,
  [TILE.MOUNTAIN]: Infinity,
};
