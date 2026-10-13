import { Game } from './game/Game';
import { drawGame, tickRenderFrame } from './render/draw';
import { renderSidebar } from './ui/sidebar';
import type { HeroesData } from './types';
import { MAP_HEIGHT, MAP_WIDTH, TILE_SIZE } from './constants';

async function loadHeroes(): Promise<HeroesData> {
  const res = await fetch('/data/heroes.json');
  if (!res.ok) throw new Error('無法載入 heroes.json');
  return res.json();
}

function showOverlay(html: string, visible: boolean) {
  const el = document.getElementById('overlay')!;
  el.innerHTML = html;
  el.classList.toggle('hidden', !visible);
}

async function main() {
  const canvas = document.getElementById('game') as HTMLCanvasElement;
  const ctx = canvas.getContext('2d')!;
  const sidebar = document.getElementById('sidebar')!;

  canvas.width = MAP_WIDTH * TILE_SIZE;
  canvas.height = MAP_HEIGHT * TILE_SIZE;

  const data = await loadHeroes();
  let game = new Game(data);

  const refreshUi = () => {
    renderSidebar(sidebar, game, () => {
      game.waitTurn();
      refreshUi();
    }, () => {
      game.reset();
      refreshUi();
    });

    if (game.phase === 'won') {
      showOverlay('<div class="modal win"><h2>大捷</h2><p>Kenny 已達 20 級，成功在百將追擊下求生！</p></div>', true);
    } else if (game.phase === 'lost') {
      showOverlay('<div class="modal lose"><h2>兵敗</h2><p>被古代名將擊倒。點「重新開始」再戰。</p></div>', true);
    } else {
      showOverlay('', false);
    }
  };

  const handlePointer = (clientX: number, clientY: number) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = Math.floor(((clientX - rect.left) * scaleX) / TILE_SIZE);
    const y = Math.floor(((clientY - rect.top) * scaleY) / TILE_SIZE);
    if (game.tryMoveKenny(x, y)) refreshUi();
  };

  canvas.addEventListener('click', (ev) => {
    handlePointer(ev.clientX, ev.clientY);
  });

  canvas.addEventListener(
    'touchend',
    (ev) => {
      const t = ev.changedTouches[0];
      if (!t) return;
      ev.preventDefault();
      handlePointer(t.clientX, t.clientY);
    },
    { passive: false },
  );

  refreshUi();

  const paintLoop = () => {
    tickRenderFrame();
    drawGame(ctx, game);
    requestAnimationFrame(paintLoop);
  };
  requestAnimationFrame(paintLoop);
}

main().catch((err) => {
  console.error(err);
  document.body.innerHTML = `<p class="error">載入失敗：${err.message}</p>`;
});
