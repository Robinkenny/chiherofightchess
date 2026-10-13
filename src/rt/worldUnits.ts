import { MAP_HEIGHT, MAP_WIDTH } from '../constants';

/** 每格對應的世界單位（Three.js X/Z） */
export const WORLD_TILE = 2.2;

export function tileToWorld(tx: number, ty: number): { x: number; z: number } {
  return {
    x: (tx + 0.5) * WORLD_TILE,
    z: (ty + 0.5) * WORLD_TILE,
  };
}

export function worldToTile(x: number, z: number): { tx: number; ty: number } {
  return {
    tx: Math.floor(x / WORLD_TILE),
    ty: Math.floor(z / WORLD_TILE),
  };
}

export const WORLD_W = MAP_WIDTH * WORLD_TILE;
export const WORLD_H = MAP_HEIGHT * WORLD_TILE;
