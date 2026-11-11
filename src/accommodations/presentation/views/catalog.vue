<script setup>
import { reactive, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { AccommodationsApi } from '../../infrastructure/accommodations-api.js';
import { useRequest } from '../../../shared/application/use-request.js';
import RequestState from '../../../shared/presentation/components/request-state.vue';
import RoomOffer from '../../../shared/presentation/components/room-offer.vue';
const { t } = useI18n(), api = new AccommodationsApi();
const { data, loading, error, run } = useRequest();
const filters = reactive({ district: '', guests: '', minPrice: '', maxPrice: '', minArea: '', bedType: '' });
function search() { if (!loading.value) run(() => api.search(Object.fromEntries(Object.entries(filters).filter(([,value]) => value !== '')))); }
onMounted(search);
</script>
<template><section><h1>{{ t('nav.catalog') }}</h1>
  <form class="card form-grid" @submit.prevent="search">
    <div v-for="key in Object.keys(filters)" :key="key"><label :for="key">{{ t('fields.' + key) }}</label>
      <input :id="key" v-model="filters[key]" :type="['district', 'bedType'].includes(key) ? 'text' : 'number'" :min="key === 'guests' ? 1 : 0" :step="['minPrice','maxPrice','minArea'].includes(key) ? 'any' : 1" /></div>
    <button :disabled="loading">{{ t('common.search') }}</button>
  </form>
  <request-state :loading="loading" :error="error" :empty="data?.length === 0" />
  <div v-if="!loading && !error" class="cards"><room-offer v-for="room in data" :key="room.roomId" :room="room" /></div>
</section></template>
