import { RealtimeGame } from './rt/RealtimeGame';
import { Scene3D } from './rt/Scene3D';
import { InputController } from './rt/input';
import { renderRealtimeSidebar } from './ui/sidebarRt';
import type { HeroesData } from './types';

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
  const sidebar = document.getElementById('sidebar')!;
  const wrap = document.querySelector('.canvas-wrap') as HTMLElement;

  const data = await loadHeroes();
  let game = new RealtimeGame(data);
  let scene = new Scene3D(canvas, wrap, game);
  const input = new InputController();
  input.bind();

  let uiThrottle = 0;

  const refreshUi = () => {
    renderRealtimeSidebar(sidebar, game, () => {
      scene.dispose();
      game = new RealtimeGame(data);
      scene = new Scene3D(canvas, wrap, game);
      refreshUi();
    });

    if (game.phase === 'won') {
      showOverlay('<div class="modal win"><h2>大捷</h2><p>Kenny 在 3D 戰場達 20 級！</p></div>', true);
    } else if (game.phase === 'lost') {
      showOverlay('<div class="modal lose"><h2>兵敗</h2><p>被名將擊倒。按重新開始。</p></div>', true);
    } else {
      showOverlay('', false);
    }
  };

  refreshUi();

  const loop = () => {
    const { x, z } = input.getMoveVector();
    scene.tick(x, z, () => {
      uiThrottle++;
      if (uiThrottle % 12 === 0) refreshUi();
    });
    requestAnimationFrame(loop);
  };
  requestAnimationFrame(loop);

  if (wrap) {
    const ro = new ResizeObserver(() => scene.resize());
    ro.observe(wrap);
  }
}

main().catch((err) => {
  console.error(err);
  document.body.innerHTML = `<p class="error">載入失敗：${err.message}</p>`;
});
