import { MAP_HEIGHT, MAP_WIDTH, TILE_SIZE } from '../constants';
import type { Game } from '../game/Game';
import { drawMapBorder, drawTileBase, initTilePatterns } from './art/tileSprites';
import { drawWarriorToken } from './art/warriorToken';
import { INK } from './art/palette';

let animFrame = 0;
let patternsReady = false;

export function tickRenderFrame() {
  animFrame++;
}

export function drawGame(ctx: CanvasRenderingContext2D, game: Game) {
  if (!patternsReady) {
    initTilePatterns();
    patternsReady = true;
  }

  const { map, kenny, enemies, highlight, telegraphs, phase } = game;
  const w = MAP_WIDTH * TILE_SIZE;
  const h = MAP_HEIGHT * TILE_SIZE;

  // 宣紙底
  ctx.fillStyle = INK.paperDark;
  ctx.fillRect(0, 0, w, h);

  for (let y = 0; y < MAP_HEIGHT; y++) {
    for (let x = 0; x < MAP_WIDTH; x++) {
      drawTileBase(ctx, map[y][x], x * TILE_SIZE, y * TILE_SIZE, animFrame);
    }
  }

  if (phase === 'player') {
    for (const [key] of highlight) {
      if (key === `${kenny.x},${kenny.y}`) continue;
      const [sx, sy] = key.split(',').map(Number);
      ctx.fillStyle = 'rgba(201, 162, 39, 0.42)';
      ctx.fillRect(sx * TILE_SIZE, sy * TILE_SIZE, TILE_SIZE, TILE_SIZE);
      ctx.strokeStyle = INK.crimsonBright;
      ctx.lineWidth = 2;
      ctx.strokeRect(sx * TILE_SIZE + 2, sy * TILE_SIZE + 2, TILE_SIZE - 4, TILE_SIZE - 4);
    }
  }

  for (const t of telegraphs) {
    ctx.strokeStyle = 'rgba(196, 43, 43, 0.95)';
    ctx.lineWidth = 3;
    ctx.setLineDash([6, 4]);
    ctx.strokeRect(t.x * TILE_SIZE + 3, t.y * TILE_SIZE + 3, TILE_SIZE - 6, TILE_SIZE - 6);
    ctx.setLineDash([]);
  }

  const heroLookup = new Map(game.heroesData.heroes.map((h) => [h.id, h]));

  for (const e of enemies) {
    const def = heroLookup.get(e.heroId);
    drawWarriorToken(
      ctx,
      e.x * TILE_SIZE,
      e.y * TILE_SIZE,
      e.name,
      'hero',
      e.heroId,
      def?.dynasty,
      def?.role,
    );
  }

  drawWarriorToken(ctx, kenny.x * TILE_SIZE, kenny.y * TILE_SIZE, 'Kenny', 'kenny');

  drawMapBorder(ctx, w, h);
}
