<script setup>
import { ref, computed, onMounted, defineAsyncComponent } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { validScene } from '../../domain/room-scene.js';
import { AccommodationsApi } from '../../infrastructure/accommodations-api.js';
import { useRequest } from '../../../shared/application/use-request.js';
import { useFormat } from '../../../shared/application/use-format.js';
import RequestState from '../../../shared/presentation/components/request-state.vue';

const RoomViewer = defineAsyncComponent(() => import('../components/room-viewer.vue'));
const PanoramaViewer = defineAsyncComponent(() => import('../components/panorama-viewer.vue'));
const { t } = useI18n(), { number } = useFormat();
const route = useRoute(), router = useRouter(), api = new AccommodationsApi();
const catalog = useRequest(), scene = useRequest(), tour = useRequest();
const roomId = ref(route.params.roomId || ''), tab = ref('scene');
const rooms = computed(() => catalog.data.value?.filter(room => room.hasVr || room.tourPath) || []);
const selectedRoom = computed(() => catalog.data.value?.find(room => String(room.roomId) === String(route.params.roomId)));
const sceneReady = computed(() => validScene(scene.data.value));
const selectedId = computed(() => route.params.roomId);
function choose() { if (roomId.value) router.push({ name: 'exploreRoom', params: { roomId: roomId.value } }); }
function loadTour() {
  tab.value = 'tour';
  if (!tour.data.value && !tour.loading.value) tour.run(() => api.tour(selectedId.value));
}
onMounted(() => {
  catalog.run(() => api.search({}));
  if (selectedId.value) scene.run(() => api.vr(selectedId.value));
});
</script>
<template>
  <section class="explore-page">
    <div class="feature-heading"><span class="tech-badge">3D / 360°</span><h1>{{ t('nav.explore') }}</h1><p>{{ t('explore.description') }}</p></div>
    <form class="card inline-form" @submit.prevent="choose">
      <label for="explore-room">{{ t('explore.selectRoom') }}</label>
      <select id="explore-room" v-model="roomId" required :disabled="catalog.loading.value">
        <option disabled value="">{{ t('explore.selectRoom') }}</option>
        <option v-for="room in rooms" :key="room.roomId" :value="String(room.roomId)">#{{ room.roomId }} · {{ room.hotelName }} · {{ room.roomTypeName }}</option>
      </select>
      <button :disabled="!roomId || catalog.loading.value">{{ t('common.open') }}</button>
    </form>
    <request-state :loading="catalog.loading.value" :error="catalog.error.value" :empty="catalog.data.value && !rooms.length" />
    <template v-if="selectedId">
      <div class="heading"><h2>{{ selectedRoom?.hotelName || t('rooms.rooms') }} · #{{ selectedId }}</h2>
        <div class="viewer-tabs" role="group" :aria-label="t('explore.viewMode')">
          <button class="secondary" :aria-pressed="tab === 'scene'" @click="tab = 'scene'">{{ t('explore.room3d') }}</button>
          <button class="secondary" :aria-pressed="tab === 'tour'" @click="loadTour">{{ t('explore.tour') }}</button>
        </div>
      </div>
      <div v-if="tab === 'scene'" class="card">
        <request-state :loading="scene.loading.value" :error="scene.error.value" />
        <template v-if="sceneReady && !scene.loading.value && !scene.error.value">
          <div class="room-facts"><span>{{ number(scene.data.value.room.areaM2) }} m²</span><span>{{ number(scene.data.value.room.widthM) }} × {{ number(scene.data.value.room.lengthM) }} m</span><span>{{ t('explore.height') }}: {{ number(scene.data.value.room.heightM) }} m</span></div>
          <room-viewer :scene-data="scene.data.value" />
          <div class="room-facts"><span v-for="panel in scene.data.value.panels" :key="panel.id">{{ panel.title }}: {{ panel.text }}</span></div>
        </template>
        <p v-if="scene.data.value && !sceneReady && !scene.loading.value" class="notice error" role="alert">{{ t('explore.invalidScene') }}</p>
        <button v-if="scene.error.value" class="secondary" @click="scene.run(() => api.vr(selectedId))">{{ t('common.refresh') }}</button>
      </div>
      <div v-else class="card">
        <request-state :loading="tour.loading.value" :error="tour.error.value" />
        <panorama-viewer v-if="tour.data.value && !tour.error.value && !tour.loading.value" :tour="tour.data.value" />
        <button v-if="tour.error.value" class="secondary" @click="loadTour">{{ t('common.refresh') }}</button>
      </div>
    </template>
    <div v-else class="cards">
      <router-link v-for="room in rooms" :key="room.roomId" :to="{ name: 'exploreRoom', params: { roomId: room.roomId } }" class="card nav-card">
        <span class="tech-badge">{{ room.hasVr ? '3D' : '360°' }}</span><h2>{{ room.hotelName }}</h2><p>{{ room.roomTypeName }} · {{ room.district }}</p><span>{{ t('common.open') }} →</span>
      </router-link>
    </div>
  </section>
</template>
