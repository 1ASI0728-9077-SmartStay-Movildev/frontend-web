<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import useIamStore from '../../../iam/application/iam.store.js';
import { adminRoles } from '../../../shared/domain/permissions.js';
import { BookingsApi } from '../../infrastructure/bookings-api.js';
import { useRequest } from '../../../shared/application/use-request.js';
import { useFormat } from '../../../shared/application/use-format.js';
import RequestState from '../../../shared/presentation/components/request-state.vue';
const { t } = useI18n(), route = useRoute(), store = useIamStore(), api = new BookingsApi();
const { data, loading, error, run } = useRequest(), { money, date, status } = useFormat(), confirmCancel = ref(false);
const admin = computed(() => adminRoles.includes(store.session?.role));
const allowed = computed(() => store.session?.role !== 'admin' || !!store.session.hotelId && store.session.hotelId === data.value?.hotelId);
const load = () => run(() => api.detail(route.params.id));
async function cancel() { await run(() => api.cancel(route.params.id)); confirmCancel.value = false; }
onMounted(load);
</script>
<template><section><div class="heading"><h1>{{ t('bookings.booking') }} #{{ route.params.id }}</h1><button :disabled="loading" @click="load">{{ t('common.refresh') }}</button></div>
  <request-state :loading="loading" :error="error" />
  <article v-if="data && !loading" class="card">
    <p>{{ status(data.status) }}</p><p>{{ data.guestName }} · {{ data.guestEmail }}</p>
    <p>{{ t('fields.roomId') }}: {{ data.roomId }} · {{ t('fields.hotelId') }}: {{ data.hotelId }}</p>
    <p>{{ date(data.checkInDate) }} · {{ date(data.checkOutDate) }}</p><h2>{{ money(data.totalAmount, data.currency) }}</h2>
    <div v-if="allowed" class="toolbar">
      <router-link v-if="data.status === 'PendingPayment'" class="button" :to="{ name: 'payments', query: { bookingId: data.id } }">{{ t('payments.pay') }}</router-link>
      <button v-if="admin && data.status === 'PendingPayment'" :disabled="loading" @click="run(() => api.confirm(route.params.id))">{{ t('bookings.confirm') }}</button>
      <button v-if="['PendingPayment', 'Confirmed'].includes(data.status)" class="secondary" :disabled="loading" @click="confirmCancel = true">{{ t('common.cancel') }}</button>
    </div>
    <div v-if="confirmCancel" class="notice"><p>{{ t('bookings.cancelQuestion') }}</p><div class="toolbar"><button :disabled="loading" @click="cancel">{{ t('bookings.cancelYes') }}</button><button class="secondary" @click="confirmCancel = false">{{ t('common.back') }}</button></div></div>
  </article>
</section></template>
