<script setup>
import { reactive, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { BookingsApi } from '../../infrastructure/bookings-api.js';
import { validStay, toBookingDate } from '../../../shared/domain/stay.js';
import { useRequest } from '../../../shared/application/use-request.js';
import RequestState from '../../../shared/presentation/components/request-state.vue';
const { t } = useI18n(), route = useRoute(), router = useRouter(), api = new BookingsApi();
const { loading, error, run } = useRequest(), invalid = ref(false);
const form = reactive({ roomId: Number(route.query.roomId) || '', guestName: '', guestEmail: '', checkInDate: route.query.checkIn || '', checkOutDate: route.query.checkOut || '' });
async function submit() {
  invalid.value = !validStay(form.checkInDate, form.checkOutDate);
  if (invalid.value || loading.value) return;
  const booking = await run(() => api.create({ ...form, roomId: Number(form.roomId), checkInDate: toBookingDate(form.checkInDate), checkOutDate: toBookingDate(form.checkOutDate) }));
  if (booking) router.replace({ name: 'bookingDetail', params: { id: booking.id } });
}
</script>
<template><section><h1>{{ t('nav.bookingNew') }}</h1><form class="card form-grid" @submit.prevent="submit">
  <div v-for="key in Object.keys(form)" :key="key"><label :for="key">{{ t('fields.' + key) }}</label>
    <input :id="key" v-model="form[key]" :type="key === 'roomId' ? 'number' : key === 'guestEmail' ? 'email' : key.endsWith('Date') ? 'date' : 'text'" :min="key === 'roomId' ? 1 : undefined" required :disabled="loading" /></div>
  <p v-if="invalid" class="notice error" role="alert">{{ t('validation.stay') }}</p>
  <button :disabled="loading">{{ t('bookings.reserve') }}</button>
</form><request-state :loading="loading" :error="error" /></section></template>
