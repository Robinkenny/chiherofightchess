import { MAP_HEIGHT, MAP_WIDTH, TILE, type TileId } from '../constants';
import { generateAncientMap, isWalkable } from '../map/generateMap';
import { resolveEnemyStrike, scaledAttack } from '../game/skills';
import { damageTakenMultiplier, pickUpgradeChoices, xpMultiplier } from '../game/upgrades';
import type { EnemyUnit, HeroesData, HeroDef, KennyState, UpgradeCard } from '../types';
import { tileToWorld, worldToTile, WORLD_TILE } from './worldUnits';

export type GamePhase = 'playing' | 'levelup' | 'won' | 'lost';

export interface RTEnemy extends EnemyUnit {
  wx: number;
  wz: number;
  attackCd: number;
  skillCd: number;
}

export interface RTKenny extends KennyState {
  wx: number;
  wz: number;
  hitFlash: number;
}

export interface XPOrb {
  tx: number;
  ty: number;
}

export class RealtimeGame {
  map: TileId[][];
  kenny: RTKenny;
  enemies: RTEnemy[] = [];
  orbs: XPOrb[] = [];
  heroesData: HeroesData;
  phase: GamePhase = 'playing';
  log: string[] = [];
  pendingUpgrades: UpgradeCard[] = [];
  elapsed = 0;
  usedHeroIds = new Set<string>();
  private nextUid = 1;
  private spawnTimer = 0;

  get usedHeroCount() {
    return this.usedHeroIds.size;
  }

  constructor(data: HeroesData) {
    this.heroesData = data;
    this.map = generateAncientMap();
    const cx = Math.floor(MAP_WIDTH / 2);
    const cy = Math.floor(MAP_HEIGHT / 2);
    const w = tileToWorld(cx, cy);
    const p = data.protagonist.baseStats;
    this.kenny = {
      x: cx,
      y: cy,
      wx: w.x,
      wz: w.z,
      hp: p.hp,
      maxHp: p.hp,
      move: p.move,
      dodge: p.dodge,
      level: 1,
      xp: 0,
      xpToNext: 40,
      upgrades: [],
      hitFlash: 0,
    };
    this.collectOrbsFromMap();
    for (let i = 0; i < data.spawnRules.initialActiveCount; i++) this.spawnEnemy();
    this.logMsg('即時戰開始！WASD／虛擬搖桿移動，避開百將升級至 20 級。');
  }

  private collectOrbsFromMap() {
    this.orbs = [];
    for (let ty = 0; ty < MAP_HEIGHT; ty++) {
      for (let tx = 0; tx < MAP_WIDTH; tx++) {
        if (this.map[ty][tx] === TILE.XP_ORB) this.orbs.push({ tx, ty });
      }
    }
  }

  private logMsg(msg: string) {
    this.log.unshift(msg);
    this.log = this.log.slice(0, 12);
  }

  canWalkWorld(x: number, z: number): boolean {
    const { tx, ty } = worldToTile(x, z);
    if (tx < 1 || ty < 1 || tx >= MAP_WIDTH - 1 || ty >= MAP_HEIGHT - 1) return false;
    return isWalkable(this.map, tx, ty);
  }

  private spawnEnemy(at?: { tx: number; ty: number }) {
    const defs = this.heroesData.heroes.filter((h) => !this.usedHeroIds.has(h.id));
    const pick = defs[Math.floor(Math.random() * defs.length)] ?? this.heroesData.heroes[0];
    this.usedHeroIds.add(pick.id);
    const pos = at ?? this.randomEdgeSpawn();
    const w = tileToWorld(pos.tx, pos.ty);
    const lvl = this.heroesData.spawnRules.enemyBaseLevel;
    const e: RTEnemy = {
      uid: this.nextUid++,
      heroId: pick.id,
      name: pick.name,
      x: pos.tx,
      y: pos.ty,
      wx: w.x,
      wz: w.z,
      hp: pick.baseStats.hp,
      maxHp: pick.baseStats.hp,
      attack: pick.baseStats.attack,
      range: pick.baseStats.range,
      move: pick.baseStats.move,
      level: lvl,
      skill: { ...pick.skill },
      skillCooldown: pick.skill.cooldown,
      stunned: false,
      attackCd: 0.5 + Math.random(),
      skillCd: pick.skill.cooldown,
    };
    this.enemies.push(e);
    this.logMsg(`${pick.name} 殺到！`);
  }

  private randomEdgeSpawn() {
    const edge = Math.floor(Math.random() * 4);
    let tx = 2;
    let ty = 2;
    if (edge === 0) {
      tx = 2 + Math.floor(Math.random() * (MAP_WIDTH - 4));
      ty = 2;
    } else if (edge === 1) {
      tx = MAP_WIDTH - 3;
      ty = 2 + Math.floor(Math.random() * (MAP_HEIGHT - 4));
    } else if (edge === 2) {
      tx = 2 + Math.floor(Math.random() * (MAP_WIDTH - 4));
      ty = MAP_HEIGHT - 3;
    } else {
      tx = 2;
      ty = 2 + Math.floor(Math.random() * (MAP_HEIGHT - 4));
    }
    if (!isWalkable(this.map, tx, ty)) return { tx: 3, ty: 3 };
    return { tx, ty };
  }

  heroDef(id: string): HeroDef | undefined {
    return this.heroesData.heroes.find((h) => h.id === id);
  }

  update(dt: number, moveX: number, moveZ: number) {
    if (this.phase === 'levelup' || this.phase === 'won' || this.phase === 'lost') return;

    this.elapsed += dt;
    if (this.kenny.hitFlash > 0) this.kenny.hitFlash -= dt;

    const speed = 6 + this.kenny.move * 1.8;
    const len = Math.hypot(moveX, moveZ) || 1;
    const nx = (moveX / len) * speed * dt;
    const nz = (moveZ / len) * speed * dt;
    if (moveX !== 0 || moveZ !== 0) {
      const tryX = this.kenny.wx + nx;
      const tryZ = this.kenny.wz + nz;
      if (this.canWalkWorld(tryX, this.kenny.wz)) this.kenny.wx = tryX;
      if (this.canWalkWorld(this.kenny.wx, tryZ)) this.kenny.wz = tryZ;
      const t = worldToTile(this.kenny.wx, this.kenny.wz);
      this.kenny.x = t.tx;
      this.kenny.y = t.ty;
    }

    this.gainXp(dt * 4);

    for (const orb of this.orbs) {
      const ow = tileToWorld(orb.tx, orb.ty);
      if (Math.hypot(this.kenny.wx - ow.x, this.kenny.wz - ow.z) < WORLD_TILE * 0.45) {
        this.orbs = this.orbs.filter((o) => o !== orb);
        this.map[orb.ty][orb.tx] = TILE.GRASS;
        this.gainXp(22);
      }
    }

    this.syncEnemyLevels();
    for (const e of this.enemies) {
      this.updateEnemy(e, dt);
    }
    this.enemies = this.enemies.filter((e) => e.hp > 0);

    this.spawnTimer += dt;
    if (
      this.spawnTimer >= this.heroesData.spawnRules.respawnEveryTurns * 0.85 &&
      this.enemies.length < this.heroesData.spawnRules.maxActiveOnMap
    ) {
      this.spawnTimer = 0;
      this.spawnEnemy();
    }

    if (this.kenny.hp <= 0) {
      this.phase = 'lost';
      this.logMsg('Kenny 戰敗。');
    }
  }

  private syncEnemyLevels() {
    const target = Math.max(1, Math.floor(this.kenny.level * 0.55));
    for (const e of this.enemies) {
      if (e.level < target) e.level = target;
      const base = this.heroDef(e.heroId)?.baseStats.attack ?? e.attack;
      e.attack = scaledAttack(base, this.kenny.level, e.level);
    }
  }

  private updateEnemy(e: RTEnemy, dt: number) {
    e.attackCd -= dt;
    e.skillCd -= dt;

    const dx = this.kenny.wx - e.wx;
    const dz = this.kenny.wz - e.wz;
    const dist = Math.hypot(dx, dz);
    const espeed = 2.2 + e.move * 0.65 + this.kenny.level * 0.05;
    if (dist > 0.15) {
      const step = Math.min(espeed * dt, dist - 0.35);
      const ux = dx / dist;
      const uz = dz / dist;
      const nx = e.wx + ux * step;
      const nz = e.wz + uz * step;
      if (this.canWalkWorld(nx, e.wz)) e.wx = nx;
      if (this.canWalkWorld(e.wx, nz)) e.wz = nz;
      const t = worldToTile(e.wx, e.wz);
      e.x = t.tx;
      e.y = t.ty;
    }

    const rangeW = (e.range + 0.6) * WORLD_TILE;
    if (dist <= rangeW && e.attackCd <= 0) {
      e.attackCd = 1.1 - Math.min(0.4, this.kenny.level * 0.015);
      const tileDist = Math.abs(e.x - this.kenny.x) + Math.abs(e.y - this.kenny.y);
      const strike = resolveEnemyStrike(e, this.kenny, this.kenny.level, tileDist);
      this.logMsg(strike.message);
      if (strike.healEnemy) e.hp = Math.min(e.maxHp, e.hp + strike.healEnemy);
      if (Math.random() < this.kenny.dodge) {
        this.logMsg('Kenny 閃避！');
      } else {
        const dmg = Math.round(strike.damage * damageTakenMultiplier(this.kenny));
        this.kenny.hp -= dmg;
        this.kenny.hitFlash = 0.25;
        this.logMsg(`Kenny -${dmg} HP`);
      }
      if (e.skillCd <= 0) e.skillCd = e.skill.cooldown;
    }
  }

  gainXp(amount: number) {
    if (amount <= 0) return;
    const amt = amount * xpMultiplier(this.kenny);
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
    this.logMsg(`Kenny 升級！Lv.${this.kenny.level}`);
    const target = this.heroesData.victory.targetLevel;
    if (this.kenny.level >= target) {
      this.phase = 'won';
      this.logMsg(`勝利！達 ${target} 級！`);
      return;
    }
    this.pendingUpgrades = pickUpgradeChoices(this.kenny, 3);
    this.phase = 'levelup';
  }

  chooseUpgrade(id: string) {
    const card = this.pendingUpgrades.find((c) => c.id === id);
    if (!card || this.phase !== 'levelup') return;
    card.apply(this.kenny);
    if (!this.kenny.upgrades.includes(card.id)) this.kenny.upgrades.push(card.id);
    this.pendingUpgrades = [];
    this.phase = 'playing';
    this.logMsg(`選擇：${card.title}`);
  }

  reset() {
    Object.assign(this, new RealtimeGame(this.heroesData));
  }
}
