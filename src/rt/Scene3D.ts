import * as THREE from 'three';
import { MAP_HEIGHT, MAP_WIDTH, TILE } from '../constants';
import type { TileId } from '../constants';
import type { RealtimeGame, RTEnemy } from './RealtimeGame';
import { createNameLabel, createWarriorMesh } from './heroMesh';
import { tileToWorld, WORLD_H, WORLD_TILE, WORLD_W } from './worldUnits';

export class Scene3D {
  renderer: THREE.WebGLRenderer;
  scene = new THREE.Scene();
  camera: THREE.PerspectiveCamera;
  kennyMesh: THREE.Group;
  enemyMeshes = new Map<number, THREE.Group>();
  orbMeshes: THREE.Mesh[] = [];
  private clock = new THREE.Clock();
  private sizeEl: HTMLElement;

  constructor(
    canvas: HTMLCanvasElement,
    sizeEl: HTMLElement,
    private game: RealtimeGame,
  ) {
    this.sizeEl = sizeEl;
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    this.scene.background = new THREE.Color('#87a8c4');
    this.scene.fog = new THREE.Fog('#a8c0d8', 35, 95);

    this.camera = new THREE.PerspectiveCamera(50, 1, 0.1, 200);
    this.resize();
    window.addEventListener('resize', () => this.resize());
    this.buildLighting();
    this.buildTerrain(game.map);
    this.buildOrbs(game);
    this.kennyMesh = createWarriorMesh('kenny');
    this.kennyMesh.add(createNameLabel('Kenny'));
    this.scene.add(this.kennyMesh);
    for (const e of game.enemies) this.addEnemyMesh(e);
  }

  resize() {
    const w = this.sizeEl.clientWidth || 800;
    const h = this.sizeEl.clientHeight || 600;
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
  }

  private buildLighting() {
    const hemi = new THREE.HemisphereLight('#fff8e7', '#3d5c38', 0.65);
    this.scene.add(hemi);
    const sun = new THREE.DirectionalLight('#ffe8c0', 1.1);
    sun.position.set(30, 50, 20);
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    sun.shadow.camera.left = -60;
    sun.shadow.camera.right = 60;
    sun.shadow.camera.top = 60;
    sun.shadow.camera.bottom = -60;
    this.scene.add(sun);
  }

  private buildTerrain(map: TileId[][]) {
    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(WORLD_W, WORLD_H),
      new THREE.MeshStandardMaterial({ color: '#5a7c52', roughness: 0.95 }),
    );
    ground.rotation.x = -Math.PI / 2;
    ground.position.set(WORLD_W / 2, 0, WORLD_H / 2);
    ground.receiveShadow = true;
    this.scene.add(ground);

    for (let ty = 0; ty < MAP_HEIGHT; ty++) {
      for (let tx = 0; tx < MAP_WIDTH; tx++) {
        const tile = map[ty][tx];
        const { x, z } = tileToWorld(tx, ty);
        if (tile === TILE.FOREST) this.addTree(x, z);
        else if (tile === TILE.WATER) this.addWater(x, z);
        else if (tile === TILE.MOUNTAIN) this.addMountain(x, z, 2.2);
        else if (tile === TILE.CLIFF) this.addCliff(x, z);
      }
    }
  }

  private addTree(x: number, z: number) {
    const trunk = new THREE.Mesh(
      new THREE.CylinderGeometry(0.12, 0.16, 0.9, 6),
      new THREE.MeshStandardMaterial({ color: '#4a3020' }),
    );
    trunk.position.set(x, 0.45, z);
    trunk.castShadow = true;
    const leaves = new THREE.Mesh(
      new THREE.ConeGeometry(0.55, 1.4, 8),
      new THREE.MeshStandardMaterial({ color: '#2d6a4f' }),
    );
    leaves.position.set(x, 1.35, z);
    leaves.castShadow = true;
    this.scene.add(trunk, leaves);
  }

  private addWater(x: number, z: number) {
    const w = new THREE.Mesh(
      new THREE.BoxGeometry(WORLD_TILE * 0.92, 0.15, WORLD_TILE * 0.92),
      new THREE.MeshStandardMaterial({
        color: '#3a6d8c',
        roughness: 0.2,
        metalness: 0.35,
        transparent: true,
        opacity: 0.85,
      }),
    );
    w.position.set(x, -0.05, z);
    this.scene.add(w);
  }

  private addMountain(x: number, z: number, h: number) {
    const m = new THREE.Mesh(
      new THREE.ConeGeometry(WORLD_TILE * 0.45, h, 6),
      new THREE.MeshStandardMaterial({ color: '#6a6258', roughness: 0.85 }),
    );
    m.position.set(x, h / 2, z);
    m.castShadow = true;
    this.scene.add(m);
  }

  private addCliff(x: number, z: number) {
    const c = new THREE.Mesh(
      new THREE.BoxGeometry(WORLD_TILE * 0.9, 1.8, WORLD_TILE * 0.9),
      new THREE.MeshStandardMaterial({ color: '#4a3728' }),
    );
    c.position.set(x, 0.9, z);
    c.castShadow = true;
    this.scene.add(c);
  }

  private buildOrbs(game: RealtimeGame) {
    for (const orb of game.orbs) {
      const w = tileToWorld(orb.tx, orb.ty);
      const mesh = new THREE.Mesh(
        new THREE.SphereGeometry(0.35, 12, 12),
        new THREE.MeshStandardMaterial({
          color: '#f0d878',
          emissive: '#c9a227',
          emissiveIntensity: 0.6,
          metalness: 0.8,
          roughness: 0.2,
        }),
      );
      mesh.position.set(w.x, 0.55, w.z);
      this.scene.add(mesh);
      this.orbMeshes.push(mesh);
    }
  }

  private addEnemyMesh(e: RTEnemy) {
    const def = this.game.heroDef(e.heroId);
    const mesh = createWarriorMesh('hero', def);
    mesh.add(createNameLabel(e.name));
    this.scene.add(mesh);
    this.enemyMeshes.set(e.uid, mesh);
  }

  syncOrbs() {
    while (this.orbMeshes.length > this.game.orbs.length) {
      const m = this.orbMeshes.pop()!;
      this.scene.remove(m);
    }
  }

  tick(moveX: number, moveZ: number, onUi: () => void) {
    const dt = Math.min(this.clock.getDelta(), 0.05);
    this.game.update(dt, moveX, moveZ);
    this.syncOrbs();

    this.kennyMesh.position.set(this.game.kenny.wx, 0, this.game.kenny.wz);
    if (moveX !== 0 || moveZ !== 0) {
      this.kennyMesh.rotation.y = Math.atan2(moveX, moveZ);
    }
    if (this.game.kenny.hitFlash > 0) {
      this.kennyMesh.scale.setScalar(1 + Math.sin(this.game.kenny.hitFlash * 30) * 0.04);
    } else {
      this.kennyMesh.scale.setScalar(1);
    }

    const seen = new Set<number>();
    for (const e of this.game.enemies) {
      seen.add(e.uid);
      let mesh = this.enemyMeshes.get(e.uid);
      if (!mesh) {
        this.addEnemyMesh(e);
        mesh = this.enemyMeshes.get(e.uid)!;
      }
      mesh.position.set(e.wx, 0, e.wz);
      mesh.rotation.y = Math.atan2(this.game.kenny.wx - e.wx, this.game.kenny.wz - e.wz);
    }
    for (const [uid, mesh] of this.enemyMeshes) {
      if (!seen.has(uid)) {
        this.scene.remove(mesh);
        this.enemyMeshes.delete(uid);
      }
    }

    const k = this.game.kenny;
    const camTarget = new THREE.Vector3(k.wx, 0, k.wz);
    const offset = new THREE.Vector3(0, 28, 22);
    this.camera.position.lerp(camTarget.clone().add(offset), 0.08);
    this.camera.lookAt(camTarget.x, 1.2, camTarget.z);

    const t = performance.now() * 0.003;
    for (const orb of this.orbMeshes) {
      orb.position.y = 0.55 + Math.sin(t + orb.position.x) * 0.12;
      orb.rotation.y += dt;
    }

    this.renderer.render(this.scene, this.camera);
    onUi();
  }

  dispose() {
    this.renderer.dispose();
  }
}
