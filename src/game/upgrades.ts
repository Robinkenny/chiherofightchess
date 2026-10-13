import type { KennyState, UpgradeCard } from '../types';

const pool: UpgradeCard[] = [
  {
    id: 'footwork',
    title: '凌波微步',
    description: '移動力 +1',
    apply: (k) => {
      k.move += 1;
    },
  },
  {
    id: 'hide',
    title: '草間隱形',
    description: '閃避率 +8%',
    apply: (k) => {
      k.dodge = Math.min(0.55, k.dodge + 0.08);
    },
  },
  {
    id: 'vitality',
    title: '養生訣',
    description: '最大生命 +25 並回滿',
    apply: (k) => {
      k.maxHp += 25;
      k.hp = k.maxHp;
    },
  },
  {
    id: 'scholar',
    title: '韋編三絕',
    description: '獲得經驗 +20%',
    apply: () => {
      /* tracked via upgrade id */
    },
  },
  {
    id: 'armor',
    title: '布衣護心',
    description: '受到傷害 -15%',
    apply: () => {},
  },
  {
    id: 'scout',
    title: '登高望遠',
    description: '可見敵將技能冷卻（介面提示）',
    apply: () => {},
  },
  {
    id: 'dash',
    title: '急行軍',
    description: '每三回合額外多走一格（自動）',
    apply: () => {},
  },
  {
    id: 'calm',
    title: '處變不驚',
    description: '被命中後本回合再獲一次閃避加成',
    apply: (k) => {
      k.dodge = Math.min(0.5, k.dodge + 0.05);
    },
  },
];

export function pickUpgradeChoices(kenny: KennyState, count = 3): UpgradeCard[] {
  const owned = new Set(kenny.upgrades);
  const available = pool.filter((c) => !owned.has(c.id) || c.id === 'hide' || c.id === 'vitality');
  const shuffled = [...available].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

export function xpMultiplier(kenny: KennyState): number {
  return kenny.upgrades.includes('scholar') ? 1.2 : 1;
}

export function damageTakenMultiplier(kenny: KennyState): number {
  return kenny.upgrades.includes('armor') ? 0.85 : 1;
}
