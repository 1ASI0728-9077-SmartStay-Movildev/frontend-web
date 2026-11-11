<script setup>
import { onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { AnalyticsApi } from '../../infrastructure/analytics-api.js';
import { useRequest } from '../../../shared/application/use-request.js';
import { useFormat } from '../../../shared/application/use-format.js';
import RequestState from '../../../shared/presentation/components/request-state.vue';
const { t } = useI18n(), api = new AnalyticsApi(), { number, date } = useFormat();
const { data, loading, error, run } = useRequest();
const load = () => run(() => api.monthly());
onMounted(load);
</script>
<template><section><div class="heading"><h1>{{ t('nav.analytics') }}</h1><button :disabled="loading" @click="load">{{ t('common.refresh') }}</button></div>
  <request-state :loading="loading" :error="error" />
  <div v-if="data && !loading && !error" class="cards"><article v-for="key in ['totalRevenue', 'totalBookings', 'occupancyRate', 'cancelledBookings']" :key="key" class="card"><h2>{{ t('metrics.' + key) }}</h2><strong class="metric">{{ number(data[key]) }}{{ key === 'occupancyRate' ? '%' : '' }}</strong></article><article class="card"><h2>{{ t('metrics.generatedAt') }}</h2><p>{{ date(data.generatedAt) }}</p></article></div>
</section></template>
