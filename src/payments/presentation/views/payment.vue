<script setup>
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue';
import { useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { BookingsApi } from '../../../bookings/infrastructure/bookings-api.js';
import { PaymentsApi } from '../../infrastructure/payments-api.js';
import { PaymentAttempt, normalizeCardNumber, paymentTestData } from '../../domain/payment-attempt.js';
import { useRequest } from '../../../shared/application/use-request.js';
import { useFormat } from '../../../shared/application/use-format.js';
import RequestState from '../../../shared/presentation/components/request-state.vue';
const { t } = useI18n(), route = useRoute(), api = new PaymentsApi(), bookings = new BookingsApi();
const bookingId = ref(route.query.bookingId || ''), booking = useRequest(), payment = useRequest(), submission = useRequest();
const { money, date, status } = useFormat();
const retryChecked = ref(false);
const retry = ref(false), invalid = ref(false), finished = ref(false), attempt = new PaymentAttempt();
const form = reactive({ cardNumber: '', cardHolderName: '', expirationDate: '', cvv: '' });
const busy = computed(() => booking.loading.value || payment.loading.value || submission.loading.value);
const noPayment = computed(() => payment.error.value?.status === 404);
const payable = computed(() => booking.data.value?.status === 'PendingPayment' && noPayment.value && !finished.value);
function clearSensitive() { Object.keys(form).forEach(key => form[key] = ''); attempt.clear(); }
async function load() {
  if (!/^[1-9]\d*$/.test(String(bookingId.value)) || busy.value || retry.value) return;
  finished.value = false; clearSensitive(); payment.data.value = null; payment.error.value = null;
  const value = await booking.run(() => bookings.detail(bookingId.value));
  if (value) await payment.run(() => api.forBooking(value.id));
}
async function submit() {
  if (busy.value || !payable.value) return;
  invalid.value = !retry.value && (!normalizeCardNumber(form.cardNumber) || Object.values(form).some(value => !value.trim()));
  if (invalid.value) return;
  const { body, key } = attempt.start({ bookingId: booking.data.value.id, amount: booking.data.value.totalAmount, paymentMethod: 'CreditCard', ...form, cardNumber: normalizeCardNumber(form.cardNumber) });
  const result = await submission.run(() => api.create(body, key));
  if (result) {
    payment.data.value = result; payment.error.value = null; finished.value = true; retry.value = false; clearSensitive();
    await booking.run(() => bookings.detail(body.bookingId));
  } else if (submission.error.value?.uncertain) { retry.value = true; retryChecked.value = false; }
  else { retry.value = false; clearSensitive(); }
}
async function checkUncertain() {
  if (busy.value) return;
  const result = await payment.run(() => api.forBooking(attempt.body.bookingId));
  retryChecked.value = payment.error.value?.status === 404;
  if (result) { retry.value = false; finished.value = true; clearSensitive(); await booking.run(() => bookings.detail(result.bookingId)); }
}
onMounted(() => { if (bookingId.value) load(); });
onUnmounted(clearSensitive);
</script>
<template><section><h1>{{ t('nav.payments') }}</h1><p class="notice">{{ t('payments.simulated') }}</p>
  <form class="card inline-form" @submit.prevent="load"><label for="pay-booking">{{ t('fields.bookingId') }}</label><input id="pay-booking" v-model="bookingId" type="number" min="1" required :disabled="busy || retry" /><button :disabled="busy || retry">{{ t('common.search') }}</button></form>
  <request-state :loading="booking.loading.value" :error="booking.error.value" />
  <template v-if="booking.data.value && !booking.error.value">
    <article class="card"><h2>{{ t('bookings.booking') }} #{{ booking.data.value.id }}</h2><p>{{ status(booking.data.value.status) }}</p><p>{{ money(booking.data.value.totalAmount, booking.data.value.currency) }}</p>
      <router-link :to="{ name: 'bookingDetail', params: { id: booking.data.value.id } }">{{ t('common.details') }}</router-link>
    </article>
    <request-state :loading="payment.loading.value" :error="noPayment ? null : payment.error.value" />
    <article v-if="payment.data.value" class="card"><h2>{{ t('payments.result') }}</h2><p>{{ status(payment.data.value.status) }}</p><p>{{ payment.data.value.cardNumberMasked }}</p><p>{{ t('fields.transactionId') }}: {{ payment.data.value.transactionId }}</p><p>{{ date(payment.data.value.paymentDate) }}</p><p>{{ t('payments.async') }}</p>
      <button :disabled="busy" @click="load">{{ t('common.refresh') }}</button></article>
    <p v-else-if="noPayment" class="notice">{{ t('payments.none') }}</p>
    <form v-if="payable && !retry" class="card form-grid" @submit.prevent="submit">
      <div class="full toolbar"><button type="button" class="secondary" :disabled="busy" @click="Object.assign(form, paymentTestData())">{{ t('payments.useTestData') }}</button><small>{{ t('payments.flexible') }}</small></div>
      <div><label for="amount">{{ t('fields.amount') }}</label><input id="amount" :value="money(booking.data.value.totalAmount, booking.data.value.currency)" readonly /></div>
      <div v-for="key in Object.keys(form)" :key="key"><label :for="key">{{ t('fields.' + key) }}</label><input :id="key" v-model="form[key]" :type="key === 'cvv' ? 'password' : 'text'" :inputmode="['cardNumber', 'cvv'].includes(key) ? 'numeric' : 'text'" :placeholder="key === 'expirationDate' ? 'MM/YY' : undefined" autocomplete="off" required :disabled="busy" /></div>
      <p v-if="invalid" role="alert" class="notice error">{{ t('validation.card') }}</p><button :disabled="busy">{{ t('payments.pay') }}</button>
    </form>
    <div v-if="retry" class="card"><p role="status">{{ t('payments.uncertain') }}</p><div class="toolbar"><button :disabled="busy" @click="checkUncertain">{{ t('common.refresh') }}</button><button :disabled="busy || !noPayment || !retryChecked" @click="submit">{{ t('payments.retry') }}</button></div></div>
    <request-state :loading="submission.loading.value" :error="submission.error.value" />
  </template>
</section></template>
