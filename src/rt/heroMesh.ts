import * as THREE from 'three';
import { hashHue, dynastyStyle } from '../render/art/palette';
import type { HeroDef } from '../types';

export type MeshKind = 'kenny' | 'hero';

export function createWarriorMesh(kind: MeshKind, def?: HeroDef): THREE.Group {
  const g = new THREE.Group();
  const hue = def ? hashHue(def.id) : 140;
  const robe =
    kind === 'kenny'
      ? new THREE.Color('#4a6741')
      : new THREE.Color(`hsl(${hue}, 45%, 42%)`);
  const accent = def ? dynastyStyle(def.dynasty).rim : '#c9a227';

  const bodyMat = new THREE.MeshStandardMaterial({
    color: robe,
    roughness: 0.55,
    metalness: 0.15,
  });
  const armorMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(accent),
    roughness: 0.35,
    metalness: 0.65,
  });
  const skinMat = new THREE.MeshStandardMaterial({ color: '#e8c4a0', roughness: 0.8 });

  const torso = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.75, 0.38), bodyMat);
  torso.position.y = 0.95;
  torso.castShadow = true;
  g.add(torso);

  const head = new THREE.Mesh(new THREE.SphereGeometry(0.28, 12, 12), skinMat);
  head.position.y = 1.55;
  head.castShadow = true;
  g.add(head);

  addHeadgear(g, kind, def?.role, armorMat);

  const shoulderL = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.12, 0.35), armorMat);
  shoulderL.position.set(-0.38, 1.25, 0);
  g.add(shoulderL);
  const shoulderR = shoulderL.clone();
  shoulderR.position.x = 0.38;
  g.add(shoulderR);

  addWeapon(g, def?.role, armorMat);

  const base = new THREE.Mesh(
    new THREE.CylinderGeometry(0.55, 0.65, 0.08, 16),
    new THREE.MeshStandardMaterial({ color: '#1a1208', roughness: 0.9 }),
  );
  base.position.y = 0.04;
  g.add(base);

  return g;
}

function addHeadgear(g: THREE.Group, kind: MeshKind, role?: string, mat?: THREE.Material) {
  if (kind === 'kenny') {
    const cloth = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.08, 0.45), mat!);
    cloth.position.y = 1.78;
    g.add(cloth);
    return;
  }
  if (role === 'archer') {
    const hat = new THREE.Mesh(new THREE.ConeGeometry(0.22, 0.35, 8), mat!);
    hat.position.y = 1.85;
    g.add(hat);
  } else if (role === 'strategist') {
    const cap = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.12, 0.45), mat!);
    cap.position.y = 1.82;
    g.add(cap);
  } else if (role === 'leader') {
    const crown = new THREE.Mesh(new THREE.ConeGeometry(0.18, 0.4, 4), mat!);
    crown.position.y = 1.9;
    crown.rotation.y = Math.PI / 4;
    g.add(crown);
  } else {
    const helm = new THREE.Mesh(new THREE.SphereGeometry(0.32, 10, 8, 0, Math.PI * 2, 0, Math.PI / 2), mat!);
    helm.position.y = 1.58;
    g.add(helm);
  }
}

function addWeapon(g: THREE.Group, role?: string, mat?: THREE.Material) {
  if (role === 'archer') {
    const bow = new THREE.Mesh(new THREE.TorusGeometry(0.35, 0.03, 6, 12, Math.PI), mat!);
    bow.rotation.z = Math.PI / 2;
    bow.position.set(0.45, 1.1, 0);
    g.add(bow);
    return;
  }
  const blade = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.85, 0.12), mat!);
  blade.position.set(0.42, 1.05, 0.15);
  blade.rotation.z = -0.35;
  g.add(blade);
}

export function createNameLabel(text: string): THREE.Sprite {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 64;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = 'rgba(74, 8, 8, 0.85)';
  ctx.fillRect(0, 0, 256, 64);
  ctx.strokeStyle = '#c9a227';
  ctx.lineWidth = 4;
  ctx.strokeRect(2, 2, 252, 60);
  ctx.fillStyle = '#f0d878';
  ctx.font = 'bold 28px "ZCOOL XiaoWei", serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text.slice(0, 4), 128, 34);
  const tex = new THREE.CanvasTexture(canvas);
  const mat = new THREE.SpriteMaterial({ map: tex, transparent: true });
  const sp = new THREE.Sprite(mat);
  sp.scale.set(2.2, 0.55, 1);
  sp.position.y = 2.35;
  return sp;
}
