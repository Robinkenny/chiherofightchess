import { TILE_SIZE } from '../../constants';
import { dynastyStyle, hashHue, INK } from './palette';

export type UnitKind = 'kenny' | 'hero';

export function drawWarriorToken(
  ctx: CanvasRenderingContext2D,
  px: number,
  py: number,
  label: string,
  kind: UnitKind,
  heroId?: string,
  dynasty?: string,
  role?: string,
) {
  const cx = px + TILE_SIZE / 2;
  const cy = py + TILE_SIZE / 2 - 2;

  ctx.save();

  // 影子
  ctx.fillStyle = 'rgba(0,0,0,0.35)';
  ctx.beginPath();
  ctx.ellipse(cx, cy + 14, 11, 4, 0, 0, Math.PI * 2);
  ctx.fill();

  const accent = dynasty ? dynastyStyle(dynasty) : { rim: INK.gold, banner: INK.jade };
  const hue = heroId ? hashHue(heroId) : 200;
  const robe =
    kind === 'kenny'
      ? '#4a6741'
      : `hsl(${hue}, ${42 + (heroId?.length ?? 0) % 20}%, ${38 + (hashHue(heroId ?? 'x') % 15)}%)`;

  // 金框底（武將卡風）
  ctx.fillStyle = accent.rim;
  ctx.beginPath();
  ctx.arc(cx, cy, 15, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#1a1208';
  ctx.beginPath();
  ctx.arc(cx, cy, 13, 0, Math.PI * 2);
  ctx.fill();

  // 頭像剪影
  drawPortraitSilhouette(ctx, cx, cy, robe, kind, role);

  // 名號旗
  ctx.fillStyle = accent.banner;
  ctx.fillRect(cx - 14, cy + 10, 28, 10);
  ctx.strokeStyle = INK.goldLight;
  ctx.lineWidth = 1;
  ctx.strokeRect(cx - 14, cy + 10, 28, 10);

  ctx.fillStyle = '#fff8e7';
  ctx.font = 'bold 9px "ZCOOL XiaoWei", "Noto Serif TC", serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(label.slice(0, 1), cx, cy + 15);

  if (kind === 'kenny') {
    ctx.fillStyle = INK.goldLight;
    ctx.font = '8px serif';
    ctx.fillText('民', cx, cy - 17);
  }

  ctx.restore();
}

function drawPortraitSilhouette(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  robe: string,
  kind: UnitKind,
  role?: string,
) {
  // 臉
  ctx.fillStyle = '#e8c4a0';
  ctx.beginPath();
  ctx.ellipse(cx, cy - 2, 6, 7, 0, 0, Math.PI * 2);
  ctx.fill();

  // 髮／冠
  ctx.fillStyle = INK.ink;
  if (kind === 'kenny') {
    ctx.fillRect(cx - 7, cy - 10, 14, 5);
  } else if (role === 'archer') {
    ctx.beginPath();
    ctx.moveTo(cx - 8, cy - 6);
    ctx.lineTo(cx, cy - 14);
    ctx.lineTo(cx + 8, cy - 6);
    ctx.fill();
  } else if (role === 'strategist') {
    ctx.fillStyle = '#2a2a2a';
    ctx.fillRect(cx - 9, cy - 12, 18, 6);
    ctx.fillStyle = INK.gold;
    ctx.fillRect(cx - 2, cy - 14, 4, 8);
  } else if (role === 'leader') {
    ctx.fillStyle = INK.crimsonBright;
    ctx.beginPath();
    ctx.moveTo(cx - 9, cy - 5);
    ctx.lineTo(cx, cy - 16);
    ctx.lineTo(cx + 9, cy - 5);
    ctx.fill();
    ctx.fillStyle = INK.gold;
    ctx.beginPath();
    ctx.arc(cx, cy - 12, 3, 0, Math.PI * 2);
    ctx.fill();
  } else {
    // warrior default — 武將盔
    ctx.fillStyle = '#4a3020';
    ctx.beginPath();
    ctx.arc(cx, cy - 8, 8, Math.PI, 0);
    ctx.fill();
    ctx.fillStyle = INK.gold;
    ctx.fillRect(cx - 1, cy - 16, 2, 6);
  }

  // 袍服
  ctx.fillStyle = robe;
  ctx.beginPath();
  ctx.moveTo(cx - 10, cy + 4);
  ctx.lineTo(cx + 10, cy + 4);
  ctx.lineTo(cx + 8, cy + 12);
  ctx.lineTo(cx - 8, cy + 12);
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = 'rgba(255,255,255,0.15)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(cx, cy + 4);
  ctx.lineTo(cx, cy + 12);
  ctx.stroke();
}
