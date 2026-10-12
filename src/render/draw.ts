import { MAP_HEIGHT, MAP_WIDTH, TILE, TILE_SIZE } from '../constants';
import type { Game } from '../game/Game';

const COLORS: Record<number, string> = {
  [TILE.GRASS]: '#4a7c59',
  [TILE.FOREST]: '#2d5a3d',
  [TILE.WATER]: '#3d6b8c',
  [TILE.CLIFF]: '#5c4a3a',
  [TILE.MOUNTAIN]: '#6b6560',
  [TILE.XP_ORB]: '#4a7c59',
};

export function drawGame(ctx: CanvasRenderingContext2D, game: Game) {
  const { map, kenny, enemies, highlight, telegraphs, phase } = game;

  ctx.fillStyle = '#1a1410';
  ctx.fillRect(0, 0, MAP_WIDTH * TILE_SIZE, MAP_HEIGHT * TILE_SIZE);

  for (let y = 0; y < MAP_HEIGHT; y++) {
    for (let x = 0; x < MAP_WIDTH; x++) {
      const tile = map[y][x];
      const px = x * TILE_SIZE;
      const py = y * TILE_SIZE;
      ctx.fillStyle = COLORS[tile] ?? '#444';
      ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE);
      ctx.strokeStyle = 'rgba(0,0,0,0.12)';
      ctx.strokeRect(px, py, TILE_SIZE, TILE_SIZE);

      if (tile === TILE.FOREST) {
        ctx.fillStyle = '#1e4030';
        ctx.beginPath();
        ctx.arc(px + 16, py + 18, 10, 0, Math.PI * 2);
        ctx.fill();
      }
      if (tile === TILE.WATER) {
        ctx.fillStyle = 'rgba(255,255,255,0.15)';
        ctx.fillRect(px + 4, py + 12, 24, 4);
      }
      if (tile === TILE.MOUNTAIN) {
        ctx.fillStyle = '#8a8580';
        ctx.beginPath();
        ctx.moveTo(px + 4, py + 28);
        ctx.lineTo(px + 16, py + 6);
        ctx.lineTo(px + 28, py + 28);
        ctx.fill();
      }
      if (tile === TILE.CLIFF) {
        ctx.fillStyle = '#3d3228';
        for (let i = 0; i < 3; i++) {
          ctx.fillRect(px + 4 + i * 8, py + 8, 4, 20);
        }
      }
      if (tile === TILE.XP_ORB) {
        ctx.fillStyle = '#e8c547';
        ctx.beginPath();
        ctx.arc(px + 16, py + 16, 6, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  if (phase === 'player') {
    for (const [key] of highlight) {
      if (key === `${kenny.x},${kenny.y}`) continue;
      const [sx, sy] = key.split(',').map(Number);
      ctx.fillStyle = 'rgba(232, 197, 71, 0.35)';
      ctx.fillRect(sx * TILE_SIZE, sy * TILE_SIZE, TILE_SIZE, TILE_SIZE);
    }
  }

  for (const t of telegraphs) {
    ctx.strokeStyle = 'rgba(220, 60, 60, 0.9)';
    ctx.lineWidth = 3;
    ctx.strokeRect(t.x * TILE_SIZE + 4, t.y * TILE_SIZE + 4, TILE_SIZE - 8, TILE_SIZE - 8);
  }

  for (const e of enemies) {
    drawUnit(ctx, e.x, e.y, '#b54a4a', e.name.slice(0, 1));
  }

  drawUnit(ctx, kenny.x, kenny.y, '#4a90c2', 'K');
}

function drawUnit(ctx: CanvasRenderingContext2D, x: number, y: number, color: string, label: string) {
  const px = x * TILE_SIZE;
  const py = y * TILE_SIZE;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(px + 16, py + 16, 12, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 14px "Noto Serif TC", serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(label, px + 16, py + 17);
}
