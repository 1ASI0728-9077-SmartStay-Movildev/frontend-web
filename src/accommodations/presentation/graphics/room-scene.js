import * as THREE from 'three';
import { wallPanels } from '../../domain/room-scene.js';

export function buildRoom(scene, data) {
  const { room } = data;
  const walls = new THREE.Group();
  scene.add(new THREE.HemisphereLight(0xffffff, 0x929c9e, 3));
  const sun = new THREE.DirectionalLight(0xffffff, 3);
  sun.position.set(3, 8, 4);
  scene.add(sun);
  function box(width, height, length, color, parent = scene, opacity = 1) {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(width, height, length),
      new THREE.MeshStandardMaterial({ color, roughness: 0.85, transparent: opacity < 1, opacity }));
    parent.add(mesh);
    return mesh;
  }
  const floorColors = { Wood: '#ae825a', Laminate: '#bba18a', Tile: '#e2ddd3', Carpet: '#889ba3', Concrete: '#a2a7a8', Porcelain: '#e4e9e7' };
  const floor = box(room.widthM, 0.1, room.lengthM, floorColors[room.floor] || '#c7bba5');
  floor.position.y = -0.05;
  // Subtle seams illustrate the declared floor type, without external textures.
  const grid = new THREE.GridHelper(Math.max(room.widthM, room.lengthM), Math.ceil(Math.max(room.widthM, room.lengthM) * 2), '#8c8172', '#b1a38e');
  grid.position.y = 0.003;
  grid.material.transparent = true;
  grid.material.opacity = 0.18;
  scene.add(grid);
  for (const wall of data.walls) {
    const angle = Math.atan2(wall.end.z - wall.start.z, wall.end.x - wall.start.x);
    for (const panel of wallPanels(wall)) {
      const mesh = box(panel.width, panel.height, 0.07, room.wallColor || '#efe9df', walls, 0.45);
      mesh.position.set(wall.start.x + Math.cos(angle)*panel.x, panel.y, wall.start.z + Math.sin(angle)*panel.x);
      mesh.rotation.y = -angle;
    }
  }
  scene.add(walls);
  for (const bed of data.beds) {
    const group = new THREE.Group();
    group.position.set(bed.x, 0, bed.z);
    group.rotation.y = THREE.MathUtils.degToRad(bed.rotationDeg);
    const frame = box(bed.widthM, bed.heightM * 0.65, bed.lengthM, '#675544', group);
    frame.position.y = bed.heightM * 0.325;
    const mattress = box(bed.widthM * 0.98, bed.heightM * 0.35, bed.lengthM * 0.98, '#f5f4ee', group);
    mattress.position.y = bed.heightM * 0.825;
    const blanket = box(bed.widthM * 0.99, 0.04, bed.lengthM * 0.55, '#447b89', group);
    blanket.position.set(0, bed.heightM + 0.02, bed.lengthM * 0.16);
    const headboard = box(bed.widthM + 0.06, bed.heightM * 1.8, 0.09, '#675544', group);
    headboard.position.set(0, bed.heightM * 0.9, -bed.lengthM/2);
    const pillowCount = bed.widthM >= 1.3 ? 2 : 1;
    for (let i = 0; i < pillowCount; i++) {
      const pillow = box(bed.widthM / pillowCount * 0.8, 0.12, 0.35, '#ffffff', group);
      pillow.position.set((i - (pillowCount-1)/2) * bed.widthM / pillowCount, bed.heightM + 0.07, -bed.lengthM * 0.32);
    }
    scene.add(group);
  }
  return walls;
}
