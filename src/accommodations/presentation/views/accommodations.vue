<script setup>
import { ref, computed, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import useIamStore from '../../../iam/application/iam.store.js';
import { AccommodationsApi } from '../../infrastructure/accommodations-api.js';
import { useRequest } from '../../../shared/application/use-request.js';
import { useFormat } from '../../../shared/application/use-format.js';
import RequestState from '../../../shared/presentation/components/request-state.vue';
const { t } = useI18n(), store = useIamStore(), api = new AccommodationsApi(), roomId = ref('');
const hotels = useRequest(), rooms = useRequest(), options = useRequest(), detail = useRequest();
const { number } = useFormat();
const scoped = (items, isHotel = false) => store.session?.role === 'admin' ? items?.filter(item => store.session.hotelId && (isHotel ? item.id : item.hotelId) === store.session.hotelId) : items;
const visibleHotels = computed(() => scoped(hotels.data.value, true));
const visibleRooms = computed(() => scoped(rooms.data.value));
async function load() {
  await Promise.all([hotels.run(() => api.hotels()), rooms.run(() => api.rooms()), options.run(async () => {
    const [types, categories, amenities] = await Promise.all([api.types(), api.categories(), api.amenities()]);
    return { data: { types: types.data, categories: categories.data, amenities: amenities.data } };
  })]);
}
onMounted(load);
</script>
<template><section><h1>{{ t('nav.accommodations') }}</h1>
  <p v-if="store.session.role === 'admin' && !store.session.hotelId" class="notice">{{ t('home.noScope') }}</p>
  <h2>{{ t('rooms.hotels') }}</h2><request-state :loading="hotels.loading.value" :error="hotels.error.value" :empty="visibleHotels?.length === 0" />
  <div v-if="!hotels.loading.value && !hotels.error.value" class="cards"><article v-for="hotel in visibleHotels" :key="hotel.id" class="card"><h3>{{ hotel.name }}</h3><p>{{ hotel.location }}</p><p>{{ hotel.description }}</p><p>{{ hotel.type }}</p></article></div>
  <h2>{{ t('rooms.rooms') }}</h2><request-state :loading="rooms.loading.value" :error="rooms.error.value" :empty="visibleRooms?.length === 0" />
  <div v-if="!rooms.loading.value && !rooms.error.value" class="cards"><article v-for="room in visibleRooms" :key="room.id" class="card"><h3>#{{ room.id }} · {{ room.roomTypeName }}</h3><p>{{ room.description }}</p><p>{{ t('fields.price') }}: {{ number(room.price) }}</p><p>{{ room.amenities?.join(' · ') }}</p><button class="secondary" @click="roomId = room.id; detail.run(() => api.room(room.id))">{{ t('common.details') }}</button></article></div>
  <form class="card inline-form" @submit.prevent="detail.run(() => api.room(roomId))"><label for="detail-room">{{ t('fields.roomId') }}</label><input id="detail-room" v-model="roomId" type="number" min="1" required /><button :disabled="detail.loading.value">{{ t('common.details') }}</button></form>
  <request-state :loading="detail.loading.value" :error="detail.error.value" />
  <article v-if="detail.data.value && !detail.error.value && scoped([detail.data.value])?.length" class="card"><h3>{{ detail.data.value.roomTypeName }} #{{ detail.data.value.id }}</h3><p>{{ detail.data.value.description }}</p><p>{{ t('fields.hotelId') }}: {{ detail.data.value.hotelId }}</p><p>{{ t('fields.price') }}: {{ number(detail.data.value.price) }}</p></article>
  <request-state :loading="options.loading.value" :error="options.error.value" />
  <div v-if="options.data.value" class="card"><h2>{{ t('rooms.types') }}</h2><p v-for="type in options.data.value.types" :key="type.id">{{ type.name }} · {{ type.description }}</p><h3>{{ t('rooms.categories') }}</h3><p>{{ options.data.value.categories.join(' · ') }}</p><h3>{{ t('rooms.amenities') }}</h3><p>{{ options.data.value.amenities.join(' · ') }}</p></div>
</section></template>
