import { MAP_HEIGHT, MAP_WIDTH, MOVE_COST, TILE, type TileId } from '../constants';
import type { Vec2 } from '../types';

const DIRS: Vec2[] = [
  { x: 1, y: 0 },
  { x: -1, y: 0 },
  { x: 0, y: 1 },
  { x: 0, y: -1 },
];

export function reachableTiles(
  map: TileId[][],
  start: Vec2,
  movePoints: number,
  blocked: Set<string>,
): Map<string, number> {
  const key = (x: number, y: number) => `${x},${y}`;
  const dist = new Map<string, number>();
  const q: Vec2[] = [{ ...start }];
  dist.set(key(start.x, start.y), 0);

  while (q.length) {
    const cur = q.shift()!;
    const d0 = dist.get(key(cur.x, cur.y))!;
    for (const dir of DIRS) {
      const nx = cur.x + dir.x;
      const ny = cur.y + dir.y;
      if (nx < 0 || ny < 0 || nx >= MAP_WIDTH || ny >= MAP_HEIGHT) continue;
      const tile = map[ny][nx];
      const cost = MOVE_COST[tile] ?? Infinity;
      if (!Number.isFinite(cost)) continue;
      const nk = key(nx, ny);
      if (blocked.has(nk) && !(nx === start.x && ny === start.y)) continue;
      const nd = d0 + cost;
      if (nd > movePoints) continue;
      const prev = dist.get(nk);
      if (prev === undefined || nd < prev) {
        dist.set(nk, nd);
        q.push({ x: nx, y: ny });
      }
    }
  }
  return dist;
}

export function stepToward(from: Vec2, to: Vec2, map: TileId[][], blocked: Set<string>): Vec2 {
  let best: Vec2 = from;
  let bestDist = Infinity;
  const manhattan = (a: Vec2, b: Vec2) => Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
  for (const dir of DIRS) {
    const nx = from.x + dir.x;
    const ny = from.y + dir.y;
    const k = `${nx},${ny}`;
    if (nx < 0 || ny < 0 || nx >= MAP_WIDTH || ny >= MAP_HEIGHT) continue;
    const tile = map[ny][nx];
    if (tile === TILE.CLIFF || tile === TILE.MOUNTAIN) continue;
    if (blocked.has(k)) continue;
    const d = manhattan({ x: nx, y: ny }, to);
    if (d < bestDist) {
      bestDist = d;
      best = { x: nx, y: ny };
    }
  }
  return best;
}
