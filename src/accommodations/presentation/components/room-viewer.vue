<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { useI18n } from 'vue-i18n';
import { createStage } from '../graphics/viewer-stage.js';
import { buildRoom } from '../graphics/room-scene.js';
import { validScene } from '../../domain/room-scene.js';

const props = defineProps({ sceneData: { type: Object, required: true } });
const { t } = useI18n();
const host = ref(null), error = ref(''), showWalls = ref(true);
let stage, walls;
function reset() { stage?.controls.reset(); stage?.render(); }
function toggleWalls() { if (walls) { walls.visible = showWalls.value; stage.render(); } }
onMounted(() => {
  if (!validScene(props.sceneData)) { error.value = 'invalidScene'; return; }
  try {
    stage = createStage(host.value, { onLost: () => { error.value = 'webgl'; } });
    walls = buildRoom(stage.scene, props.sceneData);
    const room = props.sceneData.room, size = Math.max(room.widthM, room.lengthM);
    stage.camera.position.set(size * 1.15, size * 1.3, size * 1.35);
    stage.controls.target.set(0, room.heightM * 0.2, 0);
    stage.controls.minDistance = 0.5;
    stage.controls.maxDistance = size * 5;
    stage.controls.maxPolarAngle = Math.PI * 0.49;
    stage.controls.update();
    stage.controls.saveState();
    stage.resize();
  } catch { stage?.dispose(); error.value = 'webgl'; }
});
onBeforeUnmount(() => stage?.dispose());
</script>
<template>
  <div class="viewer-shell">
    <div class="viewer-toolbar">
      <span class="tech-badge">3D</span>
      <label><input v-model="showWalls" type="checkbox" @change="toggleWalls" />{{ t('explore.walls') }}</label>
      <button type="button" class="secondary" :disabled="!!error" @click="reset">{{ t('explore.reset') }}</button>
    </div>
    <p v-if="error" role="alert" class="notice error">{{ t('explore.' + error) }}</p>
    <div v-show="!error" ref="host" class="scene-host" role="region" :aria-label="t('explore.room3d')" :aria-describedby="'scene-help'" />
    <p id="scene-help" class="viewer-help">{{ t('explore.controls') }}</p>
    <small>{{ t('explore.schematic') }}</small>
  </div>
</template>
