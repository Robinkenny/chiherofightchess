import { MAP_HEIGHT, MAP_WIDTH, TILE, type TileId } from '../constants';
import { generateAncientMap, isWalkable } from '../map/generateMap';
import { reachableTiles, stepToward } from './pathfinding';
import { resolveEnemyStrike, scaledAttack } from './skills';
import { damageTakenMultiplier, pickUpgradeChoices, xpMultiplier } from './upgrades';
import type { EnemyUnit, HeroesData, KennyState, UpgradeCard, Vec2 } from '../types';

export type GamePhase = 'player' | 'enemy' | 'levelup' | 'won' | 'lost';

export class Game {
  map: TileId[][];
  kenny: KennyState;
  enemies: EnemyUnit[] = [];
  heroesData: HeroesData;
  turn = 1;
  phase: GamePhase = 'player';
  log: string[] = [];
  pendingUpgrades: UpgradeCard[] = [];
  private nextUid = 1;
  private respawnCounter = 0;
  highlight: Map<string, number> = new Map();
  telegraphs: Vec2[] = [];
  usedHeroIds = new Set<string>();

  get usedHeroCount(): number {
    return this.usedHeroIds.size;
  }

  constructor(data: HeroesData) {
    this.heroesData = data;
    this.map = generateAncientMap();
    const cx = Math.floor(MAP_WIDTH / 2);
    const cy = Math.floor(MAP_HEIGHT / 2);
    const p = data.protagonist.baseStats;
    this.kenny = {
      x: cx,
      y: cy,
      hp: p.hp,
      maxHp: p.hp,
      move: p.move,
      dodge: p.dodge,
      level: 1,
      xp: 0,
      xpToNext: 40,
      upgrades: [],
    };
    for (let i = 0; i < data.spawnRules.initialActiveCount; i++) {
      this.spawnEnemy();
    }
    this.refreshReachable();
    this.logMsg('Kenny 踏入Ancient battlefield。避開百將，升級至 20 級！');
  }

  private logMsg(msg: string) {
    this.log.unshift(msg);
    this.log = this.log.slice(0, 12);
  }

  private spawnEnemy(at?: Vec2) {
    const defs = this.heroesData.heroes.filter((h) => !this.usedHeroIds.has(h.id));
    const pick = defs[Math.floor(Math.random() * defs.length)] ?? this.heroesData.heroes[0];
    this.usedHeroIds.add(pick.id);
    const pos = at ?? this.randomEdgeSpawn();
    const lvl = this.heroesData.spawnRules.enemyBaseLevel;
    const e: EnemyUnit = {
      uid: this.nextUid++,
      heroId: pick.id,
      name: pick.name,
      x: pos.x,
      y: pos.y,
      hp: pick.baseStats.hp,
      maxHp: pick.baseStats.hp,
      attack: pick.baseStats.attack,
      range: pick.baseStats.range,
      move: pick.baseStats.move,
      level: lvl,
      skill: { ...pick.skill },
      skillCooldown: pick.skill.cooldown,
      stunned: false,
    };
    this.enemies.push(e);
    this.logMsg(`${pick.name}（${pick.dynasty}）現身於戰場。`);
  }

  private randomEdgeSpawn(): Vec2 {
    const edge = Math.floor(Math.random() * 4);
    let x = 2;
    let y = 2;
    if (edge === 0) {
      x = 2 + Math.floor(Math.random() * (MAP_WIDTH - 4));
      y = 2;
    } else if (edge === 1) {
      x = MAP_WIDTH - 3;
      y = 2 + Math.floor(Math.random() * (MAP_HEIGHT - 4));
    } else if (edge === 2) {
      x = 2 + Math.floor(Math.random() * (MAP_WIDTH - 4));
      y = MAP_HEIGHT - 3;
    } else {
      x = 2;
      y = 2 + Math.floor(Math.random() * (MAP_HEIGHT - 4));
    }
    if (!isWalkable(this.map, x, y)) return { x: 3, y: 3 };
    return { x, y };
  }

  blockedTiles(excludeKenny = false): Set<string> {
    const s = new Set<string>();
    for (const e of this.enemies) s.add(`${e.x},${e.y}`);
    if (!excludeKenny) s.add(`${this.kenny.x},${this.kenny.y}`);
    return s;
  }

  refreshReachable() {
    if (this.phase !== 'player') {
      this.highlight.clear();
      return;
    }
    this.highlight = reachableTiles(
      this.map,
      { x: this.kenny.x, y: this.kenny.y },
      this.kenny.move,
      this.blockedTiles(true),
    );
  }

  tryMoveKenny(tx: number, ty: number): boolean {
    if (this.phase !== 'player') return false;
    const k = `${tx},${ty}`;
    if (!this.highlight.has(k)) return false;
    const tile = this.map[ty][tx];
    this.kenny.x = tx;
    this.kenny.y = ty;
    if (tile === TILE.XP_ORB) {
      this.map[ty][tx] = TILE.GRASS;
      this.gainXp(18);
    }
    this.endPlayerTurn();
    return true;
  }

  waitTurn() {
    if (this.phase !== 'player') return;
    this.gainXp(8);
    this.endPlayerTurn();
  }

  private endPlayerTurn() {
    this.phase = 'enemy';
    this.highlight.clear();
    this.runEnemyPhase();
  }

  private syncEnemyLevels() {
    const target = Math.max(1, Math.floor(this.kenny.level * 0.55));
    for (const e of this.enemies) {
      if (e.level < target) e.level = target;
      e.attack = scaledAttack(
        this.heroesData.heroes.find((h) => h.id === e.heroId)?.baseStats.attack ?? e.attack,
        this.kenny.level,
        e.level,
      );
    }
  }

  private runEnemyPhase() {
    this.syncEnemyLevels();
    this.telegraphs = [];
    const blocked = this.blockedTiles();

    for (const e of this.enemies) {
      if (e.hp <= 0) continue;
      if (e.stunned) {
        e.stunned = false;
        continue;
      }
      if (e.skillCooldown > 0) e.skillCooldown--;

      for (let m = 0; m < e.move; m++) {
        const next = stepToward({ x: e.x, y: e.y }, { x: this.kenny.x, y: this.kenny.y }, this.map, blocked);
        if (next.x === e.x && next.y === e.y) break;
        blocked.delete(`${e.x},${e.y}`);
        e.x = next.x;
        e.y = next.y;
        blocked.add(`${e.x},${e.y}`);
        if (e.x === this.kenny.x && e.y === this.kenny.y) break;
      }

      const dist = Math.abs(e.x - this.kenny.x) + Math.abs(e.y - this.kenny.y);
      if (dist <= e.range + 1) {
        this.telegraphs.push({ x: this.kenny.x, y: this.kenny.y });
        const strike = resolveEnemyStrike(e, this.kenny, this.kenny.level, dist);
        this.logMsg(strike.message);
        if (strike.healEnemy) {
          e.hp = Math.min(e.maxHp, e.hp + strike.healEnemy);
        }
        if (Math.random() < this.kenny.dodge) {
          this.logMsg('Kenny 閃避成功！');
        } else {
          const dmg = Math.round(strike.damage * damageTakenMultiplier(this.kenny));
          this.kenny.hp -= dmg;
          this.logMsg(`Kenny 受到 ${dmg} 點傷害`);
          if (strike.stunned) this.logMsg('Kenny 被控場，下回合移動-1');
        }
        if (e.skillCooldown <= 0) e.skillCooldown = e.skill.cooldown;
      }
    }

    this.enemies = this.enemies.filter((e) => e.hp > 0);

    if (this.kenny.hp <= 0) {
      this.phase = 'lost';
      this.logMsg('Kenny 戰敗。再試一次，善用地形與升級！');
      return;
    }

    this.turn++;
    this.gainXp(10 + Math.floor(this.turn / 3));

    this.respawnCounter++;
    if (
      this.respawnCounter >= this.heroesData.spawnRules.respawnEveryTurns &&
      this.enemies.length < this.heroesData.spawnRules.maxActiveOnMap
    ) {
      this.respawnCounter = 0;
      this.spawnEnemy();
    }

    this.phase = 'player';
    this.refreshReachable();
  }

  gainXp(amount: number) {
    const amt = Math.round(amount * xpMultiplier(this.kenny));
    this.kenny.xp += amt;
    while (this.kenny.xp >= this.kenny.xpToNext) {
      this.kenny.xp -= this.kenny.xpToNext;
      this.levelUp();
    }
  }

  private levelUp() {
    this.kenny.level++;
    this.kenny.xpToNext = Math.round(40 + this.kenny.level * 14);
    this.kenny.hp = Math.min(this.kenny.maxHp, this.kenny.hp + 12);
    this.logMsg(`Kenny 升級！目前等級 ${this.kenny.level}`);

    const target = this.heroesData.victory.targetLevel;
    if (this.kenny.level >= target) {
      this.phase = 'won';
      this.logMsg(`勝利！Kenny 達到 ${target} 級，成功避開群將追擊！`);
      return;
    }

    this.pendingUpgrades = pickUpgradeChoices(this.kenny, 3);
    this.phase = 'levelup';
    this.highlight.clear();
  }

  chooseUpgrade(id: string) {
    const card = this.pendingUpgrades.find((c) => c.id === id);
    if (!card || this.phase !== 'levelup') return;
    card.apply(this.kenny);
    if (!this.kenny.upgrades.includes(card.id)) this.kenny.upgrades.push(card.id);
    this.pendingUpgrades = [];
    this.phase = 'player';
    this.refreshReachable();
    this.logMsg(`選擇升級：${card.title}`);
  }

  reset() {
    const data = this.heroesData;
    const g = new Game(data);
    Object.assign(this, g);
  }
}
