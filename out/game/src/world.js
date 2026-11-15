// The map: a tactical layout with two bomb sites (A and B), mid control, and distinct lanes
// Built from boxes with proper collision and visual variety
import * as THREE from 'three';
import { PALETTE } from './palette.js';

export function createWorld(scene) {
  const group = new THREE.Group();
  scene.add(group);

  const materials = {};
  for (const name of Object.keys(PALETTE)) {
    materials[name] = new THREE.MeshStandardMaterial({
      color: new THREE.Color(PALETTE[name]),
      roughness: name === 'accent' || name === 'ink' || name === 'ct' || name === 't' ? 0.55 : 0.92,
      metalness: name === 'accent' || name === 'ct' || name === 't' ? 0.15 : 0.03,
    });
  }

  // Additional materials for map variety
  const concrete = new THREE.MeshStandardMaterial({ color: new THREE.Color('#2d333b'), roughness: 0.95, metalness: 0.02 });
  const metal = new THREE.MeshStandardMaterial({ color: new THREE.Color('#484f58'), roughness: 0.4, metalness: 0.8 });
  const wood = new THREE.MeshStandardMaterial({ color: new THREE.Color('#8b5e3c'), roughness: 0.85, metalness: 0.02 });
  const brick = new THREE.MeshStandardMaterial({ color: new THREE.Color('#6b2d2d'), roughness: 0.9, metalness: 0.02 });
  const tile = new THREE.MeshStandardMaterial({ color: new THREE.Color('#3a3f47'), roughness: 0.8, metalness: 0.02 });

  const customMaterials = { concrete, metal, wood, brick, tile };
  const allMaterials = { ...materials, ...customMaterials };

  const colliders = [];
  const shootables = [];

  function box(width, height, depth, x, y, z, material, rotation = { x: 0, y: 0, z: 0 }) {
    const mat = allMaterials[material];
    if (!mat) throw new Error(`Unknown material: ${material}`);
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(width, height, depth), mat);
    mesh.position.set(x, y, z);
    mesh.rotation.set(rotation.x, rotation.y, rotation.z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    group.add(mesh);
    colliders.push(new THREE.Box3().setFromObject(mesh));
    shootables.push(mesh);
    return mesh;
  }

  // Ground plane - larger area
  box(80, 0.4, 80, 0, -0.2, 0, 'canvas');

  // ===== BOMBSITE A (CT side) =====
  // A Site platform
  box(18, 0.5, 18, -22, 0.25, -22, 'concrete');
  // A Site cover
  box(2.5, 2.8, 2.5, -28, 1.4, -20, 'wood');
  box(2.5, 2.8, 2.5, -16, 1.4, -20, 'wood');
  box(4, 1.2, 4, -22, 0.6, -28, 'metal');
  box(1.5, 1.8, 1.5, -26, 0.9, -15, 'brick');
  box(1.5, 1.8, 1.5, -18, 0.9, -15, 'brick');

  // A Long corridor
  box(8, 0.5, 30, -22, 0.25, 8, 'concrete');
  box(0.5, 3, 30, -18, 1.5, 8, 'brick');
  box(0.5, 3, 30, -26, 1.5, 8, 'brick');
  // Cover on A Long
  box(2, 1.5, 2, -22, 0.75, -2, 'metal');
  box(2, 1.5, 2, -22, 0.75, 14, 'wood');

  // A Ramp
  box(6, 0.5, 12, -12, 0.25, 22, 'concrete', { x: 0, y: 0, z: 0 });
  box(0.5, 3, 12, -9, 1.5, 22, 'brick');
  box(0.5, 3, 12, -15, 1.5, 22, 'brick');

  // ===== BOMBSITE B (T side) =====
  // B Site platform
  box(18, 0.5, 18, 22, 0.25, 22, 'concrete');
  // B Site cover
  box(2.5, 2.8, 2.5, 16, 1.4, 20, 'wood');
  box(2.5, 2.8, 2.5, 28, 1.4, 20, 'wood');
  box(4, 1.2, 4, 22, 0.6, 28, 'metal');
  box(1.5, 1.8, 1.5, 18, 0.9, 15, 'brick');
  box(1.5, 1.8, 1.5, 26, 0.9, 15, 'brick');

  // B Tunnels
  box(8, 0.5, 25, 22, 0.25, -3, 'concrete');
  box(0.5, 3, 25, 18, 1.5, -3, 'brick');
  box(0.5, 3, 25, 26, 1.5, -3, 'brick');
  box(2, 1.5, 2, 22, 0.75, 10, 'metal');
  box(2, 1.5, 2, 22, 0.75, -10, 'wood');

  // ===== MID =====
  // Mid platform
  box(20, 0.5, 20, 0, 0.25, 0, 'tile');
  // Mid cover - boxes
  box(2.5, 2.5, 2.5, -4, 1.25, 4, 'metal');
  box(2.5, 2.5, 2.5, 4, 1.25, 4, 'metal');
  box(2.5, 2.5, 2.5, -4, 1.25, -4, 'wood');
  box(2.5, 2.5, 2.5, 4, 1.25, -4, 'wood');
  // Mid doors / window area
  box(0.4, 2.2, 3, -10, 1.1, 0, 'metal');
  box(0.4, 2.2, 3, 10, 1.1, 0, 'metal');

  // CT Spawn area
  box(20, 0.5, 15, -30, 0.25, -30, 'concrete');
  box(3, 1.8, 2, -38, 0.9, -36, 'wood');
  box(3, 1.8, 2, -22, 0.9, -36, 'wood');
  box(2, 1.5, 3, -30, 0.75, -24, 'metal');

  // T Spawn area
  box(20, 0.5, 15, 30, 0.25, 30, 'concrete');
  box(3, 1.8, 2, 22, 0.9, 36, 'wood');
  box(3, 1.8, 2, 38, 0.9, 36, 'wood');
  box(2, 1.5, 3, 30, 0.75, 24, 'metal');

  // ===== LIGHTING =====
  // Hemisphere for ambient
  const sky = new THREE.HemisphereLight(new THREE.Color(PALETTE.surface), new THREE.Color(PALETTE.canvas), 0.8);
  scene.add(sky);

  // Main directional light (sun/moon)
  const key = new THREE.DirectionalLight(new THREE.Color(PALETTE.ink), 2.2);
  key.position.set(20, 35, 15);
  key.target.position.set(0, 0, 0);
  key.castShadow = true;
  key.shadow.mapSize.set(2048, 2048);
  key.shadow.camera.left = -40;
  key.shadow.camera.right = 40;
  key.shadow.camera.top = 40;
  key.shadow.camera.bottom = -40;
  key.shadow.camera.far = 100;
  key.shadow.bias = -0.0008;
  key.shadow.normalBias = 0.02;
  scene.add(key, key.target);

  // Fill light
  const fill = new THREE.DirectionalLight(new THREE.Color(PALETTE.muted), 0.6);
  fill.position.set(-25, 20, -20);
  scene.add(fill);

  // Accent rim light for CT side
  const rimCT = new THREE.DirectionalLight(new THREE.Color(PALETTE.ct), 0.4);
  rimCT.position.set(-30, 15, -30);
  scene.add(rimCT);

  // Accent rim light for T side
  const rimT = new THREE.DirectionalLight(new THREE.Color(PALETTE.t), 0.4);
  rimT.position.set(30, 15, 30);
  scene.add(rimT);

  // Point lights at bomb sites for visibility
  const siteALight = new THREE.PointLight(new THREE.Color(PALETTE.ct), 1.5, 25, 2);
  siteALight.position.set(-22, 8, -22);
  siteALight.castShadow = true;
  scene.add(siteALight);

  const siteBLight = new THREE.PointLight(new THREE.Color(PALETTE.t), 1.5, 25, 2);
  siteBLight.position.set(22, 8, 22);
  siteBLight.castShadow = true;
  scene.add(siteBLight);

  return { colliders, shootables, group, materials: allMaterials };
}