import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// One renderer per mounted viewer. No global animation loop or keyboard listener.
export function createStage(host, { panorama = false, onLost } = {}) {
  let renderer;
  try { renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false }); }
  catch { throw new Error('webgl'); }
  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#eaf0f2');
  const camera = new THREE.PerspectiveCamera(panorama ? 70 : 45, 1, 0.05, 200);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.domElement.tabIndex = 0;
  renderer.domElement.setAttribute('aria-label', host.getAttribute('aria-label') || '3D');
  host.appendChild(renderer.domElement);
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = false;
  controls.listenToKeyEvents(renderer.domElement);
  const render = () => renderer.render(scene, camera);
  const resize = () => {
    const width = Math.max(host.clientWidth, 1), height = Math.max(host.clientHeight, 1);
    renderer.setSize(width, height);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    render();
  };
  const observer = new ResizeObserver(resize);
  observer.observe(host);
  controls.addEventListener('change', render);
  const lost = event => { event.preventDefault(); onLost?.(); };
  renderer.domElement.addEventListener('webglcontextlost', lost);
  let disposed = false;
  function dispose() {
    if (disposed) return;
    disposed = true;
    observer.disconnect();
    controls.removeEventListener('change', render);
    controls.dispose();
    const geometries = new Set(), materials = new Set(), textures = new Set();
    scene.traverse(object => {
      if (object.geometry) geometries.add(object.geometry);
      for (const material of [object.material].flat().filter(Boolean)) {
        materials.add(material);
        for (const value of Object.values(material)) if (value?.isTexture) textures.add(value);
      }
    });
    textures.forEach(value => value.dispose());
    materials.forEach(value => value.dispose());
    geometries.forEach(value => value.dispose());
    renderer.domElement.removeEventListener('webglcontextlost', lost);
    renderer.dispose();
    renderer.forceContextLoss();
    renderer.domElement.remove();
  }
  return { scene, camera, controls, renderer, render, resize, dispose };
}
