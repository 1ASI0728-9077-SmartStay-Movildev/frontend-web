<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import useIamStore from '../../../iam/application/iam.store.js';
import { BookingsApi } from '../../infrastructure/bookings-api.js';
import { useRequest } from '../../../shared/application/use-request.js';
import { useFormat } from '../../../shared/application/use-format.js';
import RequestState from '../../../shared/presentation/components/request-state.vue';
const { t } = useI18n(), route = useRoute(), api = new BookingsApi(), roomId = ref('');
const { data, loading, error, run } = useRequest(), { money, date, status } = useFormat();
const store = useIamStore();
const visible = computed(() => !admin.value || store.session?.role !== 'admin' ? data.value : data.value?.filter(item => store.session.hotelId && item.hotelId === store.session.hotelId));
const admin = computed(() => route.name === 'bookingAdmin');
function load() { if (!loading.value) run(() => admin.value ? roomId.value ? api.room(roomId.value) : api.all() : api.mine()); }
onMounted(load);
</script>
<template><section><div class="heading"><h1>{{ t('nav.' + (admin ? 'bookingAdmin' : 'bookings')) }}</h1><button :disabled="loading" @click="load">{{ t('common.refresh') }}</button></div>
  <p v-if="admin && store.session.role === 'admin' && !store.session.hotelId" class="notice">{{ t('home.noScope') }}</p>
  <form v-if="admin" class="inline-form card" @submit.prevent="load"><label for="room-filter">{{ t('fields.roomId') }}</label><input id="room-filter" v-model="roomId" type="number" min="1" /><button :disabled="loading">{{ t('common.search') }}</button></form>
  <request-state :loading="loading" :error="error" :empty="visible?.length === 0" />
  <div v-if="!loading && !error" class="cards"><article v-for="booking in visible" :key="booking.id" class="card">
    <h2>{{ t('bookings.booking') }} #{{ booking.id }}</h2><p>{{ status(booking.status) }}</p><p>{{ date(booking.checkInDate) }} · {{ date(booking.checkOutDate) }}</p>
    <p>{{ money(booking.totalAmount, booking.currency) }}</p><router-link :to="{ name: 'bookingDetail', params: { id: booking.id } }">{{ t('common.details') }}</router-link>
  </article></div>
</section></template>
