import { MAP_HEIGHT, MAP_WIDTH, TILE, type TileId } from '../constants';

function rnd(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 0xffffffff;
  };
}

export function generateAncientMap(seed = 20261012): TileId[][] {
  const rand = rnd(seed);
  const map: TileId[][] = [];
  for (let y = 0; y < MAP_HEIGHT; y++) {
    map[y] = [];
    for (let x = 0; x < MAP_WIDTH; x++) {
      map[y][x] = TILE.GRASS;
    }
  }

  // 邊界懸崖
  for (let x = 0; x < MAP_WIDTH; x++) {
    map[0][x] = TILE.CLIFF;
    map[MAP_HEIGHT - 1][x] = TILE.CLIFF;
  }
  for (let y = 0; y < MAP_HEIGHT; y++) {
    map[y][0] = TILE.CLIFF;
    map[y][MAP_WIDTH - 1] = TILE.CLIFF;
  }

  // 山脈叢
  for (let i = 0; i < 28; i++) {
    const cx = 3 + Math.floor(rand() * (MAP_WIDTH - 6));
    const cy = 3 + Math.floor(rand() * (MAP_HEIGHT - 6));
    const r = 1 + Math.floor(rand() * 3);
    for (let dy = -r; dy <= r; dy++) {
      for (let dx = -r; dx <= r; dx++) {
        if (dx * dx + dy * dy > r * r + 1) continue;
        const x = cx + dx;
        const y = cy + dy;
        if (x <= 1 || y <= 1 || x >= MAP_WIDTH - 2 || y >= MAP_HEIGHT - 2) continue;
        map[y][x] = rand() > 0.35 ? TILE.MOUNTAIN : TILE.FOREST;
      }
    }
  }

  // 河流
  let rx = 4 + Math.floor(rand() * 8);
  let ry = 2;
  while (ry < MAP_HEIGHT - 2) {
    map[ry][rx] = TILE.WATER;
    if (rand() > 0.55 && rx < MAP_WIDTH - 4) rx++;
    else if (rand() > 0.5 && rx > 3) rx--;
    ry++;
  }

  // 樹林
  for (let i = 0; i < 120; i++) {
    const x = 2 + Math.floor(rand() * (MAP_WIDTH - 4));
    const y = 2 + Math.floor(rand() * (MAP_HEIGHT - 4));
    if (map[y][x] === TILE.GRASS) map[y][x] = TILE.FOREST;
  }

  // 中央清出出生安全區
  const cx = Math.floor(MAP_WIDTH / 2);
  const cy = Math.floor(MAP_HEIGHT / 2);
  for (let dy = -2; dy <= 2; dy++) {
    for (let dx = -2; dx <= 2; dx++) {
      if (map[cy + dy][cx + dx] !== TILE.WATER) map[cy + dy][cx + dx] = TILE.GRASS;
    }
  }

  // 經驗珠
  for (let i = 0; i < 45; i++) {
    const x = 2 + Math.floor(rand() * (MAP_WIDTH - 4));
    const y = 2 + Math.floor(rand() * (MAP_HEIGHT - 4));
    if (map[y][x] === TILE.GRASS) map[y][x] = TILE.XP_ORB;
  }

  return map;
}

export function isWalkable(map: TileId[][], x: number, y: number): boolean {
  if (x < 0 || y < 0 || x >= MAP_WIDTH || y >= MAP_HEIGHT) return false;
  const t = map[y][x];
  return t !== TILE.CLIFF && t !== TILE.MOUNTAIN;
}
