import { TILE, TILE_SIZE, type TileId } from '../../constants';
import { INK } from './palette';

let grassPat: CanvasPattern | null = null;
let paperPat: CanvasPattern | null = null;

function makePattern(
  w: number,
  h: number,
  draw: (c: CanvasRenderingContext2D) => void,
): CanvasPattern {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const ctx = c.getContext('2d')!;
  draw(ctx);
  const p = ctx.createPattern(c, 'repeat');
  if (!p) throw new Error('pattern');
  return p;
}

export function initTilePatterns() {
  grassPat = makePattern(16, 16, (g) => {
    g.fillStyle = '#5a7c52';
    g.fillRect(0, 0, 16, 16);
    g.fillStyle = '#4a6c42';
    g.fillRect(0, 8, 16, 2);
    g.fillStyle = '#6a8c62';
    for (let i = 0; i < 4; i++) g.fillRect((i * 4) % 16, (i * 3) % 16, 1, 1);
  });
  paperPat = makePattern(32, 32, (g) => {
    g.fillStyle = INK.paper;
    g.fillRect(0, 0, 32, 32);
    g.fillStyle = 'rgba(60,40,20,0.04)';
    for (let i = 0; i < 8; i++) {
      g.fillRect((i * 7) % 32, (i * 11) % 32, 2, 1);
    }
  });
}

export function drawTileBase(
  ctx: CanvasRenderingContext2D,
  tile: TileId,
  px: number,
  py: number,
  frame: number,
) {
  if (!grassPat || !paperPat) initTilePatterns();

  ctx.save();
  ctx.translate(px, py);

  switch (tile) {
    case TILE.GRASS:
    case TILE.XP_ORB:
      ctx.fillStyle = paperPat!;
      ctx.fillRect(0, 0, TILE_SIZE, TILE_SIZE);
      ctx.fillStyle = grassPat!;
      ctx.globalAlpha = 0.55;
      ctx.fillRect(0, 0, TILE_SIZE, TILE_SIZE);
      ctx.globalAlpha = 1;
      break;
    case TILE.FOREST:
      ctx.fillStyle = '#3d5c38';
      ctx.fillRect(0, 0, TILE_SIZE, TILE_SIZE);
      drawBamboo(ctx);
      break;
    case TILE.WATER:
      ctx.fillStyle = INK.river;
      ctx.fillRect(0, 0, TILE_SIZE, TILE_SIZE);
      ctx.fillStyle = 'rgba(180,220,255,0.25)';
      const wave = (frame % 60) / 60;
      for (let i = 0; i < 3; i++) {
        ctx.fillRect(2, 8 + i * 9 + wave * 4, 28, 2);
      }
      break;
    case TILE.MOUNTAIN:
      ctx.fillStyle = INK.paperDark;
      ctx.fillRect(0, 0, TILE_SIZE, TILE_SIZE);
      drawInkMountain(ctx, 16, 20, 14, '#5c5348', '#8a8070');
      drawInkMountain(ctx, 10, 24, 10, '#4a4238', '#6a6258');
      drawInkMountain(ctx, 22, 26, 8, '#3a3228', '#5a5248');
      break;
    case TILE.CLIFF:
      ctx.fillStyle = '#4a3728';
      ctx.fillRect(0, 0, TILE_SIZE, TILE_SIZE);
      for (let i = 0; i < 4; i++) {
        ctx.fillStyle = i % 2 ? '#3d2e22' : '#5c4634';
        ctx.fillRect(2 + i * 7, 4, 6, TILE_SIZE - 6);
      }
      ctx.strokeStyle = INK.inkSoft;
      ctx.lineWidth = 1;
      ctx.strokeRect(1, 1, TILE_SIZE - 2, TILE_SIZE - 2);
      break;
    default:
      ctx.fillStyle = '#444';
      ctx.fillRect(0, 0, TILE_SIZE, TILE_SIZE);
  }

  ctx.strokeStyle = 'rgba(26,18,8,0.08)';
  ctx.strokeRect(0, 0, TILE_SIZE, TILE_SIZE);

  if (tile === TILE.XP_ORB) {
    drawSpiritOrb(ctx, frame);
  }

  ctx.restore();
}

function drawBamboo(ctx: CanvasRenderingContext2D) {
  for (let i = 0; i < 3; i++) {
    const bx = 6 + i * 10;
    ctx.strokeStyle = '#2a4a28';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(bx, 28);
    ctx.lineTo(bx, 6);
    ctx.stroke();
    ctx.strokeStyle = '#1e3820';
    ctx.lineWidth = 1;
    for (let s = 0; s < 4; s++) {
      ctx.beginPath();
      ctx.moveTo(bx - 6, 10 + s * 6);
      ctx.lineTo(bx, 8 + s * 6);
      ctx.stroke();
    }
  }
}

function drawInkMountain(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  r: number,
  dark: string,
  light: string,
) {
  const g = ctx.createLinearGradient(cx, cy - r, cx, cy + r);
  g.addColorStop(0, light);
  g.addColorStop(1, dark);
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.moveTo(cx - r, cy + r);
  ctx.lineTo(cx, cy - r);
  ctx.lineTo(cx + r, cy + r);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = INK.mist;
  ctx.fillRect(cx - r * 0.6, cy - r * 0.2, r * 1.2, r * 0.35);
}

function drawSpiritOrb(ctx: CanvasRenderingContext2D, frame: number) {
  const pulse = 0.85 + Math.sin(frame / 15) * 0.15;
  ctx.fillStyle = `rgba(201, 162, 39, ${0.35 * pulse})`;
  ctx.beginPath();
  ctx.arc(16, 16, 12 * pulse, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = INK.goldLight;
  ctx.beginPath();
  ctx.arc(16, 16, 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = INK.crimsonBright;
  ctx.lineWidth = 1;
  ctx.stroke();
}

export function drawMapBorder(ctx: CanvasRenderingContext2D, w: number, h: number) {
  ctx.strokeStyle = INK.gold;
  ctx.lineWidth = 4;
  ctx.strokeRect(2, 2, w - 4, h - 4);
  ctx.strokeStyle = INK.crimson;
  ctx.lineWidth = 1;
  ctx.strokeRect(6, 6, w - 12, h - 12);
}
