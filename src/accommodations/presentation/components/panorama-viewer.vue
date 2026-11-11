<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import { useI18n } from 'vue-i18n';
import * as THREE from 'three';
import { createStage } from '../graphics/viewer-stage.js';
import { panoramaUrl } from '../../domain/room-scene.js';

const props = defineProps({ tour: { type: Object, required: true } });
const { t } = useI18n();
const host = ref(null), loading = ref(false), error = ref(''), selected = ref('');
const node = computed(() => props.tour.nodes?.find(item => item.id === selected.value));
let stage, sphere, request = 0, disposed = false;
const origin = new URL(import.meta.env.VITE_MOVILDEV_API_URL).origin;
async function load(id) {
  const current = ++request;
  selected.value = id; loading.value = true; error.value = '';
  // Never display a previous panorama under the new node's name.
  if (sphere) { stage.scene.remove(sphere); sphere.geometry.dispose(); sphere.material.map?.dispose(); sphere.material.dispose(); sphere = null; stage.render(); }
  try {
    const url = panoramaUrl(node.value.panorama, origin);
    const texture = await new THREE.TextureLoader().loadAsync(url);
    if (disposed || current !== request) { texture.dispose(); return; }
    texture.colorSpace = THREE.SRGBColorSpace;
    const geometry = new THREE.SphereGeometry(20, 64, 32);
    geometry.scale(-1, 1, 1);
    sphere = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({ map: texture }));
    stage.scene.add(sphere);
    reset();
  } catch { if (!disposed && current === request) error.value = 'textureError'; }
  finally { if (!disposed && current === request) loading.value = false; }
}
function reset() {
  if (!stage) return;
  stage.camera.position.set(0, 0, 0.01);
  stage.controls.target.set(0, 0, 0);
  stage.camera.fov = 70;
  stage.camera.updateProjectionMatrix();
  stage.controls.update();
  stage.render();
}
function zoom(amount) {
  stage.camera.fov = THREE.MathUtils.clamp(stage.camera.fov + amount, 30, 100);
  stage.camera.updateProjectionMatrix();
  stage.render();
}
onMounted(() => {
  if (!props.tour.nodes?.length || !props.tour.nodes.some(item => item.id === props.tour.startNodeId)) {
    error.value = 'invalidTour'; return;
  }
  try {
    stage = createStage(host.value, { panorama: true, onLost: () => { error.value = 'webgl'; } });
    stage.controls.enablePan = false;
    stage.controls.enableZoom = false;
    stage.controls.rotateSpeed = -0.4;
    stage.controls.minDistance = 0.01; stage.controls.maxDistance = 0.01;
    stage.resize();
    load(props.tour.startNodeId);
  } catch { stage?.dispose(); error.value = 'webgl'; }
});
onBeforeUnmount(() => { disposed = true; request++; stage?.dispose(); });
</script>
<template>
  <div class="viewer-shell">
    <div class="viewer-toolbar">
      <span class="tech-badge">360°</span>
      <label for="tour-node">{{ t('explore.location') }}</label>
      <select id="tour-node" :value="selected" :disabled="loading || !stage" @change="load($event.target.value)">
        <option v-for="item in tour.nodes" :key="item.id" :value="item.id">{{ item.name }}</option>
      </select>
      <button class="secondary" :disabled="!!error || loading" :aria-label="t('explore.zoomIn')" @click="zoom(-10)">+</button>
      <button class="secondary" :disabled="!!error || loading" :aria-label="t('explore.zoomOut')" @click="zoom(10)">−</button>
      <button class="secondary" :disabled="!!error || loading" @click="reset">{{ t('explore.reset') }}</button>
    </div>
    <p v-if="loading" role="status" class="notice">{{ t('common.loading') }}</p>
    <div v-if="error" class="notice error" role="alert">
      <p>{{ t('explore.' + error) }}</p>
      <p v-if="error === 'textureError'" class="asset-path">{{ node?.panorama }}</p>
      <button v-if="error === 'textureError'" class="secondary" @click="load(selected)">{{ t('common.refresh') }}</button>
    </div>
    <div v-show="!error" ref="host" class="scene-host" role="region" :aria-label="t('explore.tour')" />
    <div v-if="node?.links?.length" class="toolbar">
      <button v-for="link in node.links" :key="link.nodeId" class="secondary" :disabled="loading" @click="load(link.nodeId)">
        {{ tour.nodes.find(item => item.id === link.nodeId)?.name || link.nodeId }} →
      </button>
    </div>
    <small>{{ t('explore.panoramaControls') }}</small>
  </div>
</template>
