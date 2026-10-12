import type { Game } from '../game/Game';

export function renderSidebar(root: HTMLElement, game: Game, onWait: () => void, onReset: () => void) {
  const { kenny, phase, turn, log, pendingUpgrades, heroesData } = game;
  const pct = Math.min(100, Math.round((kenny.xp / kenny.xpToNext) * 100));

  let upgradeHtml = '';
  if (phase === 'levelup') {
    upgradeHtml = `<div class="levelup-panel"><h3>升級！選擇一項獎勵</h3><div class="cards">`;
    for (const c of pendingUpgrades) {
      upgradeHtml += `<button type="button" class="card" data-upgrade="${c.id}"><strong>${c.title}</strong><span>${c.description}</span></button>`;
    }
    upgradeHtml += `</div></div>`;
  }

  root.innerHTML = `
    <section class="stat-block">
      <h2>${heroesData.protagonist.name} · ${heroesData.protagonist.title}</h2>
      <p>等級 <strong>${kenny.level}</strong> / 目標 ${heroesData.victory.targetLevel}</p>
      <p>生命 ${kenny.hp} / ${kenny.maxHp}</p>
      <p>移動 ${kenny.move} · 閃避 ${Math.round(kenny.dodge * 100)}%</p>
      <div class="xp-bar"><div style="width:${pct}%"></div></div>
      <p class="xp-label">經驗 ${kenny.xp} / ${kenny.xpToNext}</p>
      <p>回合 ${turn} · 階段 ${phaseLabel(phase)}</p>
      <p>場上將領 ${game.enemies.length} · 圖鑑已登場 ${game.usedHeroCount} / ${heroesData.heroes.length}</p>
    </section>
    ${upgradeHtml}
    <section class="actions">
      <button type="button" id="btn-wait" ${phase !== 'player' ? 'disabled' : ''}>待機（+經驗）</button>
      <button type="button" id="btn-reset">重新開始</button>
    </section>
    <section class="help">
      <h3>操作</h3>
      <ul>
        <li>黃色格：Kenny 可移動範圍（戰棋回合制）</li>
        <li>點擊／點按地圖移動；收集金黃經驗珠升級更快</li>
        <li>手機：地圖可雙指捲動查看，黃格為可移動範圍</li>
        <li>敵將能力隨你的等級變強，初時較弱</li>
        <li>修改 <code>public/data/heroes.json</code> 可調整百將技能</li>
      </ul>
    </section>
    <section class="log">
      <h3>戰報</h3>
      <ul>${log.map((l) => `<li>${l}</li>`).join('')}</ul>
    </section>
  `;

  root.querySelector('#btn-wait')?.addEventListener('click', onWait);
  root.querySelector('#btn-reset')?.addEventListener('click', onReset);
  root.querySelectorAll('[data-upgrade]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = (btn as HTMLElement).dataset.upgrade;
      if (id) game.chooseUpgrade(id);
    });
  });
}

function phaseLabel(p: string): string {
  switch (p) {
    case 'player':
      return 'Kenny 回合';
    case 'enemy':
      return '將領回合';
    case 'levelup':
      return '選擇升級';
    case 'won':
      return '勝利';
    case 'lost':
      return '戰敗';
    default:
      return p;
  }
}
