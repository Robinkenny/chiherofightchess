import type { EnemyUnit, HeroSkill, KennyState } from '../types';
import type { TileId } from '../constants';

export function scaledPower(skill: HeroSkill, kennyLevel: number, enemyLevel: number): number {
  const scale = 1 + (kennyLevel - 1) * (skill.scalingPerKennyLevel * 0.08);
  const lvl = 0.85 + enemyLevel * 0.12;
  return Math.round(skill.basePower * scale * lvl);
}

export function scaledAttack(base: number, kennyLevel: number, enemyLevel: number): number {
  const kScale = 1 + (kennyLevel - 1) * 0.12;
  const eScale = 0.7 + enemyLevel * 0.15;
  return Math.round(base * kScale * eScale);
}

/** 簡化技能：依 type 決定傷害倍率與附加效果 */
export function resolveEnemyStrike(
  enemy: EnemyUnit,
  _kenny: KennyState,
  kennyLevel: number,
  distance: number,
): { damage: number; message: string; stunned?: boolean; healEnemy?: number } {
  const atk = scaledAttack(enemy.attack, kennyLevel, enemy.level);
  let mult = 1;
  let message = `${enemy.name} 普通攻擊`;
  let stunned = false;
  let healEnemy = 0;

  if (enemy.skillCooldown <= 0 && distance <= enemy.range + 1) {
    const p = scaledPower(enemy.skill, kennyLevel, enemy.level);
    message = `${enemy.name} 發動「${enemy.skill.name}」`;
    switch (enemy.skill.type) {
      case 'heal_aoe':
        healEnemy = p;
        mult = 0.35;
        break;
      case 'stun_line':
      case 'cage':
        stunned = true;
        mult = 0.8;
        break;
      case 'heavy_strike':
      case 'execute':
      case 'all_in':
        mult = 1.6;
        break;
      case 'snipe':
      case 'triple_shot':
        mult = 1.35;
        break;
      default:
        mult = 1.15 + p / 100;
        break;
    }
  }

  const raw = Math.max(1, Math.round(atk * mult));
  return { damage: raw, message, stunned, healEnemy };
}

export function collectOrbXp(tile: TileId, xpOrb: number): number {
  return tile === 5 ? xpOrb : 0; // TILE.XP_ORB
}
