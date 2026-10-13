export interface HeroSkill {
  id: string;
  name: string;
  description: string;
  type: string;
  basePower: number;
  cooldown: number;
  scalingPerKennyLevel: number;
}

export interface HeroDef {
  id: string;
  name: string;
  dynasty: string;
  role: string;
  baseStats: {
    hp: number;
    attack: number;
    range: number;
    move: number;
  };
  skill: HeroSkill;
}

export interface HeroesData {
  version: number;
  description: string;
  protagonist: {
    id: string;
    name: string;
    title: string;
    baseStats: { hp: number; move: number; dodge: number };
  };
  spawnRules: {
    initialActiveCount: number;
    maxActiveOnMap: number;
    respawnEveryTurns: number;
    enemyBaseLevel: number;
  };
  victory: { targetLevel: number };
  heroes: HeroDef[];
}

export interface Vec2 {
  x: number;
  y: number;
}

export interface EnemyUnit {
  uid: number;
  heroId: string;
  name: string;
  x: number;
  y: number;
  hp: number;
  maxHp: number;
  attack: number;
  range: number;
  move: number;
  level: number;
  skill: HeroSkill;
  skillCooldown: number;
  stunned: boolean;
}

export interface KennyState {
  x: number;
  y: number;
  hp: number;
  maxHp: number;
  move: number;
  dodge: number;
  level: number;
  xp: number;
  xpToNext: number;
  upgrades: string[];
}

export type UpgradeCard = {
  id: string;
  title: string;
  description: string;
  apply: (k: KennyState) => void;
};
