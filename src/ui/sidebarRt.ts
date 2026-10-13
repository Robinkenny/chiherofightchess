import type { RealtimeGame } from '../rt/RealtimeGame';

export function renderRealtimeSidebar(
  root: HTMLElement,
  game: RealtimeGame,
  onReset: () => void,
) {
  const { kenny, phase, log, pendingUpgrades, heroesData, elapsed } = game;
  const pct = Math.min(100, Math.round((kenny.xp / kenny.xpToNext) * 100));
  const mins = Math.floor(elapsed / 60);
  const secs = Math.floor(elapsed % 60);

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
      <p>存活 ${mins}:${secs.toString().padStart(2, '0')} · ${phaseLabel(phase)}</p>
      <p>追擊將領 ${game.enemies.length} · 已登場 ${game.usedHeroCount}/${heroesData.heroes.length}</p>
    </section>
    ${upgradeHtml}
    <section class="actions">
      <button type="button" id="btn-reset">重新開始</button>
    </section>
    <section class="help">
      <h3>操作（即時 3D）</h3>
      <ul>
        <li><strong>W A S D</strong> 或方向鍵移動</li>
        <li>手機：左下虛擬搖桿</li>
        <li>避開將領攻擊，拾取金色經驗珠</li>
        <li>敵將會隨你的等級變強</li>
      </ul>
    </section>
    <section class="log">
      <h3>戰報</h3>
      <ul>${log.map((l) => `<li>${l}</li>`).join('')}</ul>
    </section>
  `;

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
    case 'playing':
      return '激戰中';
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
