<script setup>
import { reactive, ref, nextTick } from 'vue';
import { useI18n } from 'vue-i18n';
import { ConciergeApi } from '../../infrastructure/concierge-api.js';
import { conciergeRequest, validConciergeRequest, chatExchange } from '../../domain/chat-message.js';
import { useRequest } from '../../../shared/application/use-request.js';
import RequestState from '../../../shared/presentation/components/request-state.vue';
import RoomOffer from '../../../shared/presentation/components/room-offer.vue';

const { t } = useI18n(), api = new ConciergeApi();
const { loading, error, run } = useRequest();
const form = reactive({ checkIn: '', checkOut: '', guests: 2, district: '', budgetTotal: 0 });
const message = ref(''), invalid = ref(false), exchanges = ref([]), thread = ref(null), composer = ref(null);
async function scrollToLatest() {
  await nextTick();
  if (thread.value) thread.value.scrollTop = thread.value.scrollHeight;
}
async function send() {
  if (loading.value) return;
  const body = conciergeRequest(message.value, form);
  invalid.value = !validConciergeRequest(body);
  if (invalid.value) return;
  const turn = reactive({ id: crypto.randomUUID(), message: body.message, preferences: { ...body }, pending: true, failed: false });
  exchanges.value.push(turn);
  message.value = '';
  scrollToLatest();
  const response = await run(() => api.send(body));
  turn.pending = false;
  if (response) Object.assign(turn, chatExchange(body, response));
  else turn.failed = true;
  await scrollToLatest();
  composer.value?.focus();
}
function recover(turn) {
  message.value = turn.message;
  const { checkIn, checkOut, guests, district, budgetTotal } = turn.preferences;
  Object.assign(form, { checkIn, checkOut, guests, district, budgetTotal });
  composer.value?.focus();
}
function clear() { if (!loading.value) { exchanges.value = []; error.value = null; } }
</script>
<template>
  <section class="ai-page">
    <div class="feature-heading">
      <span class="tech-badge">IA / AI</span><h1>{{ t('nav.concierge') }}</h1><p>{{ t('concierge.description') }}</p>
    </div>
    <div class="chat-layout">
      <aside class="card preferences">
        <h2>{{ t('concierge.preferences') }}</h2>
        <div v-for="key in ['checkIn', 'checkOut', 'guests', 'district', 'budgetTotal']" :key="key" class="preference-field">
          <label :for="key">{{ t('fields.' + key) }}</label>
          <input :id="key" v-model="form[key]" form="concierge-chat" :type="['checkIn','checkOut'].includes(key) ? 'date' : ['guests','budgetTotal'].includes(key) ? 'number' : 'text'"
            :min="key === 'guests' ? 1 : key === 'budgetTotal' ? 0 : undefined" :max="key === 'guests' ? 10 : undefined"
            :step="key === 'budgetTotal' ? '0.01' : undefined" :required="key !== 'district'" :disabled="loading" />
        </div>
        <p class="currency-label">{{ t('fields.currency') }}: USD</p>
        <small>{{ t('concierge.independent') }}</small>
      </aside>
      <div class="chat-panel card">
        <div class="heading"><h2>{{ t('concierge.conversation') }}</h2><button class="secondary" :disabled="loading || !exchanges.length" @click="clear">{{ t('concierge.clear') }}</button></div>
        <div ref="thread" class="chat-thread" role="log" :aria-label="t('concierge.conversation')" aria-live="polite" :aria-busy="loading">
          <div v-if="!exchanges.length" class="chat-welcome">
            <i class="pi pi-sparkles" aria-hidden="true" /><h3>{{ t('concierge.welcome') }}</h3><p>{{ t('concierge.suggestion') }}</p>
          </div>
          <article v-for="turn in exchanges" :key="turn.id" class="chat-turn">
            <div class="chat-bubble user-bubble"><strong>{{ t('concierge.you') }}</strong><p>{{ turn.message }}</p></div>
            <div v-if="turn.pending" class="chat-bubble assistant-bubble" role="status">{{ t('concierge.thinking') }}</div>
            <div v-else-if="turn.failed" class="chat-bubble assistant-bubble">
              <p>{{ t('concierge.failed') }}</p><button class="secondary" :disabled="loading" @click="recover(turn)">{{ t('concierge.recover') }}</button>
            </div>
            <div v-else class="assistant-answer">
              <div class="chat-bubble assistant-bubble"><strong>{{ t('nav.concierge') }}</strong><p>{{ turn.text }}</p>
                <span v-if="turn.fallbackUsed" class="fallback-label">{{ t('concierge.fallback') }}</span>
                <span v-else class="tech-badge">{{ t('concierge.aiAssisted') }}</span>
              </div>
              <request-state :empty="turn.offers.length === 0" />
              <div class="cards chat-offers"><room-offer v-for="offer in turn.offers" :key="offer.roomId" :room="offer" :dates="turn.dates" /></div>
            </div>
          </article>
        </div>
        <request-state :error="error" />
        <form id="concierge-chat" class="chat-composer" @submit.prevent="send">
          <label for="message">{{ t('fields.message') }}</label>
          <textarea id="message" ref="composer" v-model="message" required maxlength="500" :placeholder="t('concierge.placeholder')" :disabled="loading" />
          <div class="composer-actions"><small>{{ message.length }}/500</small><button :disabled="loading || !message.trim()">{{ t(loading ? 'concierge.thinking' : 'common.send') }} <i class="pi pi-send" aria-hidden="true" /></button></div>
          <p v-if="invalid" role="alert" class="notice error">{{ t('validation.concierge') }}</p>
        </form>
      </div>
    </div>
  </section>
</template>
